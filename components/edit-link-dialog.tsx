'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateShortLink } from '@/lib/mutations/link-mutations';
import { Pencil, Loader2 } from 'lucide-react';

const formSchema = z.object({
  url: z.string().url('URL inválida. Por favor, insira uma URL válida.'),
  customCode: z
    .string()
    .min(3, 'O código deve ter pelo menos 3 caracteres.')
    .max(20, 'O código deve ter no máximo 20 caracteres.')
    .regex(/^[a-zA-Z0-9-_]+$/, 'O código deve conter apenas letras, números, hífens e underscores.')
    .optional()
    .or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface EditLinkDialogProps {
  link: {
    id: string;
    shortCode: string;
    originalUrl: string;
  };
}

export function EditLinkDialog({ link }: EditLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: link.originalUrl,
      customCode: link.shortCode,
    },
  });

  // Reset form when dialog opens or link changes
  useEffect(() => {
    if (open) {
      form.reset({
        url: link.originalUrl,
        customCode: link.shortCode,
      });
      setError(null);
    }
  }, [open, link, form]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateShortLink({
        id: link.id,
        url: data.url,
        customCode: data.customCode || undefined,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar o link.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" title="Editar link">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-131.25">
        <DialogHeader>
          <DialogTitle>Editar Link Encurtado</DialogTitle>
          <DialogDescription>
            Atualize a URL original ou o código personalizado do seu link.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Original</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/meu-link-muito-longo"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A URL completa para onde o link encurtado redireciona.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Personalizado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="meu-link"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    O código que aparece na URL encurtada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
