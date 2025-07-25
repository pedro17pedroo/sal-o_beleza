import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().default("admin"), // admin or professional
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: text("email"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(), // duration in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: text("email"),
  userId: integer("user_id").notNull().references(() => users.id),
  canAccessSystem: boolean("can_access_system").default(false).notNull(),
  systemUserId: integer("system_user_id").references(() => users.id), // Reference to user account if professional can access system
  // Work schedule fields
  workDays: text("work_days").notNull().default("1,2,3,4,5"), // Days of week: 0=Sunday, 1=Monday, etc. Comma-separated
  workStartTime: text("work_start_time").notNull().default("08:00"), // Start time in HH:MM format
  workEndTime: text("work_end_time").notNull().default("18:00"), // End time in HH:MM format
  lunchStartTime: text("lunch_start_time"), // Optional lunch break start time
  lunchEndTime: text("lunch_end_time"), // Optional lunch break end time
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  professionalId: integer("professional_id").references(() => professionals.id),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("confirmed"), // confirmed, pending, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // revenue, expense
  category: text("category").notNull(), // service_payment, salary, supplies, rent, utilities, other
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id), // Only for revenue from services
  userId: integer("user_id").notNull().references(() => users.id),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Professional permissions table
export const professionalPermissions = pgTable("professional_permissions", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id),
  permission: text("permission").notNull(), // view_appointments, manage_appointments, view_clients, manage_clients, view_services, manage_services, view_financial, manage_financial
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  services: many(services),
  professionals: many(professionals),
  appointments: many(appointments),
  transactions: many(transactions),
  systemProfessionals: many(professionals, { relationName: "professionalSystemUser" }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  user: one(users, {
    fields: [services.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const professionalsRelations = relations(professionals, ({ one, many }) => ({
  user: one(users, {
    fields: [professionals.userId],
    references: [users.id],
  }),
  systemUser: one(users, {
    fields: [professionals.systemUserId],
    references: [users.id],
    relationName: "professionalSystemUser",
  }),
  appointments: many(appointments),
  permissions: many(professionalPermissions),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  professional: one(professionals, {
    fields: [appointments.professionalId],
    references: [professionals.id],
  }),
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  appointment: one(appointments, {
    fields: [transactions.appointmentId],
    references: [appointments.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const professionalPermissionsRelations = relations(professionalPermissions, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalPermissions.professionalId],
    references: [professionals.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  workDays: z.string().optional().default("1,2,3,4,5"), // Monday to Friday by default
  workStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default("08:00"),
  workEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default("18:00"),
  lunchStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  lunchEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  userId: true,
  createdAt: true,
  endDate: true,
}).extend({
  date: z.union([z.date(), z.string().datetime()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  transactionDate: z.union([z.date(), z.string().datetime()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  amount: z.union([z.number(), z.string()]).transform((val) => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
});

export const insertProfessionalPermissionSchema = createInsertSchema(professionalPermissions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type ProfessionalPermission = typeof professionalPermissions.$inferSelect;
export type InsertProfessionalPermission = z.infer<typeof insertProfessionalPermissionSchema>;

// Permission types enum
export const PERMISSIONS = {
  VIEW_APPOINTMENTS: 'view_appointments',
  MANAGE_APPOINTMENTS: 'manage_appointments',
  VIEW_CLIENTS: 'view_clients', 
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_SERVICES: 'view_services',
  MANAGE_SERVICES: 'manage_services',
  VIEW_FINANCIAL: 'view_financial',
  MANAGE_FINANCIAL: 'manage_financial',
} as const;

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS];
