# Implementation Plan: Distribution Card Refactor

## Overview

This implementation plan refactors `EmotionDistributionCard` and `SleepDistributionCard` to use the common `DistributionCard` component. The approach is incremental: first enhance the common component, then refactor each card one at a time.

## Tasks

- [x] 1. Enhance DistributionCard component
  - [x] 1.1 Add new props to DistributionCardProps interface
    - Add `iconElement?: React.ReactNode` prop
    - Add `centerValueColor?: string` prop
    - Add `itemLayout?: 'default' | 'with-duration' | 'grid-2col'` prop
    - Add `pieChartSize?: 'auto' | 'small' | 'medium' | 'large'` prop
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 5.1_

  - [x] 1.2 Implement iconElement rendering in header
    - Modify header to render iconElement when provided
    - Prioritize iconElement over icon prop when both present
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 1.3 Implement centerValueColor support
    - Apply centerValueColor to center value text when provided
    - Fall back to themeColor when not provided
    - _Requirements: 5.2, 5.3_

  - [x] 1.4 Implement pieChartSize logic
    - Add size calculation based on pieChartSize prop
    - Implement 'small' (w-32 h-32), 'medium' (w-40 h-40), 'large' (w-48 h-48)
    - Implement 'auto' logic based on columns and highlightValue
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 1.5 Implement 'with-duration' item layout
    - Add new layout mode for sleep distribution
    - Display label + percent on left, duration + status badge on right
    - Style status badge with green background
    - _Requirements: 3.3_

  - [x] 1.6 Implement 'grid-2col' item layout
    - Add new layout mode for emotion distribution
    - Display items in 2-column grid with label + percent
    - _Requirements: 3.4_

- [x] 2. Checkpoint - Verify DistributionCard enhancements
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify existing cards (BP, Glucose, HR, SpO2) still render correctly

- [x] 3. Refactor SleepDistributionCard
  - [x] 3.1 Create data transformation function
    - Transform SleepStructureItem[] to DistributionItem[]
    - Map type to SLEEP_COLORS for color
    - Preserve duration and status fields
    - _Requirements: 6.2_

  - [x] 3.2 Refactor component to use DistributionCard
    - Import DistributionCard from common components
    - Create violet bar iconElement
    - Use itemLayout 'with-duration'
    - Use pieChartSize 'medium'
    - Set centerValue to hours, centerLabel to "Total hours"
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 3.3 Write property test for sleep data transformation
    - **Property 5: Sleep Data Transformation**
    - **Validates: Requirements 6.2**

- [x] 4. Checkpoint - Verify SleepDistributionCard refactoring
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify Sleep Distribution Card renders identically

- [x] 5. Refactor EmotionDistributionCard (daily)
  - [x] 5.1 Create data transformation function
    - Transform EmotionDistributionItem[] to DistributionItem[]
    - Use getEmotionColor() for color mapping
    - Preserve count field
    - _Requirements: 7.2_

  - [x] 5.2 Refactor component to use DistributionCard
    - Import DistributionCard from common components
    - Create orange bar iconElement
    - Use itemLayout 'grid-2col'
    - Use pieChartSize 'medium'
    - Set centerValue to mainEmotionLabel, centerLabel to "as main"
    - Set centerValueColor to getEmotionColor(mainEmotion)
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 5.3 Write property test for emotion data transformation
    - **Property 6: Emotion Data Transformation**
    - **Validates: Requirements 7.2**

- [x] 6. Final checkpoint - Verify all distribution cards
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify all 6 distribution card types render correctly

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
