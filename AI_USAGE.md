# AI Usage Disclosure

## Tools Used

- VS Code
- GitHub Copilot / Copilot coding assistance

## Representative Prompts

1. “Set up a modular React and Vite task dashboard with a Context and `useReducer` data layer.”
2. “Build the responsive desktop, tablet, and mobile dashboard to match the supplied Figma layout.”
3. “Create accessible task and delete modals with validation, focus trapping, Escape handling, and localStorage persistence.”
4. “Audit the full codebase for persistence, overflow, accessibility, and direct state mutation edge cases.”

## AI-Assisted Areas

- Component and folder scaffolding
- React Context and `useReducer` setup
- Reusable `useTasks` hook and exact `focusboard_tasks` storage-key setup
- Master platform sections for projects, habits, assistant, analytics, and achievements
- Separate assistant recommendation engine and gamification reward utility
- React Router and Vitest/Testing Library test setup
- Derived statistics and filtered task memoization
- Local storage initialization and guarded persistence
- Task and delete modal form structure
- Responsive custom CSS grid and breakpoint refinements
- Carousel, status controls, and accessible icon-button labels
- README and assessment documentation

## Human Review and Refinement Example

The AI suggested a local-storage hydration effect that could synchronize state from a generic hook immediately on first render. I reviewed the initialization path and refined it so saved tasks are read and validated in the initial state before reducer initialization, preventing valid saved user data from being replaced during refresh.

I also manually reviewed and corrected responsive touch target sizes, including expanding mobile task-check, icon, carousel, and modal controls to at least 44 × 44 pixels, and verified no horizontal overflow at 390px. Priority and status colors and final spacing were adjusted in the project stylesheet to provide consistent visual contrast across desktop and mobile layouts.
