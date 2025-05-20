# AidCraft Workshop Simulation - Project Structure

This document provides a comprehensive overview of the AidCraft Workshop Simulation project structure, including detailed descriptions of each file and its associated features. The project is built using vanilla HTML, CSS, and JavaScript without any external frameworks or libraries.

## Project Overview

AidCraft is an interactive educational simulation focused on development finance and the hidden-debt challenge. It provides an immersive learning experience where participants navigate complex stakeholder relationships, make financial decisions, and experience the consequences of their choices across multiple phases of a development project.

## File Structure

```
aidcraft-workshop-simulation/
│
├── index.html                # Main entry point HTML that loads CSS and JavaScript files
│
├── assets/                   # Static assets directory
│   ├── images/               # Contains images for UI elements, stakeholders, and backgrounds
│   │   ├── stakeholders/     # Stakeholder profile images and relationship diagrams
│   │   ├── backgrounds/      # Phase-specific background images
│   │   ├── icons/            # UI icons and interactive elements
│   │   └── logos/            # AidCraft and partner organization logos
│   │
│   ├── fonts/                # Custom fonts for consistent typography
│   │   ├── inter/            # Inter font family files (woff2, woff)
│   │   └── source-code-pro/  # Monospace font for code or data displays
│   │
│   ├── audio/                # Sound effects and background music
│   │   ├── ui/               # UI interaction sounds
│   │   ├── events/           # Event notification sounds
│   │   └── music/            # Background music for different phases
│   │
│   └── data/                 # Game data files
│       ├── aidcraft_game_data.json  # Main game data structure (stakeholders, events, options)
│       ├── scenarios.json    # Different scenario configurations
│       └── localization/     # Localization files for multilingual support
│
├── css/                      # CSS styles directory
│   ├── main.css              # Main styles and CSS variables
│   │
│   ├── components/           # Component-specific styles
│   │   ├── phase-timer.css   # Styles for the phase timer component (countdown timer, urgency indicators)
│   │   ├── user-profile.css  # User profile UI styles (avatar, progress indicators, achievements)
│   │   ├── endgame-options.css # Styling for endgame results and options screens
│   │   ├── stakeholders.css  # Stakeholder cards and relationship visualizations
│   │   ├── dashboard.css     # Main dashboard layout and responsive design
│   │   └── events.css        # Event notification and decision point styling
│   │
│   ├── phases/               # Phase-specific styles
│   │   ├── analysis.css      # Analysis phase styling (data visualizations, initial assessments)
│   │   ├── funding.css       # Funding phase styling (financial options, comparison tables)
│   │   ├── negotiation.css   # Negotiation phase styling (stakeholder interactions, agreement tracking)
│   │   └── outcome.css       # Outcome phase styling (results visualization, score displays)
│   │
│   └── utilities/            # Utility styles
│       ├── animations.css    # Animation definitions for UI elements and transitions
│       ├── accessibility.css # Accessibility enhancements (focus states, screen reader support)
│       └── responsive.css    # Responsive design breakpoints and adjustments
│
├── js/                       # JavaScript files directory
│   ├── main.js               # Application entry point (initialization sequence, component coordination)
│   │
│   ├── core/                 # Core system modules
│   │   ├── state-manager.js  # Global state management (player decisions, game progression, persistence)
│   │   ├── data-loader.js    # Loads and validates game data from JSON (stakeholders, events, scenarios)
│   │   ├── game-engine.js    # Core game mechanics and logic (decision processing, outcome calculations)
│   │   ├── event-system.js   # Event handling and triggered events (scheduled and random events)
│   │   ├── feedback-system.js # User feedback collection and processing (surveys, ratings)
│   │   ├── analytics-system.js # Analytics tracking for simulation usage and player decisions
│   │   └── storage-manager.js # Client-side storage using localStorage (user data, progress tracking)
│   │
│   ├── ui/                   # UI components
│   │   ├── ui-interactions.js # Generic UI interaction handlers (clicks, tooltips, modals)
│   │   ├── phase-timer.js    # Phase timing and urgency mechanics (countdowns, time constraints)
│   │   ├── user-profile.js   # User profile management (settings, preferences, achievements)
│   │   ├── phase-transition.js # Phase transition effects and context preservation
│   │   └── endgame-options.js # Final scoring and endgame choices (replay, export results)
│   │
│   ├── phases/               # Phase-specific modules
│   │   ├── analysis-phase.js # Analysis phase logic (initial assessment, stakeholder mapping)
│   │   ├── funding-phase.js  # Funding phase logic (financial options, resource allocation)
│   │   ├── negotiation-phase.js # Negotiation phase logic (stakeholder interactions, agreements)
│   │   └── outcome-phase.js  # Outcome phase logic (result calculations, consequence reveals)
│   │
│   └── utils/                # Utility functions
│       ├── data-visualization.js # Chart and graph rendering utilities using vanilla JavaScript
│       ├── accessibility.js  # Accessibility enhancement functions
│       ├── performance.js    # Performance optimization utilities
│       └── save-load.js      # Save and load game state functionality with localStorage
│
├── templates/                # HTML templates for dynamic content
│   ├── phases/               # Phase-specific HTML templates
│   │   ├── analysis.html     # Analysis phase UI layout (stakeholder maps, project briefs)
│   │   ├── funding.html      # Funding phase UI layout (financing options, budget tools)
│   │   ├── negotiation.html  # Negotiation phase UI layout (dialogue options, relationship meters)
│   │   └── outcome.html      # Outcome phase UI layout (results visualization, impact metrics)
│   │
│   ├── components/           # Reusable component templates
│   │   ├── stakeholder-panel.html # Stakeholder information and interaction panel
│   │   ├── event-dialog.html # Event notification and decision dialog
│   │   ├── feedback-panel.html # User feedback collection interface
│   │   └── dashboard.html    # Main dashboard layout and navigation
│   │
│   └── modals/               # Modal dialog templates
│       ├── help.html         # Help and tutorial content
│       ├── settings.html     # User settings and preferences
│       └── glossary.html     # Terminology and concept explanations
│
├── docs/                     # Documentation directory
│   ├── facilitator-guide.md  # Guide for workshop facilitators
│   ├── technical-overview.md # Technical architecture and implementation details
│   ├── data-structure.md     # Game data structure documentation
│   └── vanilla-js-guide.md   # Guide for vanilla JavaScript patterns used in the project
│
└── tests/                    # Testing files directory
    ├── unit/                 # Unit tests for individual components using vanilla JavaScript
    │   ├── state-manager.test.js # Tests for state management
    │   ├── game-engine.test.js # Tests for game engine logic
    │   └── event-system.test.js # Tests for event system
    └── integration/          # Integration tests for component interaction
        ├── phase-transitions.test.js # Tests for phase transition process
        └── stakeholder-interactions.test.js # Tests for stakeholder interaction system
```

## Feature Details

### Core Features

#### State Management System
- **File**: `js/core/state-manager.js`
- **Description**: Manages the global state of the simulation, including player decisions, game progression, and state persistence.
- **Features**:
  - State initialization and default state creation
  - State getter and setter methods with dot notation support
  - State change event dispatching
  - Local storage persistence
  - State history tracking for undo/redo capability
  - State snapshots for phase transitions

#### Game Engine
- **File**: `js/core/game-engine.js`
- **Description**: Core game mechanics and logic, processing decisions and calculating outcomes.
- **Features**:
  - Decision processing pipeline
  - Stakeholder relationship calculations
  - Resource management
  - Score and metrics calculation
  - Game rule enforcement
  - Conditional event triggering
  - Hidden debt mechanics implementation

#### Event System
- **File**: `js/core/event-system.js`
- **Description**: Handles scheduled and dynamic events throughout the simulation.
- **Features**:
  - Event queue management
  - Scheduled event triggering
  - Random "curveball" events
  - Conditional events based on player decisions
  - Event notification and display
  - Event response processing
  - Event history tracking

#### Data Loader
- **File**: `js/core/data-loader.js`
- **Description**: Loads and validates game data from JSON files using the Fetch API.
- **Features**:
  - Asynchronous data loading
  - Data structure validation
  - Error handling and fallbacks
  - Dynamic data integration
  - Cached data management
  - Performance metrics for data loading

### UI Components

#### Phase Timer
- **Files**: `js/ui/phase-timer.js`, `css/components/phase-timer.css`
- **Description**: Manages time constraints for each phase, creating urgency and realistic decision pressure.
- **Features**:
  - Configurable time limits per phase
  - Visual countdown display
  - Warning thresholds (50%, 25%, 10% remaining)
  - Pause functionality during modal interactions
  - Time-based event triggering
  - Time pressure effect on decision outcomes

#### Phase Transitions
- **File**: `js/ui/phase-transition.js`
- **Description**: Handles transitions between simulation phases with context preservation.
- **Features**:
  - Smooth visual transitions between phases
  - Context summarization from previous phases
  - Decision consequence carry-forward
  - Phase history navigation
  - Phase completion checkpoints
  - Navigation prevention for incomplete requirements

#### User Profile
- **Files**: `js/ui/user-profile.js`, `css/components/user-profile.css`
- **Description**: Manages user profiles, settings, and progress tracking.
- **Features**:
  - User identification using localStorage
  - Personal settings management
  - Progress tracking across sessions
  - Achievement system
  - Experience points and leveling
  - Profile customization options

#### Endgame Options
- **Files**: `js/ui/endgame-options.js`, `css/components/endgame-options.css`
- **Description**: Handles the conclusion of the simulation with results and follow-up options.
- **Features**:
  - Comprehensive outcome calculation
  - Results visualization and explanation
  - Hidden debt revelation
  - Decision impact analysis
  - Replay options with different strategies
  - Results export for discussion
  - Comparative analysis with peer results

### Phase-Specific Components

#### Analysis Phase
- **Files**: `js/phases/analysis-phase.js`, `css/phases/analysis.css`, `templates/phases/analysis.html`
- **Description**: Initial phase focused on understanding the development context and stakeholders.
- **Features**:
  - Stakeholder relationship mapping
  - Development needs assessment
  - Resource inventory
  - Risk analysis tools
  - Political landscape visualization
  - Historical context exploration

#### Funding Phase
- **Files**: `js/phases/funding-phase.js`, `css/phases/funding.css`, `templates/phases/funding.html`
- **Description**: Phase focused on exploring and selecting funding options for development projects.
- **Features**:
  - Multiple funding source options
  - Term comparison tools
  - Interest rate and fee visualization
  - Risk assessment for different funding options
  - Budget allocation interface
  - Cost-benefit analysis tools
  - Hidden debt potential indicators

#### Negotiation Phase
- **Files**: `js/phases/negotiation-phase.js`, `css/phases/negotiation.css`, `templates/phases/negotiation.html`
- **Description**: Phase focused on stakeholder negotiations and agreement building.
- **Features**:
  - Stakeholder dialogue system
  - Relationship management interface
  - Concession tracking
  - Agreement building tools
  - Coalition formation mechanics
  - Opposition management strategies
  - Unexpected event handling

#### Outcome Phase
- **Files**: `js/phases/outcome-phase.js`, `css/phases/outcome.css`, `templates/phases/outcome.html`
- **Description**: Final phase revealing the consequences of player decisions.
- **Features**:
  - Project success metrics
  - Financial sustainability assessment
  - Stakeholder satisfaction visualization
  - Hidden debt revelation
  - Long-term impact projection
  - Comparative analysis with alternative approaches
  - Learning outcome reinforcement

### Support Systems

#### Analytics System
- **File**: `js/core/analytics-system.js`
- **Description**: Tracks user interactions and decisions for analysis and improvement.
- **Features**:
  - Decision pattern tracking
  - Time spent analysis
  - Success rate monitoring
  - User journey mapping
  - Aggregate data visualization for facilitators
  - Performance metric collection
  - Privacy-focused data handling

#### Feedback System
- **File**: `js/core/feedback-system.js`
- **Description**: Collects and processes user feedback for continuous improvement.
- **Features**:
  - In-simulation feedback collection
  - User experience surveys
  - Feature suggestion handling
  - Bug reporting interface
  - Satisfaction metrics
  - Learning outcome assessment
  - Facilitator feedback integration

#### Storage Manager
- **File**: `js/core/storage-manager.js`
- **Description**: Manages client-side data storage using localStorage.
- **Features**:
  - User data persistence
  - Session management
  - Profile data storage
  - Secure data handling
  - Anonymous session options
  - Data import/export functionality

## Technical Details

### Browser Compatibility
The simulation is designed to work on modern browsers (Chrome, Firefox, Safari, Edge) with fallbacks for older versions. The application uses standard ES6+ JavaScript features with appropriate polyfills for wider browser support.

### Performance Considerations
- Lazy loading of phase-specific resources
- Efficient state management to minimize rerendering
- Optimized animations and transitions
- Efficient DOM manipulation
- Memory management for long sessions

### Accessibility
- Screen reader compatibility
- Keyboard navigation support
- High contrast mode
- Font size adjustment options
- Color blindness considerations
- Focus management for cognitive accessibility
- Time constraint adjustments for different ability levels

### Security
- Data validation for all inputs
- Secure client-side storage practices
- Content security policy implementation
- No sensitive data in client-side storage
- Session timeout management
- Input sanitization

## Extension Points

The simulation is designed with extensibility in mind:

1. **New Scenarios**: Add new scenarios in the `assets/data/` directory
2. **Additional Stakeholders**: Extend stakeholder definitions in `aidcraft_game_data.json`
3. **Custom Events**: Add new events with appropriate triggers and consequences
4. **Alternative UIs**: Create custom theme files in the `css/` directory
5. **New Phases**: Implement additional phases by following the phase module pattern
6. **Data Visualization**: Extend the visualization utilities with custom charts and graphs
