"use client";

import * as React from "react";
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });
  return <Button {...attributes} {...listeners} variant="ghost" size="icon">≡</Button>;
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">{item.header}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>Detalhes do menu extra</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            {["header", "type", "status", "target", "limit", "reviewer"].map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                <Input id={key} defaultValue={item[key as keyof typeof item]} />
              </div>
            ))}
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({ id: row.original.id });
  return (
    <TableRow ref={setNodeRef} data-dragging={isDragging} style={{ transform: CSS.Transform.toString(transform), transition }}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

export default function DataTableAppMenuExtra() {
    // --- state/hooks fundamentais (sempre declarados) ---
    const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

    // sensores para DnD (memoizados implicitamente por hooks)
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));

    // ids memoizados — OK
    const dataIds = React.useMemo<UniqueIdentifier[]>(() => data.map((item) => item.id), [data]);

    // --- columns MEMOIZADAS (crucial) ---
    const columns = React.useMemo<ColumnDef<any>[]>(() => [


    { accessorKey: "id", header: "ID" },
    { accessorKey: "titulo", header: "Título" },
    { accessorKey: "icone", header: "Ícone" },

    {
      accessorKey: "url",
      header: "URL",
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          className="text-blue-600 underline"
        >
          {row.original.url}
        </a>
      ),
    },

    { accessorKey: "tipousuario", header: "Tipo Usuário" },
    { accessorKey: "nivelensino", header: "Nível Ensino" },
    { accessorKey: "contextousuario", header: "Contexto" },
    { accessorKey: "cor", header: "Cor" },

    {
      accessorKey: "visivel",
      header: "Visível",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.visivel === "S" ? "Sim" : "Não"}
        </Badge>
      ),
    },

    { accessorKey: "target", header: "Target" },
    { accessorKey: "usuariocad", header: "Usuário Cad." },
    { accessorKey: "datacad", header: "Data Cad." },
    { accessorKey: "usuarioalt", header: "Usuário Alt." },
    { accessorKey: "dataalt", header: "Data Alt." },
  ], []);

  // --- useReactTable chamado SEMPRE (antes de returns condicionais) ---
  const table = useReactTable({
    data, columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- fetch (client-side) ---
  React.useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8000/api/appmenuextra", {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          // pega mensagem do servidor quando possível
          const text = await response.text().catch(() => null);
          throw new Error(text || "Erro ao buscar menus extras");
        }

        const json = await response.json();

        if (!mounted) return;

        setData(json.map((item: any) => ({
        id: item.IDMENU,
        titulo: item.TITULO,
        icone: item.ICONE,
        url: item.URL,
        tipousuario: item.TIPOUSUARIO,
        nivelensino: item.NIVELENSINO,
        contextousuario: item.CONTEXTOUSUARIO,
        cor: item.COR,
        visivel: item.VISIVEL,
        target: item.TARGET,
        usuariocad: item.USUARIOCAD,
        datacad: item.DATACAD,
        usuarioalt: item.USUARIOALT,
        dataalt: item.DATAALT,
      })));
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Erro desconhecido");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, []);


  // --- Condicionais de render (só depois que todos hooks foram definidos) ---
  if (loading) return <div>Carregando menus extras...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;


  // --- drag handling ---
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((current) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(current, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} sensors={sensors} onDragEnd={handleDragEnd}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
              {table.getRowModel().rows.map((row) => <DraggableRow key={row.id} row={row} />)}
            </SortableContext>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">Nenhum resultado.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DndContext>
  );
}
