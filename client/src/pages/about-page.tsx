import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertAboutInfoSchema } from "@shared/schema";
import { z } from "zod";
import { Info, Save } from "lucide-react";

const aboutFormSchema = insertAboutInfoSchema.extend({
  services: z.string().optional().default(""),
  workingHours: z.string().optional().default(""),
});

type AboutFormData = z.infer<typeof aboutFormSchema>;

export default function AboutPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: aboutInfo, isLoading } = useQuery({
    queryKey: ["/api/about"],
  });

  const form = useForm<AboutFormData>({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: {
      title: "",
      description: "",
      services: "",
      phone: "",
      email: "",
      address: "",
      workingHours: "",
    },
  });

  // Update form when data is loaded
  React.useEffect(() => {
    if (aboutInfo && !isEditing) {
      form.reset({
        title: aboutInfo.title || "",
        description: aboutInfo.description || "",
        services: aboutInfo.services || "",
        phone: aboutInfo.phone || "",
        email: aboutInfo.email || "",
        address: aboutInfo.address || "",
        workingHours: aboutInfo.workingHours || "",
      });
    }
  }, [aboutInfo, form, isEditing]);

  const createMutation = useMutation({
    mutationFn: async (data: AboutFormData) => {
      const response = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create about info");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Informações sobre o salão criadas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar informações sobre o salão.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AboutFormData) => {
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update about info");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Informações sobre o salão atualizadas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar informações sobre o salão.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AboutFormData) => {
    if (aboutInfo) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (aboutInfo) {
      form.reset({
        title: aboutInfo.title || "",
        description: aboutInfo.description || "",
        services: aboutInfo.services || "",
        phone: aboutInfo.phone || "",
        email: aboutInfo.email || "",
        address: aboutInfo.address || "",
        workingHours: aboutInfo.workingHours || "",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Info className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-800">Sobre o Salão</h1>
        </div>
        
        {!isEditing && (
          <Button onClick={handleEdit}>
            Editar Informações
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Salão</CardTitle>
        </CardHeader>
        <CardContent>
          {!aboutInfo && !isEditing ? (
            <div className="text-center py-8">
              <Info className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Nenhuma informação sobre o salão foi configurada ainda.
              </p>
              <Button onClick={handleEdit}>
                Criar Informações
              </Button>
            </div>
          ) : isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Bella Studio" {...field} />
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
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: +244 921 000 000" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: contato@bellastudio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Rua Principal, 123, Luanda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva seu salão, sua missão, valores e diferenciais..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviços Oferecidos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste os principais serviços do seu salão..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Funcionamento</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Segunda a Sexta: 08h às 18h&#10;Sábado: 08h às 16h&#10;Domingo: Fechado"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {createMutation.isPending || updateMutation.isPending
                        ? "Salvando..."
                        : "Salvar"}
                    </span>
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {aboutInfo.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {aboutInfo.description}
                </p>
              </div>

              {aboutInfo.services && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Serviços</h4>
                  <p className="text-slate-600 whitespace-pre-line">
                    {aboutInfo.services}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aboutInfo.phone && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Telefone</h4>
                    <p className="text-slate-600">{aboutInfo.phone}</p>
                  </div>
                )}

                {aboutInfo.email && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Email</h4>
                    <p className="text-slate-600">{aboutInfo.email}</p>
                  </div>
                )}

                {aboutInfo.address && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Endereço</h4>
                    <p className="text-slate-600">{aboutInfo.address}</p>
                  </div>
                )}

                {aboutInfo.workingHours && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Horário de Funcionamento</h4>
                    <p className="text-slate-600 whitespace-pre-line">
                      {aboutInfo.workingHours}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}