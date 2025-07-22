import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProfessionalSchema, type InsertProfessional, type Professional } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  isOpen: boolean;
  onClose: () => void;
  professional?: Professional;
  mode: "create" | "edit";
}

const formSchema = insertProfessionalSchema;

export function ProfessionalModal({ isOpen, onClose, professional, mode }: ProfessionalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Omit<InsertProfessional, "userId">>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      specialty: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (professional && mode === "edit") {
      form.reset({
        name: professional.name,
        specialty: professional.specialty,
        phone: professional.phone,
        email: professional.email || "",
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        specialty: "",
        phone: "",
        email: "",
      });
    }
  }, [professional, mode, form]);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertProfessional, "userId">) => {
      const response = await apiRequest("POST", "/api/professionals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Sucesso",
        description: "Profissional cadastrado com sucesso!",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar profissional",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<InsertProfessional, "userId">) => {
      const response = await apiRequest("PUT", `/api/professionals/${professional?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/professionals"] });
      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso!",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar profissional",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: Omit<InsertProfessional, "userId">) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Cadastrar Novo Profissional" : "Editar Profissional"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Preencha os dados do novo profissional. Campos marcados com * são obrigatórios."
              : "Edite os dados do profissional."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do profissional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cabeleireiro, Manicure, Esteticista" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="profissional@email.com" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : (mode === "create" ? "Cadastrar" : "Salvar")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}