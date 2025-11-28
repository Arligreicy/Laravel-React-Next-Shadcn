"use client";
import { useEffect, useState } from "react";
import { fetchMe } from "@/lib/authService";

export function useUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchMe().then(setUser);
  }, []);

  return user;
}
