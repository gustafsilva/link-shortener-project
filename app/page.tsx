import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon, BarChart3, Shield, Zap } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Encurte seus links.
              <br />
              <span className="text-primary">Amplifique seu alcance.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Crie links curtos, rastreáveis e profissionais em segundos. 
              Perfeito para redes sociais, marketing e muito mais.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg">
              <Link href="/dashboard">
                Começar Gratuitamente
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link href="#features">
                Conhecer Recursos
              </Link>
            </Button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            Sem necessidade de cartão de crédito • Configuração instantânea
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Recursos Poderosos
          </h2>
          <p className="text-muted-foreground text-lg">
            Tudo que você precisa para gerenciar seus links de forma eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <LinkIcon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Links Curtos</CardTitle>
              <CardDescription>
                Transforme URLs longas em links curtos e memoráveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie links personalizados que refletem sua marca e são fáceis de compartilhar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Análises Detalhadas</CardTitle>
              <CardDescription>
                Acompanhe cliques e desempenho em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Obtenha insights sobre quem está clicando em seus links e quando.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Seguro e Confiável</CardTitle>
              <CardDescription>
                Seus dados protegidos com segurança de nível empresarial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Autenticação segura e armazenamento criptografado de todos os seus links.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Rápido e Simples</CardTitle>
              <CardDescription>
                Interface intuitiva e velocidade instantânea
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie seus links em questão de segundos com nossa interface amigável.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Link Shortener. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
