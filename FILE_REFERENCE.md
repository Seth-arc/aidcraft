# AidCraft File Structure Reference

This document provides a quick reference to the AidCraft Workshop Simulation file structure with brief descriptions of each component's purpose.

## Root Directory

- **index.html** - Main entry point that loads all CSS and JavaScript resources
- **aidcraft_game_data.json** - Primary data file containing all simulation scenarios and content

## JavaScript Files

### Core Systems
- **state-manager.js** - Global state management and persistence
- **data-loader.js** - Asynchronous loading and validation of game data
- **game-engine.js** - Core simulation logic and mechanics
- **event-system.js** - Event handling and dynamic event generation
- **feedback-system.js** - User feedback collection and processing
- **analytics-system.js** - Usage tracking and decision pattern analysis
- **firebase-auth.js** - User authentication and session management

### User Interface
- **main.js** - Application entry point and initialization
- **ui-interactions.js** - General UI event handling
- **phase-timer.js** - Time management for simulation phases
- **phase-transition.js** - Phase navigation and context preservation
- **user-profile.js** - User profile and settings management
- **endgame-options.js** - End-of-simulation options and results display

## CSS Files

- **simulation.css** - Main application styles and theme
- **user-profile.css** - User interface styling for profile components
- **phase-timer.css** - Styling for the phase timer component
- **endgame-options.css** - Styling for the simulation conclusion screens

## Directory Structure

### assets/
Contains all static resources used in the simulation:
- **images/** - UI graphics, stakeholder avatars, and backgrounds
- **fonts/** - Typography resources
- **audio/** - Sound effects and background audio
- **data/** - JSON data files for simulation content

### css/
All styling resources organized by component and function:
- **main.css** - Core styling and variables
- **components/** - Component-specific styles
- **phases/** - Phase-specific styling
- **utilities/** - Helper styles for animations, accessibility, etc.

### js/
JavaScript modules organized by function:
- **core/** - Core system modules (state, data, events)
- **ui/** - User interface components
- **phases/** - Phase-specific logic and interactions
- **utils/** - Utility functions and helpers

### templates/
HTML templates for dynamic content:
- **phases/** - Phase-specific layouts
- **components/** - Reusable component templates
- **modals/** - Dialog and overlay templates

### docs/
Project documentation:
- **facilitator-guide.md** - Guide for workshop facilitators
- **technical-overview.md** - Technical architecture documentation
- **data-structure.md** - Data schema documentation
- **api-reference.md** - API documentation for extensibility

### tests/
Testing resources:
- **unit/** - Unit tests for individual components
- **integration/** - Integration tests for system interactions
