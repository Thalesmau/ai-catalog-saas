import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import type { Product } from '../api';
import { useProductMutations } from '../hooks';

export function DeleteProductDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { remove } = useProductMutations();

  const confirm = async () => {
    if (!product) {
      return;
    }

    try {
      await remove.mutateAsync(product);
      onClose();
    } catch {
      return;
    }
  };

  return (
    <AlertDialog open={Boolean(product)} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{product?.name}&rdquo; será removido do catálogo e das respostas do assistente. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={remove.isPending}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={remove.isPending}>
            {remove.isPending && <Loader2 className="animate-spin" />}
            Excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
