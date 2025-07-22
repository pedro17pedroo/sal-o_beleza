import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dashboard from "@/components/dashboard";
import ClientsManager from "@/components/clients-manager";
import ServicesManager from "@/components/services-manager";
import ProfessionalsManager from "@/components/professionals-manager";
import AppointmentsCalendar from "@/components/appointments-calendar";
import CashFlowManager from "@/components/cash-flow-manager";

type View = "dashboard" | "appointments" | "clients" | "services" | "professionals" | "cashflow";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "appointments":
        return <AppointmentsCalendar />;
      case "clients":
        return <ClientsManager />;
      case "services":
        return <ServicesManager />;
      case "professionals":
        return <ProfessionalsManager />;
      case "cashflow":
        return <CashFlowManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="lg:ml-64 min-h-screen">
        <Header 
          currentView={currentView}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="container-responsive py-4 sm:py-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
