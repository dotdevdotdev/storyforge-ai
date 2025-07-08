# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Build Next.js application for production
- `npm run start` - Start Next.js production server
- `npm run custom-server` - Run with custom Express server (for Socket.io features)

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
- **Text-to-Speech**: ElevenLabs API integration for story narration

### Key Architecture Patterns

#### Server Architecture
The application primarily uses Next.js's built-in server:
- Next.js handles all routing, API routes (`/pages/api/`), and page rendering
- Optional custom Express server (`server.js`) available for Socket.io features
- For development, use standard `npm run dev` (Next.js only)
- Socket.io features documented in `/docs/future-features/realtime-collaboration.md`

#### Database Layer
- **Connection Management**: Uses singleton pattern in `lib/services/storyService.js` for MongoDB connections
- **Dual Database Approach**: 
  - Simple model in `models/Story.js` for basic operations
  - Advanced service layer in `lib/services/storyService.js` for complex operations
- **Collections**: `stories`, `story_drafts`, `story_parameters`, `story_audio`, plus resource collections for `characters`, `locations`, `themes`, `archetypes`

#### Story Generation System
- **AI Integration**: `lib/ai.js` handles OpenAI interactions with structured prompts
- **Prompt Building**: `lib/promptBuilder.js` creates formatted prompts from story parameters
- **Story Parameters**: Complex nested object system for defining story elements
- **Progress Tracking**: Real-time story generation progress via Socket.io

#### Text-to-Speech Integration
- **API Endpoint**: `/api/tts.js` handles ElevenLabs TTS requests
- **Caching System**: Audio results cached in `story_audio` collection to reduce API calls
- **Voice Configuration**: Uses "Andrea Wolff" voice (ID: Crm8VULvkVs5ZBDa1Ixm) with preset settings
- **Audio Format**: Returns base64-encoded MP3 audio for browser playback

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
- **Structured Logging**: Server errors logged with timestamp, error details, and request context

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
- `ELEVENLABS_API_KEY` - Text-to-speech integration
- `SERVER_PORT` - Server port (defaults to 3000)
- `MONGODB_DB` - Database name (defaults to 'storyforge')

ImageKit integration:
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` - Client-side ImageKit public key
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint
- `IMAGEKIT_PRIVATE_KEY` - Server-side private key (never expose client-side)

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
- `pages/api/tts.js` - ElevenLabs TTS integration endpoint
- `design-document--storyforge-ai.md` - Comprehensive project documentation
- `todo.md` - Current development priorities and task tracking
- `project-goals.md` - Long-term roadmap and feature planning

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
- Socket.io errors handled separately with connection recovery

### Git Workflow
- Main branch: `main`
- Feature branches created from main
- Commit messages should describe changes clearly
- No pre-commit hooks configured

## ImageKit Integration

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

### Audio Caching Strategy
The TTS system implements intelligent caching:
- Audio cached by text hash + voice ID combination
- Reduces redundant API calls for identical content
- Stored as base64 in MongoDB for fast retrieval
- Cache entries include metadata for debugging

## Project Roadmap

StoryForge AI follows a progressive enhancement strategy outlined in `project-goals.md`. The development is organized into 6 major phases:

1. **Authentication Foundation** - User accounts and secure authentication
2. **Multi-Tenant Architecture** - User-owned resources and data isolation  
3. **Sharing & Visibility** - Public/private stories and community features
4. **Community Platform** - Discovery, engagement, and social features
5. **AI Image Generation** - Visual storytelling with generated illustrations
6. **Kid-Friendly UI** - Magical, gamified interface for young users

Each phase builds upon the previous one and should be fully tested before proceeding. See `project-goals.md` for detailed tasks, timelines, and success criteria.