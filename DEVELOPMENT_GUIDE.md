# AidCraft Workshop Simulation - Development Guide

This guide provides instructions and best practices for developers working on extending or modifying the AidCraft Workshop Simulation.

## Development Environment Setup

### Prerequisites

- **Node.js** (v14.x or higher)
- **NPM** (v6.x or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor with JavaScript support (VS Code recommended)

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Access the application at `http://localhost:3000`

### Recommended VS Code Extensions

- ESLint
- Prettier
- Live Server
- JavaScript Debugger
- HTML CSS Support

## Project Structure Overview

The AidCraft project follows a modular structure with clear separation of concerns:

```
aidcraft-workshop-simulation/
├── index.html                # Main entry point
├── assets/                   # Static resources
├── css/                      # Stylesheets
├── js/                       # JavaScript modules
│   ├── core/                 # Core system modules
│   ├── ui/                   # UI component modules
│   ├── phases/               # Phase-specific modules
│   └── utils/                # Utility functions
├── templates/                # HTML templates
├── docs/                     # Documentation
└── tests/                    # Test files
```

## Coding Standards

### JavaScript

- Use ES6+ features
- Follow camelCase for variables and functions
- Follow PascalCase for classes
- Use JSDoc comments for all functions
- Prefix private methods with underscore (_methodName)
- Use async/await for asynchronous operations
- Avoid global variables, use modules instead

### CSS

- Use kebab-case for class names
- Follow BEM methodology for component styling
- Use CSS variables for theming
- Organize styles by component
- Use responsive design principles
- Add comments for complex selectors

### HTML

- Use semantic HTML elements
- Include proper ARIA attributes
- Maintain proper heading hierarchy
- Keep markup focused on structure, not presentation
- Use data-* attributes for JavaScript hooks

## Working with Components

### Adding a New Component

1. Create JavaScript file in appropriate directory (e.g., `js/ui/new-component.js`)
2. Create CSS file if needed (e.g., `css/components/new-component.css`)
3. Follow the module pattern:

```javascript
/**
 * NewComponent class
 * Description of the component
 */
class NewComponent {
    constructor() {
        this.initialized = false;
        this.stateManager = window.aidcraft;
        // Initialize properties
    }
    
    /**
     * Initialize the component
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init() {
        if (this.initialized) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            console.log('Initializing New Component...');
            
            // Setup event listeners
            document.addEventListener('aidcraft:statechange', this.handleStateChange.bind(this));
            
            // Create UI elements
            this.createUI();
            
            this.initialized = true;
            console.log('New Component initialized');
            resolve();
        });
    }
    
    // Component methods
    createUI() {
        // Create UI elements
    }
    
    handleStateChange(event) {
        // Handle state changes
    }
}

// Register the component
window.newComponent = new NewComponent();
```

4. Add component script to `index.html`:

```html
<script src="js/ui/new-component.js"></script>
```

5. Add any CSS file to `index.html`:

```html
<link rel="stylesheet" href="css/components/new-component.css">
```

6. Initialize the component in the main application flow

### Modifying Existing Components

1. Locate the component file in the appropriate directory
2. Understand the component's role and dependencies
3. Make changes following the existing patterns
4. Test thoroughly to ensure no regression
5. Update any related documentation

## Working with the State Manager

### Accessing State

```javascript
// Get a state value
const budget = window.stateManager.getState('resources.budget', 0);

// Get nested state with default value
const relationship = window.stateManager.getState(
    'stakeholderRelationships.president.financeMinister.strength',
    0.5
);
```

### Updating State

```javascript
// Set a state value
window.stateManager.setState('resources.budget', 950000);

// Set nested state
window.stateManager.setState(
    'stakeholderRelationships.president.financeMinister.strength',
    0.7
);
```

### Reacting to State Changes

```javascript
document.addEventListener('aidcraft:statechange', (event) => {
    const { path, value } = event.detail;
    
    // Check if this is a path we care about
    if (path.startsWith('resources.')) {
        // Update UI based on resource change
        updateResourceDisplay();
    }
});
```

## Working with the Event System

### Triggering Events

```javascript
// Queue an event to trigger after a delay
window.eventSystem.queueEvent('event-political-unrest', 5000); // 5 seconds

// Trigger an event immediately
window.eventSystem.triggerEvent('event-budget-crisis');
```

### Creating Custom Events

1. Add the event definition to `aidcraft_game_data.json`:

```json
"events": {
    "event-custom-scenario": {
        "title": "New Development",
        "description": "A new situation has emerged...",
        "type": "decision",
        "choices": [
            {
                "id": "choice-a",
                "text": "Option A",
                "effects": {
                    "resources.budget": -50000,
                    "stakeholderRelationships.president.parliament.strength": 0.1
                }
            },
            {
                "id": "choice-b",
                "text": "Option B",
                "effects": {
                    "resources.politicalCapital": -10,
                    "stakeholderRelationships.president.localCommunities.strength": 0.2
                }
            }
        ],
        "conditions": {
            "currentPhase": "negotiation",
            "resources.budget": {
                "min": 500000
            }
        }
    }
}
```

2. Register event handler if needed:

```javascript
document.addEventListener('aidcraft:showEvent', (event) => {
    const { eventId } = event.detail;
    
    if (eventId === 'event-custom-scenario') {
        // Custom handling for this specific event
        console.log('Custom event triggered');
    }
});
```

## Adding a New Phase

1. Create phase module in `js/phases/`:

```javascript
/**
 * NewPhase class
 * Handles the new simulation phase
 */
class NewPhase {
    constructor() {
        this.initialized = false;
        this.stateManager = window.aidcraft;
        this.gameEngine = window.gameEngine;
    }
    
    /**
     * Initialize the new phase
     */
    init() {
        if (this.initialized) return;
        
        // Register phase-specific event handlers
        document.addEventListener('aidcraft:phaseChange', this.handlePhaseChange.bind(this));
        
        // Setup phase-specific UI
        this.setupPhaseUI();
        
        this.initialized = true;
        console.log('New phase initialized');
    }
    
    /**
     * Handle phase change event
     */
    handlePhaseChange(event) {
        const { newPhase } = event.detail;
        
        if (newPhase === 'newphase') {
            // Initialize phase-specific content
            this.initPhaseContent();
        }
    }
    
    /**
     * Setup phase-specific UI
     */
    setupPhaseUI() {
        // Create phase-specific UI elements
    }
    
    /**
     * Initialize phase content
     */
    initPhaseContent() {
        // Load phase-specific data
        // Set up phase-specific interactions
    }
    
    /**
     * Check if phase completion criteria are met
     * @returns {boolean} Whether phase is complete
     */
    isPhaseComplete() {
        // Check completion criteria
        return true;
    }
}

// Register the phase
window.newPhase = new NewPhase();
window.newPhase.init();
```

2. Create phase template in `templates/phases/`:

```html
<!-- templates/phases/new-phase.html -->
<div class="phase-container new-phase">
    <h1 class="phase-title">New Phase</h1>
    
    <div class="phase-description">
        <p>Description of the new phase...</p>
    </div>
    
    <div class="phase-content">
        <!-- Phase-specific content -->
    </div>
    
    <div class="phase-actions">
        <button class="btn btn-primary" id="complete-phase">Complete Phase</button>
    </div>
</div>
```

3. Add the phase to the sequence in `phase-transition.js`:

```javascript
this.phaseSequence = ['analysis', 'funding', 'negotiation', 'newphase', 'outcome'];
```

4. Create phase-specific styles in `css/phases/`:

```css
/* css/phases/new-phase.css */
.new-phase {
    /* Phase-specific styles */
}

.new-phase .phase-content {
    /* Content styles */
}
```

5. Update `index.html` to include new files:

```html
<link rel="stylesheet" href="css/phases/new-phase.css">
<script src="js/phases/new-phase.js"></script>
```

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

1. Create test file in `tests/unit/` or `tests/integration/`:

```javascript
// tests/unit/new-component.test.js
describe('NewComponent', () => {
    beforeEach(() => {
        // Setup test environment
    });
    
    afterEach(() => {
        // Clean up test environment
    });
    
    test('should initialize correctly', () => {
        // Test initialization
        expect(window.newComponent.initialized).toBe(true);
    });
    
    test('should handle state changes', () => {
        // Test state change handling
        const event = new CustomEvent('aidcraft:statechange', {
            detail: {
                path: 'testPath',
                value: 'testValue'
            }
        });
        
        document.dispatchEvent(event);
        
        // Assert expected behavior
    });
});
```

## Debugging

### Console Logging

- Use `console.log()` for general information
- Use `console.warn()` for potential issues
- Use `console.error()` for critical problems
- Use `console.table()` for tabular data

### State Inspection

```javascript
// Log the entire state
console.log('Current state:', window.stateManager.state);

// Log a specific part of the state
console.log('Resources:', window.stateManager.getState('resources'));
```

### Performance Monitoring

```javascript
// Mark the start of a performance measurement
performance.mark('functionStart');

// Perform operations
doSomethingExpensive();

// Mark the end and measure
performance.mark('functionEnd');
performance.measure('functionDuration', 'functionStart', 'functionEnd');

// Log the result
console.log(performance.getEntriesByName('functionDuration')[0].duration);
```

## Deployment

### Building for Production

```bash
npm run build
```

This will:
1. Minify JavaScript and CSS
2. Optimize assets
3. Generate a production build in the `dist/` directory

### Deployment Checklist

- Ensure all tests pass
- Check for console errors
- Verify accessibility compliance
- Test on all supported browsers
- Validate HTML and CSS
- Check performance metrics
- Update version number in `package.json`

## Documentation

### Updating Documentation

1. Update relevant markdown files in the `docs/` directory
2. For code documentation, update JSDoc comments
3. Run documentation generator:
   ```bash
   npm run docs
   ```

### Documentation Standards

- Use markdown for general documentation
- Use JSDoc for code documentation
- Include examples for complex functionality
- Keep documentation up-to-date with code changes
- Document both successes and failures/limitations

## Common Patterns

### Loading Templates

```javascript
/**
 * Load an HTML template
 * @param {string} templatePath - Path to the template file
 * @returns {Promise<string>} Promise resolving to the template HTML
 */
function loadTemplate(templatePath) {
    return fetch(templatePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status}`);
            }
            return response.text();
        });
}

// Usage
loadTemplate('templates/components/stakeholder-panel.html')
    .then(html => {
        document.getElementById('container').innerHTML = html;
        // Initialize after loading
    })
    .catch(error => {
        console.error('Failed to load template:', error);
    });
```

### Creating Modals

```javascript
/**
 * Create and show a modal dialog
 * @param {string} title - Modal title
 * @param {string} content - Modal content HTML
 * @param {Array} buttons - Array of button configs {text, action, class}
 */
function showModal(title, content, buttons) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${buttons.map(btn => `
                    <button class="btn ${btn.class || ''}" data-action="${btn.action}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Setup event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Setup button actions
    buttons.forEach(btn => {
        modal.querySelector(`button[data-action="${btn.action}"]`).addEventListener('click', () => {
            if (typeof btn.callback === 'function') {
                btn.callback();
            }
            document.body.removeChild(modal);
        });
    });
    
    // Notify that modal is open
    document.dispatchEvent(new CustomEvent('aidcraft:modalOpened'));
}

// Usage
showModal(
    'Confirm Action',
    '<p>Are you sure you want to proceed?</p>',
    [
        {
            text: 'Cancel',
            action: 'cancel',
            class: 'btn-secondary'
        },
        {
            text: 'Confirm',
            action: 'confirm',
            class: 'btn-primary',
            callback: () => {
                console.log('Action confirmed');
                // Perform action
            }
        }
    ]
);
```

## Troubleshooting Common Issues

### State Not Updating

1. Check if the state path is correct
2. Verify the setState call is being executed
3. Check for any error messages in the console
4. Verify event listeners are properly registered
5. Check if the component is properly initialized

### Events Not Triggering

1. Verify the event system is initialized
2. Check event conditions in the data file
3. Ensure the event ID is correct
4. Check for console errors during event processing
5. Verify event listeners are properly bound

### UI Not Rendering Correctly

1. Check browser console for errors
2. Verify HTML structure is correct
3. Check CSS for conflicting styles
4. Test in different browsers
5. Verify the templates are loaded correctly

### Performance Issues

1. Check for excessive DOM manipulations
2. Look for unoptimized loops or calculations
3. Verify event listener cleanup
4. Check for memory leaks using browser tools
5. Optimize asset loading and caching
