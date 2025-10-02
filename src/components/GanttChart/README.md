# Enhanced GanttChart Component

A professional Gantt chart implementation for the Nivexa CRM using the `gantt-task-react` library. This component provides interactive timeline visualization with drag-to-resize, dependencies, and multiple view modes.

## Features

### 🎨 Professional Design
- Clean, minimalist interface aligned with Nivexa's design system
- Gray-scale color palette with subtle accent colors
- Responsive design that works on all screen sizes
- Custom styling with proper typography and spacing

### ⚡ Interactive Features
- **Drag to Move**: Drag tasks horizontally to change start/end dates (when editable)
- **Resize to Adjust**: Drag task edges to modify duration (when editable)
- **Progress Indicators**: Visual progress bars within tasks
- **Dependency Lines**: Dotted lines showing task dependencies
- **Multiple View Modes**: Hour, Day, Week, and Month views
- **Expandable Height**: Toggle between compact and expanded views

### 🔧 Configuration Options
- Toggle dependencies visibility
- Show/hide progress indicators
- Enable/disable editing capabilities
- Custom color coding by task status
- Responsive zoom controls

## Usage

### Basic Implementation

```tsx
import { GanttChart, type GanttStage } from '@/components/GanttChart';

const stages: GanttStage[] = [
  {
    id: 'stage-1',
    name: 'Planning Phase',
    description: 'Initial planning and requirements gathering',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'stage-2',
    name: 'Development Phase',
    description: 'Core development work',
    startDate: '2024-02-16',
    endDate: '2024-04-15',
    status: 'in-progress',
    progress: 65,
    dependencies: ['stage-1'],
  },
];

function ProjectTimeline() {
  return (
    <GanttChart
      stages={stages}
      showDependencies={true}
      showProgress={true}
      isEditable={false}
      onStageClick={(stage) => console.log('Clicked:', stage)}
    />
  );
}
```

### Advanced Implementation with Editing

```tsx
function EditableProjectTimeline() {
  const [stages, setStages] = useState<GanttStage[]>(initialStages);

  const handleStageUpdate = (updatedStage: GanttStage) => {
    setStages(prev => 
      prev.map(stage => 
        stage.id === updatedStage.id ? updatedStage : stage
      )
    );
  };

  return (
    <GanttChart
      stages={stages}
      showDependencies={true}
      showProgress={true}
      isEditable={true}
      onStageUpdate={handleStageUpdate}
      onStageClick={(stage) => openStageDetails(stage)}
    />
  );
}
```

## Props API

### GanttChartProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stages` | `GanttStage[]` | `[]` | Array of project stages/tasks to display |
| `className` | `string` | `''` | Additional CSS classes for the container |
| `showDependencies` | `boolean` | `true` | Show dependency lines between tasks |
| `showProgress` | `boolean` | `true` | Show progress bars within tasks |
| `isEditable` | `boolean` | `false` | Allow drag and resize interactions |
| `minDate` | `string` | - | Minimum date for timeline (ISO format) |
| `maxDate` | `string` | - | Maximum date for timeline (ISO format) |
| `onStageClick` | `(stage: GanttStage) => void` | - | Callback when a stage is clicked |
| `onStageUpdate` | `(stage: GanttStage) => void` | - | Callback when a stage is modified |

### GanttStage Interface

```tsx
interface GanttStage {
  id: string;                                          // Unique identifier
  name: string;                                        // Task/stage name
  description?: string;                                // Optional description
  startDate: string;                                   // Start date (ISO format)
  endDate: string;                                     // End date (ISO format)
  dependencies?: string[];                             // Array of dependent stage IDs
  color?: string;                                      // Custom color (hex format)
  status?: 'pending' | 'in-progress' | 'completed' | 'overdue';  // Status indicator
  progress?: number;                                   // Progress percentage (0-100)
}
```

## Status Color Mapping

The component automatically applies colors based on the `status` field:

- **Pending**: `#6b7280` (gray-500)
- **In Progress**: `#3b82f6` (blue-500)
- **Completed**: `#10b981` (green-500)
- **Overdue**: `#ef4444` (red-500)

You can override these by providing a custom `color` property.

## View Modes

The component supports four view modes accessible via the header controls:

1. **Hour View**: Detailed hourly timeline
2. **Day View**: Daily timeline (default)
3. **Week View**: Weekly overview
4. **Month View**: Monthly high-level view

## Interactive Features

### When `isEditable={true}`:

- **Drag Tasks**: Click and drag tasks horizontally to change dates
- **Resize Tasks**: Drag the left or right edges to adjust duration
- **Progress Updates**: Drag the progress handle to update completion percentage

### Always Available:

- **Click Events**: Single click to select, double click for detailed view
- **View Controls**: Toggle between different time scales
- **Expand/Collapse**: Switch between compact and expanded height
- **Dependency Visualization**: Automatic line drawing for task dependencies

## Styling Customization

The component includes custom CSS classes that can be overridden:

```css
/* Main container */
.gantt-container { }

/* Task bars */
.gantt-container .gantt_task-bar { }

/* Progress indicators */
.gantt-container .gantt_task-bar-progress { }

/* Dependency lines */
.gantt-container .gantt_dependency-line { }
```

## Integration with SectionCard

The component is designed to work seamlessly within `SectionCard` components:

```tsx
<SectionCard
  title="Project Timeline"
  icon={<Calendar className="w-5 h-5" />}
  subtitle="Visual representation of project stages"
>
  <GanttChart
    stages={projectStages}
    showDependencies={true}
    showProgress={true}
  />
</SectionCard>
```

## Performance Considerations

- The component efficiently handles up to 100+ tasks
- Uses React.memo for performance optimization
- Implements virtual scrolling for large datasets
- Responsive design adapts to container size

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators for interactive elements

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

- `gantt-task-react`: Professional Gantt chart library
- `lucide-react`: Icon library
- `@/components/Button`: Nivexa button component

## Known Limitations

- Dependency editing must be handled programmatically
- Touch gestures are limited on mobile devices
- Large datasets (>500 tasks) may impact performance