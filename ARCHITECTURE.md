# Nivexa Progressive Architecture

## Overview

This project implements a **Progressive Architecture with Service Layer** pattern, optimized for rapid development while maintaining professional code quality. The architecture provides clean abstractions for CRUD operations, proper separation of concerns, and excellent developer experience.

## Core Philosophy

- **Professional without Over-engineering**: Clean abstractions that eliminate repetitive code without unnecessary complexity
- **Progressive Enhancement**: Start simple, add complexity only when needed
- **Type-Safe by Default**: Full TypeScript support with Supabase types
- **Developer Experience First**: Intuitive patterns that are easy to understand and extend

## Architecture Layers

### 1. Data Layer (Supabase)
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth with JWT
- **Real-time**: WebSocket subscriptions
- **Storage**: File storage via Supabase Storage
- **Edge Functions**: Serverless functions for complex logic

### 2. Service Layer (`/core/services` & `/modules/*/services`)
- **BaseService**: Abstract class with generic CRUD operations
- **Domain Services**: Extend BaseService with business logic
- **Type Safety**: Full TypeScript integration with database types
- **Error Handling**: Consistent error response pattern

### 3. State Management
- **Server State**: React Query for caching and synchronization
- **Client State**: Zustand for local UI state
- **Auth State**: Dedicated auth store with persistence

### 4. UI Layer
- **Components**: Reusable UI components with Storybook
- **Hooks**: Custom hooks for data fetching and mutations
- **Forms**: React Hook Form with Zod validation

## Folder Structure

```
src/
├── config/                 # Application configuration
│   └── supabase.ts        # Supabase client setup
├── core/                  # Core functionality
│   ├── services/          # Base services
│   │   ├── BaseService.ts
│   │   └── AuthService.ts
│   ├── hooks/             # Global hooks
│   │   └── useAuth.ts
│   ├── providers/         # React providers
│   │   └── QueryProvider.tsx
│   ├── types/             # Global types
│   └── utils/             # Utility functions
│       └── validation.ts
├── modules/               # Feature modules
│   ├── workspaces/
│   │   ├── services/      # Workspace business logic
│   │   │   └── WorkspaceService.ts
│   │   ├── hooks/         # Workspace hooks
│   │   │   └── useWorkspaces.ts
│   │   ├── components/    # Workspace UI components
│   │   └── types/         # Workspace types
│   ├── ai-agents/
│   │   ├── services/      # AI Agent business logic
│   │   │   └── AIAgentService.ts
│   │   └── ...
│   └── pipelines/
│       ├── services/      # Pipeline business logic
│       │   └── PipelineService.ts
│       └── ...
├── shared/                # Shared resources
│   ├── components/        # Shared UI components
│   ├── hooks/             # Shared hooks
│   └── utils/             # Shared utilities
├── components/            # Design system components
└── types/                 # TypeScript type definitions
    └── database.types.ts  # Supabase generated types
```

## Key Patterns

### 1. Service Pattern with BaseService

```typescript
// All services extend BaseService for consistent CRUD operations
export class WorkspaceService extends BaseService<'workspaces'> {
  constructor() {
    super('workspaces');
  }
  
  // Add domain-specific methods
  async getUserWorkspaces(userId: string) {
    return this.getAll({
      filters: { user_id: userId }
    });
  }
}
```

### 2. React Query Hooks

```typescript
// Consistent hook pattern with caching and optimistic updates
export function useWorkspaces(userId: string) {
  return useQuery({
    queryKey: workspaceKeys.list({ userId }),
    queryFn: () => workspaceService.getUserWorkspaces(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 3. Zod Validation

```typescript
// Type-safe validation with helpful error messages
const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  description: z.string().optional(),
});
```

## Development Workflow

### 1. Creating a New Module

1. Create module folder: `src/modules/your-module/`
2. Create service extending BaseService
3. Create React Query hooks
4. Add Zod validation schemas
5. Build UI components

### 2. Adding CRUD Operations

BaseService provides these methods out of the box:
- `getAll(filters)` - Get filtered records
- `getPaginated(page, pageSize)` - Get paginated records
- `getById(id)` - Get single record
- `create(data)` - Create record
- `update(id, data)` - Update record
- `delete(id)` - Delete record
- `subscribeToChanges()` - Real-time updates

### 3. Type Generation

```bash
# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

## Best Practices

### 1. Service Layer
- Keep business logic in services, not components
- Use BaseService for standard CRUD operations
- Add domain-specific methods as needed
- Handle errors consistently

### 2. State Management
- Use React Query for server state
- Use Zustand for complex client state
- Keep auth state separate
- Enable React Query devtools in development

### 3. Type Safety
- Generate types from Supabase schema
- Use Zod for runtime validation
- Leverage TypeScript's type inference
- Avoid using `any` type

### 4. Error Handling
- Return consistent error format from services
- Show user-friendly error messages
- Log errors for debugging
- Implement retry logic for transient failures

### 5. Performance
- Use React Query's caching strategically
- Implement pagination for large datasets
- Use optimistic updates for better UX
- Lazy load modules when appropriate

## Environment Setup

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Common Tasks

### Creating a New Service

```typescript
import { BaseService } from '@core/services/BaseService';

export class YourService extends BaseService<'your_table'> {
  constructor() {
    super('your_table');
  }
  
  // Add custom methods here
}
```

### Creating a Query Hook

```typescript
export function useYourData() {
  return useQuery({
    queryKey: ['your-data'],
    queryFn: () => yourService.getAll(),
  });
}
```

### Creating a Mutation Hook

```typescript
export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => yourService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['your-data']);
    },
  });
}
```

## Benefits of This Architecture

1. **Rapid Development**: BaseService eliminates boilerplate
2. **Type Safety**: Full TypeScript coverage with Supabase types
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Easy to add new modules
5. **Performance**: Built-in caching with React Query
6. **Developer Experience**: Intuitive patterns and good tooling
7. **Real-time Support**: WebSocket subscriptions built-in
8. **Error Handling**: Consistent error patterns
9. **Testing**: Services are easily testable
10. **Documentation**: Self-documenting through TypeScript