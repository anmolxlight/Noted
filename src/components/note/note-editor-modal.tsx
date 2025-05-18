
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useNoteWiseStore } from '@/lib/store';
import type { Note, NoteListItem } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  // DialogHeader, // Not explicitly used for title in this design
  // DialogTitle, // Not explicitly used for title in this design
  // DialogFooter, // Custom footer structure
  // DialogClose, // Custom close handling
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { NoteColorPopover } from './note-color-popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const createId = () => Math.random().toString(36).substr(2, 9);

export function NoteEditorModal() {
  const editingNoteId = useNoteWiseStore(state => state.editingNoteId);
  const editingNote = useNoteWiseStore(state => state.notes.find(n => n.id === state.editingNoteId));
  const setEditingNoteId = useNoteWiseStore(state => state.setEditingNoteId);
  const updateNote = useNoteWiseStore(state => state.updateNote);
  const togglePinNote = useNoteWiseStore(state => state.togglePinNote);
  const trashNote = useNoteWiseStore(state => state.trashNote);
  
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentItems, setCurrentItems] = useState<NoteListItem[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [formattedUpdatedAt, setFormattedUpdatedAt] = useState<string | null>(null);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [newListItemText, setNewListItemText] = useState('');

  const { toast } = useToast();
  const contentAreaRef = useRef<HTMLDivElement>(null); 

  const markChanges = useCallback(() => {
    if (!hasChanges) {
        setHasChanges(true);
    }
  }, [hasChanges]);

  useEffect(() => {
    if (editingNote) {
      setCurrentTitle(editingNote.title || '');
      setCurrentContent(editingNote.content || '');
      setCurrentItems(editingNote.items ? JSON.parse(JSON.stringify(editingNote.items)) : []);
      setCurrentImageUrl(editingNote.imageUrl || null);
      setCurrentColor(editingNote.color || null);
      setFormattedUpdatedAt(new Date(editingNote.updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      setShowImageUrlInput(!!editingNote.imageUrl);
      setHasChanges(false); // Reset changes flag when a new note is loaded or modal re-opens
    } else {
      // Reset all fields when modal is closed or no note is being edited
      setCurrentTitle('');
      setCurrentContent('');
      setCurrentItems([]);
      setCurrentImageUrl(null);
      setCurrentColor(null);
      setFormattedUpdatedAt(null);
      setShowImageUrlInput(false);
      setNewListItemText('');
      setHasChanges(false);
    }
  }, [editingNote]);


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(e.target.value);
    markChanges();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentContent(e.target.value);
    markChanges();
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentImageUrl(e.target.value);
    markChanges();
  };
  
  const handleColorChangeInPopover = (color: string | null) => {
    setCurrentColor(color);
    markChanges();
  };

  const handlePinToggle = () => {
    if (!editingNote) return;
    togglePinNote(editingNote.id); // Store handles immediate update for pinned status
    toast({ title: editingNote.pinned ? "Note Unpinned" : "Note Pinned" });
    // Pin status is reflected immediately from store, `hasChanges` not strictly needed for this for modal save
  };

  const handleDeleteNote = () => {
    if (!editingNote) return;
    trashNote(editingNote.id);
    toast({ title: "Note Deleted", description: `"${editingNote.title || 'Untitled Note'}" moved to trash.` });
    setEditingNoteId(null); // Close modal after deleting
  };

  const handleItemTextChange = (itemId: string, newText: string) => {
    setCurrentItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, text: newText } : item));
    markChanges();
  };

  const handleItemCheckedChange = (itemId: string) => {
    setCurrentItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item));
    markChanges();
  };

  const handleAddListItem = () => {
    if (!editingNote || !newListItemText.trim()) {
        if (newListItemText.trim()) { // if there's text, add it
             const newItem: NoteListItem = { id: createId(), text: newListItemText.trim(), checked: false };
             setCurrentItems(prevItems => [...prevItems, newItem]);
             setNewListItemText('');
             markChanges();
        }
        // If newListItemText is empty, we might want to focus the next input or do nothing.
        // For now, just clear and mark changes if text was added.
        return;
    }
    const newItem: NoteListItem = { id: createId(), text: newListItemText.trim(), checked: false };
    setCurrentItems(prevItems => [...prevItems, newItem]);
    setNewListItemText(''); // Clear input for next item
    markChanges();
    // Optionally, focus the newListItemText input again or the newly created item's input
  };
  
  const handleDeleteListItem = (itemId: string) => {
    setCurrentItems(prevItems => prevItems.filter(item => item.id !== itemId));
    markChanges();
  };

  const handleSaveChanges = useCallback(() => {
    if (!editingNote) return false; // No note to save
    if (!hasChanges) return false; // No changes made

    const updatedNoteData: Partial<Note> = {
      title: currentTitle.trim(),
      content: editingNote.type === 'text' ? currentContent.trim() : '', // Save trimmed content
      items: editingNote.type === 'list' ? currentItems : undefined,
      imageUrl: currentImageUrl,
      color: currentColor,
      updatedAt: new Date().toISOString(),
    };
    
    updateNote(editingNote.id, updatedNoteData);
    // toast({ title: "Note Saved", description: `"${currentTitle || 'Untitled Note'}" has been updated.` });
    setHasChanges(false); // Reset after saving
    return true;
  }, [editingNote, currentTitle, currentContent, currentItems, currentImageUrl, currentColor, updateNote, hasChanges, toast]);

  const handleClose = () => {
    handleSaveChanges(); 
    setEditingNoteId(null); 
  };

  if (!editingNote) {
    return null;
  }

  return (
    <Dialog open={!!editingNote} onOpenChange={(open) => {
      if (!open) { 
        handleClose();
      }
    }}>
      <DialogContent 
        className="sm:max-w-lg p-0 flex flex-col max-h-[90vh] shadow-xl" 
        style={{ backgroundColor: currentColor || undefined }}
        onPointerDownOutside={(e) => { // Prevent closing when interacting with popovers
          if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]') || (e.target as HTMLElement).closest('.note-color-popover-trigger')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => { // Prevent closing when interacting with popovers
             if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]') || (e.target as HTMLElement).closest('.note-color-popover-trigger')) {
                e.preventDefault();
            }
        }}
      >
        {/* Top section: Title and Pin/Bell icons */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
          <Input
            value={currentTitle}
            onChange={handleTitleChange}
            placeholder="Title"
            className="text-lg font-medium border-none shadow-none focus-visible:ring-0 p-0 h-auto flex-grow bg-transparent placeholder:text-foreground/60"
          />
          <div className="flex-shrink-0 flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePinToggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              {editingNote.pinned ? <Icons.PinOff className="h-5 w-5 text-primary" /> : <Icons.Pin className="h-5 w-5" />}
            </Button>
            {/* Placeholder for Bell icon based on screenshot */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Icons.Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image Area */}
        {currentImageUrl && (
          <div className="relative w-full aspect-[16/9] overflow-hidden my-2 px-4">
            <Image src={currentImageUrl} alt={currentTitle || "Note image"} layout="fill" objectFit="cover" data-ai-hint="note image" />
          </div>
        )}
        {showImageUrlInput && !currentImageUrl && (
            <div className="px-4 pb-2 pt-1">
                <Input
                    type="text"
                    placeholder="Image URL (e.g., https://placehold.co/600x400.png)"
                    value={currentImageUrl || ''}
                    onChange={handleImageUrlChange}
                    className="h-8 text-sm bg-transparent/50"
                />
            </div>
        )}

        {/* Content Area */}
        <ScrollArea className="flex-grow min-h-[150px] max-h-[50vh] px-4 pb-2" ref={contentAreaRef}>
          {editingNote.type === 'list' ? (
            <div className="space-y-2 mt-1">
              {currentItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <Checkbox
                    id={`modal-item-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={() => handleItemCheckedChange(item.id)}
                    className="shrink-0 border-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Input
                    value={item.text}
                    onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                    placeholder="List item"
                    className={cn(
                      "h-auto p-0 border-none focus-visible:ring-0 bg-transparent text-sm flex-grow",
                      item.checked && "line-through text-muted-foreground"
                    )}
                     onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            // Potentially add new item or move to next, for now just basic handling
                            const nextInput = e.currentTarget.parentElement?.nextElementSibling?.querySelector('input');
                            if (nextInput) {
                                (nextInput as HTMLInputElement).focus();
                            } else {
                                handleAddListItem(); // Or focus the "add item" input
                                setTimeout(() => document.getElementById('new-list-item-input')?.focus(), 0);
                            }
                        }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteListItem(item.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    aria-label="Delete item"
                  >
                    <Icons.Clear className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {/* Add new list item input */}
              <div className="flex items-center gap-2 pl-[calc(1rem_-_2px)]"> {/* Align with checkbox + gap */}
                <Icons.Add className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    id="new-list-item-input"
                    value={newListItemText}
                    onChange={(e) => setNewListItemText(e.target.value)}
                    placeholder="List item"
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddListItem();}}}
                    className="h-auto p-0 border-none focus-visible:ring-0 bg-transparent text-sm flex-grow"
                />
                 {/* Hidden button to submit, or rely on Enter */}
              </div>
            </div>
          ) : (
            <Textarea
              value={currentContent}
              onChange={handleContentChange}
              placeholder="Take a note..."
              className="h-full min-h-[150px] w-full border-none shadow-none focus-visible:ring-0 p-0 resize-none text-sm bg-transparent placeholder:text-foreground/60"
            />
          )}
        </ScrollArea>

        {/* Footer Toolbar */}
        <div className="flex items-center justify-start gap-0.5 p-2 px-3 border-t border-border/30">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Collaborators (placeholder)" disabled>
              <Icons.UserPlus className="h-4 w-4" />
            </Button>
            <NoteColorPopover note={editingNote} onOpenChange={() => {}} >
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground note-color-popover-trigger" aria-label="Change color">
                    <Icons.Palette className="h-4 w-4" />
                </Button>
            </NoteColorPopover>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                onClick={() => setShowImageUrlInput(prev => !prev)} 
                aria-label={showImageUrlInput ? "Hide image URL input" : "Show image URL input"}>
              <Icons.Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Archive (placeholder)" disabled>
              <Icons.Archive className="h-4 w-4" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="More options">
                        <Icons.More className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={5}>
                    <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteNote();}}>
                        <Icons.Trash className="mr-2 h-4 w-4" /> Delete note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {e.stopPropagation(); /* TODO: Implement Make a copy */}} disabled>
                        <Icons.Copy className="mr-2 h-4 w-4" /> Make a copy
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-grow"></div> {/* Spacer */}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Undo (placeholder)" disabled>
              <Icons.Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Redo (placeholder)" disabled>
              <Icons.Redo className="h-4 w-4" />
            </Button>
        </div>

        {/* Bottom Status Line: "Edited at" and "Close" button */}
        <div className="flex items-center justify-between p-2 px-4 pt-0 ">
            {formattedUpdatedAt && (
              <span className="text-xs text-muted-foreground">
                Edited {formattedUpdatedAt}
              </span>
            )}
            <div className="flex-grow"></div> {/* Spacer to push Close button to the right if no timestamp */}
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

