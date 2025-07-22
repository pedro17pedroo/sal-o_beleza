import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, User, Lock } from "lucide-react";
import type { Professional } from "@shared/schema";

interface SystemAccessModalProps {
  professional: Professional | null;
  open: boolean;
  onClose: () => void;
}

export function SystemAccessModal({ professional, open, onClose }: SystemAccessModalProps) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { toast } = useToast();

  const grantAccessMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      await apiRequest("POST", `/api/professionals/${professional?.id}/grant-access`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Acesso concedido",
        description: "O profissional agora pode acessar o sistema.",
      });
      onClose();
      setCredentials({ username: "", password: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao conceder acesso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokeAccessMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/professionals/${professional?.id}/revoke-access`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Acesso revogado",
        description: "O profissional não pode mais acessar o sistema.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao revogar acesso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha usuário e senha.",
        variant: "destructive",
      });
      return;
    }
    grantAccessMutation.mutate(credentials);
  };

  const handleRevokeAccess = () => {
    if (confirm("Tem certeza que deseja revogar o acesso ao sistema para este profissional?")) {
      revokeAccessMutation.mutate();
    }
  };

  if (!professional) return null;

  const hasSystemAccess = professional.canAccessSystem;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Acesso ao Sistema</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <User className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium">{professional.name}</p>
              <p className="text-sm text-muted-foreground">{professional.specialty}</p>
            </div>
          </div>

          {hasSystemAccess ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Este profissional tem acesso ao sistema</span>
              </div>
              
              <Button 
                onClick={handleRevokeAccess}
                disabled={revokeAccessMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                {revokeAccessMutation.isPending ? "Revogando..." : "Revogar Acesso"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Este profissional não tem acesso ao sistema</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite o nome de usuário"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose} className="w-full">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={grantAccessMutation.isPending}
                  className="w-full"
                >
                  {grantAccessMutation.isPending ? "Concedendo..." : "Conceder Acesso"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}