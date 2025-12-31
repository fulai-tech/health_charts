# Requirements Document

## Introduction

This specification covers the refactoring of `EmotionDistributionCard` and `SleepDistributionCard` components to use the common `DistributionCard` component. The goal is to eliminate code duplication and ensure consistent layout across all distribution cards in the application.

Currently, there are three separate implementations:
1. `src/components/common/DistributionCard.tsx` - Common component used by features (blood-pressure, glucose, heart-rate, spo2)
2. `src/daily/sleep/components/SleepDistributionCard.tsx` - Standalone implementation for sleep daily page
3. `src/daily/emotion/components/EmotionDistributionCard.tsx` - Standalone implementation for emotion daily page

The refactoring will consolidate these into a single, flexible common component while maintaining identical visual appearance and functionality.

## Glossary

- **DistributionCard**: A reusable card component that displays distribution data with a donut/pie chart and legend
- **Distribution_Item**: A data structure representing a single item in the distribution (type, label, percent, color, optional duration/status)
- **Item_Layout**: The layout mode for displaying distribution items ('default', 'with-duration', 'grid-2col')
- **Pie_Chart_Size**: The size configuration for the donut chart ('auto', 'small', 'medium', 'large')
- **Icon_Element**: A custom React node for rendering non-standard icons (e.g., colored bars instead of Lucide icons)
- **Center_Value_Color**: Custom color for the center value text in the donut chart

## Requirements

### Requirement 1: Enhanced DistributionItem Interface

**User Story:** As a developer, I want the DistributionItem interface to support duration and status fields, so that sleep stage data can be displayed with time duration and status badges.

#### Acceptance Criteria

1. THE Distribution_Item interface SHALL include an optional `duration` field of type string
2. THE Distribution_Item interface SHALL include an optional `status` field of type string
3. WHEN a Distribution_Item has a duration value, THE DistributionCard SHALL be capable of displaying it
4. WHEN a Distribution_Item has a status value, THE DistributionCard SHALL be capable of displaying it as a badge

### Requirement 2: Custom Icon Element Support

**User Story:** As a developer, I want to provide custom icon elements to DistributionCard, so that I can use non-standard icons like colored bars for sleep and emotion cards.

#### Acceptance Criteria

1. THE DistributionCard SHALL accept an optional `iconElement` prop of type React.ReactNode
2. WHEN an iconElement is provided, THE DistributionCard SHALL render it instead of the Lucide icon
3. WHEN both icon and iconElement are provided, THE DistributionCard SHALL prioritize iconElement
4. THE iconElement SHALL be rendered in the header section alongside the title

### Requirement 3: Item Layout Modes

**User Story:** As a developer, I want different layout modes for distribution items, so that I can display sleep data with duration/status and emotion data in a 2-column grid.

#### Acceptance Criteria

1. THE DistributionCard SHALL accept an `itemLayout` prop with values 'default', 'with-duration', or 'grid-2col'
2. WHEN itemLayout is 'default', THE DistributionCard SHALL display items with label, percent, and optional count in a single column
3. WHEN itemLayout is 'with-duration', THE DistributionCard SHALL display items with label and percent on the left, duration and status badge on the right
4. WHEN itemLayout is 'grid-2col', THE DistributionCard SHALL display items in a 2-column grid with label and percent
5. IF itemLayout is not specified, THE DistributionCard SHALL use 'default' layout

### Requirement 4: Configurable Pie Chart Size

**User Story:** As a developer, I want to configure the pie chart size, so that different cards can have appropriately sized charts.

#### Acceptance Criteria

1. THE DistributionCard SHALL accept a `pieChartSize` prop with values 'auto', 'small', 'medium', or 'large'
2. WHEN pieChartSize is 'small', THE DistributionCard SHALL render the chart at w-32 h-32
3. WHEN pieChartSize is 'medium', THE DistributionCard SHALL render the chart at w-40 h-40
4. WHEN pieChartSize is 'large', THE DistributionCard SHALL render the chart at w-48 h-48
5. WHEN pieChartSize is 'auto', THE DistributionCard SHALL determine size based on columns and highlightValue props
6. IF pieChartSize is not specified, THE DistributionCard SHALL use 'auto' sizing

### Requirement 5: Custom Center Value Color

**User Story:** As a developer, I want to customize the center value color, so that emotion cards can display the main emotion in its corresponding color.

#### Acceptance Criteria

1. THE DistributionCard SHALL accept an optional `centerValueColor` prop of type string
2. WHEN centerValueColor is provided, THE DistributionCard SHALL apply it to the center value text
3. WHEN centerValueColor is not provided, THE DistributionCard SHALL use the themeColor for center value text

### Requirement 6: SleepDistributionCard Refactoring

**User Story:** As a developer, I want SleepDistributionCard to use the common DistributionCard, so that code duplication is eliminated and layout consistency is maintained.

#### Acceptance Criteria

1. THE SleepDistributionCard SHALL import and use DistributionCard from common components
2. THE SleepDistributionCard SHALL transform SleepStructureItem[] to DistributionItem[]
3. THE SleepDistributionCard SHALL use itemLayout 'with-duration' to display duration and status
4. THE SleepDistributionCard SHALL use pieChartSize 'medium' for w-40 chart size
5. THE SleepDistributionCard SHALL display a violet bar icon using iconElement prop
6. THE SleepDistributionCard SHALL display total hours as centerValue with "Total hours" as centerLabel
7. THE SleepDistributionCard SHALL maintain identical visual appearance after refactoring

### Requirement 7: EmotionDistributionCard Refactoring

**User Story:** As a developer, I want EmotionDistributionCard (daily) to use the common DistributionCard, so that code duplication is eliminated and layout consistency is maintained.

#### Acceptance Criteria

1. THE EmotionDistributionCard SHALL import and use DistributionCard from common components
2. THE EmotionDistributionCard SHALL transform EmotionDistributionItem[] to DistributionItem[]
3. THE EmotionDistributionCard SHALL use itemLayout 'grid-2col' for 2-column grid layout
4. THE EmotionDistributionCard SHALL use pieChartSize 'medium' for w-40 chart size
5. THE EmotionDistributionCard SHALL display an orange bar icon using iconElement prop
6. THE EmotionDistributionCard SHALL display mainEmotionLabel as centerValue with "as main" as centerLabel
7. THE EmotionDistributionCard SHALL use centerValueColor matching the main emotion color
8. THE EmotionDistributionCard SHALL maintain identical visual appearance after refactoring

### Requirement 8: Backward Compatibility

**User Story:** As a developer, I want existing DistributionCard usages to continue working, so that the refactoring does not break existing functionality.

#### Acceptance Criteria

1. WHEN new props are not provided, THE DistributionCard SHALL behave identically to the current implementation
2. THE DistributionCard SHALL maintain support for all existing props (title, icon, themeColor, items, centerValue, centerLabel, showCount, columns, gridColumns, highlightValue, highlightLabel, highlightDescription, className, isLoading, showInfo, infoContent)
3. WHEN using existing features (blood-pressure, glucose, heart-rate, spo2), THE DistributionCard SHALL render identically to before

### Requirement 9: Visual Consistency

**User Story:** As a user, I want all distribution cards to have consistent visual styling, so that the application feels cohesive and professional.

#### Acceptance Criteria

1. THE DistributionCard SHALL use consistent spacing (gap-6 between left and right sections)
2. THE DistributionCard SHALL use consistent header styling (flex items-center gap-2 mb-4)
3. THE DistributionCard SHALL use consistent pie chart styling (innerRadius 60%, paddingAngle 3)
4. THE DistributionCard SHALL use consistent center label styling (text-2xl font-bold for value, text-xs text-slate-400 for label)
5. THE DistributionCard SHALL vertically center the pie chart relative to the content
