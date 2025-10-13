# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Nivexa is a financial management system specialized for architecture studios with a triple cash box system and project financing features. Built with React 19, TypeScript, Vite 7, Tailwind CSS v4, and Supabase (PostgreSQL).

## Key Architecture

### Agent Structure
Each agent is a Markdown file with YAML frontmatter containing:
- **name**: Unique kebab-case identifier
- **description**: Detailed usage scenarios with 3-4 examples including context and commentary
- **color**: Visual identification
- **tools**: Specific Claude Code tools the agent can access (Write, Read, MultiEdit, Bash, Task, etc.)
- **System prompt**: Comprehensive expertise and instructions (500+ words)

### Department Organization
Agents are organized into functional departments:
- `engineering/` - Development and implementation agents
- `design/` - UI/UX and visual design agents
- `marketing/` - Growth and platform-specific marketing agents
- `product/` - Product strategy and feedback agents
- `project-management/` - Sprint and project coordination agents
- `studio-operations/` - Business operations and support agents
- `testing/` - Quality assurance and performance agents
- `bonus/` - Special agents including the proactive studio-coach

## Development Workflow

### Agent Installation
```bash
# Clone repository
git clone https://github.com/contains-studio/agents.git

# Copy to Claude Code agents directory
cp -r agents/* ~/.claude/agents/

# Restart Claude Code to load agents
```

### Creating New Agents
When creating a new agent:
1. Place in appropriate department folder
2. Use existing agents as templates for structure
3. Include comprehensive YAML frontmatter
4. Write detailed system prompt (500+ words minimum)
5. Provide 3-4 realistic usage examples with context and commentary
6. Test thoroughly with real tasks

### Agent Testing Checklist
- Agent activates correctly for intended use cases
- Specified tools are accessible and functional
- Output quality meets studio standards
- Edge cases are handled appropriately
- Works well in multi-agent workflows
- Completes tasks within 6-day sprint constraints

## Key Agents and Their Purposes

### Proactive Agents
These agents trigger automatically:
- **studio-coach**: Activates at start of complex tasks or when agents need coordination
- **test-writer-fixer**: Triggers after feature implementation or bug fixes
- **whimsy-injector**: Activates after UI/UX changes
- **experiment-tracker**: Triggers when feature flags are added

### Core Development Agents
- **rapid-prototyper**: MVP creation, trend integration, project scaffolding
- **backend-architect**: API design, scalable server systems
- **frontend-developer**: Fast user interfaces, component development
- **mobile-app-builder**: Native iOS/Android experiences
- **ai-engineer**: AI/ML feature integration

### Studio Philosophy
All agents follow the "6-day sprint" philosophy:
- Ship fast and iterate based on real feedback
- Prioritize working prototypes over perfect code
- Focus on viral potential and user value
- Maintain high velocity without sacrificing core quality

## Agent Customization

### Required Components for Custom Agents
Each agent must include:
- Unique name and clear role definition
- 5-8 specific primary responsibilities
- Technical skills and knowledge areas
- Integration with 6-day sprint workflow
- Success metrics and constraints
- Platform/tool-specific methodologies

### Department-Specific Focus
- **Engineering**: Implementation speed, code quality, testing
- **Design**: User experience, visual consistency, rapid iteration
- **Marketing**: Viral potential, platform expertise, growth metrics
- **Product**: User value, data-driven decisions, market fit
- **Operations**: Process optimization, friction reduction, system scaling

## Best Practices

### Working with Agents
1. Let agents collaborate on complex tasks
2. Be specific in task descriptions for better performance
3. Trust domain expertise of specialized agents
4. Use studio-coach for multi-agent coordination
5. Leverage proactive agents' automatic triggers

### Agent Communication
Agents should:
- Maintain their specialized persona and expertise
- Reference the 6-day sprint constraint when relevant
- Collaborate smoothly with handoffs between specialists
- Focus on rapid delivery and iteration
- Balance speed with quality for studio success

## Development Commands

```bash
# Start development server on port 3001
npm run dev

# Build with TypeScript checks (recommended)
npm run build

# Build without TypeScript checks (faster)
npm run build:fast

# Run linter
npm run lint

# Testing commands
npm test                    # Run all tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run with coverage report
npm run test:watch         # Run in watch mode

# Storybook (component development)
npm run storybook          # Start Storybook on port 6006
npm run build-storybook    # Build Storybook

# Database setup
npm run setup:auth         # Setup authentication
npm run db:setup          # Setup database
```

## Database Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Execute `supabase/migrations/001_initial_schema.sql`
4. Execute subsequent migration files in order

## Architecture and Key Concepts

### Progressive Architecture with Service Layer

The codebase follows a progressive architecture pattern with a clear service layer abstraction:

- **BaseService**: Abstract base class (`src/core/services/BaseService.ts`) providing generic CRUD operations with type safety
- **Domain Services**: Extend BaseService for domain-specific logic (ProjectService, CashBoxService)
- **Service Pattern**: All services return `ServiceResponse<T>` with `{ data, error }` structure for consistent error handling

### Triple Cash Box System

Core business logic implementing a specialized financial flow:

1. **Master Cash Box** (`master_cash_box` table): Main studio cash box
   - Automatically receives duplicates of all project income
   - Source for architect fee collection

2. **Admin Cash Box** (`admin_cash`): Personal architect cash box
   - Receives manual fee collections from master cash
   - Architect decides when and how much to collect

3. **Project Cash Boxes** (`project_cash_box` table): One per project
   - Receives project payments
   - Tracks project-specific finances

**Critical Business Rules**:
- All project income automatically duplicates to master cash
- Fee collection is manual from master to admin (architect's decision)
- Complete traceability through `cash_movements` table
- Each movement has source/destination types and IDs

### Multi-Currency Support

The system supports ARS (Argentine Peso) and USD:
- Cash boxes have separate balance fields: `current_balance_ars`, `current_balance_usd`
- All monetary amounts validated with `isValidCurrencyAmount()` to prevent overflow
- Validation enforced in `src/core/utils/validation.ts`
- Maximum values defined in currency validation functions

### Module Structure

```
src/
├── core/                     # Framework-level code
│   ├── services/            # BaseService, AuthService, SentryService
│   ├── contexts/            # React contexts
│   └── providers/           # Provider components
├── modules/                 # Domain-specific modules
│   ├── projects/            # Project management
│   │   ├── services/ProjectService.ts
│   │   ├── hooks/
│   │   └── components/
│   ├── finance/             # Financial system
│   │   └── services/CashBoxService.ts
│   ├── clients/             # Client management
│   └── providers/           # Contractor/provider management
├── components/              # Shared UI components
│   └── ui/                 # shadcn/ui components
├── pages/                  # Page components (route targets)
└── types/                  # TypeScript type definitions
    └── database.types.ts   # Supabase generated types
```

### Path Aliases

Configured in both `tsconfig.app.json` and `vite.config.ts`:

```typescript
@/          → ./src/
@components → ./src/components/
@core       → ./src/core/
@modules    → ./src/modules/
@hooks      → ./src/hooks/
@utils      → ./src/utils/
@types      → ./src/types/
```

Always use these aliases for imports instead of relative paths.

### Project Code Generation

Projects receive unique codes in format `PRY-YYYY-###`:
- Generated by `ProjectService.generateProjectCode()`
- Sequential numbering per year
- Example: `PRY-2024-001`, `PRY-2024-002`

### Installment System

Projects support financing with installments:
- Installment 0 = down payment (anticipo)
- Installments 1-N = regular payments
- Payment frequencies: monthly, weekly, biweekly, quarterly
- Status tracking: pending, paid, overdue
- Late fee calculation with configurable grace periods
- Automatic installment generation based on project configuration

## Technology Stack Details

### TypeScript Configuration

- Strict mode: **disabled** (`strict: false` in tsconfig.app.json)
- Unused locals/parameters checking: **disabled**
- Target: ES2022
- Module resolution: bundler mode
- Composite project structure with references

**Important**: When adding strict type checking, expect significant refactoring needs.

### Supabase Integration

- Database types generated in `src/types/database.types.ts`
- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions available via `BaseService.subscribeToChanges()`
- Configuration in `src/config/supabase.ts`

### Testing Setup

- Framework: Vitest with happy-dom
- React Testing Library configured
- Coverage configured with v8 provider
- Setup file: `src/test/setup.ts`
- Run individual test: `npm test -- path/to/test.test.ts`

### UI Component Library

- shadcn/ui components in `src/components/ui/`
- Radix UI primitives for accessible components
- Tailwind CSS v4 with new Vite plugin
- Framer Motion for animations
- Lucide React for icons
- Dark theme configured with next-themes

### State Management

- React Query (TanStack Query) for server state
- Zustand for client state (`src/core/store/`)
- React Context for cross-cutting concerns
- Form state with react-hook-form + Zod validation

## Common Development Tasks

### Adding a New Table/Service

1. Run Supabase migration to create table
2. Regenerate types: Check Supabase docs for type generation
3. Create service extending `BaseService<'table_name'>`
4. Add type exports using generated `Tables<'table_name'>` type
5. Create custom hooks in `modules/[domain]/hooks/`

### Working with Cash Movements

Always use the service layer methods:
- `CashBoxService.recordProjectIncome()` - For project payments (auto-duplicates to master)
- `CashBoxService.collectFees()` - For manual fee collection (master → admin)
- `CashBoxService.recordExpense()` - For expenses from any cash box

Never manually update cash box balances - always create movements first.

### Form Validation

Forms use react-hook-form with Zod:
```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ /* ... */ });
const form = useForm({ resolver: zodResolver(schema) });
```

Currency amounts should be validated with utility functions from `@core/utils/validation.ts`.

### Error Handling Pattern

Services return `ServiceResponse<T>`:
```typescript
const { data, error } = await service.method();
if (error) {
  // Handle error
  return;
}
// Use data
```

React Query hooks handle async state automatically.

## Database Schema Key Relationships

- `projects` → `project_cash_box` (1:1)
- `projects` → `installments` (1:N)
- `installments` → `payments` (1:N)
- Cash movements track all financial flows with source/destination references
- `fee_collections` links to `cash_movements` via `movement_id`

## Important Constraints

- All monetary operations must validate amounts to prevent database overflow
- Project creation includes automatic cash box creation (atomic operation)
- Down payment confirmation is separate from project creation
- RLS policies require authenticated users for all operations
- Each cash box movement must have corresponding balance updates
