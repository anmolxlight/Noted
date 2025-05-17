
"use client";

import type { Note, NoteListItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useNoteWiseStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const toggleNoteListItem = useNoteWiseStore(state => state.toggleNoteListItem);

  const handleItemToggle = (itemId: string, e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click when toggling item
    toggleNoteListItem(note.id, itemId);
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
                id={`item-${item.id}`}
                checked={item.checked}
                onCheckedChange={() => toggleNoteListItem(note.id, item.id)}
                onClick={(e) => e.stopPropagation()} 
                className="shrink-0"
                aria-label={item.text || "list item"}
              />
              <label
                htmlFor={`item-${item.id}`}
                className={cn(
                  "flex-grow text-sm break-words cursor-pointer",
                  item.checked && "line-through text-muted-foreground"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleNoteListItem(note.id, item.id);
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
                id={`item-${item.id}`}
                checked={item.checked}
                onCheckedChange={() => toggleNoteListItem(note.id, item.id)}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
                aria-label={item.text || "list item"}
              />
              <label
                htmlFor={`item-${item.id}`}
                className={cn(
                  "flex-grow text-sm break-words cursor-pointer",
                  item.checked && "line-through text-muted-foreground"
                )}
                 onClick={(e) => {
                    e.stopPropagation();
                    toggleNoteListItem(note.id, item.id);
                }}
              >
                {item.text || <span className="italic text-muted-foreground">Empty item</span>}
              </label>
            </div>
          ))}
        </div>
      );
    }
    // Default to text content, previewed
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
        className="break-inside-avoid-column shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer group/notecard" 
        onClick={onClick}
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.();}}
        aria-label={`Note titled ${note.title || 'Untitled'}`}
    >
      <CardHeader className="pb-2 pt-4 px-4">
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
