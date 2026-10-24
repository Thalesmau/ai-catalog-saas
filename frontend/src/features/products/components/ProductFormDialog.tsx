import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { handleFormError } from '@/lib/formErrors';
import { centsToInput, parseBRL } from '@/lib/money';

import type { CategorySummary, Product, ProductInput } from '../api';
import { useProductMutations } from '../hooks';
import { type ProductFormValues, productFormSchema } from '../schemas';
import { ProductImage } from './ProductImage';

const EMPTY_VALUES: ProductFormValues = { name: '', description: '', price: '', category: '', imageUrl: '' };

function toFormValues(product: Product | null): ProductFormValues {
  if (!product) {
    return EMPTY_VALUES;
  }

  return {
    name: product.name,
    description: product.description,
    price: centsToInput(product.priceInCents),
    category: product.category,
    imageUrl: product.imageUrl ?? '',
  };
}

function toInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name,
    description: values.description,
    priceInCents: parseBRL(values.price)!,
    category: values.category,
    imageUrl: values.imageUrl || null,
  };
}

type ProductFormDialogProps = {
  open: boolean;
  product: Product | null;
  categories: CategorySummary[];
  onOpenChange: (open: boolean) => void;
};

export function ProductFormDialog({ open, product, categories, onOpenChange }: ProductFormDialogProps) {
  const { create, update } = useProductMutations();
  const isEditing = Boolean(product);

  const { register, handleSubmit, reset, setError, control, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const imageUrl = useWatch({ control, name: 'imageUrl' });

  useEffect(() => {
    if (open) {
      reset(toFormValues(product));
    }
  }, [open, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (product) {
        await update.mutateAsync({ id: product.id, input: toInput(values) });
      } else {
        await create.mutateAsync(toInput(values));
      }

      onOpenChange(false);
    } catch (error) {
      handleFormError(error, setError, ['name', 'description', 'category', 'imageUrl']);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'As alterações aparecem para todos da empresa.' : 'O produto fica visível para todos da empresa.'}
          </DialogDescription>
        </DialogHeader>

        <form id="product-form" onSubmit={onSubmit} className="grid gap-4" noValidate>
          <FormField label="Nome" error={errors.name?.message} {...register('name')} />

          <div className="grid gap-2">
            <Label htmlFor="product-description">Descrição</Label>
            <Textarea
              id="product-description"
              rows={4}
              aria-invalid={Boolean(errors.description)}
              {...register('description')}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Preço (R$)"
              inputMode="decimal"
              placeholder="129,90"
              error={errors.price?.message}
              {...register('price')}
            />
            <FormField
              label="Categoria"
              list="product-categories"
              autoComplete="off"
              error={errors.category?.message}
              {...register('category')}
            />
            <datalist id="product-categories">
              {categories.map(item => <option key={item.category} value={item.category} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <FormField
              label="URL da imagem (opcional)"
              type="url"
              placeholder="https://..."
              error={errors.imageUrl?.message}
              {...register('imageUrl')}
            />
            <ProductImage
              src={errors.imageUrl ? null : imageUrl || null}
              alt="Pré-visualização"
              className="mt-[22px] size-16 rounded-md border"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEditing ? 'Salvar alterações' : 'Criar produto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
