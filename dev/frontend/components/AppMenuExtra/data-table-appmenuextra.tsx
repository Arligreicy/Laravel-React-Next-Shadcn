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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { NovoMenuExtra } from "@/components/AppMenuExtra/novo-menuextra";

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
import SelectField from "@/components/AppMenuExtra/selectfield";

export const schema = z.object({
  id: z.number(),
  titulo: z.string(),
  icone: z.string(),
  url: z.string(),
  tipousuario: z.string(),
  nivelensino: z.string(),
  contextousuario: z.string(),
  cor: z.string(),
  visivel: z.string(),
  target: z.string(),
  usuariocad: z.string(),
  datacad: z.string(),
  usuarioalt: z.string(),
  dataalt: z.string(),
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
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]); // filtros das colunas
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 50 });

     // --- estados para edição ---
    const [editingItem, setEditingItem] = React.useState<z.infer<typeof schema> | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    

     // --- DnD sensores ---
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor));
    const dataIds = React.useMemo<UniqueIdentifier[]>(() => data.map((item) => item.id), [data]);

     // --- columns MEMOIZADAS (crucial) ---
    const columns = React.useMemo<ColumnDef<any>[]>(() => [

    {
      id: "actions",
      header: "Ações:",
      cell: ({ row }) => (
        <div className="flex gap-2">

          {/* BOTÃO EDITAR */}
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[11px] bg-secondary text-primary"
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

                <AlertDialogDescription className="space-y-1">
                  <p>Tem certeza de que deseja excluir o menu? <b>{row.original.descricao}</b></p>
                  <p>Essa ação não pode ser desfeita.</p>
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
    { accessorKey: "id", header: "Cód:" },
    { accessorKey: "titulo", header: "Título:", enableColumnFilter: true },
    { accessorKey: "icone", header: "Ícone:" },
    {
      accessorKey: "url",
      header: "URL:",
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
    {
      accessorKey: "cor",
      header: "Cor:",
      cell: ({ row }) => {
        const valor = row.original.cor?.toLowerCase();

        const map: Record<
          string,
          { label: string; bg: string; text: string }
        > = {
          primary:  { label: "primary",      bg: "bg-blue-200",   text: "text-blue-800" },
          danger:   { label: "danger",  bg: "bg-red-200",    text: "text-red-800" },
          warning:  { label: "warning",   bg: "bg-yellow-200", text: "text-yellow-800" },
          light:    { label: "light",     bg: "bg-gray-200",   text: "text-gray-800" },
          tertiary: { label: "tertiary",      bg: "bg-purple-200", text: "text-purple-800" },
          success:  { label: "success",  bg: "bg-green-200",  text: "text-green-800" },
        };

        const info = map[valor] ?? {
          label: valor ?? "Indefinido",
          bg: "bg-gray-200",
          text: "text-gray-700",
        };

        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-semibold ${info.bg} ${info.text}`}
          >
            {info.label}
          </span>
        );
      },
    },
    {
      accessorKey: "visivel",
      header: "Visível:",
      enableColumnFilter: true,
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
    { accessorKey: "target", header: "Target:" },
    {
      accessorKey: "tipousuario",
      header: "Tipo Usuário:",
      cell: ({ row }) => {
        const map: Record<string, string> = {
          R: "Responsável",
          A: "Aluno",
          P: "Professor"
        };

        const valor = row.original.tipousuario;
        return map[valor] ?? valor; // fallback se vier algo estranho
      }
    },
    { accessorKey: "nivelensino", 
      header: "Nível Ensino:",
      cell: ({ row }) => {
        const map: Record<string, string> = {
          "0": "Indefinido",
          "1": "Colégio",
          "2": "Graduação",
          "3": "Pós-Graduação",
          "4": "Técnico/Pós-Graduação"
        };
        const valor = row.original.nivelensino;
        return map[valor] ?? valor; // fallback se vier algo estranho
      }
    },
    { accessorKey: "usuariocad", header: "Usuário Cad.:" },   
    { accessorKey: "datacad", header: "Data Cad.:" },
     
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
    setIsEditDialogOpen(true); 
    
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
        variant: "success",
        title: "Menu excluído!",
        description: "O registro foi removido com sucesso."
      });

      
    } catch (err: any) {
      toast({
        variant: "error",
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

      const updatedbanco = await res.json();
      
      const updated = {
        id: updatedbanco.IDMENU,
        titulo: updatedbanco.TITULO,
        icone: updatedbanco.ICONE,
        url: updatedbanco.URL,
        tipousuario: updatedbanco.TIPOUSUARIO,
        nivelensino: updatedbanco.NIVELENSINO,
        contextousuario: updatedbanco.CONTEXTOUSUARIO,
        cor: updatedbanco.COR,
        visivel: updatedbanco.VISIVEL,
        target: updatedbanco.TARGET,
        usuariocad: updatedbanco.USUARIOCAD,
        datacad: updatedbanco.DATACAD,
        usuarioalt: updatedbanco.USUARIOALT,
        dataalt: updatedbanco.DATAALT,
      };
     
      setData(prev =>
        prev.map(item => item.id === updated.id ? updated : item)
      );
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
      
      // --- TOAST BONITÃO ---
      toast({
        variant: "success",
        title: "Atualizado com sucesso!",
        description: `O menu "${updated.titulo}" foi salvo sem problemas.`,
       
      });
          
      
    } catch (err: any) {
      toast({
        variant: "error",
        title: "Erro ao atualizar",
        description: err.message || "Erro desconhecido.",
      });
      
    }
    
  }
  // --- Condicionais de render (só depois que todos hooks foram definidos) ---
  if (loading) return <div>Carregando menus extras...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    
    <div className="flex flex-col h-full">

      <div className="flex items-center gap-4 mb-4">

        {/* Botão novo menu */}
        <NovoMenuExtra />

        {/* FILTRO POR TÍTULO */}
        <Input
          placeholder="Filtrar por título..."
          value={(table.getColumn("titulo")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("titulo")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />

        {/* FILTRO POR VISÍVEL */}
        <select
          id="filter-visivel"
          className="border rounded px-2 py-1"
          value={(table.getColumn("visivel")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("visivel")?.setFilterValue(e.target.value)
          }
        >
          <option value="">Visível: Todos</option>
          <option value="S">Visível: Sim</option>
          <option value="N">Visível: Não</option>
        </select>

        {/* BOTÃO LIMPAR FILTROS */}
        <Button
          variant="outline"
          onClick={() => table.resetColumnFilters()}
          className="ml-2 bg-secondary text-primary"
        >
          Limpar filtros
        </Button>

      </div>



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
          className="bg-secondary text-primary"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          className="bg-secondary text-primary"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </footer>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">

          <DialogHeader>
            <DialogTitle>Editar Menu</DialogTitle>
            <DialogDescription>
              Atualize os campos e salve.
            </DialogDescription>
          </DialogHeader>

          {/* FORM */}
          <form className="grid grid-cols-2 gap-4 mt-4">

            {/* TÍTULO */}
            <div className="col-span-2 flex flex-col gap-1">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={editingItem?.titulo ?? ""}
                onChange={(e) =>
                  setEditingItem(prev => prev ? { ...prev, titulo: e.target.value } : prev)
                }
              />
            </div>

            {/* URL */}
            <div className="col-span-2 flex flex-col gap-1">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={editingItem?.url ?? ""}
                onChange={(e) =>
                  setEditingItem(prev => prev ? { ...prev, url: e.target.value } : prev)
                }
              />
            </div>

            {/* VISÍVEL */}
            <div className="flex flex-col gap-1">
              <SelectField
                label="Visível *"
                value={editingItem?.visivel}
                onChange={(v) =>
                  setEditingItem(prev => prev ? { ...prev, visivel: v } : prev)
                }
                options={[
                  { value: "S", label: "Sim" },
                  { value: "N", label: "Não" }
                ]}
              />
            </div>

            {/* TARGET */}
            <div className="flex flex-col gap-1">
              <SelectField
                label="Target"
                value={editingItem?.target}
                onChange={(v) =>
                  setEditingItem(prev => prev ? { ...prev, target: v } : prev)
                }
                options={[
                  { value: "_system", label: "_system" },
                  { value: "_blank", label: "_blank" }
                ]}
              />
            </div> 

            {/* ICONE */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="icone">Ícone *</Label>
              <Input
                id="icone"
                value={editingItem?.icone ?? ""}
                onChange={(e) =>
                  setEditingItem(prev => prev ? { ...prev, icone: e.target.value } : prev)
                }
              />
              <p className="text-xs text-muted-foreground">
                Consulte os ícones disponíveis em{" "}
                <a
                  href="https://ionic.io/ionicons"
                  className="underline text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ionic Icons
                </a>
              </p>
            </div>

            {/* COR */}
            <div className="flex flex-col gap-1">
              <SelectField
                label="Cor"
                value={editingItem?.cor}
                onChange={(v) =>
                  setEditingItem(prev => prev ? { ...prev, cor: v } : prev)
                }
                options={[
                  { value: "primary", label: "Azul" },
                  { value: "light", label: "Cinza Claro" },
                  { value: "danger", label: "Vermelho" },
                  { value: "success", label: "Verde" },
                  { value: "warning", label: "Amarelo" },
                  { value: "tertiary", label: "Roxo Claro" }
                ]}
              />
            </div>
            {/* TIPO USUÁRIO */}
            <div className="flex flex-col gap-1">
              <SelectField
                label="Tipo Usuário"
                value={editingItem?.tipousuario}
                onChange={(v) =>
                  setEditingItem(prev => prev ? { ...prev, tipousuario: v } : prev)
                }
                options={[
                  { value: "A", label: "Aluno" },
                  { value: "P", label: "Professor" },
                  { value: "R", label: "Responsável" }
                ]}
              />
            </div>

            {/* NÍVEL DE ENSINO */}
            <div className="flex flex-col gap-1">
              <SelectField
                label="Nível de Ensino"
                value={editingItem?.nivelensino}
                onChange={(v) =>
                  setEditingItem(prev => prev ? { ...prev, nivelensino: v } : prev)
                }
                options={[
                  { value: "0", label: "Indefinido" },
                  { value: "1", label: "Colégio" },
                  { value: "2", label: "Graduação" },
                  { value: "3", label: "Pós-Graduação" },
                  { value: "4", label: "Técnico/Pós-Graduação" }
                ]}
              />
            </div>
          </form>

          {/* FOOTER */}
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSubmitEdit}>Salvar</Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>

    
  );
  
}
