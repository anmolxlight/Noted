
"use client";

import type { Note } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  // Keep content to a reasonable preview length
  const previewContent = note.content.length > 200 
    ? note.content.substring(0, 200) + "..."
    : note.content;

  return (
    <Card className="break-inside-avoid-column shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2 pt-4 px-4">
        {note.title && <CardTitle className="text-base font-medium leading-snug">{note.title}</CardTitle>}
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
          {previewContent}
        </p>
      </CardContent>
      <CardFooter className="p-2 px-4 flex justify-end items-center min-h-[40px]">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Placeholder for action icons on hover */}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <Icons.Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <Icons.Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <Icons.More className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
