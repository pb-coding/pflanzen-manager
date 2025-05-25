# FigmaHeader Enhancement Plan

## Overview
Enhance the FigmaHeader component to support action buttons on both left and right sides while maintaining backward compatibility.

## Current State
- Single action button positioned on the right
- Title centered with right padding offset
- Used in Plant List (add button), Plant Detail (back button), Add Plant (back button)

## Enhanced Design

### Component Interface
```typescript
interface FigmaHeaderProps {
  title: string;
  
  // New flexible action props
  leftAction?: {
    icon: 'plus' | 'back' | 'settings' | 'home' | 'plant' | 'camera';
    onClick: () => void;
  };
  rightAction?: {
    icon: 'plus' | 'back' | 'settings' | 'home' | 'plant' | 'camera';
    onClick: () => void;
  };
  
  // Backward compatibility props (deprecated but supported)
  onActionClick?: () => void;
  actionIcon?: 'plus' | 'back';
  
  className?: string;
}
```

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ [Left Action] [Centered Title] [Right Action] │
└─────────────────────────────────────────────┘
```

### CSS Updates
```css
.figma-header {
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  padding: var(--figma-padding-base);
  min-height: var(--figma-header-height);
}

.figma-header-left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.figma-header-title {
  display: flex;
  justify-content: center;
  align-items: center;
}

.figma-header-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.figma-header-action {
  width: var(--figma-header-height);
  height: var(--figma-header-height);
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## Implementation Steps

### 1. Update FigmaHeader Component
- Add new interface with leftAction and rightAction props
- Implement backward compatibility logic
- Update JSX structure to use 3-column grid layout

### 2. Update CSS Styles
- Replace flexbox with CSS Grid for better control
- Create separate classes for left, center, right areas
- Ensure proper spacing and alignment

### 3. Update Screen Components
- Plant List Screen: Use rightAction for add button
- Plant Detail Screen: Use leftAction for back button
- Add Plant Screen: Use leftAction for back button

### 4. Migration Strategy
- Keep existing props working (backward compatibility)
- Add deprecation warnings for old props
- Provide clear migration path

## Usage Examples

### Plant List Screen (Right Action)
```tsx
<FigmaHeader
  title="My Plants"
  rightAction={{
    icon: 'plus',
    onClick: handleAddPlant
  }}
/>
```

### Plant Detail Screen (Left Action)
```tsx
<FigmaHeader
  title={plantView.name}
  leftAction={{
    icon: 'back',
    onClick: handleBack
  }}
/>
```

### Future: Both Actions
```tsx
<FigmaHeader
  title="Plant Settings"
  leftAction={{
    icon: 'back',
    onClick: handleBack
  }}
  rightAction={{
    icon: 'settings',
    onClick: handleSettings
  }}
/>
```

## Benefits
1. **Flexibility**: Support for actions on both sides
2. **Consistency**: Unified API for all header actions
3. **Maintainability**: Clear separation of concerns
4. **Future-proof**: Easy to extend with more action types
5. **Backward Compatible**: Existing code continues to work

## Testing Requirements
- Verify all existing screens still work
- Test new left/right action functionality
- Ensure proper spacing and alignment
- Test responsive behavior
- Validate accessibility (keyboard navigation, screen readers)