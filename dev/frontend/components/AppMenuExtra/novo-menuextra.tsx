"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

export function NovoMenuExtra({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState({
    TITULO: "",
    URL: "",
    VISIVEL: "S",
    TARGET: "",
    ICONE: "",
    COR: "",
    TIPOUSUARIO: "",
    NIVELENSINO: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/appmenuextra", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          USUARIOCAD: "ARLI",
          DATACAD: new Date().toISOString().slice(0, 19).replace("T", " "),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o menu extra");
      }

      if (onSaved) onSaved();
    } catch (error) {
      console.error("Erro:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Novo Menu</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Menu</DialogTitle>
            <DialogDescription>
              Preencha os dados e clique em salvar.
            </DialogDescription>
          </DialogHeader>

          {/* GRID PRINCIPAL EM DUAS COLUNAS */}
          <div className="grid grid-cols-2 gap-4 mt-4">

            {/* TITULO - LINHA INTEIRA */}
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="TITULO">Título *</Label>
              <Input
                id="TITULO"
                name="TITULO"
                value={form.TITULO}
                onChange={handleChange}
              />
            </div>

            {/* URL - LINHA INTEIRA */}
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="URL">URL *</Label>
              <Input
                id="URL"
                name="URL"
                value={form.URL}
                onChange={handleChange}
              />
            </div>

            {/* VISIVEL */}
            <div className="grid gap-2">
              <Label>Visível *</Label>
              <Select
                value={form.VISIVEL}
                onValueChange={(value) => setForm({ ...form, VISIVEL: value })}
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

            {/* TARGET */}
            <div className="grid gap-2">
              <Label>Target</Label>
              <Select
                value={form.TARGET}
                onValueChange={(value) => setForm({ ...form, TARGET: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_system">_system</SelectItem>
                  <SelectItem value="_blank">_blank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ICONE */}
            <div className="grid gap-2">
              <Label htmlFor="ICONE">Ícone *</Label>
              <Input
                id="ICONE"
                name="ICONE"
                value={form.ICONE}
                onChange={handleChange}
              />
            </div>

            {/* COR */}
            <div className="grid gap-2">
              <Label>Cor</Label>
              <Select
                value={form.COR}
                onValueChange={(value) => setForm({ ...form, COR: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="vermelho">Vermelho</SelectItem>
                  <SelectItem value="amarelo">Amarelo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TIPOUSUARIO */}
            <div className="grid gap-2">
              <Label>Tipo Usuário</Label>
              <Select
                value={form.TIPOUSUARIO}
                onValueChange={(value) => setForm({ ...form, TIPOUSUARIO: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R">Responsável</SelectItem>
                  <SelectItem value="P">Professor</SelectItem>
                  <SelectItem value="A">Aluno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NIVELENSINO */}
            <div className="grid gap-2">
              <Label>Nível de Ensino</Label>
              <Select
                value={form.NIVELENSINO}
                onValueChange={(value) => setForm({ ...form, NIVELENSINO: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Indefinido</SelectItem>
                  <SelectItem value="1">Colégio</SelectItem>
                  <SelectItem value="2">Graduação</SelectItem>
                  <SelectItem value="3">Pós-Graduação</SelectItem>
                  <SelectItem value="4">Técnico/Pós-Graduação</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
