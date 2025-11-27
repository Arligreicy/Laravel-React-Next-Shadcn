"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

export function LoginForm() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        credentials: "include", // 🔥 IMPORTANTE PARA RECEBER COOKIE HTTP-ONLY
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login,
          senha: senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.message || "Erro ao fazer login");
        return;
      }

      // Login OK → backend enviará cookie automaticamente
      window.location.href = "/dashboard"; // redireciona
    } catch (error) {
      console.error(error);
      setErro("Erro de conexão com o servidor");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">PORTAL DO COLABORADOR</h1>
        </div>

        <Field>
          <FieldLabel>Código</FieldLabel>
          <Input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            type="text"
            placeholder="Digite seu código"
            required
          />
        </Field>

        <Field>
          <FieldLabel>Senha</FieldLabel>
          <Input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            type="password"
            required
          />
        </Field>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <Button type="submit">Login</Button>
      </FieldGroup>
    </form>
  );
}
