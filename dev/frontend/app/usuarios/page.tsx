"use client";

import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Dynamic import do componente cliente, SSR desativado
const DataTableGusuarios = dynamic(
  () => import("@/components/Gusuario/data-table-usuarios"),
  { ssr: false }
);

export default function UsuariosPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Tabela de Usuários */}
                <DataTableGusuarios/>
               <br/>
            
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
