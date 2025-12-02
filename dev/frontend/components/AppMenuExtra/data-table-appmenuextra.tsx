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
import { useToast } from "@/components/ui/use-toast";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

    const { toast } = useToast();

    // --- state/hooks fundamentais (sempre declarados) ---
    const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 50 });

     // --- estados para edição ---
    const [editingItem, setEditingItem] = React.useState<z.infer<typeof schema> | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

     // --- DnD sensores ---
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));
    const dataIds = React.useMemo<UniqueIdentifier[]>(() => data.map((item) => item.id), [data]);

     // --- columns MEMOIZADAS (crucial) ---
    const columns = React.useMemo<ColumnDef<any>[]>(() => [

    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex gap-2">

          {/* BOTÃO EDITAR */}
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[11px]"
            onClick={() => handleEdit(row.original)}
          >
            Editar
          </Button>

          {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="destructive"
                className="h-6 px-2 text-[11px]"
                >
                Excluir
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirmar Exclusão
                </AlertDialogTitle>

                <AlertDialogDescription>
                  Tem certeza de que deseja excluir o menu <b>{row.original.descricao}</b>?  
                  Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>

                <AlertDialogAction
                  onClick={() => handleDelete(row.original.id)}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
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
    cell: ({ row }) => {
      const isSim = row.original.visivel === "S";
      return (
        <Badge
          variant="outline"
          className={isSim ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}
        >
          {isSim ? "Sim" : "Não"}
        </Badge>
      );
    },
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

   // --- drag & drop ---
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData(current => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(current, oldIndex, newIndex);
      });
    }
  }

  // --- funções de edição e exclusão ---
  function handleEdit(item: z.infer<typeof schema>) {
    setEditingItem(item);
    setIsDrawerOpen(true);
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`http://localhost:8000/api/appmenuextra/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erro ao excluir");

      setData(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Menu excluído!",
        description: "O registro foi removido com sucesso."
      });

    } catch (err: any) {
      toast({
        title: "Erro ao excluir",
        description: err.message || "Ocorreu um erro inesperado."
      });
    }
  }


  async function handleSubmitEdit() {
    if (!editingItem) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/appmenuextra/${editingItem.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingItem),
        }
      );

      if (!res.ok) throw new Error("Erro ao atualizar menu");

      const updated = await res.json();

      setData(prev =>
        prev.map(item => item.id === updated.id ? updated : item)
      );

      setIsDrawerOpen(false);
      setEditingItem(null);

      // --- TOAST BONITÃO ---
      toast({
        title: "Menu atualizado!",
        description: `O menu "${updated.descricao}" foi salvo com sucesso.`,
      });

    } catch (err: any) {
      toast({
        title: "Erro ao atualizar",
        description: err.message || "Erro desconhecido",
      });
    }
  }

    // --- Condicionais de render (só depois que todos hooks foram definidos) ---
  if (loading) return <div>Carregando menus extras...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <div className="flex flex-col h-full">

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
   
      <footer className="flex justify-between mt-2">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </footer>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-[450px]">
          <DrawerHeader>
            <DrawerTitle>Editar Menu</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <form className="col-span-2 grid gap-2">
              {["Titulo:", "Url:", "Visível:", "Target:", "Ícone:", "Cor:", "Tipo Usuário:", "Nível de Ensino:"].map(key => (
                <div key={key} className="flex flex-col gap-1">
                  <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                  <Input
                    id={key}
                    value={editingItem?.[key as keyof typeof editingItem] || ""}
                    onChange={e => setEditingItem(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                  />
                </div>
              ))}
            </form>
          </div>
          <DrawerFooter>
            <Button onClick={handleSubmitEdit}>Salvar</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

    </div>

    
  );
  
}
