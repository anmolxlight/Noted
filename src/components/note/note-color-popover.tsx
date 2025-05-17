
"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icons } from "@/components/icons";
import { useNoteWiseStore } from "@/lib/store";
import type { Note } from "@/types";

interface NoteColorPopoverProps {
  note: Note;
  children: React.ReactNode; // This will be the trigger button
  onOpenChange?: (open: boolean) => void;
}

const availableColors: (string | null)[] = [
  null, // Default (no color)
  "hsl(0, 75%, 90%)",   // Light Red
  "hsl(30, 85%, 90%)",  // Light Orange
  "hsl(50, 95%, 90%)",  // Light Yellow
  "hsl(80, 70%, 88%)",  // Light Green
  "hsl(150, 60%, 90%)", // Light Teal
  "hsl(200, 80%, 90%)", // Light Blue
  "hsl(260, 70%, 92%)", // Light Purple
  "hsl(320, 60%, 92%)", // Light Pink
  "hsl(0, 0%, 90%)",    // Light Gray
];

export function NoteColorPopover({ note, children, onOpenChange }: NoteColorPopoverProps) {
  const updateNoteColor = useNoteWiseStore((state) => state.updateNoteColor);

  const handleColorSelect = (color: string | null) => {
    updateNoteColor(note.id, color);
    onOpenChange?.(false); // Close popover after selection
  };

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-5 gap-1">
          {availableColors.map((colorValue, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-8 w-8 rounded-full p-0 border-2"
              style={{
                backgroundColor: colorValue || undefined,
                borderColor: note.color === colorValue || (!note.color && !colorValue) ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
              onClick={() => handleColorSelect(colorValue)}
              aria-label={colorValue ? `Set color to ${colorValue}` : "Remove color"}
            >
              {note.color === colorValue || (!note.color && !colorValue) ? (
                 // Simple checkmark, can be replaced with lucide icon if preferred
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                     className={colorValue ? "text-black/70" : "text-foreground/70"}>
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : colorValue === null ? (
                <Icons.Clear className="h-4 w-4 text-muted-foreground" />
              ) : null}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
