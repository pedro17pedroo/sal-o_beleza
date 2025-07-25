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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
      workDays: "1,2,3,4,5", // Monday to Friday
      workStartTime: "08:00",
      workEndTime: "18:00",
      lunchStartTime: "",
      lunchEndTime: "",
    },
  });

  useEffect(() => {
    if (professional && mode === "edit") {
      form.reset({
        name: professional.name,
        specialty: professional.specialty,
        phone: professional.phone,
        email: professional.email || "",
        workDays: professional.workDays || "1,2,3,4,5",
        workStartTime: professional.workStartTime || "08:00",
        workEndTime: professional.workEndTime || "18:00",
        lunchStartTime: professional.lunchStartTime || "",
        lunchEndTime: professional.lunchEndTime || "",
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        specialty: "",
        phone: "",
        email: "",
        workDays: "1,2,3,4,5",
        workStartTime: "08:00",
        workEndTime: "18:00",
        lunchStartTime: "",
        lunchEndTime: "",
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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

            {/* Work Schedule Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Horário de Trabalho</h4>
              
              {/* Work Days */}
              <FormField
                control={form.control}
                name="workDays"
                render={({ field }) => {
                  const daysOfWeek = [
                    { id: "1", label: "Segunda-feira" },
                    { id: "2", label: "Terça-feira" },
                    { id: "3", label: "Quarta-feira" },
                    { id: "4", label: "Quinta-feira" },
                    { id: "5", label: "Sexta-feira" },
                    { id: "6", label: "Sábado" },
                    { id: "0", label: "Domingo" },
                  ];
                  
                  const selectedDays = field.value ? field.value.split(",") : [];
                  
                  const handleDayChange = (dayId: string, checked: boolean) => {
                    let newDays = [...selectedDays];
                    if (checked) {
                      if (!newDays.includes(dayId)) {
                        newDays.push(dayId);
                      }
                    } else {
                      newDays = newDays.filter(d => d !== dayId);
                    }
                    field.onChange(newDays.join(","));
                  };
                  
                  return (
                    <FormItem>
                      <FormLabel>Dias de Trabalho *</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          {daysOfWeek.map((day) => (
                            <div key={day.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day.id}`}
                                checked={selectedDays.includes(day.id)}
                                onCheckedChange={(checked) => handleDayChange(day.id, !!checked)}
                              />
                              <Label 
                                htmlFor={`day-${day.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Work Hours */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Início *</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          value={field.value || "08:00"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Fim *</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          value={field.value || "18:00"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Lunch Break */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lunchStartTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início do Almoço (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          value={field.value || ""}
                          placeholder="12:00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lunchEndTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim do Almoço (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          value={field.value || ""}
                          placeholder="13:00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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