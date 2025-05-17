"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { SidebarNav } from "@/components/sidebar/sidebar-nav";
import { NoteEditor } from "@/components/note/note-editor";
import { AiQueryPanel } from "@/components/ai/ai-query-panel";
import { Separator } from "@/components/ui/separator";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";


export function AppLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-2 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
              <Icons.Notebook className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">NoteWise AI</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 border-t group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-sidebar-foreground/70 text-center">
                &copy; {new Date().getFullYear()} NoteWise AI
            </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
            <SidebarTrigger className="md:hidden" /> {/* Mobile trigger */}
            <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">My Notes</h2>
            </div>
            {/* Add any header actions here, e.g., global search, user profile */}
        </header>
        <main className="flex-1 flex flex-col p-4 lg:p-6 gap-4 overflow-auto">
            <ResizablePanelGroup direction="vertical" className="min-h-[calc(100vh-100px)]">
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="h-full">
                  <NoteEditor />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="h-full">
                  <AiQueryPanel />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
