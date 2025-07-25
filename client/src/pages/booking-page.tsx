import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, Phone, User, Check, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, startOfDay, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatPhone } from "@/lib/format";

const bookingSchema = z.object({
  clientName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  clientPhone: z.string().min(8, "Telefone deve ter pelo menos 8 dígitos"),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horário"),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      serviceId: "",
      date: "",
      time: "",
    },
  });

  // Get available services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/public/services"],
    queryFn: async () => {
      const response = await fetch("/api/public/services");
      return await response.json();
    },
  });

  // Get working days for date filtering
  const { data: workingDays } = useQuery({
    queryKey: ["/api/public/availability/working-days"],
    queryFn: async () => {
      const response = await fetch("/api/public/availability/working-days");
      if (!response.ok) return [];
      return await response.json();
    },
  });

  // Generate time slots based on professional availability
  useEffect(() => {
    if (selectedDate && form.watch("serviceId")) {
      generateTimeSlots();
    }
  }, [selectedDate, form.watch("serviceId")]);

  const generateTimeSlots = async () => {
    try {
      const serviceId = form.watch("serviceId");
      if (!serviceId) return;

      const response = await fetch(`/api/public/availability/time-slots?date=${selectedDate}&serviceId=${serviceId}`);
      if (response.ok) {
        const availableSlots = await response.json();
        // Convert to the expected format
        const slots: TimeSlot[] = availableSlots.map((slot: any) => ({
          time: slot.time,
          available: slot.availableProfessionals > 0
        }));
        setTimeSlots(slots);
      } else {
        // No availability found - no professionals working
        setTimeSlots([]);
      }
    } catch (error) {
      console.error("Failed to generate time slots:", error);
      setTimeSlots([]);
    }
  };

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const response = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: data.clientName,
          clientPhone: data.clientPhone,
          clientEmail: data.clientEmail || undefined,
          serviceId: parseInt(data.serviceId),
          appointmentDate: new Date(`${data.date}T${data.time}:00`).toISOString(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Agendamento criado",
        description: "Seu agendamento foi criado com sucesso! Entraremos em contato em breve.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar agendamento.",
        variant: "destructive",
      });
    },
  });

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) { // Next 14 days
      const date = addDays(today, i);
      const dayOfWeek = date.getDay().toString();
      
      // Only show dates when professionals are working
      if (workingDays && workingDays.includes(dayOfWeek)) {
        dates.push({
          value: format(date, "yyyy-MM-dd"),
          label: format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }),
        });
      }
    }
    
    return dates;
  };

  const selectedService = services?.find((s: Service) => s.id === parseInt(form.watch("serviceId")));

  const onSubmit = (data: BookingForm) => {
    createBookingMutation.mutate(data);
  };

  const formatCurrencyLocal = (value: string) => {
    return formatCurrency(parseFloat(value));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Agendamento Confirmado!</h2>
            <p className="text-slate-600 mb-6">
              Obrigado por agendar conosco. Entraremos em contato em breve para confirmar os detalhes.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Fazer Novo Agendamento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Agendar Serviço</h1>
          <p className="text-slate-600">Reserve seu horário de forma rápida e fácil</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-slate-200 text-slate-600"
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ${
                    step > stepNumber ? "bg-primary" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {step === 1 && "Escolha o Serviço"}
                {step === 2 && "Selecione Data e Horário"}
                {step === 3 && "Seus Dados"}
              </CardTitle>
              {step > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Service Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="serviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione o Serviço</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha um serviço" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {servicesLoading ? (
                                <SelectItem value="loading" disabled>Carregando serviços...</SelectItem>
                              ) : (
                                services?.map((service: Service) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} - {formatCurrencyLocal(service.price)} ({service.duration}min)
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedService && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-800 mb-2">{selectedService.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>💰 {formatCurrency(selectedService.price)}</span>
                          <span>⏱️ {selectedService.duration} minutos</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="button" 
                      onClick={() => setStep(2)} 
                      disabled={!form.watch("serviceId")}
                      className="w-full"
                    >
                      Continuar
                    </Button>
                  </div>
                )}

                {/* Step 2: Date and Time Selection */}
                {step === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione a Data</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDate(value);
                            // Reset time selection when date changes
                            form.setValue("time", "");
                          }} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha uma data" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAvailableDates().map((date) => (
                                <SelectItem key={date.value} value={date.value}>
                                  {date.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedDate && (
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Selecione o Horário</FormLabel>
                            {timeSlots.length === 0 ? (
                              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                                <p className="text-orange-700 text-sm">
                                  Nenhum horário disponível para esta data.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.map((slot) => (
                                  <Button
                                    key={slot.time}
                                    type="button"
                                    variant={field.value === slot.time ? "default" : "outline"}
                                    size="sm"
                                    disabled={!slot.available}
                                    onClick={() => field.onChange(slot.time)}
                                    className="text-sm font-medium"
                                  >
                                    {slot.time}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button 
                      type="button" 
                      onClick={() => setStep(3)} 
                      disabled={!form.watch("date") || !form.watch("time")}
                      className="w-full"
                    >
                      Continuar
                    </Button>
                  </div>
                )}

                {/* Step 3: Client Information */}
                {step === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input placeholder="Seu nome completo" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input 
                                placeholder="+244 923 456 789" 
                                className="pl-10" 
                                {...field}
                                onChange={(e) => {
                                  const formatted = formatPhone(e.target.value);
                                  field.onChange(formatted);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clientEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="seu@email.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Summary */}
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-800 mb-2">Resumo do Agendamento</h4>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p><strong>Serviço:</strong> {selectedService?.name}</p>
                        <p><strong>Data:</strong> {selectedDate && format(new Date(selectedDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                        <p><strong>Horário:</strong> {form.watch("time")}</p>
                        <p><strong>Duração:</strong> {selectedService?.duration} minutos</p>
                        <p><strong>Preço:</strong> {selectedService && formatCurrency(selectedService.price)}</p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={createBookingMutation.isPending}
                      className="w-full"
                    >
                      {createBookingMutation.isPending ? "Criando agendamento..." : "Confirmar Agendamento"}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}