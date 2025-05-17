
"use client";

import { useState, useMemo } from 'react';
import { SidebarProvider, Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { TakeANoteInput } from "@/components/note/take-a-note-input";
import { NoteCard } from "@/components/note/note-card";
import { AiFloatingButton } from "@/components/ai/ai-floating-button";
import { AiFloatingPanel } from "@/components/ai/ai-floating-panel";
import { useNoteWiseStore } from '@/lib/store';
import type { Note } from '@/types';
import { Separator } from '@/components/ui/separator';

export function AppLayout() {
  const allNotes = useNoteWiseStore(state => state.notes);
  const searchTerm = useNoteWiseStore(state => state.searchTerm);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const handleNoteCardClick = (noteId: string) => {
    // TODO: Implement opening a note editor modal or expanded view
    console.log("Note card clicked:", noteId);
    // useNoteWiseStore.getState().selectNote(noteId);
  };

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return allNotes;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return allNotes.filter(note => 
      note.title.toLowerCase().includes(lowercasedFilter) || 
      note.content.toLowerCase().includes(lowercasedFilter) ||
      (note.items && note.items.some(item => item.text.toLowerCase().includes(lowercasedFilter)))
    );
  }, [allNotes, searchTerm]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(note => note.pinned), [filteredNotes]);
  const unpinnedNotes = useMemo(() => filteredNotes.filter(note => !note.pinned), [filteredNotes]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar side="left" collapsible="offcanvas" className="bg-app-sidebar-background w-64 shrink-0 border-r md:block hidden">
            <SidebarContent className="p-0">
              <AppSidebar />
            </SidebarContent>
          </Sidebar>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
            <TakeANoteInput />

            {pinnedNotes.length > 0 && (
              <>
                <div className="mt-8 mb-2">
                  <h2 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Pinned</h2>
                </div>
                <div 
                  className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
                  style={{ columnFill: 'balance' }}
                >
                  {pinnedNotes.map((note: Note) => (
                    <div key={note.id} className="mb-4 break-inside-avoid">
                      <NoteCard note={note} onClick={() => handleNoteCardClick(note.id)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
                <div className="my-6">
                    <Separator />
                </div>
            )}
            
            {unpinnedNotes.length > 0 && (
                 <>
                    {pinnedNotes.length > 0 && ( // Only show "Others" label if there are pinned notes
                        <div className="mb-2">
                            <h2 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Others</h2>
                        </div>
                    )}
                    <div 
                    className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
                    style={{ columnFill: 'balance' }}
                    >
                    {unpinnedNotes.map((note: Note) => (
                        <div key={note.id} className="mb-4 break-inside-avoid">
                        <NoteCard note={note} onClick={() => handleNoteCardClick(note.id)} />
                        </div>
                    ))}
                    </div>
                </>
            )}

            {filteredNotes.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-10 mt-8">
                <p>{searchTerm ? `No notes found for "${searchTerm}".` : "No notes yet. Try creating one!"}</p>
              </div>
            )}
          </main>
        </div>
        <AiFloatingButton onClick={() => setIsAiPanelOpen(true)} />
        <AiFloatingPanel isOpen={isAiPanelOpen} onOpenChange={setIsAiPanelOpen} />
      </div>
    </SidebarProvider>
  );
}
