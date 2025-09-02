import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Finska
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie suas finanças pessoais de forma inteligente e colaborativa
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="px-8">
                  Acessar Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="px-8">
                    Começar Agora
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="px-8">
                    Fazer Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <DollarSign className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Controle Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitore receitas e despesas com categorização inteligente
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Análises Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Visualize gráficos e relatórios para tomar melhores decisões
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Contas Compartilhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Gerencie finanças familiares ou de grupos com facilidade
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Bell className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Lembretes Inteligentes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Nunca esqueça de pagar contas ou receber pagamentos
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold mb-4">
            Transforme sua relação com o dinheiro
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Finska oferece todas as ferramentas que você precisa para organizar suas finanças, 
            desde o controle básico até análises avançadas e gestão colaborativa.
          </p>
        </div>
      </div>
    </div>
  );
}