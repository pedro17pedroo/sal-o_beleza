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

  // Middleware to check permissions
  const requirePermission = (permission: import("@shared/schema").PermissionType) => {
    return async (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Admin always has permission
      if (req.user.role === "admin") {
        return next();
      }
      
      try {
        const hasPermission = await storage.checkUserPermission(req.user.id, permission);
        if (!hasPermission) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }
        next();
      } catch (error) {
        return res.status(500).json({ message: "Error checking permissions" });
      }
    };
  };

  // Client routes
  app.get("/api/clients", requireAuth, requirePermission('view_clients' as any), async (req: any, res) => {
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

  app.post("/api/clients", requireAuth, requirePermission('manage_clients' as any), async (req: any, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData, req.user.id);
      res.status(201).json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", requireAuth, requirePermission('manage_clients' as any), async (req: any, res) => {
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

  app.delete("/api/clients/:id", requireAuth, requirePermission('manage_clients' as any), async (req: any, res) => {
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
  app.get("/api/services", requireAuth, requirePermission('view_services' as any), async (req: any, res) => {
    try {
      const services = await storage.getServices(req.user.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", requireAuth, requirePermission('manage_services' as any), async (req: any, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData, req.user.id);
      res.status(201).json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create service" });
    }
  });

  app.put("/api/services/:id", requireAuth, requirePermission('manage_services' as any), async (req: any, res) => {
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

  app.delete("/api/services/:id", requireAuth, requirePermission('manage_services' as any), async (req: any, res) => {
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

  // Grant system access to professional
  app.post("/api/professionals/:id/grant-access", requireAuth, async (req: any, res) => {
    try {
      // Only admin can grant system access
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can grant system access" });
      }

      const id = parseInt(req.params.id);
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const newUser = await storage.grantSystemAccess(id, req.user.id, { username, password });
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to grant system access" });
    }
  });

  // Revoke system access from professional
  app.post("/api/professionals/:id/revoke-access", requireAuth, async (req: any, res) => {
    try {
      // Only admin can revoke system access
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can revoke system access" });
      }

      const id = parseInt(req.params.id);
      const revoked = await storage.revokeSystemAccess(id, req.user.id);
      
      if (!revoked) {
        return res.status(404).json({ message: "Professional not found or doesn't have system access" });
      }

      res.status(200).json({ message: "System access revoked successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to revoke system access" });
    }
  });

  // Get professional permissions
  app.get("/api/professionals/:id/permissions", requireAuth, async (req: any, res) => {
    try {
      // Only admin can view permissions
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can view permissions" });
      }

      const id = parseInt(req.params.id);
      const permissions = await storage.getProfessionalPermissions(id);
      res.json(permissions);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to fetch permissions" });
    }
  });

  // Update professional permissions
  app.put("/api/professionals/:id/permissions", requireAuth, async (req: any, res) => {
    try {
      // Only admin can update permissions
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can update permissions" });
      }

      const id = parseInt(req.params.id);
      const { permissions } = req.body;
      
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }

      await storage.updateProfessionalPermissions(id, permissions);
      res.json({ message: "Permissions updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update permissions" });
    }
  });

  // Get user permissions
  app.get("/api/user/permissions", requireAuth, async (req: any, res) => {
    try {
      const permissions = await storage.getUserPermissions(req.user.id);
      res.json(permissions);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to get user permissions" });
    }
  });

  // Check user permission (for middleware use)
  app.get("/api/permissions/check/:permission", requireAuth, async (req: any, res) => {
    try {
      const permission = req.params.permission;
      const hasPermission = await storage.checkUserPermission(req.user.id, permission);
      res.json({ hasPermission });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to check permission" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", requireAuth, requirePermission('view_appointments' as any), async (req: any, res) => {
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

  // Get a specific appointment by ID
  app.get("/api/appointments/:id", requireAuth, requirePermission('view_appointments' as any), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id, req.user.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", requireAuth, requirePermission('manage_appointments' as any), async (req: any, res) => {
    try {
      console.log("Appointment request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertAppointmentSchema.parse(req.body);
      console.log("Validated appointment data:", JSON.stringify(validatedData, null, 2));
      
      // Check for conflicts
      const service = await storage.getService(validatedData.serviceId, req.user.id);
      if (!service) {
        return res.status(400).json({ message: "Service not found" });
      }

      const startDate = new Date(validatedData.date);
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);

      const hasConflict = validatedData.professionalId ? await storage.checkAppointmentConflict(
        validatedData.professionalId,
        startDate,
        endDate,
        req.user.id
      ) : false;

      if (hasConflict) {
        return res.status(409).json({ message: "Appointment conflict detected" });
      }

      const appointment = await storage.createAppointment(validatedData, req.user.id);
      res.status(201).json(appointment);
    } catch (error: any) {
      console.log("Appointment creation error:", error);
      if (error.issues) {
        console.log("Validation issues:", JSON.stringify(error.issues, null, 2));
      }
      res.status(400).json({ message: error.message || "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, requirePermission('manage_appointments' as any), async (req: any, res) => {
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

  app.delete("/api/appointments/:id", requireAuth, requirePermission('manage_appointments' as any), async (req: any, res) => {
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
      if (error.message === 'Appointment is already marked as paid') {
        return res.status(400).json({ message: "Appointment is already marked as paid" });
      }
      res.status(500).json({ message: "Failed to mark appointment as paid" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", requireAuth, requirePermission('view_financial' as any), async (req: any, res) => {
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

  app.post("/api/transactions", requireAuth, requirePermission('manage_financial' as any), async (req: any, res) => {
    try {
      console.log("Transaction request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertTransactionSchema.parse(req.body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));
      const transaction = await storage.createTransaction(validatedData, req.user.id);
      res.status(201).json(transaction);
    } catch (error: any) {
      console.log("Transaction creation error:", error);
      if (error.issues) {
        console.log("Validation issues:", JSON.stringify(error.issues, null, 2));
      }
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
  app.get("/api/financial/summary", requireAuth, requirePermission('view_financial' as any), async (req: any, res) => {
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

  // Professional availability routes
  app.get("/api/availability/time-slots", requireAuth, async (req: any, res) => {
    try {
      const { date, serviceId } = req.query;
      
      if (!date || !serviceId) {
        return res.status(400).json({ message: "Date and service ID are required" });
      }

      const service = await storage.getService(parseInt(serviceId), req.user.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const timeSlots = await storage.getAvailableTimeSlots(
        new Date(date as string),
        service.duration,
        req.user.id
      );
      
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch available time slots" });
    }
  });

  app.get("/api/availability/working-days", requireAuth, async (req: any, res) => {
    try {
      const workingDays = await storage.getWorkingDays(req.user.id);
      res.json(workingDays);
    } catch (error) {
      console.error("Error fetching working days:", error);
      res.status(500).json({ message: "Failed to fetch working days" });
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

  // Appointments availability check (public route)
  app.get("/api/appointments/availability", async (req: any, res) => {
    try {
      const { date, professionalId, serviceId } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      const selectedDate = new Date(date as string);
      const startHour = 9; // 9 AM
      const endHour = 18; // 6 PM
      const interval = 30; // 30 minutes

      const allSlots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotDateTime = new Date(selectedDate);
          slotDateTime.setHours(hour, minute, 0, 0);
          
          // TODO: Check for existing appointments and mark slots as unavailable
          allSlots.push({
            time: timeString,
            available: true
          });
        }
      }

      res.json(allSlots);
    } catch (error) {
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Public routes for booking (no authentication required)
  app.get("/api/public/services", async (req: any, res) => {
    try {
      // Get services from any salon for public viewing
      const services = await storage.getAllPublicServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/public/booking", async (req: any, res) => {
    try {
      const { clientName, clientPhone, clientEmail, serviceId, appointmentDate } = req.body;

      if (!clientName || !clientPhone || !serviceId || !appointmentDate) {
        return res.status(400).json({ message: "Nome, telefone, serviço e data são obrigatórios" });
      }

      // Create the booking without authentication
      const booking = await storage.createPublicBooking({
        clientName,
        clientPhone,
        clientEmail,
        serviceId: parseInt(serviceId),
        appointmentDate: new Date(appointmentDate),
      });

      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
