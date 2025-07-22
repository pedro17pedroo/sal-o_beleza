import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertProfessionalSchema, type Professional, type InsertProfessional } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfessionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | null;
}

export default function ProfessionalModal({ open, onOpenChange, professional }: ProfessionalModalProps) {
  const { toast } = useToast();
  const isEditing = !!professional;

  const form = useForm<InsertProfessional>({
    resolver: zodResolver(insertProfessionalSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (professional) {
      form.reset({
        name: professional.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [professional, form]);

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: InsertProfessional) => {
      const response = await apiRequest("POST", "/api/professionals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Profissional cadastrado",
        description: "O profissional foi cadastrado com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar profissional",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfessionalMutation = useMutation({
    mutationFn: async (data: InsertProfessional) => {
      const response = await apiRequest("PUT", `/api/professionals/${professional!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Profissional atualizado",
        description: "O profissional foi atualizado com sucesso.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar profissional",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProfessional) => {
    if (isEditing) {
      updateProfessionalMutation.mutate(data);
    } else {
      createProfessionalMutation.mutate(data);
    }
  };

  const isPending = createProfessionalMutation.isPending || updateProfessionalMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Profissional" : "Novo Profissional"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isPending}
              >
                {isPending 
                  ? (isEditing ? "Atualizando..." : "Salvando...") 
                  : (isEditing ? "Atualizar" : "Salvar")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
