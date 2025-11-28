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

    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar /me:", error);
    return null;
  }
}
