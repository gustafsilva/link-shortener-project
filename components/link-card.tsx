'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteShortLink } from '@/lib/mutations/link-mutations';
import { EditLinkDialog } from '@/components/edit-link-dialog';
import { ExternalLink, Copy, Trash2, Check } from 'lucide-react';

interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
}

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use URL relativa para evitar erro de hidratação
  const shortUrl = `/${link.shortCode}`;
  // URL completa para copiar (só calculada no cliente quando necessário)
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/${link.shortCode}` : shortUrl;

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este link?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteShortLink(link.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir o link.');
      setIsDeleting(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Erro ao copiar o link.');
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {shortUrl}
              </a>
            </CardTitle>
            <CardDescription className="line-clamp-1">
              {link.originalUrl}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              title="Copiar link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              asChild
            >
              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir URL original"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <EditLinkDialog link={link} />
            <Button
              size="icon"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Excluir link"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </CardContent>
    </Card>
  );
}
