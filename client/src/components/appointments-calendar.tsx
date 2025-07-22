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
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", formatDate(currentDate)],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?date=${formatDate(currentDate)}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    }
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
    return currentDate.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter appointments by time period - ensure appointments is an array
  const appointmentsList = Array.isArray(appointments) ? appointments : [];
  
  const morningAppointments = appointmentsList.filter((apt: any) => {
    const hour = new Date(apt.date).getHours();
    return hour >= 8 && hour < 12;
  });

  const afternoonAppointments = appointmentsList.filter((apt: any) => {
    const hour = new Date(apt.date).getHours();
    return hour >= 13 && hour < 18;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <CardTitle>Calendário de Agendamentos</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={view === "daily" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("daily")}
                >
                  Diário
                </Button>
                <Button
                  variant={view === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("weekly")}
                >
                  Semanal
                </Button>
              </div>
            </div>
            <Button onClick={() => setAppointmentModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={previousDay}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-semibold text-slate-800 capitalize">
                {getCurrentDateString()}
              </h3>
              <Button variant="ghost" size="sm" onClick={nextDay}>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-4">Manhã (08:00 - 12:00)</h4>
                <div className="space-y-2">
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
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-4">Tarde (13:00 - 18:00)</h4>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
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
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Morning Schedule */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-4">Manhã (08:00 - 12:00)</h4>
                <div className="space-y-2">
                  {morningAppointments.length > 0 ? (
                    morningAppointments.map((appointment: any) => (
                      <div 
                        key={appointment.id} 
                        className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setAppointmentDetailsOpen(true);
                        }}
                      >
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-medium text-slate-800">{formatTime(appointment.date)}</p>
                          <p className="text-xs text-slate-600">{getDuration(appointment.serviceDuration)}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{appointment.clientName}</p>
                          <p className="text-sm text-slate-600">{appointment.serviceName}</p>
                          <p className="text-xs text-slate-500">{appointment.professionalName}</p>
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
                    ))
                  ) : (
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg">
                      <div className="text-center">
                        <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Nenhum agendamento pela manhã</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Afternoon Schedule */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-4">Tarde (13:00 - 18:00)</h4>
                <div className="space-y-2">
                  {afternoonAppointments.length > 0 ? (
                    afternoonAppointments.map((appointment: any) => (
                      <div 
                        key={appointment.id} 
                        className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setAppointmentDetailsOpen(true);
                        }}
                      >
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-medium text-slate-800">{formatTime(appointment.date)}</p>
                          <p className="text-xs text-slate-600">{getDuration(appointment.serviceDuration)}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{appointment.clientName}</p>
                          <p className="text-sm text-slate-600">{appointment.serviceName}</p>
                          <p className="text-xs text-slate-500">{appointment.professionalName}</p>
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
        </CardContent>
      </Card>

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
