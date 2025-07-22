import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AppointmentModal from "@/components/modals/appointment-modal";
import AppointmentDetailsModal from "@/components/modals/appointment-details-modal";

export default function AppointmentsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);

  // Generate date range based on current view
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    switch (view) {
      case "daily":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "weekly":
        const dayOfWeek = start.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start.setDate(start.getDate() + mondayOffset);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case "monthly":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "yearly":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { start, end };
  };

  // Fetch appointments with proper date filtering
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", view, currentDate.toDateString()],
    queryFn: async () => {
      const { start, end } = getDateRange();
      const response = await fetch(`/api/appointments?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });

  const appointmentsList = Array.isArray(appointments) ? appointments : [];
  
  const morningAppointments = appointmentsList.filter((apt: any) => {
    const hour = new Date(apt.date).getHours();
    return hour >= 8 && hour < 12;
  });

  const afternoonAppointments = appointmentsList.filter((apt: any) => {
    const hour = new Date(apt.date).getHours();
    return hour >= 13 && hour < 18;
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
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

  const getCurrentDateString = () => {
    switch (view) {
      case "daily":
        return currentDate.toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case "weekly":
        const { start, end } = getDateRange();
        return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case "monthly":
        return currentDate.toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long'
        });
      case "yearly":
        return currentDate.toLocaleDateString('pt-BR', {
          year: 'numeric'
        });
      default:
        return '';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case "daily":
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case "weekly":
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case "monthly":
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case "yearly":
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const previousPeriod = () => navigateDate('prev');
  const nextPeriod = () => navigateDate('next');

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4 sm:space-y-6 container-responsive">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <CardTitle className="text-responsive-lg">Calendário de Agendamentos</CardTitle>
              <Button 
                onClick={() => setAppointmentModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-1">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 w-full sm:w-auto">
                <Button
                  variant={view === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("daily")}
                  className="text-xs sm:text-sm"
                >
                  Diário
                </Button>
                <Button
                  variant={view === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("weekly")}
                  className="text-xs sm:text-sm"
                >
                  Semanal
                </Button>
                <Button
                  variant={view === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("monthly")}
                  className="text-xs sm:text-sm"
                >
                  Mensal
                </Button>
                <Button
                  variant={view === "yearly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("yearly")}
                  className="text-xs sm:text-sm"
                >
                  Anual
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={previousPeriod}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-semibold text-slate-800 capitalize">
                {getCurrentDateString()}
              </h3>
              <Button variant="ghost" size="sm" onClick={nextPeriod}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Hoje
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Daily and Weekly View */}
              {(view === "daily" || view === "weekly") && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Manhã (08:00 - 12:00)</h4>
                    <div className="space-y-3">
                      {morningAppointments.length > 0 ? (
                        morningAppointments.map((appointment: any) => (
                          <div
                            key={appointment.id}
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setAppointmentDetailsOpen(true);
                            }}
                            className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <div className="text-center min-w-[60px]">
                              <p className="text-sm font-medium text-slate-800">
                                {formatTime(appointment.date)}
                              </p>
                              <p className="text-xs text-slate-600">
                                {getDuration(appointment.serviceDuration)}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">{appointment.clientName}</p>
                              <p className="text-sm text-slate-600">{appointment.serviceName}</p>
                              <p className="text-xs text-slate-500">
                                {appointment.professionalName || "Sem profissional"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {appointment.status === 'confirmed' ? 'Confirmado' :
                                 appointment.status === 'pending' ? 'Pendente' :
                                 appointment.status === 'cancelled' ? 'Cancelado' :
                                 appointment.status === 'completed' ? 'Concluído' :
                                 'Desconhecido'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg">
                          <div className="text-center">
                            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Nenhum agendamento de manhã</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-4">Tarde (13:00 - 18:00)</h4>
                    <div className="space-y-3">
                      {afternoonAppointments.length > 0 ? (
                        afternoonAppointments.map((appointment: any) => (
                          <div
                            key={appointment.id}
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setAppointmentDetailsOpen(true);
                            }}
                            className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <div className="text-center min-w-[60px]">
                              <p className="text-sm font-medium text-slate-800">
                                {formatTime(appointment.date)}
                              </p>
                              <p className="text-xs text-slate-600">
                                {getDuration(appointment.serviceDuration)}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">{appointment.clientName}</p>
                              <p className="text-sm text-slate-600">{appointment.serviceName}</p>
                              <p className="text-xs text-slate-500">
                                {appointment.professionalName || "Sem profissional"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {appointment.status === 'confirmed' ? 'Confirmado' :
                                 appointment.status === 'pending' ? 'Pendente' :
                                 appointment.status === 'cancelled' ? 'Cancelado' :
                                 appointment.status === 'completed' ? 'Concluído' :
                                 'Desconhecido'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg">
                          <div className="text-center">
                            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Nenhum agendamento à tarde</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Monthly and Yearly View */}
              {(view === "monthly" || view === "yearly") && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800">
                    Agendamentos ({appointmentsList.length})
                  </h4>
                  {appointmentsList.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">
                        Nenhum agendamento encontrado para {view === "monthly" ? "este mês" : "este ano"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointmentsList.map((appointment: any) => (
                        <div 
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setAppointmentDetailsOpen(true);
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-center min-w-[80px]">
                              <p className="text-sm font-medium text-slate-800">
                                {new Date(appointment.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                              </p>
                              <p className="text-xs text-slate-600">
                                {formatTime(appointment.date)}
                              </p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">{appointment.clientName}</p>
                              <p className="text-sm text-slate-600">{appointment.serviceName}</p>
                              <p className="text-xs text-slate-500">
                                {appointment.professionalName || "Sem profissional"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              appointment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {appointment.status === 'confirmed' ? 'Confirmado' :
                               appointment.status === 'pending' ? 'Pendente' :
                               appointment.status === 'cancelled' ? 'Cancelado' :
                               'Concluído'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AppointmentModal
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
      />

      <AppointmentDetailsModal
        open={appointmentDetailsOpen}
        onOpenChange={setAppointmentDetailsOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
}