import { 
  users, clients, services, professionals, appointments, transactions,
  type User, type InsertUser, type Client, type InsertClient,
  type Service, type InsertService, type Professional, type InsertProfessional,
  type Appointment, type InsertAppointment, type Transaction, type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client methods
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number, userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient, userId: number): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>, userId: number): Promise<Client | undefined>;
  deleteClient(id: number, userId: number): Promise<boolean>;
  searchClients(query: string, userId: number): Promise<Client[]>;

  // Service methods
  getServices(userId: number): Promise<Service[]>;
  getService(id: number, userId: number): Promise<Service | undefined>;
  createService(service: InsertService, userId: number): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>, userId: number): Promise<Service | undefined>;
  deleteService(id: number, userId: number): Promise<boolean>;

  // Professional methods
  getProfessionals(userId: number): Promise<Professional[]>;
  getProfessional(id: number, userId: number): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional, userId: number): Promise<Professional>;
  updateProfessional(id: number, professional: Partial<InsertProfessional>, userId: number): Promise<Professional | undefined>;
  deleteProfessional(id: number, userId: number): Promise<boolean>;
  grantSystemAccess(professionalId: number, userId: number, userCredentials: { username: string; password: string }): Promise<User | undefined>;
  revokeSystemAccess(professionalId: number, userId: number): Promise<boolean>;

  // Appointment methods
  getAppointments(userId: number): Promise<any[]>;
  getAppointmentsByDate(date: Date, userId: number): Promise<any[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date, userId: number): Promise<any[]>;
  getAppointment(id: number, userId: number): Promise<any | undefined>;
  createAppointment(appointment: InsertAppointment, userId: number): Promise<any>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>, userId: number): Promise<any | undefined>;
  deleteAppointment(id: number, userId: number): Promise<boolean>;
  checkAppointmentConflict(professionalId: number, startDate: Date, endDate: Date, userId: number, excludeId?: number): Promise<boolean>;
  markAppointmentAsPaid(appointmentId: number, userId: number): Promise<any | undefined>;

  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date, userId: number): Promise<Transaction[]>;
  getTransaction(id: number, userId: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction, userId: number): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: number): Promise<Transaction | undefined>;
  deleteTransaction(id: number, userId: number): Promise<boolean>;
  getFinancialSummary(startDate: Date, endDate: Date, userId: number): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    revenueByCategory: { category: string; amount: number }[];
    expensesByCategory: { category: string; amount: number }[];
  }>;

  // Mark appointment as paid
  markAppointmentAsPaid(id: number, userId: number): Promise<any | undefined>;

  // Public booking methods (no authentication required)
  getAllPublicServices(): Promise<Service[]>;
  createPublicBooking(booking: {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    serviceId: number;
    appointmentDate: Date;
  }): Promise<any>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Client methods
  async getClients(userId: number): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.userId, userId));
  }

  async getClient(id: number, userId: number): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client || undefined;
  }

  async createClient(client: InsertClient, userId: number): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values({ ...client, userId })
      .returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>, userId: number): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return updatedClient || undefined;
  }

  async deleteClient(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async searchClients(query: string, userId: number): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.userId, userId),
          or(
            eq(clients.name, query),
            eq(clients.phone, query)
          )
        )
      );
  }

  // Service methods
  async getServices(userId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.userId, userId));
  }

  async getService(id: number, userId: number): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.userId, userId)));
    return service || undefined;
  }

  async createService(service: InsertService, userId: number): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values({ ...service, userId })
      .returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>, userId: number): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(and(eq(services.id, id), eq(services.userId, userId)))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Professional methods
  async getProfessionals(userId: number): Promise<Professional[]> {
    return await db.select().from(professionals).where(eq(professionals.userId, userId));
  }

  async getProfessional(id: number, userId: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(and(eq(professionals.id, id), eq(professionals.userId, userId)));
    return professional || undefined;
  }

  async createProfessional(professional: InsertProfessional, userId: number): Promise<Professional> {
    const [newProfessional] = await db
      .insert(professionals)
      .values({ ...professional, userId })
      .returning();
    return newProfessional;
  }

  async updateProfessional(id: number, professional: Partial<InsertProfessional>, userId: number): Promise<Professional | undefined> {
    const [updatedProfessional] = await db
      .update(professionals)
      .set(professional)
      .where(and(eq(professionals.id, id), eq(professionals.userId, userId)))
      .returning();
    return updatedProfessional || undefined;
  }

  async deleteProfessional(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(professionals)
      .where(and(eq(professionals.id, id), eq(professionals.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async grantSystemAccess(professionalId: number, userId: number, userCredentials: { username: string; password: string }): Promise<User | undefined> {
    // Check if professional exists and belongs to user
    const professional = await this.getProfessional(professionalId, userId);
    if (!professional) {
      throw new Error("Professional not found");
    }

    // Check if username already exists
    const existingUser = await this.getUserByUsername(userCredentials.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Import hashing function
    const { scrypt, randomBytes } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(userCredentials.password, salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;

    // Create user account for professional
    const [newUser] = await db
      .insert(users)
      .values({
        username: userCredentials.username,
        password: hashedPassword,
        name: professional.name,
        email: professional.email,
        role: "professional"
      })
      .returning();

    // Update professional to link to user account
    await db
      .update(professionals)
      .set({ 
        canAccessSystem: true, 
        systemUserId: newUser.id 
      })
      .where(and(eq(professionals.id, professionalId), eq(professionals.userId, userId)));

    return newUser;
  }

  async revokeSystemAccess(professionalId: number, userId: number): Promise<boolean> {
    // Get professional with system user info
    const professional = await this.getProfessional(professionalId, userId);
    if (!professional || !professional.systemUserId) {
      return false;
    }

    // Delete user account
    await db.delete(users).where(eq(users.id, professional.systemUserId));

    // Update professional to remove system access
    const result = await db
      .update(professionals)
      .set({ 
        canAccessSystem: false, 
        systemUserId: null 
      })
      .where(and(eq(professionals.id, professionalId), eq(professionals.userId, userId)));

    return (result.rowCount || 0) > 0;
  }

  // Appointment methods
  async getAppointments(userId: number): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        date: appointments.date,
        endDate: appointments.endDate,
        notes: appointments.notes,
        status: appointments.status,
        clientName: clients.name,
        clientPhone: clients.phone,
        serviceName: services.name,
        servicePrice: services.price,
        serviceDuration: services.duration,
        professionalName: professionals.name,
      })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(professionals, eq(appointments.professionalId, professionals.id))
      .where(eq(appointments.userId, userId));
  }

  async getAppointmentsByDate(date: Date, userId: number): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select({
        id: appointments.id,
        date: appointments.date,
        endDate: appointments.endDate,
        notes: appointments.notes,
        status: appointments.status,
        clientName: clients.name,
        clientPhone: clients.phone,
        serviceName: services.name,
        servicePrice: services.price,
        serviceDuration: services.duration,
        professionalName: professionals.name,
      })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(professionals, eq(appointments.professionalId, professionals.id))
      .where(
        and(
          eq(appointments.userId, userId),
          gte(appointments.date, startOfDay),
          lte(appointments.date, endOfDay)
        )
      );
  }

  async getAppointmentsByDateRange(startDate: Date, endDate: Date, userId: number): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        date: appointments.date,
        endDate: appointments.endDate,
        notes: appointments.notes,
        status: appointments.status,
        clientName: clients.name,
        clientPhone: clients.phone,
        serviceName: services.name,
        servicePrice: services.price,
        serviceDuration: services.duration,
        professionalName: professionals.name,
      })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(professionals, eq(appointments.professionalId, professionals.id))
      .where(
        and(
          eq(appointments.userId, userId),
          gte(appointments.date, startDate),
          lte(appointments.date, endDate)
        )
      );
  }

  async getAppointment(id: number, userId: number): Promise<any | undefined> {
    const [appointment] = await db
      .select({
        id: appointments.id,
        clientId: appointments.clientId,
        serviceId: appointments.serviceId,
        professionalId: appointments.professionalId,
        date: appointments.date,
        endDate: appointments.endDate,
        notes: appointments.notes,
        status: appointments.status,
        clientName: clients.name,
        clientPhone: clients.phone,
        serviceName: services.name,
        servicePrice: services.price,
        serviceDuration: services.duration,
        professionalName: professionals.name,
      })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(professionals, eq(appointments.professionalId, professionals.id))
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
    
    return appointment || undefined;
  }

  async createAppointment(appointment: InsertAppointment, userId: number): Promise<any> {
    // Calculate end date based on service duration
    const service = await this.getService(appointment.serviceId, userId);
    if (!service) {
      throw new Error("Service not found");
    }

    const endDate = new Date(appointment.date);
    endDate.setMinutes(endDate.getMinutes() + service.duration);

    const [newAppointment] = await db
      .insert(appointments)
      .values({ 
        ...appointment, 
        userId, 
        endDate 
      })
      .returning();

    return await this.getAppointment(newAppointment.id, userId);
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>, userId: number): Promise<any | undefined> {
    let updateData = { ...appointment };

    // Recalculate end date if date or service changed
    if (appointment.date || appointment.serviceId) {
      const currentAppointment = await this.getAppointment(id, userId);
      if (!currentAppointment) return undefined;

      const serviceId = appointment.serviceId || currentAppointment.serviceId;
      const service = await this.getService(serviceId, userId);
      if (!service) throw new Error("Service not found");

      const appointmentDate = appointment.date || currentAppointment.date;
      const endDate = new Date(appointmentDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);
      (updateData as any).endDate = endDate;
    }

    const [updatedAppointment] = await db
      .update(appointments)
      .set(updateData)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
      .returning();

    if (updatedAppointment) {
      return await this.getAppointment(updatedAppointment.id, userId);
    }
    return undefined;
  }

  async deleteAppointment(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async checkAppointmentConflict(
    professionalId: number, 
    startDate: Date, 
    endDate: Date, 
    userId: number,
    excludeId?: number
  ): Promise<boolean> {
    let whereClause = and(
      eq(appointments.userId, userId),
      eq(appointments.professionalId, professionalId),
      or(
        and(
          lte(appointments.date, startDate),
          gte(appointments.endDate, startDate)
        ),
        and(
          lte(appointments.date, endDate),
          gte(appointments.endDate, endDate)
        ),
        and(
          gte(appointments.date, startDate),
          lte(appointments.endDate, endDate)
        )
      )
    );

    if (excludeId) {
      whereClause = and(whereClause, eq(appointments.id, excludeId));
    }

    const conflictingAppointments = await db
      .select()
      .from(appointments)
      .where(whereClause);

    return conflictingAppointments.length > 0;
  }



  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date, userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      );
  }

  async getTransaction(id: number, userId: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction, userId: number): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({ ...transaction, userId })
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>, userId: number): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updatedTransaction || undefined;
  }

  async deleteTransaction(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getFinancialSummary(startDate: Date, endDate: Date, userId: number): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    revenueByCategory: { category: string; amount: number }[];
    expensesByCategory: { category: string; amount: number }[];
  }> {
    const allTransactions = await this.getTransactionsByDateRange(startDate, endDate, userId);
    
    const revenues = allTransactions.filter(t => t.type === "revenue");
    const expenses = allTransactions.filter(t => t.type === "expense");
    
    const totalRevenue = revenues.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const netIncome = totalRevenue - totalExpenses;

    // Group by category
    const revenueByCategory = revenues.reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category);
      if (existing) {
        existing.amount += parseFloat(t.amount);
      } else {
        acc.push({ category: t.category, amount: parseFloat(t.amount) });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);

    const expensesByCategory = expenses.reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category);
      if (existing) {
        existing.amount += parseFloat(t.amount);
      } else {
        acc.push({ category: t.category, amount: parseFloat(t.amount) });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      revenueByCategory,
      expensesByCategory
    };
  }

  // Public booking methods (no authentication required)
  async getAllPublicServices(): Promise<Service[]> {
    try {
      const result = await db.select().from(services);
      return result;
    } catch (error) {
      console.error("Error fetching public services:", error);
      return [];
    }
  }

  async createPublicBooking(booking: {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    serviceId: number;
    appointmentDate: Date;
  }): Promise<any> {
    try {
      // First, get the first available user to associate the booking with
      const adminUsers = await db.select().from(users).limit(1);
      if (adminUsers.length === 0) {
        throw new Error("No admin user found. Please set up an admin account first.");
      }
      const adminUserId = adminUsers[0].id;

      // Check if client already exists by phone
      let existingClients = await db.select()
        .from(clients)
        .where(and(
          eq(clients.phone, booking.clientPhone),
          eq(clients.userId, adminUserId)
        ));

      let clientId: number;

      if (existingClients.length > 0) {
        // Update existing client with new information if provided
        const existingClient = existingClients[0];
        const updatedClient = await db.update(clients)
          .set({
            name: booking.clientName,
            email: booking.clientEmail || existingClient.email,
          })
          .where(eq(clients.id, existingClient.id))
          .returning();
        clientId = updatedClient[0].id;
      } else {
        // Create new client
        const newClients = await db.insert(clients)
          .values({
            name: booking.clientName,
            phone: booking.clientPhone,
            email: booking.clientEmail || "",
            userId: adminUserId,
          })
          .returning();
        clientId = newClients[0].id;
      }

      // Get service duration to calculate end date
      const serviceDetails = await db.select()
        .from(services)
        .where(eq(services.id, booking.serviceId))
        .limit(1);

      if (serviceDetails.length === 0) {
        throw new Error("Service not found");
      }

      const serviceDuration = serviceDetails[0].duration;
      const endDate = new Date(booking.appointmentDate.getTime() + serviceDuration * 60000);

      // Don't assign professional for public bookings - let manager assign later
      const professionalId = null;

      // Create appointment without professional - manager will assign later
      const newAppointment = await db.insert(appointments)
        .values({
          clientId,
          serviceId: booking.serviceId,
          professionalId: null, // No professional assigned for public bookings
          date: booking.appointmentDate,
          endDate,
          status: "pending", // Always pending for public bookings
          userId: adminUserId,
        })
        .returning();

      // Get the appointment with client and service details
      const appointmentWithDetails = await db.select({
        id: appointments.id,
        date: appointments.date,
        status: appointments.status,
        clientName: clients.name,
        clientPhone: clients.phone,
        serviceName: services.name,
        servicePrice: services.price,
        serviceDuration: services.duration,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.id, newAppointment[0].id));

      return appointmentWithDetails[0];
    } catch (error) {
      console.error("Error creating public booking:", error);
      throw error;
    }
  }

  async markAppointmentAsPaid(id: number, userId: number): Promise<any | undefined> {
    try {
      // Update appointment payment status
      const [updatedAppointment] = await db
        .update(appointments)
        .set({ paymentStatus: 'paid' })
        .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
        .returning();

      if (!updatedAppointment) {
        return undefined;
      }

      // Get full appointment details
      const [appointmentDetails] = await db
        .select({
          id: appointments.id,
          date: appointments.date,
          endDate: appointments.endDate,
          notes: appointments.notes,
          status: appointments.status,
          paymentStatus: appointments.paymentStatus,
          clientName: clients.name,
          clientPhone: clients.phone,
          serviceName: services.name,
          servicePrice: services.price,
          serviceDuration: services.duration,
          professionalName: professionals.name,
        })
        .from(appointments)
        .innerJoin(clients, eq(appointments.clientId, clients.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .leftJoin(professionals, eq(appointments.professionalId, professionals.id))
        .where(eq(appointments.id, id));

      // Create a revenue transaction
      const servicePrice = parseFloat(appointmentDetails.servicePrice);
      await db.insert(transactions).values({
        amount: servicePrice.toString(),
        type: 'revenue',
        category: 'services',
        description: `Pagamento - ${appointmentDetails.serviceName} - ${appointmentDetails.clientName}`,
        transactionDate: new Date(),
        userId,
      });

      return appointmentDetails;
    } catch (error) {
      console.error("Error marking appointment as paid:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
