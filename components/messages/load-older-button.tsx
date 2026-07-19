import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

type LoadOlderMessagesButtonProps = {
  onClick: () => void;
  isLoading: boolean;
};

export function LoadOlderMessagesButton({
  onClick,
  isLoading,
}: LoadOlderMessagesButtonProps) {
  return (
    <div className="flex justify-center pb-2">
      <Button variant="outline" size="sm" onClick={onClick} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2Icon className="animate-spin" />
            Loading...
          </>
        ) : (
          "Load older messages"
        )}
      </Button>
    </div>
  );
}
