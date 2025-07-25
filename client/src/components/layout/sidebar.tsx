import { Building2, Calendar, Users, Clipboard, Home, LogOut, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type View = "dashboard" | "appointments" | "clients" | "services" | "professionals" | "cashflow";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { key: "dashboard" as View, label: "Dashboard", icon: Home, permission: null },
  { key: "appointments" as View, label: "Agendamentos", icon: Calendar, permission: "appointments" },
  { key: "clients" as View, label: "Clientes", icon: Users, permission: "clients" },
  { key: "services" as View, label: "Serviços", icon: Clipboard, permission: "services" },
  { key: "professionals" as View, label: "Profissionais", icon: Users, permission: "professionals" },
  { key: "cashflow" as View, label: "Controle de Caixa", icon: DollarSign, permission: "financial" },
];

export default function Sidebar({ currentView, onViewChange, isOpen, onToggle }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const { canView, isAdmin } = usePermissions();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-slate-200 z-50 transform transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{user?.name || "Salão Bella Vista"}</h2>
              <p className="text-sm text-slate-600">{isAdmin ? "Admin" : "Profissional"}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation
              .filter(({ key, permission }) => {
                // Dashboard is always visible
                if (key === "dashboard") return true;
                // Check permissions for other sections
                if (permission) {
                  return canView(permission as any);
                }
                return true;
              })
              .map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <button
                    onClick={() => {
                      onViewChange(key);
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors w-full text-left",
                      currentView === key
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                </li>
              ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            className="flex items-center space-x-3 px-4 py-3 w-full justify-start"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5" />
            <span>{logoutMutation.isPending ? "Saindo..." : "Sair"}</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
