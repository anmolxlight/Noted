"use client";

import React, { useState, useEffect } from 'react';
import { useNoteWiseStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function AiQueryPanel() {
  const {
    aiQuestion,
    setAiQuestion,
    aiResponse,
    isAiLoading,
    queryNotes,
    notes,
    setHighlightedLines,
    clearHighlightedLines,
    selectNote,
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
      setAiQuestion(localQuestion.trim()); // Update store, which triggers query
      queryNotes(localQuestion.trim());
    }
  };

  const handleReferenceClick = (noteTitle: string) => {
    const targetNote = notes.find(n => n.title === noteTitle);
    if (targetNote) {
      selectNote(targetNote.id); // This will also clear previous highlights
      // Find the specific reference for this note title in the current AI response
      const refForThisNote = aiResponse?.references.find(r => r.noteTitle === noteTitle);
      if (refForThisNote) {
        setHighlightedLines(targetNote.id, refForThisNote.lines);
      }
    }
  };

  const handleClear = () => {
    setLocalQuestion('');
    setAiQuestion('');
    clearHighlightedLines(); // This also clears the AI response via the store logic if needed or separate call
    // For now, clearing question is enough to imply new state. Explicit clear for response might be good.
    useNoteWiseStore.setState({ aiResponse: null }); 
  };

  return (
    <Card className="h-full flex flex-col shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icons.AI className="h-6 w-6 text-primary" /> AI Query Panel
          </CardTitle>
          { (aiQuestion || aiResponse) && 
            <Button variant="ghost" size="icon" onClick={handleClear} title="Clear Query and Response">
              <Icons.Clear className="h-5 w-5" />
            </Button>
          }
        </div>
        <CardDescription>Ask questions about your notes and get AI-powered answers.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-4">
        <div className="flex gap-2">
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
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        )}

        {aiResponse && !isAiLoading && (
          <ScrollArea className="h-[calc(100%-100px)] pr-3"> {/* Adjust height as needed */}
            <Alert variant="default" className="bg-background border-primary/50 shadow-sm">
              <Icons.AI className="h-5 w-5 text-primary" />
              <AlertTitle className="font-semibold text-primary">AI Response</AlertTitle>
              <AlertDescription className="mt-2 space-y-3 text-foreground/90">
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
          </ScrollArea>
        )}
         {!aiResponse && !isAiLoading && notes.length === 0 && (
             <Alert variant="default" className="mt-4">
                <Icons.Notebook className="h-5 w-5" />
                <AlertTitle>No Notes Yet</AlertTitle>
                <AlertDescription>
                    You don't have any notes to query. Add some notes or import them to start using the AI features.
                </AlertDescription>
            </Alert>
        )}

      </CardContent>
      <CardFooter className="border-t p-3 text-center">
        <p className="text-xs text-muted-foreground w-full">
          AI responses are generated by Google Gemini. Use Shift+Enter for new lines in query.
        </p>
      </CardFooter>
    </Card>
  );
}
