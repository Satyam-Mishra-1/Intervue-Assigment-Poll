# Intervue Poll - Live Polling System

## Overview

This is a real-time live polling application that enables teachers to create and manage polls while students submit answers and view results instantly. The system uses WebSockets for real-time communication between teachers and students, with a role-based interface where users select their role (teacher or student) on the landing page.

Key features include:
- Real-time question broadcasting with countdown timers
- Live vote tracking and result visualization
- Student session management with kick functionality
- Historical poll results viewing
- In-memory data storage for polls, questions, students, and responses

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin

The frontend follows a page-based structure:
- `Desktop.tsx` - Landing page for role selection
- `TeacherDashboard.tsx` - Poll creation and management interface
- `StudentPage.tsx` - Student participation interface

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Real-time Communication**: Socket.IO for WebSocket connections
- **API Style**: RESTful endpoints for initial state, WebSocket events for real-time updates

Socket events handle:
- Teacher/student join flows
- Question creation and broadcasting
- Vote submission and result aggregation
- Student session management (kick functionality)

### Data Storage
- **Current Implementation**: In-memory storage using JavaScript Maps (`server/storage.ts`)
- **Schema Definition**: TypeScript interfaces with Zod validation in `shared/schema.ts`
- **Database Ready**: Drizzle ORM configured with PostgreSQL dialect for future migration

Data models include:
- Poll (container for questions)
- Question (poll items with options and time limits)
- Student (session tracking with socket connection)
- Response (student answers linked to questions)

### Shared Code
The `shared/` directory contains TypeScript interfaces and Zod schemas used by both frontend and backend, ensuring type safety across the full stack.

## External Dependencies

### Database
- **Drizzle ORM**: Configured for PostgreSQL via `@neondatabase/serverless`
- **Connection**: Requires `DATABASE_URL` environment variable
- **Migrations**: Output to `./migrations` directory via `drizzle-kit`

### Real-time Communication
- **Socket.IO**: Client and server packages for WebSocket communication
- **Transport**: WebSocket with polling fallback

### UI Framework
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **shadcn/ui**: Pre-built component library using Radix + Tailwind
- **Lucide React**: Icon library

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment
- **esbuild**: Production server bundling
- **TypeScript**: Strict mode with bundler module resolution