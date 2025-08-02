import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deleting?: boolean;
  conta?: any;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  deleting = false,
  conta,
  title = "Confirmar exclusão",
  description = "Esta ação não pode ser desfeita.",
  itemName,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const getDisplayName = () => {
    if (conta) {
      return `${conta.banco} - Ag: ${conta.agencia} / CC: ${conta.conta}`;
    }
    return itemName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(conta || itemName) && (
              <>
                Tem certeza que deseja excluir <span className="font-medium text-gray-900 dark:text-gray-100">"{getDisplayName()}"</span>?
              </>
            )}
          </p>
        </div>

        <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting || isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting || isLoading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {deleting || isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
