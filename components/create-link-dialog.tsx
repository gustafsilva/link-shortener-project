'use client';

import { useState } from 'react';
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
import { createShortLink } from '@/lib/mutations/link-mutations';
import { Plus, Loader2 } from 'lucide-react';

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

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      customCode: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      await createShortLink({
        url: data.url,
        customCode: data.customCode || undefined,
      });

      form.reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao criar o link.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Criar Novo Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-131.25">
        <DialogHeader>
          <DialogTitle>Criar Novo Link Encurtado</DialogTitle>
          <DialogDescription>
            Insira a URL que deseja encurtar. Opcionalmente, você pode escolher um código personalizado.
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
                    Cole a URL completa que deseja encurtar.
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
                  <FormLabel>Código Personalizado (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="meu-link"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Se deixar em branco, um código aleatório será gerado.
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
                Criar Link
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
