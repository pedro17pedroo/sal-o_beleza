import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Edit, Trash2, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/format";
import { apiRequest } from "@/lib/queryClient";

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
}

export default function AppointmentDetailsModal({ 
  open, 
  onOpenChange, 
  appointment 
}: AppointmentDetailsModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(appointment?.professionalName || "none");
  const [notes, setNotes] = useState(appointment?.notes || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the latest appointment data to keep it updated
  const { data: currentAppointment } = useQuery({
    queryKey: ["/api/appointments", appointment?.id],
    queryFn: async () => {
      if (!appointment?.id) return null;
      const response = await fetch(`/api/appointments/${appointment.id}`);
      if (!response.ok) throw new Error('Failed to fetch appointment');
      return response.json();
    },
    enabled: open && !!appointment?.id,
  });

  // Use current appointment data if available, fallback to prop
  const displayAppointment = currentAppointment || appointment;

  // Get professionals for assignment
  const { data: professionals } = useQuery({
    queryKey: ["/api/professionals"],
    enabled: open,
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek: date.toLocaleDateString('pt-BR', { weekday: 'long' })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  // Mutations for appointment actions
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", appointment.id] });
      toast({
        title: "Status atualizado",
        description: "O status do agendamento foi atualizado com sucesso.",
      });
      
      // Se o status foi alterado para 'cancelled' (rejeitado), fechar o modal automaticamente
      if (status === 'cancelled') {
        setTimeout(() => {
          onOpenChange(false);
        }, 1000); // Aguarda 1 segundo para mostrar o toast antes de fechar
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar o status do agendamento.",
        variant: "destructive",
      });
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async () => {
      // Find professional ID by name, or set to null if "none" is selected
      const professionalList = Array.isArray(professionals) ? professionals : [];
      const professional = selectedProfessional === "none" ? null : professionalList.find((p: any) => p.name === selectedProfessional);
      
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          professionalId: professional?.id || null,
          notes: notes.trim() || undefined
        })
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", appointment.id] });
      toast({
        title: "Agendamento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      setEditMode(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar o agendamento.",
        variant: "destructive",
      });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete appointment');
      // DELETE returns 204 with no content, so don't try to parse JSON
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao cancelar o agendamento.",
        variant: "destructive",
      });
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/appointments/${appointment.id}/mark-paid`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to mark as paid');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", appointment.id] });
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi marcado como pago.",
      });
      
      // Fechar o modal automaticamente após marcar como pago
      setTimeout(() => {
        onOpenChange(false);
      }, 1000); // Aguarda 1 segundo para mostrar o toast antes de fechar
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao registrar o pagamento.",
        variant: "destructive",
      });
    }
  });

  if (!displayAppointment) return null;

  const dateTime = formatDateTime(displayAppointment.date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detalhes do Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <Badge className={getStatusColor(displayAppointment.status)}>
                {getStatusText(displayAppointment.status)}
              </Badge>
              {displayAppointment.paymentStatus === 'paid' && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  💰 Pago
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {editMode ? "Cancelar" : "Editar"}
            </Button>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </h3>
              <div className="space-y-2">
                <p className="font-medium">{displayAppointment.clientName}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  {displayAppointment.clientPhone}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Data e Hora
              </h3>
              <div className="space-y-1">
                <p className="font-medium">{dateTime.dayOfWeek}</p>
                <p className="text-sm text-slate-600">{dateTime.date}</p>
                <p className="text-sm text-slate-600">{dateTime.time}</p>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Serviço</h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{displayAppointment.serviceName}</p>
                  <p className="text-sm text-slate-600">{displayAppointment.serviceDuration} minutos</p>
                </div>
                <p className="font-semibold text-slate-800">
                  {formatCurrency(displayAppointment.servicePrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Assignment */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Profissional
            </h3>
            {editMode ? (
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem profissional atribuído</SelectItem>
                  {Array.isArray(professionals) && professionals.map((professional: any) => (
                    <SelectItem key={professional.id} value={professional.name}>
                      {professional.name} - {professional.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-slate-600">
                {displayAppointment.professionalName || "Nenhum profissional atribuído"}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Observações</h3>
            {editMode ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicionar observações..."
                rows={3}
              />
            ) : (
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg min-h-[60px]">
                {displayAppointment.notes || "Nenhuma observação"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {editMode ? (
              <Button 
                onClick={() => updateAppointmentMutation.mutate()}
                disabled={updateAppointmentMutation.isPending}
                className="flex-1"
              >
                {updateAppointmentMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            ) : (
              <>
                {/* Confirmar/Rejeitar - apenas para agendamentos pendentes */}
                {displayAppointment.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => updateStatusMutation.mutate('confirmed')}
                      disabled={updateStatusMutation.isPending}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateStatusMutation.mutate('cancelled')}
                      disabled={updateStatusMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </Button>
                  </>
                )}
                
                {/* Marcar como Concluído - apenas para agendamentos confirmados */}
                {displayAppointment.status === 'confirmed' && (
                  <Button
                    onClick={() => updateStatusMutation.mutate('completed')}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marcar como Concluído
                  </Button>
                )}

                {/* Marcar como Pago - apenas para agendamentos concluídos ou confirmados, e que ainda não foram pagos */}
                {(displayAppointment.status === 'completed' || displayAppointment.status === 'confirmed') && 
                 displayAppointment.paymentStatus !== 'paid' && (
                  <Button
                    onClick={() => markAsPaidMutation.mutate()}
                    disabled={markAsPaidMutation.isPending}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    💰 Marcar como Pago
                  </Button>
                )}

                {/* Cancelar - apenas se o agendamento não está concluído e não foi pago */}
                {displayAppointment.status !== 'completed' && displayAppointment.status !== 'cancelled' && displayAppointment.paymentStatus !== 'paid' && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteAppointmentMutation.mutate()}
                    disabled={deleteAppointmentMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancelar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}