/**
 * Accessibility Utility
 * Provides functions to enhance accessibility of the AidCraft simulation
 */
(function() {
    const Accessibility = {
        initialized: false,
        
        /**
         * Initialize accessibility features
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: function() {
            if (this.initialized) {
                return Promise.resolve();
            }
            
            console.log('Initializing Accessibility Utility...');
            
            return new Promise((resolve) => {
                // Set up event listeners
                this.setupEventListeners();
                
                // Apply any saved accessibility settings
                this.applySettings();
                
                this.initialized = true;
                console.log('Accessibility Utility initialized');
                resolve();
            });
        },
        
        /**
         * Set up event listeners for accessibility features
         */
        setupEventListeners: function() {
            // Listen for settings changes
            document.addEventListener('aidcraft:accessibilitySettingsChanged', this.handleSettingsChanged.bind(this));
            
            // Set up focus management for modals
            document.addEventListener('aidcraft:modalOpened', this.handleModalOpened.bind(this));
            document.addEventListener('aidcraft:modalClosed', this.handleModalClosed.bind(this));
            
            // Add keyboard navigation handler
            document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        },
        
        /**
         * Apply accessibility settings from storage
         */
        applySettings: function() {
            // Get settings from storage
            const settings = window.stateManager.getState('settings.accessibility', {
                highContrast: false,
                largeText: false,
                reducedMotion: false,
                extendedTimers: false
            });
            
            // Apply high contrast mode if enabled
            if (settings.highContrast) {
                document.body.classList.add('high-contrast-mode');
            } else {
                document.body.classList.remove('high-contrast-mode');
            }
            
            // Apply large text mode if enabled
            if (settings.largeText) {
                document.body.classList.add('large-text-mode');
            } else {
                document.body.classList.remove('large-text-mode');
            }
            
            // Apply reduced motion if enabled
            if (settings.reducedMotion) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
            
            // Apply extended timers setting (will be used by phase timer)
            if (settings.extendedTimers) {
                document.body.classList.add('extended-timers');
            } else {
                document.body.classList.remove('extended-timers');
            }
        },
        
        /**
         * Handle accessibility settings changed event
         * @param {CustomEvent} event - Settings changed event
         */
        handleSettingsChanged: function(event) {
            const settings = event.detail;
            
            // Save settings to state
            window.stateManager.setState('settings.accessibility', settings);
            
            // Apply the updated settings
            this.applySettings();
            
            console.log('Accessibility settings updated', settings);
        },
        
        /**
         * Handle modal opened event for focus management
         * @param {CustomEvent} event - Modal opened event
         */
        handleModalOpened: function(event) {
            // Store the element that had focus before the modal opened
            this.previouslyFocusedElement = document.activeElement;
            
            // Find the modal element (usually the last modal in the DOM)
            const modal = document.querySelector('.modal:last-child');
            if (!modal) return;
            
            // Set focus to the first focusable element in the modal
            const focusableElements = this.getFocusableElements(modal);
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
            
            // Add event listener to trap focus within the modal
            document.addEventListener('keydown', this.trapFocus);
        },
        
        /**
         * Handle modal closed event for focus management
         * @param {CustomEvent} event - Modal closed event
         */
        handleModalClosed: function(event) {
            // Remove focus trap
            document.removeEventListener('keydown', this.trapFocus);
            
            // Restore focus to the element that had focus before the modal opened
            if (this.previouslyFocusedElement) {
                this.previouslyFocusedElement.focus();
            }
        },
        
        /**
         * Trap focus within a modal using Tab key
         * @param {KeyboardEvent} event - Keyboard event
         */
        trapFocus: function(event) {
            // Only handle Tab key
            if (event.key !== 'Tab') return;
            
            // Find current modal
            const modal = document.querySelector('.modal:last-child');
            if (!modal) return;
            
            // Get all focusable elements in the modal
            const focusableElements = Accessibility.getFocusableElements(modal);
            if (focusableElements.length === 0) return;
            
            // Get first and last focusable elements
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            // Handle tab and shift+tab to trap focus
            if (event.shiftKey) {
                // If shift+tab on first element, move to last element
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                // If tab on last element, move to first element
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        },
        
        /**
         * Get all focusable elements within a container
         * @param {HTMLElement} container - Container element
         * @returns {Array} Array of focusable elements
         */
        getFocusableElements: function(container) {
            // Selector for all potentially focusable elements
            const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            
            // Get all elements that match the selector
            const elements = container.querySelectorAll(selector);
            
            // Filter to only visible and enabled elements
            return Array.from(elements).filter(element => {
                return element.offsetWidth > 0 && 
                       element.offsetHeight > 0 && 
                       !element.disabled;
            });
        },
        
        /**
         * Handle keyboard navigation
         * @param {KeyboardEvent} event - Keyboard event
         */
        handleKeyboardNavigation: function(event) {
            // Skip if within form fields
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
                return;
            }
            
            // Skip if modifiers are pressed (except shift)
            if (event.ctrlKey || event.altKey || event.metaKey) {
                return;
            }
            
            // Handle specific keyboard shortcuts
            switch (event.key) {
                case 'Escape':
                    // Close modal or dialog if open
                    document.dispatchEvent(new CustomEvent('aidcraft:escapePressed'));
                    break;
                    
                case 'h':
                case 'H':
                    // Open help dialog
                    if (!this.isModalOpen()) {
                        document.dispatchEvent(new CustomEvent('aidcraft:showHelp'));
                    }
                    break;
                
                case 's':
                case 'S':
                    // Open settings dialog
                    if (!this.isModalOpen()) {
                        document.dispatchEvent(new CustomEvent('aidcraft:showSettings'));
                    }
                    break;
                
                case 'p':
                case 'P':
                    // Pause/resume simulation
                    if (!this.isModalOpen()) {
                        document.dispatchEvent(new CustomEvent('aidcraft:togglePause'));
                    }
                    break;
            }
        },
        
        /**
         * Check if a modal is currently open
         * @returns {boolean} True if a modal is open
         */
        isModalOpen: function() {
            return document.querySelector('.modal') !== null;
        },
        
        /**
         * Add ARIA attributes to an element
         * @param {HTMLElement} element - Element to add attributes to
         * @param {Object} attributes - ARIA attributes object
         */
        setAriaAttributes: function(element, attributes) {
            if (!element) return;
            
            Object.entries(attributes).forEach(([key, value]) => {
                const attributeName = key.startsWith('aria') ? key : `aria-${key}`;
                
                if (value === null) {
                    element.removeAttribute(attributeName);
                } else {
                    element.setAttribute(attributeName, value);
                }
            });
        },
        
        /**
         * Make an element announce text to screen readers
         * @param {string} text - Text to announce
         * @param {string} [priority='polite'] - Announcement priority ('polite' or 'assertive')
         */
        announce: function(text, priority = 'polite') {
            // Create or use existing live region
            let liveRegion = document.getElementById('aria-live-announcer');
            
            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = 'aria-live-announcer';
                liveRegion.className = 'sr-only';
                liveRegion.setAttribute('aria-live', priority);
                liveRegion.setAttribute('aria-atomic', 'true');
                document.body.appendChild(liveRegion);
            } else {
                // Update existing region
                liveRegion.setAttribute('aria-live', priority);
            }
            
            // Set the text (clear first, then set after a small delay for screen readers to detect the change)
            liveRegion.textContent = '';
            
            setTimeout(() => {
                liveRegion.textContent = text;
            }, 50);
        },
        
        /**
         * Add a skip link to the page for keyboard users
         * @param {string} targetSelector - Selector for the main content
         */
        addSkipLink: function(targetSelector) {
            // Check if skip link already exists
            if (document.getElementById('skip-link')) return;
            
            // Create the skip link
            const skipLink = document.createElement('a');
            skipLink.id = 'skip-link';
            skipLink.href = '#';
            skipLink.className = 'skip-link';
            skipLink.textContent = 'Skip to main content';
            
            // Add skip link to body
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            // Add event listener
            skipLink.addEventListener('click', (event) => {
                event.preventDefault();
                
                // Find target element
                const target = document.querySelector(targetSelector);
                if (target) {
                    // Focus the target
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                    
                    // Remove tabindex after focus (optional)
                    setTimeout(() => {
                        target.removeAttribute('tabindex');
                    }, 1000);
                }
            });
        }
    };
    
    // Register the module
    window.accessibility = Accessibility;
})(); 