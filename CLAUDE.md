# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start development environment (runs both server and Next.js in parallel)
- `npm run server` - Start Express.js server only (port 3000 by default)
- `npm run build` - Build Next.js application for production
- `npm run start` - Start production server

### Linting and Testing
- No linting configuration currently exists
- No testing framework is configured
- The application uses nodemon for auto-reloading during development

## Architecture Overview

StoryForge AI is a full-stack AI-powered storytelling platform built with Next.js and Express.js.

### Tech Stack
- **Frontend**: React.js with Next.js (pages router)
- **Backend**: Express.js server with Socket.io for real-time features
- **Database**: MongoDB with connection pooling
- **AI Integration**: OpenAI GPT-4o-mini for story generation
- **Image Handling**: ImageKit integration for uploads and processing

### Key Architecture Patterns

#### Hybrid Server Architecture
The application runs both a Next.js application and a custom Express server concurrently:
- Express server (`server.js`) handles Socket.io connections and custom middleware
- Next.js handles API routes (`/pages/api/`) and frontend rendering
- Both servers run on the same port with Express delegating to Next.js

#### Database Layer
- **Connection Management**: Uses singleton pattern in `lib/services/storyService.js` for MongoDB connections
- **Dual Database Approach**: 
  - Simple model in `models/Story.js` for basic operations
  - Advanced service layer in `lib/services/storyService.js` for complex operations
- **Collections**: `stories`, `story_drafts`, `story_parameters`, plus resource collections for `characters`, `locations`, `themes`, `archetypes`

#### Story Generation System
- **AI Integration**: `lib/ai.js` handles OpenAI interactions with structured prompts
- **Prompt Building**: `lib/promptBuilder.js` creates formatted prompts from story parameters
- **Story Parameters**: Complex nested object system for defining story elements
- **Progress Tracking**: Real-time story generation progress via Socket.io

### Component Architecture

#### Resource Management Pattern
The application uses a consistent pattern across resource types (characters, locations, themes, archetypes):
- List pages (`characters.jsx`, `locations.jsx`, etc.) for viewing and managing collections
- CRUD API endpoints (`/api/characters/`, `/api/locations/`, etc.)
- Shared components for common operations (`ItemGrid`, `PageHeader`)

#### Editor System
- **Nested Editors**: Complex nested object/array editing via `NestedObjectEditor.jsx` and `NestedArrayEditor.jsx`
- **Story Parameter Editor**: Specialized editor in `components/editors/StoryParameterEditor.jsx`
- **Modal System**: Consistent modal pattern using `EditModal.jsx` and `JsonModal.jsx`

#### Error Handling
- **Error Boundaries**: `ErrorBoundary.jsx` and `ErrorBoundaryWrapper.jsx` for React error containment
- **Custom Error Types**: Defined in `lib/errors/types.js`
- **Centralized Handler**: `lib/errors/handler.js` with MongoDB-specific middleware
- **Server-Level**: Express error middleware in `middleware/`

### Data Flow Patterns

#### Story Generation
1. User creates/selects story parameters via `StoryParameterEditor`
2. Parameters processed through `promptBuilder.js`
3. AI generation triggered via `lib/ai.js`
4. Progress tracked via Socket.io (`StoryGenerationProgress.jsx`)
5. Results saved to database via `storyService.js`

#### Resource Management
1. List view loads resources via API endpoints
2. CRUD operations handled through consistent API pattern
3. UI updates via React state management
4. Complex editing via nested editor components

## Environment Variables

Required environment variables:
- `MONGODB_URI` or `MONGODB_HOST`/`MONGODB_PORT` - Database connection
- `OPENAI_API_KEY` - AI story generation
- `SERVER_PORT` - Server port (defaults to 3000)
- `MONGODB_DB` - Database name (defaults to 'storyforge')

## File Organization

### Key Directories
- `/components/` - React components organized by function
- `/pages/` - Next.js pages and API routes
- `/lib/` - Utility functions, AI integration, database connection
- `/models/` - Simple database models
- `/middleware/` - Express middleware
- `/utils/` - Validation and utility functions

### Important Files
- `server.js` - Main Express server with Socket.io setup
- `lib/ai.js` - OpenAI integration and story generation
- `lib/services/storyService.js` - Advanced database operations
- `design-document--storyforge-ai.md` - Comprehensive project documentation
- `todo.md` - Current development priorities and task tracking

## Development Notes

### MongoDB Connection Patterns
The codebase uses two different MongoDB connection patterns:
- Legacy pattern in `lib/db.js` and `models/Story.js`
- Modern service pattern in `lib/services/storyService.js`
Prefer the service pattern for new development.

### Story Parameter System
Story parameters use a complex nested structure. When working with story generation:
- Parameters are stored as nested objects/arrays
- Use the specialized editor components for UI
- Follow the existing parameter schema patterns

### Error Handling Strategy
- All database operations should use try/catch with proper error types
- Frontend errors should be contained by error boundaries
- Server errors logged with structured format including request context

## ImageKit Integration

### Environment Variables for Images
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` - Client-side ImageKit public key
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint
- `IMAGEKIT_PRIVATE_KEY` - Server-side private key (never expose client-side)

### Image Upload Guidelines
- Always use the reusable `ImageUpload` component
- Validate files: max 5MB, formats: jpeg, png, gif, webp
- Use folder structure: `/entity-type/...`
- Include unique filenames with timestamps
- Handle authentication with Promise-based authenticator

## Design System and UI Patterns

### Complex Data Editing
- Each complex data type requires specialized editor components
- Support both form-based and raw JSON editing modes
- Field types: text, textarea, json (with subtypes: list, key-value, nested-object)
- Always provide example data in field definitions

### Modal Design Standards
- Header contains action controls (not footer)
- Toggle between form/JSON editing modes
- Consistent padding (2rem)
- Full-width form elements
- Proper overflow handling

### Styling Conventions
- Spacing: 2rem containers, 1rem gaps
- Border radius: 4px standard, 8px for cards
- Include hover effects for interactive elements
- Maintain clear visual hierarchy
- Ensure proper focus states

## Critical Implementation Notes

### Database Fallback System
The application includes a mock database fallback when MongoDB is unavailable:
- Primary: MongoDB connection via `MONGODB_URI`
- Fallback: Mock database in `lib/mockDatabase.js`
- Service automatically switches based on connection availability

### Real-time Features
Socket.io integration for live updates:
- Story generation progress tracking
- Real-time error notifications
- Connection handling in `server.js`

### AI Story Generation
- Model: GPT-4o-mini via OpenAI API
- Structured prompts with system messages
- Story length guidelines enforced in prompts
- Progress updates via Socket.io events