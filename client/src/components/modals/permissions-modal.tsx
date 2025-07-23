import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Shield, User, Lock, Settings, Eye, Edit, DollarSign } from "lucide-react";
import type { Professional } from "@shared/schema";
import { PERMISSIONS } from "@shared/schema";

interface PermissionsModalProps {
  professional: Professional | null;
  open: boolean;
  onClose: () => void;
}

const PERMISSION_LABELS = {
  [PERMISSIONS.VIEW_APPOINTMENTS]: "Visualizar Agendamentos",
  [PERMISSIONS.MANAGE_APPOINTMENTS]: "Gerenciar Agendamentos",
  [PERMISSIONS.VIEW_CLIENTS]: "Visualizar Clientes",
  [PERMISSIONS.MANAGE_CLIENTS]: "Gerenciar Clientes",
  [PERMISSIONS.VIEW_SERVICES]: "Visualizar Serviços",
  [PERMISSIONS.MANAGE_SERVICES]: "Gerenciar Serviços",
  [PERMISSIONS.VIEW_FINANCIAL]: "Visualizar Financeiro",
  [PERMISSIONS.MANAGE_FINANCIAL]: "Gerenciar Financeiro",
};

const PERMISSION_ICONS = {
  [PERMISSIONS.VIEW_APPOINTMENTS]: Eye,
  [PERMISSIONS.MANAGE_APPOINTMENTS]: Edit,
  [PERMISSIONS.VIEW_CLIENTS]: Eye,
  [PERMISSIONS.MANAGE_CLIENTS]: Edit,
  [PERMISSIONS.VIEW_SERVICES]: Eye,
  [PERMISSIONS.MANAGE_SERVICES]: Edit,
  [PERMISSIONS.VIEW_FINANCIAL]: Eye,
  [PERMISSIONS.MANAGE_FINANCIAL]: DollarSign,
};

export function PermissionsModal({ professional, open, onClose }: PermissionsModalProps) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  // Get current permissions for professional
  const { data: currentPermissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["/api/professionals", professional?.id, "permissions"],
    queryFn: async () => {
      if (!professional?.id) return [];
      const response = await apiRequest("GET", `/api/professionals/${professional.id}/permissions`);
      return await response.json();
    },
    enabled: !!professional?.id && professional.canAccessSystem,
  });

  useEffect(() => {
    if (currentPermissions.length > 0) {
      setSelectedPermissions(currentPermissions.map((p: any) => p.permission));
    } else {
      setSelectedPermissions([]);
    }
  }, [currentPermissions]);

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
      setSelectedPermissions([]);
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

  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions: string[]) => {
      await apiRequest("PUT", `/api/professionals/${professional?.id}/permissions`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals", professional?.id, "permissions"] });
      toast({
        title: "Permissões atualizadas",
        description: "As permissões do profissional foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar permissões",
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
    if (confirm("Tem certeza que deseja revogar o acesso ao sistema para este profissional? Todas as permissões serão removidas.")) {
      revokeAccessMutation.mutate();
    }
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setSelectedPermissions(prev => 
      checked 
        ? [...prev, permission]
        : prev.filter(p => p !== permission)
    );
  };

  const handleSavePermissions = () => {
    updatePermissionsMutation.mutate(selectedPermissions);
  };

  if (!professional) return null;

  const hasSystemAccess = professional.canAccessSystem;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Controle de Acesso e Permissões</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <User className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium">{professional.name}</p>
              <p className="text-sm text-muted-foreground">{professional.specialty}</p>
            </div>
            {hasSystemAccess && (
              <Badge variant="secondary" className="ml-auto">
                Acesso Ativo
              </Badge>
            )}
          </div>

          <Tabs defaultValue="access" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="access">Acesso ao Sistema</TabsTrigger>
              <TabsTrigger value="permissions" disabled={!hasSystemAccess}>
                Permissões
              </TabsTrigger>
            </TabsList>

            <TabsContent value="access" className="space-y-4">
              {hasSystemAccess ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-600">
                      <Shield className="w-5 h-5" />
                      <span>Acesso Concedido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este profissional possui acesso ao sistema e pode fazer login com suas credenciais.
                    </p>
                    <Button 
                      onClick={handleRevokeAccess}
                      disabled={revokeAccessMutation.isPending}
                      variant="destructive"
                    >
                      {revokeAccessMutation.isPending ? "Revogando..." : "Revogar Acesso"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-muted-foreground">
                      <Lock className="w-5 h-5" />
                      <span>Sem Acesso</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGrantAccess} className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Crie credenciais de acesso para permitir que este profissional faça login no sistema.
                      </p>

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
                        <Button type="button" variant="outline" onClick={onClose}>
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={grantAccessMutation.isPending}
                        >
                          {grantAccessMutation.isPending ? "Concedendo..." : "Conceder Acesso"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Permissões do Sistema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {permissionsLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando permissões...</p>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Selecione as permissões que este profissional deve ter no sistema:
                      </p>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(PERMISSIONS).map(([key, permission]) => {
                          const Icon = PERMISSION_ICONS[permission];
                          const isChecked = selectedPermissions.includes(permission);
                          
                          return (
                            <div key={permission} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Checkbox 
                                id={permission}
                                checked={isChecked}
                                onCheckedChange={(checked) => handlePermissionToggle(permission, !!checked)}
                              />
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <label 
                                htmlFor={permission}
                                className="text-sm font-medium cursor-pointer flex-1"
                              >
                                {PERMISSION_LABELS[permission]}
                              </label>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSavePermissions}
                          disabled={updatePermissionsMutation.isPending}
                        >
                          {updatePermissionsMutation.isPending ? "Salvando..." : "Salvar Permissões"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}