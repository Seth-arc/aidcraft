# AidCraft Workshop Simulation - Technical Documentation

This document provides technical details about the architecture, implementation, and interaction patterns of the AidCraft Workshop Simulation, which is built entirely with vanilla HTML, CSS, and JavaScript.

## Application Architecture

AidCraft follows a modular architecture with clear separation of concerns. The application is built on the following principles:

1. **Component-Based Design**: Self-contained modules with specific responsibilities
2. **Event-Driven Communication**: Loosely coupled components communicating via custom events
3. **Centralized State Management**: Single source of truth for application state
4. **Asynchronous Operations**: Non-blocking operations using native Promises and Fetch API
5. **Progressive Enhancement**: Core functionality works with enhanced features added as available

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      ┌──────────────┐  │
│  │ Phase UI │ │ Events  │ │ Profile │ ... │ Visualization │  │
│  └─────────┘ └─────────┘ └─────────┘      └──────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
┌───────────▼───────┐ ┌─────▼─────┐ ┌───────▼───────┐
│ State Management  │ │Event System│ │ Game Engine   │
└───────────┬───────┘ └─────┬─────┘ └───────┬───────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                    ┌───────▼───────┐
                    │  Data Layer   │
                    └───────────────┘
```

## System Components

### State Management System

The State Management System provides a centralized store for application state, with methods to update state in a controlled manner and notify components of changes.

#### Key Files
- `state-manager.js`: Core implementation

#### Core Functions
- `setState(path, value)`: Update a specific path in the state
- `getState(path, defaultValue)`: Get value at a specific path
- `resetState()`: Reset to default state
- `saveState()`: Persist state to localStorage
- `loadState()`: Load state from localStorage

#### State Structure
```javascript
{
  // Current simulation state
  currentPhase: 'analysis', // analysis, funding, negotiation, outcome
  phaseProgress: {
    analysis: 0.5, // progress as percentage
    funding: 0,
    negotiation: 0,
    outcome: 0
  },
  
  // Player choices and decisions
  decisions: {
    // Keyed by decision ID
    'decision-001': 'option-b',
    'decision-002': 'option-a'
  },
  
  // Stakeholder relationships
  stakeholderRelationships: {
    // See data structure in aidcraft_game_data.json
  },
  
  // Resources and metrics
  resources: {
    budget: 1000000,
    politicalCapital: 75,
    timeRemaining: 6 // in months
  },
  
  // User profile
  user: {
    id: 'user123',
    name: 'Workshop Participant',
    completedSimulations: 2,
    currentProgress: 0.25
  },
  
  // System state
  system: {
    initialized: true,
    lastSaved: 1684678923000, // timestamp
    version: '1.2.3'
  }
}
```

#### Events
- `aidcraft:statechange`: Fired when state changes, with detail containing the path and new value
- `aidcraft:resetstate`: Fired when state is completely reset

### Game Engine

The Game Engine is responsible for all game mechanics, decision processing, and outcome calculations.

#### Key Files
- `game-engine.js`: Core implementation

#### Core Functions
- `init()`: Initialize the game engine
- `processDecision(decisionId, choiceId)`: Process a player decision
- `calculateStakeholderRelationships()`: Update relationship values based on decisions
- `determineOutcomes()`: Calculate final outcomes based on all decisions
- `applyResourceChanges(changes)`: Update resource values

#### Decision Processing Pipeline
1. Validate decision and choice IDs
2. Apply immediate effects to resources
3. Update stakeholder relationships
4. Trigger any cascading events
5. Update state with new values
6. Check for phase completion criteria

### Event System

The Event System manages the lifecycle of game events, including scheduled events, random events, and decision-triggered events.

#### Key Files
- `event-system.js`: Core implementation

#### Core Functions
- `init()`: Initialize the event system
- `queueEvent(eventId, delay)`: Add event to the queue
- `triggerEvent(eventId)`: Immediately trigger an event
- `handleEventChoice(eventId, choiceId)`: Process a choice for an event
- `checkForCurveballEvent()`: Randomly trigger unexpected events

#### Event Types
- **Scheduled Events**: Triggered at specific points in the simulation
- **Decision Events**: Triggered by specific player decisions
- **Curveball Events**: Randomly triggered to test adaptability
- **Threshold Events**: Triggered when metrics cross certain thresholds
- **Phase Events**: Triggered at phase transitions

### Data Loader

The Data Loader handles the asynchronous loading and validation of simulation data using the Fetch API.

#### Key Files
- `data-loader.js`: Core implementation
- `aidcraft_game_data.json`: Primary data file

#### Core Functions
- `loadData()`: Load and parse the game data using fetch()
- `validateGameData(data)`: Ensure data structure is valid
- `getStakeholders()`: Get all stakeholder definitions
- `getEvents()`: Get all event definitions
- `getDecisions()`: Get all decision definitions

#### Data Structure
See the comprehensive structure in `aidcraft_game_data.json`, which includes:
- Stakeholder definitions and relationships
- Event definitions and triggers
- Decision options and consequences
- Resource definitions and initial values
- Phase configurations and completion criteria

### UI Components

The UI layer consists of multiple specialized components that handle different aspects of the user interface.

#### Phase Timer System
- **Files**: `phase-timer.js`, `phase-timer.css`
- **Responsibilities**: Manage time constraints for phases
- **Key Functions**:
  - `startTimer(phase, duration)`: Start countdown for a phase
  - `pauseTimer()`: Pause the current timer
  - `resumeTimer()`: Resume the current timer
  - `getTimeRemaining()`: Get remaining time for current phase

#### User Profile System
- **Files**: `user-profile.js`, `user-profile.css`
- **Responsibilities**: Manage user profiles and settings
- **Key Functions**:
  - `loadUserProfile(userId)`: Load a user's profile from localStorage
  - `updateUserSettings(settings)`: Update user settings
  - `trackAchievement(achievementId)`: Record a user achievement
  - `getCompletionStats()`: Get statistics on user's progress

#### Phase Transition System
- **Files**: `phase-transition.js`
- **Responsibilities**: Handle transitions between phases
- **Key Functions**:
  - `navigateToPhase(phase)`: Navigate to a phase with context
  - `showPhaseTransitionDialog(fromPhase, toPhase)`: Show transition UI
  - `createPhaseHistory()`: Generate history of phase decisions

#### Endgame Options System
- **Files**: `endgame-options.js`, `endgame-options.css`
- **Responsibilities**: Handle conclusion of simulation
- **Key Functions**:
  - `calculateOutcomeMetrics()`: Calculate final simulation metrics
  - `createEndgameUI()`: Generate endgame interface
  - `handleEndgameOption(option)`: Process endgame user choice

## Interaction Patterns

### Component Initialization Sequence

The application follows a specific initialization sequence to ensure dependencies are properly established:

1. State Manager initializes first (auto-init on load)
2. Data Loader loads necessary game data
3. Game Engine initializes with loaded data
4. Event System initializes and registers with Game Engine
5. UI Components initialize and register event listeners
6. Main application determines initial phase and navigates to it

```javascript
// Initialization sequence in main.js
(function() {
    // Initialize core systems
    window.stateManager.init()
        .then(() => window.dataLoader.loadData())
        .then(() => window.gameEngine.init())
        .then(() => window.eventSystem.init())
        .then(() => {
            // Initialize UI components
            return Promise.all([
                window.phaseTimer.init(),
                window.userProfile.init(),
                window.phaseTransition.init()
            ]);
        })
        .then(() => {
            // Determine and navigate to the current phase
            const currentPhase = window.stateManager.getState('currentPhase', 'analysis');
            window.phaseTransition.navigateToPhase(currentPhase);
            
            console.log('AidCraft simulation initialized');
        })
        .catch(error => {
            console.error('Initialization error:', error);
        });
})();
```

### Event-Based Communication

Components communicate primarily through custom events to maintain loose coupling:

```javascript
// Dispatching an event
document.dispatchEvent(new CustomEvent('aidcraft:statechange', {
    detail: {
        path: 'resources.budget',
        value: 950000
    }
}));

// Listening for an event
document.addEventListener('aidcraft:statechange', (event) => {
    const { path, value } = event.detail;
    // Handle state change
});
```

### Phase Navigation Flow

Phase navigation follows a specific pattern to ensure proper state transitions:

1. Check if current phase can be exited (completion criteria)
2. Save current phase state to history
3. Prepare next phase prerequisites
4. Show transition UI with context from previous decisions
5. Initialize new phase UI and components
6. Set current phase in state manager
7. Start phase timer if applicable

## Performance Considerations

### Render Optimization

- DOM manipulation is minimized and batched where possible
- CSS animations used instead of JavaScript where possible
- Heavy calculations split into smaller chunks using setTimeout
- Throttled event handlers for frequent events (resize, scroll)
- Using document fragments for bulk DOM insertions

### Memory Management

- Event listeners properly removed when components unload
- Large data structures parsed incrementally
- Reference cleanup to prevent memory leaks
- Cached data expires after defined periods
- Regular garbage collection prompting for long sessions

### Network Efficiency

- Assets loaded on demand based on simulation phase
- Data cached in localStorage where appropriate
- Image and asset preloading for critical resources
- Compression for JSON data (minified JSON files)

## Extensibility

### Adding New Phases

To add a new phase:

1. Create phase-specific UI files (`new-phase.js`, `new-phase.css`)
2. Add phase to the phase sequence in `phase-transition.js`
3. Define phase completion criteria in game engine
4. Create phase template in `templates/phases/`
5. Add phase-specific logic in a new module
6. Update state structure to handle new phase data

### Creating Custom Scenarios

Scenarios can be customized by:

1. Following the data structure in `aidcraft_game_data.json`
2. Defining new stakeholders, relationships, events, and decisions
3. Setting initial resource values and win conditions
4. Creating phase-specific content and challenges
5. Defining custom endgame outcomes

### Extension Points

The simulation provides several extension points:

1. Custom event handlers using the event system
2. Modular component architecture for adding new UI components
3. Import/export functionality for simulation data
4. State management hooks for external integrations
5. Template system for UI customization

## Accessibility Compliance

The simulation is designed to meet WCAG 2.1 AA standards:

- Proper semantic HTML structure
- ARIA attributes where appropriate
- Keyboard navigation throughout all interactions
- Focus management for modal dialogs
- Color contrast meeting AA requirements
- Text alternatives for all non-text content
- No reliance on color alone for conveying information
- Time limits can be adjusted or disabled
- Content is readable and functional with 200% zoom

## Browser Compatibility

The simulation is tested and supported on:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

Mobile browsers:
- iOS Safari
- Chrome for Android

## Storage and User Data

- User progress stored in localStorage
- Session state maintained in memory
- Options for exporting/importing save data as JSON
- No server-side storage requirements
- Data purging options for privacy

## Security Considerations

- Input validation for all user inputs
- Safe handling of imported JSON data
- XSS prevention through proper output escaping
- No sensitive data stored in client-side storage
- Content Security Policy implementation recommended for deployment
