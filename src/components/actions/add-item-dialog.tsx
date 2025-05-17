"use client";

import { useState } from 'react';
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
import type { TreeItemType } from '@/types';
import { Icons } from '@/components/icons';

interface AddItemDialogProps {
  itemType: TreeItemType;
  parentId?: string | null; // NotebookId for folder/note, FolderId for note
  notebookId?: string | null; // Required for folder and note
  onConfirm: (name: string) => void;
  trigger?: React.ReactNode;
}

export function AddItemDialog({ itemType, parentId, notebookId, onConfirm, trigger }: AddItemDialogProps) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const capitalizedItemType = itemType.charAt(0).toUpperCase() + itemType.slice(1);

  const handleSubmit = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Icons.Add className="h-4 w-4" />
            New {capitalizedItemType}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New {capitalizedItemType}</DialogTitle>
          <DialogDescription>
            Enter a name for your new {itemType}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!name.trim()}>Save {capitalizedItemType}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
