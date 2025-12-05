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
import SelectField from "@/components/Gusuario/selectfield";
import { NovoUsuario } from "@/components/Gusuario/novo-usuario";

export const schema = z.object({
  id: z.number(),
  ativo: z.string().min(1),
  login: z.string().min(1),
  nome: z.string().min(1),  
  senha: z.string().optional(),
  idperfil: z.number().optional(),
  iddepart: z.number().optional(),
  email: z.string(),
  usuarioalt: z.string().optional(),
  dataalt: z.string().optional(),
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

export default function DataTableGusuarios() {

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
                  <p>Tem certeza de que deseja excluir o usuário? <b>{row.original.descricao}</b></p>
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
    { accessorKey: "login", header: "Usuário:" },
    {
      accessorKey: "ativo",
      header: "Ativo:",
      enableColumnFilter: true,
      cell: ({ row }) => {
        const isSim = row.original.ativo === "S";
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
    { accessorKey: "nome", header: "Nome:", enableColumnFilter: true },
    { accessorKey: "departamento", header: "Departamento:" },
    {
      accessorKey: "email",
      header: "Email:",
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          target="_blank"
          className="text-blue-600 underline"
        >
          {row.original.email}
        </a>
      ),
    },
    { accessorKey: "dataalt", header: "Última Alteração:" },
    { accessorKey: "ultimoacesso", header: "Último Acesso:" },
     
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
        const response = await fetch("http://localhost:8000/api/users", {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          // pega mensagem do servidor quando possível
          const text = await response.text().catch(() => null);
          throw new Error(text || "Erro ao buscar usuários");
        }

        const json = await response.json();
        
        if (!mounted) return;

        setData(json.map((item: any) => ({

          id: item.IDUSUARIO,
          ativo: item.ATIVO,
          nome: item.NOME,           
          email: item.EMAIL, 
          login: item.LOGIN,  
          senha: item.SENHA,
          usuarioalt: item.USUARIOALT,           
          idperfil: item.IDPERFIL ?? '',
          iddepart: item.IDDEPART ?? '',          
          ultimoacesso: item.DTULTIMOACESSO ?? '',
          dataalt: item.DATAALT ?? '',

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
      const res = await fetch(`http://localhost:8000/api/users/${id}`, {
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
        `http://localhost:8000/api/users/${editingItem.id}`,
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
        id: updatedbanco.IDUSUARIO,
        ativo: updatedbanco.ATIVO,
        login: updatedbanco.LOGIN,
        nome: updatedbanco.NOME,
        senha: updatedbanco.SENHA,
        iddepart: updatedbanco.IDDEPART ?? '',
        email: updatedbanco.EMAIL,
        ultimoacesso: updatedbanco.DTULTIMOACESSO ?? '',
        dataalt: updatedbanco.DATAALT ?? '',
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
        description: `O usuário "${updated.nome}" foi salvo sem problemas.`,
       
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
  if (loading) return <div>Carregando usuários...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    
    <div className="flex flex-col h-full">

      <div className="flex items-center gap-4 mb-4"> 

        <NovoUsuario />     

        {/* FILTRO POR NOME */}
        <Input
          placeholder="Filtrar por Nome..."
          value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("nome")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />

        {/* FILTRO POR ATIVO */}
        <select
          id="filter-ativo"
          className="border rounded px-2 py-1"
          value={(table.getColumn("ativo")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("ativo")?.setFilterValue(e.target.value)
          }
        >
          <option value="">Ativo: Todos</option>
          <option value="S">Ativo: Sim</option>
          <option value="N">Ativo: Não</option>
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
                    <DialogTitle>Editar Usuário</DialogTitle>
                    <DialogDescription>
                    Atualize os campos e salve.
                    </DialogDescription>
                </DialogHeader>

                {/* FORM */}
                <form className="grid grid-cols-2 gap-4 mt-4">

                    {/* NOME */}
                    <div className="col-span-2 flex flex-col gap-1">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                        id="nome"
                        value={editingItem?.nome ?? ""}
                        onChange={(e) =>
                        setEditingItem(prev => prev ? { ...prev, nome: e.target.value } : prev)
                        }
                    />
                    </div>

                    {/* EMAIL */}
                    <div className="col-span-2 flex flex-col gap-1">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                        id="email"
                        value={editingItem?.email ?? ""}
                        onChange={(e) =>
                        setEditingItem(prev => prev ? { ...prev, email: e.target.value } : prev)
                        }
                    />
                    </div>

                    {/* ATIVO */}
                    <div className="flex flex-col gap-1">
                    <SelectField
                        label="Ativo *"
                        value={editingItem?.ativo}
                        onChange={(v) =>
                        setEditingItem(prev => prev ? { ...prev, ativo: v } : prev)
                        }
                        options={[
                        { value: "S", label: "Sim" },
                        { value: "N", label: "Não" }
                        ]}
                    />
                    </div>

                    {/*SENHA */}
                    <div className="flex flex-col gap-1">
                    <Label htmlFor="senha">Senha (Preencha para alterar)</Label>
                    <Input
                        id="senha"
                        type="password"
                        value={editingItem?.senha?? ""}
                        onChange={(e) =>
                        setEditingItem(prev => prev ? { ...prev, senha: e.target.value } : prev)
                        }
                    />
                    </div>
                   
                    {/* DEPARTAMENTO */}
                    <div className="flex flex-col gap-1">
                    <label htmlFor="Perfil">Perfil *</label>
                    <Input
                        id="Perfil"
                        value={editingItem?.idperfil ?? ""}
                        onChange={(e) =>
                        setEditingItem(prev => prev ? { ...prev, idperfil: Number(e.target.value) } : prev)
                        }
                        
                    />

                    </div>
                    {/* DEPARTAMENTO */}
                    <div className="flex flex-col gap-1">
                    <label htmlFor="Departamento">Departamento *</label>
                    <Input
                        id="Departamento"
                        value={editingItem?.iddepart ?? ""}
                        onChange={(e) =>
                        setEditingItem(prev => prev ? { ...prev, iddepart: Number(e.target.value) } : prev)
                        }
                        
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
