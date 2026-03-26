import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full retro-grid">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-12 flex items-center border-b border-border px-4">
          <SidebarTrigger className="text-muted-foreground hover:text-primary" />
          <span className="ml-auto text-xs text-muted-foreground font-mono tracking-wider">RETRO FITNESS CLUB</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

export default AppLayout;
