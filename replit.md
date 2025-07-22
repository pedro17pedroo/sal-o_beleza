# Beauty Salon Management System

## Overview
This is a full-stack web application for managing beauty salon operations, built with React, TypeScript, Express.js, and PostgreSQL. The system provides comprehensive functionality for appointment scheduling, client management, service catalog, and professional staff management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows a modern full-stack architecture with:
- **Frontend**: React 18 with TypeScript, using Vite as the build tool
- **Backend**: Express.js with TypeScript, providing RESTful APIs
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based auth
- **UI Components**: Shadcn/ui component library with Tailwind CSS styling

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Shadcn/ui component library providing consistent, accessible components
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Authentication**: Passport.js with local strategy for username/password auth
- **Session Management**: Express-session with PostgreSQL session store
- **API Design**: RESTful endpoints with consistent error handling
- **Database Access**: Drizzle ORM providing type-safe database operations

### Database Schema
The PostgreSQL database uses the following main entities:
- **Users**: System administrators/salon owners
- **Clients**: Customer information (name, phone, email)
- **Services**: Available salon services with duration and pricing
- **Professionals**: Staff members who perform services
- **Appointments**: Scheduled appointments linking clients, services, and professionals

All entities are properly related with foreign keys and include audit fields (createdAt timestamps).

### Authentication & Authorization
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: Scrypt hashing with random salts
- **Session Storage**: PostgreSQL-backed session store for persistence
- **Route Protection**: Middleware to ensure authenticated access to API endpoints
- **User Context**: React context provider for managing authentication state

## Data Flow
1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **Authentication**: Passport middleware validates user sessions
3. **Route Handling**: Express routes process requests with proper error handling
4. **Database Operations**: Drizzle ORM handles type-safe database queries
5. **Response Formatting**: Consistent JSON responses with proper HTTP status codes
6. **Client Updates**: TanStack Query manages cache invalidation and UI updates

## External Dependencies
- **Database**: Neon PostgreSQL for serverless database hosting
- **UI Components**: Radix UI primitives for accessibility
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation
- **Development Tools**: Various Vite plugins for enhanced development experience

## Deployment Strategy
- **Build Process**: Vite builds the frontend, esbuild bundles the backend
- **Environment**: Configured for Replit hosting with proper environment variables
- **Database**: Uses Neon serverless PostgreSQL with WebSocket support
- **Static Assets**: Frontend built to dist/public, served by Express in production
- **Process Management**: Single Node.js process serving both API and static files

## Recent Changes
- **January 22, 2025**: Successfully migrated project from Replit Agent to Replit environment
- **January 22, 2025**: Fixed authentication flow to redirect to /dashboard after login/registration
- **January 22, 2025**: Created comprehensive landing page separating customer and admin access
- **January 22, 2025**: Implemented public booking system without authentication  
- **January 22, 2025**: Added cash flow management with transaction tracking and financial dashboard
- **January 22, 2025**: Fixed API routing and database schema for public appointments
- **January 22, 2025**: Updated currency formatting throughout system from R$ to Kz (Angolan Kwanza)
- **January 22, 2025**: Confirmed public booking system working correctly with database integration
- **January 22, 2025**: Implemented complete 4-view calendar system (Daily, Weekly, Monthly, Annual) with smart navigation
- **January 22, 2025**: Improved public booking workflow - customers no longer select professionals, managers assign them later
- **January 22, 2025**: Public bookings now always create pending appointments without professional assignment
- **January 22, 2025**: Removed public user registration - only login available for authenticated access
- **January 22, 2025**: Created admin seed user (username: admin, password: admin123) for system access
- **January 22, 2025**: Added professional system access management - admin can grant/revoke access to professionals
- **January 22, 2025**: Updated database schema to support professional system users with proper role management
- **January 22, 2025**: Successfully migrated from Replit Agent to Replit environment with enhanced responsive design
- **January 22, 2025**: Implemented real-time state management with automatic data refresh every 30 seconds
- **January 22, 2025**: Added comprehensive responsive design with mobile-first approach and adaptive layouts
- **January 22, 2025**: Enhanced UI with mobile cards for table data and improved navigation for all screen sizes
- **January 22, 2025**: Fixed duplicate "Novo Agendamento" button in appointments calendar interface
- **January 22, 2025**: Implemented automatic data refresh in appointment details modal after edits
- **January 22, 2025**: Added smart button logic based on appointment status and payment status
- **January 22, 2025**: Enhanced appointment details with payment status badges and conditional button visibility
- **January 22, 2025**: Fixed appointment cancellation error - removed JSON parsing from empty DELETE responses
- **January 22, 2025**: Implemented automatic modal closure when appointment is rejected/cancelled
- **January 22, 2025**: Enhanced button visibility - Confirmar/Rejeitar buttons disappear after status change
- **January 22, 2025**: Added automatic modal closure when payment is marked as paid
- **January 22, 2025**: Enhanced Cancelar button logic - disappears when appointment is paid

The application is designed as an MVP (Minimum Viable Product) focusing on core salon management features while maintaining a clean architecture that allows for future enhancements like reporting, financial management, and advanced scheduling features.