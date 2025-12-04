"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/providers/UserProvider";
import { useToast } from "@/components/ui/use-toast";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { log } from "console";

export function NovoUsuario({ onSaved }: { onSaved?: () => void }) {
  // Toast para mostrar mensagens de sucesso/erro
  const { toast } = useToast();

  // Pegando o usuário logado do contexto
  const { user } = useUserContext();

  // Estado do dialog (aberto ou fechado)
  const [open, setOpen] = useState(false);

  // Estado do formulário
  const [form, setForm] = useState({
    ATIVO: "",
    NOME: "",
    EMAIL: "",
    LOGIN: "",
    SENHA: "",
    TELEFONE: "",
    IDPERFIL: "",
    IDDEPART: "",
    DATACAD: "",
  });

  // Atualiza o estado do formulário conforme o usuário digita
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Função para enviar o formulário
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
     
      const response = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        credentials: "include", // envia cookies JWT
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          ...form,
          USUARIOCAD: String(user?.login), // pega o login do usuário como string
          DATACAD: new Date().toISOString().slice(0, 19).replace("T", " "), // formato Y-m-d H:i:s
        }),
      });

      const data = await response.json();
     
      // Se a requisição falhar, mostra erro
      if (!response.ok) {
        toast({
          variant: "error",
          title: "Erro!",
          description: data.message || "Falha ao salvar usuário.",
        });
        return;
      }

      // Se der certo, mostra toast de sucesso
      toast({
        variant: "success",
        title: "Sucesso!",
        description: data.message || "Usuário salvo com sucesso!",
      });

      // Fecha o dialog
      setOpen(false);

      window.location.reload();

     // Callback opcional para atualizar a lista de menus extras
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Erro:", error);
      toast({
        variant: "error",
        title: "Erro inesperado",
        description: "Algo deu errado na requisição.",
      });
    }
  }

  return (
    // Dialog controlado pelo estado "open"
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="ml-2 bg-primary text-white">
        
          Novo Usuário
          </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados e clique em salvar.
            </DialogDescription>
          </DialogHeader>

          {/* GRID PRINCIPAL EM DUAS COLUNAS */}
          <div className="grid grid-cols-2 gap-4 mt-4">

            {/* ATIVO */}
            <div className="grid gap-2">
              <Label>Ativo *</Label>
              <Select
                value={form.ATIVO}
                onValueChange={(value) => setForm({ ...form, ATIVO: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Sim</SelectItem>
                  <SelectItem value="N">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NOME - LINHA INTEIRA */}
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="NOME">Nome *</Label>
              <Input
                id="NOME"
                name="NOME"
                value={form.NOME}
                onChange={handleChange}
              />
            </div>

            {/* EMAIL - LINHA INTEIRA */}
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="EMAIL">Email *</Label>
              <Input
                id="EMAIL"
                name="EMAIL"
                value={form.EMAIL}
                onChange={handleChange}
              />
            </div>

            {/* TELEFONE */}
            <div className="grid gap-2">
              <Label htmlFor="TELEFONE">Telefone</Label>
              <Input
                id="TELEFONE"
                name="TELEFONE"
                value={form.TELEFONE}
                onChange={handleChange}
              />
            </div>

            {/* LOGIN */}
            <div className="grid gap-2">
                <Label htmlFor="LOGIN">Login *</Label>
                <Input
                    id="LOGIN"
                    name="LOGIN"
                    value={form.LOGIN}
                    onChange={handleChange}
                />
            </div>

            {/* SENHA */}
            <div className="grid gap-2">
                <Label htmlFor="SENHA">Senha *</Label>
                <Input
                    type="password"
                    id="SENHA"
                    name="SENHA"
                    value={form.SENHA}
                    onChange={handleChange}
                />
            </div>
            
            {/* PERFIL */}
            <div className="grid gap-2">
              <Label>Perfil</Label>
              <Select
                value={form.IDPERFIL}
                onValueChange={(value) => setForm({ ...form, IDPERFIL: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Administrador Master</SelectItem>
                  <SelectItem value="2">Perfil teste</SelectItem>
                  <SelectItem value="3">Perfil exemplo</SelectItem>
                  <SelectItem value="4">Usuários do e-Hidrometro</SelectItem>
                  <SelectItem value="6">Padrão</SelectItem>
                  <SelectItem value="7">Admin Portal</SelectItem>
                  <SelectItem value="8">Padrão Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DEPARTAMENTO */}
            <div className="grid gap-2">
              <Label htmlFor="IDDEPART">Departamento *</Label>

              <Input
                id="IDDEPART"
                name="IDDEPART"
                value={form.IDDEPART}
                onChange={handleChange}
              />
            </div>

            

          </div>

          {/* FOOTER */}
          <DialogFooter className="mt-5">
            {/* Cancelar fecha o dialog */}
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            {/* Salvar não fecha automaticamente, será feito pelo setOpen(false) após sucesso */}
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
