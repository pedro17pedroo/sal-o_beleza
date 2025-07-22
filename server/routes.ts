import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertClientSchema, insertServiceSchema, insertProfessionalSchema, insertAppointmentSchema, insertTransactionSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Client routes
  app.get("/api/clients", requireAuth, async (req: any, res) => {
    try {
      const clients = await storage.getClients(req.user.id);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/search", requireAuth, async (req: any, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query required" });
      }
      const clients = await storage.searchClients(q, req.user.id);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to search clients" });
    }
  });

  app.post("/api/clients", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData, req.user.id);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData, req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Service routes
  app.get("/api/services", requireAuth, async (req: any, res) => {
    try {
      const services = await storage.getServices(req.user.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData, req.user.id);
      res.status(201).json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create service" });
    }
  });

  app.put("/api/services/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, validatedData, req.user.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Professional routes
  app.get("/api/professionals", requireAuth, async (req: any, res) => {
    try {
      const professionals = await storage.getProfessionals(req.user.id);
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  app.post("/api/professionals", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertProfessionalSchema.parse(req.body);
      const professional = await storage.createProfessional(validatedData, req.user.id);
      res.status(201).json(professional);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create professional" });
    }
  });

  app.put("/api/professionals/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProfessionalSchema.partial().parse(req.body);
      const professional = await storage.updateProfessional(id, validatedData, req.user.id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json(professional);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update professional" });
    }
  });

  app.delete("/api/professionals/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProfessional(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete professional" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, async (req: any, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      let appointments;
      if (date) {
        appointments = await storage.getAppointmentsByDate(new Date(date as string), req.user.id);
      } else if (startDate && endDate) {
        appointments = await storage.getAppointmentsByDateRange(
          new Date(startDate as string), 
          new Date(endDate as string), 
          req.user.id
        );
      } else {
        appointments = await storage.getAppointments(req.user.id);
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Check for conflicts
      const service = await storage.getService(validatedData.serviceId, req.user.id);
      if (!service) {
        return res.status(400).json({ message: "Service not found" });
      }

      const startDate = new Date(validatedData.date);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);

      const hasConflict = await storage.checkAppointmentConflict(
        validatedData.professionalId,
        startDate,
        endDate,
        req.user.id
      );

      if (hasConflict) {
        return res.status(409).json({ message: "Appointment conflict detected" });
      }

      const appointment = await storage.createAppointment(validatedData, req.user.id);
      res.status(201).json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      
      // Check for conflicts if date, service, or professional changed
      if (validatedData.date || validatedData.serviceId || validatedData.professionalId) {
        const currentAppointment = await storage.getAppointment(id, req.user.id);
        if (!currentAppointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }

        const serviceId = validatedData.serviceId || currentAppointment.serviceId;
        const professionalId = validatedData.professionalId || currentAppointment.professionalId;
        const appointmentDate = validatedData.date || currentAppointment.date;

        const service = await storage.getService(serviceId, req.user.id);
        if (!service) {
          return res.status(400).json({ message: "Service not found" });
        }

        const startDate = new Date(appointmentDate);
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + service.duration);

        const hasConflict = await storage.checkAppointmentConflict(
          professionalId,
          startDate,
          endDate,
          req.user.id,
          id
        );

        if (hasConflict) {
          return res.status(409).json({ message: "Appointment conflict detected" });
        }
      }

      const appointment = await storage.updateAppointment(id, validatedData, req.user.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Check appointment conflicts
  app.post("/api/appointments/check-conflict", requireAuth, async (req: any, res) => {
    try {
      const { professionalId, date, serviceId, excludeId } = req.body;
      
      const service = await storage.getService(serviceId, req.user.id);
      if (!service) {
        return res.status(400).json({ message: "Service not found" });
      }

      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);

      const hasConflict = await storage.checkAppointmentConflict(
        professionalId,
        startDate,
        endDate,
        req.user.id,
        excludeId
      );

      res.json({ hasConflict });
    } catch (error) {
      res.status(500).json({ message: "Failed to check conflicts" });
    }
  });

  // Mark appointment as paid
  app.post("/api/appointments/:id/mark-paid", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.markAppointmentAsPaid(id, req.user.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to mark appointment as paid" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let transactions;
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(
          new Date(startDate as string), 
          new Date(endDate as string), 
          req.user.id
        );
      } else {
        transactions = await storage.getTransactions(req.user.id);
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData, req.user.id);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData, req.user.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTransaction(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Financial reports
  app.get("/api/financial/summary", requireAuth, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const summary = await storage.getFinancialSummary(
        new Date(startDate as string),
        new Date(endDate as string),
        req.user.id
      );
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const [todayAppointments, allClients, monthlyFinancial] = await Promise.all([
        storage.getAppointmentsByDate(today, req.user.id),
        storage.getClients(req.user.id),
        storage.getFinancialSummary(startOfMonth, today, req.user.id)
      ]);

      const nextAppointment = todayAppointments
        .filter(apt => new Date(apt.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      res.json({
        todayAppointments: todayAppointments.length,
        activeClients: allClients.length,
        monthlyRevenue: monthlyFinancial.totalRevenue,
        monthlyExpenses: monthlyFinancial.totalExpenses,
        monthlyNetIncome: monthlyFinancial.netIncome,
        nextAppointment: nextAppointment ? {
          time: new Date(nextAppointment.date).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          clientName: nextAppointment.clientName
        } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
