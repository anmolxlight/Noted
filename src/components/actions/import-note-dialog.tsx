"use client";

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from '@/components/icons';
import { useNoteWiseStore } from '@/lib/store';

interface ImportNoteDialogProps {
  notebookId: string | null;
  folderId?: string | null;
  trigger?: React.ReactNode;
}

export function ImportNoteDialog({ notebookId, folderId, trigger }: ImportNoteDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const importNoteFromFile = useNoteWiseStore(state => state.importNoteFromFile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === "text/plain") {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a .txt file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }
    if (!notebookId) {
        toast({
            title: "No Notebook Selected",
            description: "Please select or create a notebook first.",
            variant: "destructive",
        });
        return;
    }

    try {
      const importedNote = await importNoteFromFile(selectedFile, notebookId, folderId);
      if (importedNote) {
        toast({
          title: "Note Imported",
          description: `"${importedNote.title}" has been successfully imported.`,
        });
      }
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error importing note:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing your note. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-full justify-start flex items-center gap-1">
            <Icons.Import className="h-4 w-4" />
            Import Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Note</DialogTitle>
          <DialogDescription>
            Select a .txt file to import as a new note. The file name will be used as the note title.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note-file" className="text-right">
              File
            </Label>
            <Input
              id="note-file"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="col-span-3"
            />
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground col-span-4 px-1">Selected: {selectedFile.name}</p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!selectedFile}>Import Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
