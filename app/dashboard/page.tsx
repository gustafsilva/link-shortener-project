export default async function DashboardPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Bem-vindo ao seu painel de controle. Gerencie seus links encurtados e acompanhe suas estatísticas.
          </p>
        </div>
      </div>
    </div>
  );
}
