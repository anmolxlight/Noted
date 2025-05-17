
"use client";

import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { TakeANoteInput } from "@/components/note/take-a-note-input";
import { NoteCard } from "@/components/note/note-card";
import { AiFloatingButton } from "@/components/ai/ai-floating-button";
import { AiFloatingPanel } from "@/components/ai/ai-floating-panel";
import { useNoteWiseStore, useSelectedNote } from '@/lib/store'; // Assuming notes are fetched here
import type { Note } from '@/types';

export function AppLayout() {
  const notes = useNoteWiseStore(state => state.notes);
  const selectedNote = useSelectedNote(); // This might be used if a note card click opens a modal
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const handleNoteCardClick = (noteId: string) => {
    // TODO: Implement opening a note editor modal or expanded view
    console.log("Note card clicked:", noteId);
    // useNoteWiseStore.getState().selectNote(noteId);
  };
  
  // Filter out the currently selected note if it's being edited elsewhere (e.g. a modal)
  // For now, just display all notes.
  const notesToDisplay = notes;


  return (
    <SidebarProvider defaultOpen={true}> {/* Manages mobile sidebar state */}
      <div className="flex flex-col h-screen">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          {/* ShadCN Sidebar for mobile drawer functionality */}
          <Sidebar side="left" collapsible="offcanvas" className="bg-app-sidebar-background w-64 shrink-0 border-r md:block hidden">
            {/* collapsible="offcanvas" makes it a drawer on mobile, normal on desktop */}
            {/* className applied to the fixed desktop sidebar */}
            <SidebarContent className="p-0">
              <AppSidebar />
            </SidebarContent>
          </Sidebar>
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
            <TakeANoteInput />
            <div 
              className="mt-8 columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
              style={{ columnFill: 'balance' }} // Helps with masonry-like layout
            >
              {notesToDisplay.length > 0 ? (
                notesToDisplay.map((note: Note) => (
                  <div key={note.id} className="mb-4 break-inside-avoid"> {/* Wrapper for break-inside */}
                    <NoteCard note={note} onClick={() => handleNoteCardClick(note.id)} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  <p>No notes yet. Try creating one!</p>
                </div>
              )}
            </div>
          </main>
        </div>
        <AiFloatingButton onClick={() => setIsAiPanelOpen(true)} />
        <AiFloatingPanel isOpen={isAiPanelOpen} onOpenChange={setIsAiPanelOpen} />
      </div>
    </SidebarProvider>
  );
}
