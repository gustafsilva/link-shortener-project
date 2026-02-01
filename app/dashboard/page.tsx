import { getUserLinks } from '@/lib/mutations/link-mutations';
import { CreateLinkDialog } from '@/components/create-link-dialog';
import { LinkCard } from '@/components/link-card';
import { Link2 } from 'lucide-react';

export default async function DashboardPage() {
  const links = await getUserLinks();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Gerencie seus links encurtados e acompanhe suas estatísticas.
            </p>
          </div>
          <CreateLinkDialog />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Total de Links</h3>
            </div>
            <p className="mt-2 text-3xl font-bold">{links.length}</p>
          </div>
        </div>

        {/* Links List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Seus Links</h2>
          {links.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Link2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum link ainda</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comece criando seu primeiro link encurtado.
              </p>
              <div className="mt-6">
                <CreateLinkDialog />
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {links.map((link: typeof links[number]) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
