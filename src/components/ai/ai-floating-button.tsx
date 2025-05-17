
"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface AiFloatingButtonProps {
  onClick: () => void;
}

export function AiFloatingButton({ onClick }: AiFloatingButtonProps) {
  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
      onClick={onClick}
      aria-label="Open AI Assistant"
    >
      <Icons.Bot className="h-7 w-7" />
    </Button>
  );
}
