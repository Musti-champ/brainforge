
# API Puzzle Quest

## Overview

API Puzzle Quest is a gamified educational platform designed to teach developers API skills through interactive challenges and hands-on practice. The application combines learning with game mechanics, featuring XP systems, levels, streaks, and achievements to engage users while they master REST APIs, authentication, GraphQL, and other API-related concepts.

The platform provides a comprehensive learning environment where users can progress through structured challenges, test real API endpoints, and build practical skills through guided tutorials and real-world scenarios.

**Latest Updates (Phase 2 - August 15, 2025):**
- Added AI-powered adaptive challenge engine that personalizes learning paths
- Implemented procedural challenge generator for endless content
- Created progressive skill tree with unlockable learning paths  
- Built comprehensive Postman integration with exportable collections
- Added global leaderboard system with competitive elements
- Enhanced navigation with dedicated pages for skill tree, leaderboard, and collections
- Extended data model with skills tracking, prerequisites, and API provider information

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## System Architecture

### Frontend Architecture
- **React** with **TypeScript** using modern development patterns
- **Tailwind CSS** with **shadcn/ui** component library
- **TanStack Query** for server state management
- **Wouter** for lightweight client-side routing

### Backend Architecture
- **Node.js** with **Express** for the API server
- **PostgreSQL** with **Drizzle ORM** for database operations
- **WebSocket support** for real-time collaboration

### Key Features
- Interactive API testing environment
- AI-powered code review and suggestions
- Real-time collaboration sessions
- Progressive skill tree with unlockable content
- Professional portfolio builder
- Community forum and mentorship system

## Configuration

The application uses environment variables for configuration:
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- Database configuration via Neon Database

## Deployment

This application is optimized for deployment on multiple platforms with built-in configuration files for Vercel and other hosting services.
