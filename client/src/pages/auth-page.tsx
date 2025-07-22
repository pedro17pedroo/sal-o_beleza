import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Shield } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:block text-center lg:text-left">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Sistema de Gestão
          </h1>
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Salão de Beleza
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Gerencie agendamentos, clientes e serviços do seu salão de forma simples e eficiente.
          </p>
          <div className="space-y-4 text-slate-600">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Controle de agendamentos com verificação de conflitos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Gestão completa de clientes e serviços</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Interface intuitiva e responsiva</span>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="lg:hidden">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
            <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
              <Shield className="w-4 h-4 mr-2" />
              Área restrita do sistema
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Usuário</Label>
                <Input
                  id="login-username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="font-medium mb-1">Credenciais padrão:</p>
                <p>Usuário: <code className="px-1 py-0.5 bg-muted rounded text-xs">admin</code></p>
                <p>Senha: <code className="px-1 py-0.5 bg-muted rounded text-xs">admin123</code></p>
                <p className="text-xs mt-2 text-orange-600">⚠️ Altere a senha após o primeiro acesso</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
