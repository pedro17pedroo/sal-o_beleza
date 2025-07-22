import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ProfessionalModal from "@/components/modals/professional-modal";
import type { Professional } from "@shared/schema";

export default function ProfessionalsManager() {
  const [professionalModalOpen, setProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const { toast } = useToast();

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["/api/professionals"],
  });

  const deleteProfessionalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/professionals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Profissional excluído",
        description: "O profissional foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir profissional",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setProfessionalModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este profissional?")) {
      deleteProfessionalMutation.mutate(id);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle>Gerenciar Profissionais</CardTitle>
            <Button onClick={() => {
              setEditingProfessional(null);
              setProfessionalModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Profissional
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex space-x-2">
                      <Skeleton className="w-8 h-8" />
                      <Skeleton className="w-8 h-8" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-40" />
                </div>
              ))}
            </div>
          ) : professionals && professionals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional: Professional) => (
                <Card key={professional.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {getInitials(professional.name)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800">{professional.name}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(professional)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(professional.id)}
                          disabled={deleteProfessionalMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">Nenhum profissional cadastrado</h3>
              <p className="text-slate-600 mb-6">Comece cadastrando os profissionais do seu salão</p>
              <Button onClick={() => {
                setEditingProfessional(null);
                setProfessionalModalOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Profissional
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ProfessionalModal 
        open={professionalModalOpen} 
        onOpenChange={(open) => {
          setProfessionalModalOpen(open);
          if (!open) setEditingProfessional(null);
        }}
        professional={editingProfessional}
      />
    </div>
  );
}
