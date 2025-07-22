import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

type View = "dashboard" | "appointments" | "clients" | "services" | "professionals" | "cashflow";

interface HeaderProps {
  currentView: View;
  onToggleSidebar: () => void;
}

const viewTitles = {
  dashboard: "Dashboard",
  appointments: "Calendário de Agendamentos",
  clients: "Gerenciar Clientes",
  services: "Gerenciar Serviços",
  professionals: "Gerenciar Profissionais",
  cashflow: "Controle de Caixa",
};

export default function Header({ currentView, onToggleSidebar }: HeaderProps) {
  const { user } = useAuth();

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 container-responsive py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
              {viewTitles[currentView]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 capitalize hidden sm:block">
              {getCurrentDate()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" size="sm" className="relative hidden sm:flex">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full update-indicator"></span>
          </Button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user ? getInitials(user.name) : "U"}
              </span>
            </div>
            <span className="hidden md:block font-medium text-slate-700 text-sm">
              {user?.name || "Usuário"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
