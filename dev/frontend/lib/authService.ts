// frontend/lib/authService.ts

export async function fetchMe() {
  try {
    const res = await fetch("http://localhost:8000/api/me", {
      method: "GET",
      credentials: "include", // envia o cookie HTTP-only
    });

    if (!res.ok) {
      throw new Error("Não autenticado");
    }

    const data = await res.json();

   // 🔥 MAPEAMENTO DO BACKEND → FRONTEND
    return {
      id: data.IDUSUARIO,
      name: data.NOME,
      email: data.EMAIL,
      login: data.LOGIN,
      avatar: `/avatars/${data.IMAGEM}`, // se existir
      raw: data  // opcional: guarda tudo caso precise depois
    };
  } catch (error) {
    console.error("Erro ao buscar /me:", error);
    return null;
  }
}
