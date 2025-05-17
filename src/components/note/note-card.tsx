
"use client";

import Image from 'next/image';
import type { Note } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useNoteWiseStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { NoteColorPopover } from './note-color-popover'; // New import
import { useState } from 'react';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const toggleNoteListItem = useNoteWiseStore(state => state.toggleNoteListItem);
  const togglePinNote = useNoteWiseStore(state => state.togglePinNote);
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false);

  const handleItemToggle = (itemId: string) => {
    toggleNoteListItem(note.id, itemId);
  };

  const handlePinToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click
    togglePinNote(note.id);
  };

  const renderContent = () => {
    if (note.type === 'list' && note.items) {
      const uncheckedItems = note.items.filter(item => !item.checked);
      const checkedItems = note.items.filter(item => item.checked);

      return (
        <div className="space-y-1.5">
          {uncheckedItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 group">
              <Checkbox
                id={`item-${item.id}-${note.id}`} // Ensure unique ID
                checked={item.checked}
                onCheckedChange={() => handleItemToggle(item.id)}
                onClick={(e) => e.stopPropagation()} 
                className="shrink-0"
                aria-label={item.text || "list item"}
              />
              <label
                htmlFor={`item-${item.id}-${note.id}`} // Ensure unique ID
                className={cn(
                  "flex-grow text-sm break-words cursor-pointer",
                  item.checked && "line-through text-muted-foreground"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    handleItemToggle(item.id);
                }}
              >
                {item.text || <span className="italic text-muted-foreground">Empty item</span>}
              </label>
            </div>
          ))}
          {checkedItems.length > 0 && uncheckedItems.length > 0 && (
            <hr className="my-2 border-border/50" />
          )}
          {checkedItems.map(item => (
             <div key={item.id} className="flex items-center gap-2 group">
              <Checkbox
                id={`item-${item.id}-${note.id}`} // Ensure unique ID
                checked={item.checked}
                onCheckedChange={() => handleItemToggle(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
                aria-label={item.text || "list item"}
              />
              <label
                htmlFor={`item-${item.id}-${note.id}`} // Ensure unique ID
                className={cn(
                  "flex-grow text-sm break-words cursor-pointer",
                  item.checked && "line-through text-muted-foreground"
                )}
                 onClick={(e) => {
                    e.stopPropagation();
                    handleItemToggle(item.id);
                }}
              >
                {item.text || <span className="italic text-muted-foreground">Empty item</span>}
              </label>
            </div>
          ))}
        </div>
      );
    }
    const previewContent = note.content.length > 200 
      ? note.content.substring(0, 200) + "..."
      : note.content;
    return (
      <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
        {previewContent}
      </p>
    );
  };

  return (
    <Card 
        className="break-inside-avoid-column shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer group/notecard relative" 
        onClick={onClick}
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.();}}
        aria-label={`Note titled ${note.title || 'Untitled'}`}
        style={{ backgroundColor: note.color || undefined }}
    >
      {note.imageUrl && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-lg">
          <Image
            src={note.imageUrl}
            alt={note.title || 'Note image'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="note image"
          />
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-7 w-7 text-muted-foreground opacity-0 group-hover/notecard:opacity-100 focus-within:opacity-100 transition-opacity z-10"
        onClick={handlePinToggle}
        aria-label={note.pinned ? "Unpin note" : "Pin note"}
      >
        {note.pinned ? <Icons.PinOff className="h-4 w-4 text-primary" /> : <Icons.Pin className="h-4 w-4" />}
      </Button>

      <CardHeader className={cn("pb-2 pt-4 px-4", note.imageUrl && "pt-3")}>
        {note.title && <CardTitle className="text-base font-medium leading-snug break-words">{note.title}</CardTitle>}
      </CardHeader>
      <CardContent className="px-4 pb-2">
        {renderContent()}
      </CardContent>
      <CardFooter className="p-2 px-4 flex justify-end items-center min-h-[40px]">
        <div className="flex gap-1 opacity-0 group-hover/notecard:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Add reminder">
                <Icons.Bell className="h-4 w-4" />
            </Button>
            <NoteColorPopover note={note} onOpenChange={setIsColorPopoverOpen}>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Change color">
                  <Icons.Palette className="h-4 w-4" />
              </Button>
            </NoteColorPopover>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Archive note">
                <Icons.Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="More options">
                <Icons.More className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
