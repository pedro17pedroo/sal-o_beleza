import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, DollarSign, Clock, Plus, Search, UserPlus, Clipboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ClientModal from "@/components/modals/client-modal";
import ServiceModal from "@/components/modals/service-modal";
import AppointmentModal from "@/components/modals/appointment-modal";
import { formatCurrency } from "@/lib/format";

export default function Dashboard() {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", { date: new Date().toISOString().split('T')[0] }],
  });



  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-AO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Agendamentos Hoje</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{(stats as any)?.todayAppointments || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Clientes Ativos</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-slate-800">{(stats as any)?.activeClients || 0}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Receita do Mês</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency((stats as any)?.monthlyRevenue || 0)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Lucro Líquido</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className={`text-2xl font-bold ${((stats as any)?.monthlyNetIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency((stats as any)?.monthlyNetIncome || 0)}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${((stats as any)?.monthlyNetIncome || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${((stats as any)?.monthlyNetIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agenda de Hoje</CardTitle>
              <Button onClick={() => setAppointmentModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                    <Skeleton className="h-12 w-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todayAppointments && (todayAppointments as any[]).length > 0 ? (
              <div className="space-y-4">
                {(todayAppointments as any[]).map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-medium text-slate-800">{formatTime(appointment.date)}</p>
                      <p className="text-xs text-slate-600">{getDuration(appointment.serviceDuration)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{appointment.clientName}</p>
                      <p className="text-sm text-slate-600">{appointment.serviceName}</p>
                      <p className="text-xs text-slate-500">Profissional: {appointment.professionalName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 
                         appointment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Nenhum agendamento para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-primary hover:bg-primary/5"
                onClick={() => setClientModalOpen(true)}
              >
                <UserPlus className="w-8 h-8 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Novo Cliente</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-primary hover:bg-primary/5"
                onClick={() => setServiceModalOpen(true)}
              >
                <Clipboard className="w-8 h-8 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Novo Serviço</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-accent hover:bg-accent/5"
              >
                <Search className="w-8 h-8 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Buscar Cliente</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-emerald-400 hover:bg-emerald-50"
              >
                <Calendar className="w-8 h-8 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Ver Calendário</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ClientModal 
        open={clientModalOpen} 
        onOpenChange={setClientModalOpen} 
      />
      <ServiceModal 
        open={serviceModalOpen} 
        onOpenChange={setServiceModalOpen} 
      />
      <AppointmentModal 
        open={appointmentModalOpen} 
        onOpenChange={setAppointmentModalOpen} 
      />
    </div>
  );
}
