
"use client";

import React, { useState, useEffect } from 'react';
import { useNoteWiseStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';

interface AiFloatingPanelProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AiFloatingPanel({ isOpen, onOpenChange }: AiFloatingPanelProps) {
  const {
    aiQuestion,
    setAiQuestion,
    aiResponse,
    isAiLoading,
    queryNotes,
    notes,
    selectNote, // For reference clicking, though highlighting lines might be complex in this context
    setHighlightedLines,
    clearHighlightedLines,
  } = useNoteWiseStore();

  const [localQuestion, setLocalQuestion] = useState(aiQuestion);

  useEffect(() => {
    setLocalQuestion(aiQuestion);
  }, [aiQuestion]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuestion(e.target.value);
  };

  const handleSubmitQuery = () => {
    if (localQuestion.trim()) {
      setAiQuestion(localQuestion.trim());
      queryNotes(localQuestion.trim());
    }
  };

  const handleReferenceClick = (noteTitle: string) => {
    const targetNote = notes.find(n => n.title === noteTitle);
    if (targetNote) {
      selectNote(targetNote.id); // This will select the note, main view might react to it.
      // Highlighting specific lines from a floating panel back to a potentially modal editor is complex.
      // For now, selecting the note is the primary action.
      const refForThisNote = aiResponse?.references.find(r => r.noteTitle === noteTitle);
      if (refForThisNote) {
         // TODO: Implement a way to show highlighted lines if notes are editable in a modal from here
        console.log("Highlight lines for note:", targetNote.id, refForThisNote.lines);
         // setHighlightedLines(targetNote.id, refForThisNote.lines); // This won't work directly with NoteCard
      }
      onOpenChange(false); // Close panel to show main view with selected note
    }
  };

  const handleClear = () => {
    setLocalQuestion('');
    setAiQuestion('');
    clearHighlightedLines(); 
    useNoteWiseStore.setState({ aiResponse: null }); 
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Icons.AI className="h-5 w-5 text-primary" /> AI Assistant
            </SheetTitle>
            <SheetClose asChild>
                <Button variant="ghost" size="icon">
                    <Icons.Clear className="h-5 w-5" />
                </Button>
            </SheetClose>
          </div>
           <SheetDescription className="text-xs">Ask questions about your notes.</SheetDescription>
        </SheetHeader>
        
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          <div className="flex gap-2 sticky top-0 bg-background py-2">
            <Input
              type="text"
              placeholder="Ask about your notes..."
              value={localQuestion}
              onChange={handleQuestionChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuery()}
              disabled={isAiLoading}
              className="flex-grow"
            />
            <Button onClick={handleSubmitQuery} disabled={isAiLoading || !localQuestion.trim()} className="flex items-center gap-2">
              {isAiLoading ? <Icons.AI className="h-4 w-4 animate-spin" /> : <Icons.Search className="h-4 w-4" />}
              Ask
            </Button>
          </div>

          {isAiLoading && (
            <div className="space-y-3 mt-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {aiResponse && !isAiLoading && (
             <Alert variant="default" className="bg-background border-primary/30 shadow-sm">
              <Icons.AI className="h-5 w-5 text-primary absolute left-4 top-4" />
              <AlertTitle className="font-semibold text-primary ml-7">AI Response</AlertTitle>
              <AlertDescription className="mt-2 space-y-3 text-foreground/90 ml-7">
                <p className="whitespace-pre-wrap leading-relaxed">{aiResponse.answer}</p>
                {aiResponse.references && aiResponse.references.length > 0 && (
                  <>
                    <Separator className="my-3 bg-border"/>
                    <h4 className="font-medium text-foreground">References:</h4>
                    <ul className="space-y-1 list-disc list-inside">
                      {aiResponse.references.map((ref, index) => (
                        <li key={index} className="text-sm">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary hover:underline"
                            onClick={() => handleReferenceClick(ref.noteTitle)}
                          >
                            {ref.noteTitle}
                          </Button>
                          {ref.lines && ref.lines.length > 0 && (
                            <span className="text-muted-foreground"> (lines: {ref.lines.join(', ')})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                 {aiResponse.references.length === 0 && aiResponse.answer !== "No notes available to query." && aiResponse.answer !== "Error processing your question." && (
                    <p className="text-sm text-muted-foreground italic">No specific references found for this answer.</p>
                )}
              </AlertDescription>
            </Alert>
          )}
           {!aiResponse && !isAiLoading && notes.length === 0 && (
               <Alert variant="default" className="mt-4">
                  <Icons.Notebook className="h-5 w-5 absolute left-4 top-4" />
                  <AlertTitle className="ml-7">No Notes Yet</AlertTitle>
                  <AlertDescription className="ml-7">
                      You don't have any notes to query. Add some notes to start using the AI features.
                  </AlertDescription>
              </Alert>
          )}
           {!aiResponse && !isAiLoading && notes.length > 0 && !aiQuestion && (
             <Alert variant="default" className="mt-4 border-dashed">
                <Icons.Search className="h-5 w-5 absolute left-4 top-4" />
                <AlertTitle className="ml-7">Ready to assist!</AlertTitle>
                <AlertDescription className="ml-7">
                    Type your question above to get insights from your notes.
                </AlertDescription>
             </Alert>
           )}
        </div>
        
        <SheetFooter className="border-t p-3 text-center bg-background">
          <p className="text-xs text-muted-foreground w-full">
            AI responses by Google Gemini.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
