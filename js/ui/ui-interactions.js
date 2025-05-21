/**
 * AidCraft Workshop Simulation - UI Interactions
 * Handles general UI interaction events and behaviors.
 */

(function() {
  'use strict';

  /**
   * UI Interactions - Manages general UI events and behaviors
   */
  const UIInteractions = {
    initialized: false,
    modalActive: false,
    
    /**
     * Initialize UI interactions
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    init: function() {
      if (this.initialized) {
        return Promise.resolve();
      }
      
      return new Promise((resolve) => {
        console.log('Initializing UI Interactions...');
        
        // Set up event listeners
        this._setupEventListeners();
        
        // Initialize tooltips
        this._initTooltips();
        
        this.initialized = true;
        console.log('UI Interactions initialized');
        resolve();
      });
    },
    
    /**
     * Show a modal dialog
     * @param {string} title - Modal title
     * @param {string} content - Modal content HTML
     * @param {Array} buttons - Array of button configs {text, action, class, callback}
     */
    showModal: function(title, content, buttons) {
      if (this.modalActive) {
        this.closeModal();
      }
      
      // Create modal container
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'active-modal';
      
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
        this.closeModal();
      });
      
      // Setup button actions
      buttons.forEach(btn => {
        modal.querySelector(`button[data-action="${btn.action}"]`).addEventListener('click', () => {
          if (typeof btn.callback === 'function') {
            btn.callback();
          }
          this.closeModal();
        });
      });
      
      // Mark modal as active
      this.modalActive = true;
      
      // Notify that modal is open - useful for pausing timers, etc.
      document.dispatchEvent(new CustomEvent('aidcraft:modalopened'));
      
      // Add active class after a short delay to allow for transitions
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
    },
    
    /**
     * Close the active modal
     */
    closeModal: function() {
      const modal = document.getElementById('active-modal');
      
      if (!modal) return;
      
      // Remove active class first (for transition)
      modal.classList.remove('active');
      
      // Remove modal after transition
      setTimeout(() => {
        document.body.removeChild(modal);
        this.modalActive = false;
        
        // Notify that modal is closed
        document.dispatchEvent(new CustomEvent('aidcraft:modalclosed'));
      }, 300); // Match transition duration in CSS
    },
    
    /**
     * Show a confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Function to call when confirmed
     * @param {Function} onCancel - Function to call when canceled
     */
    showConfirmation: function(message, onConfirm, onCancel) {
      this.showModal(
        'Confirm Action',
        `<p>${message}</p>`,
        [
          {
            text: 'Cancel',
            action: 'cancel',
            class: 'btn-secondary',
            callback: onCancel
          },
          {
            text: 'Confirm',
            action: 'confirm',
            class: 'btn-primary',
            callback: onConfirm
          }
        ]
      );
    },
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('info', 'success', 'warning', 'error')
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    showNotification: function(message, type = 'info', duration = 3000) {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      
      // Add content
      notification.innerHTML = `
        <div class="notification-icon"></div>
        <div class="notification-message">${message}</div>
        <button class="notification-close">&times;</button>
      `;
      
      // Add to notifications container (create if it doesn't exist)
      let container = document.querySelector('.notifications-container');
      
      if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
      }
      
      container.appendChild(notification);
      
      // Set up close button
      notification.querySelector('.notification-close').addEventListener('click', () => {
        this._removeNotification(notification);
      });
      
      // Auto-remove after duration
      setTimeout(() => {
        this._removeNotification(notification);
      }, duration);
      
      // Add active class after a short delay for animation
      setTimeout(() => {
        notification.classList.add('active');
      }, 10);
    },
    
    /**
     * Remove a notification element
     * @param {HTMLElement} notification - Notification element to remove
     * @private
     */
    _removeNotification: function(notification) {
      notification.classList.remove('active');
      
      // Remove after transition
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        
        // Check if container is empty and remove it
        const container = document.querySelector('.notifications-container');
        if (container && container.children.length === 0) {
          container.parentNode.removeChild(container);
        }
      }, 300); // Match transition duration in CSS
    },
    
    /**
     * Initialize tooltips
     * @private
     */
    _initTooltips: function() {
      // Find elements with data-tooltip attribute
      document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (event) => {
          const tooltipText = event.target.getAttribute('data-tooltip');
          this._showTooltip(event.target, tooltipText);
        });
        
        element.addEventListener('mouseleave', () => {
          this._hideTooltip();
        });
      });
    },
    
    /**
     * Show a tooltip
     * @param {HTMLElement} element - Element to show tooltip for
     * @param {string} text - Tooltip text
     * @private
     */
    _showTooltip: function(element, text) {
      // Remove any existing tooltip
      this._hideTooltip();
      
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = text;
      tooltip.id = 'active-tooltip';
      
      // Add to document
      document.body.appendChild(tooltip);
      
      // Position tooltip relative to element
      const rect = element.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let top = rect.top - tooltipRect.height - 10;
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      
      // Adjust if would go off screen
      if (top < 10) {
        top = rect.bottom + 10;
        tooltip.classList.add('tooltip-bottom');
      }
      
      if (left < 10) {
        left = 10;
      } else if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
      
      // Add active class for animation
      setTimeout(() => {
        tooltip.classList.add('active');
      }, 10);
    },
    
    /**
     * Hide the active tooltip
     * @private
     */
    _hideTooltip: function() {
      const tooltip = document.getElementById('active-tooltip');
      
      if (tooltip) {
        tooltip.classList.remove('active');
        
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 200);
      }
    },
    
    /**
     * Setup global UI event listeners
     * @private
     */
    _setupEventListeners: function() {
      // Handle modal events
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.modalActive) {
          this.closeModal();
        }
      });
      
      // Add document-level event delegation for common UI elements
      document.addEventListener('click', (event) => {
        // Handle data-toggle elements
        if (event.target.hasAttribute('data-toggle')) {
          const targetId = event.target.getAttribute('data-toggle');
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            targetElement.classList.toggle('active');
            event.preventDefault();
          }
        }
        
        // Handle data-action elements
        if (event.target.hasAttribute('data-action')) {
          const action = event.target.getAttribute('data-action');
          
          // Dispatch action event
          document.dispatchEvent(new CustomEvent('aidcraft:action', {
            detail: {
              action: action,
              element: event.target
            }
          }));
        }
      });
      
      // Set up viewport resize handling
      window.addEventListener('resize', this._debounce(() => {
        // Dispatch resize event
        document.dispatchEvent(new CustomEvent('aidcraft:resize', {
          detail: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }));
      }, 250));
    },
    
    /**
     * Debounce function to limit frequency of calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     * @private
     */
    _debounce: function(func, delay) {
      let timeoutId;
      
      return function(...args) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          func.apply(this, args);
        }, delay);
      };
    }
  };
  
  // Make UIInteractions available globally
  window.uiInteractions = UIInteractions;
})(); 