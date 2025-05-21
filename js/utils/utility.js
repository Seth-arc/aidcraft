/**
 * AidCraft Workshop Simulation - Utility Functions
 * Common helper functions for use throughout the application.
 */

(function() {
  'use strict';

  /**
   * Utility - Collection of helper functions
   */
  const Utility = {
    /**
     * Format a number as currency
     * @param {number} value - Value to format
     * @param {string} currency - Currency code (default: USD)
     * @param {string} locale - Locale for formatting (default: en-US)
     * @returns {string} Formatted currency string
     */
    formatCurrency: function(value, currency = 'USD', locale = 'en-US') {
      if (typeof value !== 'number') {
        console.error('formatCurrency requires a number');
        return value;
      }
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
      }).format(value);
    },
    
    /**
     * Format a number with thousands separators
     * @param {number} value - Value to format
     * @param {string} locale - Locale for formatting (default: en-US)
     * @returns {string} Formatted number string
     */
    formatNumber: function(value, locale = 'en-US') {
      if (typeof value !== 'number') {
        console.error('formatNumber requires a number');
        return value;
      }
      
      return new Intl.NumberFormat(locale).format(value);
    },
    
    /**
     * Format a percentage
     * @param {number} value - Value to format (0-100)
     * @param {boolean} includeSymbol - Whether to include % symbol
     * @returns {string} Formatted percentage
     */
    formatPercentage: function(value, includeSymbol = true) {
      if (typeof value !== 'number') {
        console.error('formatPercentage requires a number');
        return value;
      }
      
      const formatted = value.toFixed(1).replace(/\.0$/, '');
      return includeSymbol ? `${formatted}%` : formatted;
    },
    
    /**
     * Debounce a function call
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait = 300) {
      let timeout;
      
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    /**
     * Throttle a function call
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle: function(func, limit = 300) {
      let inThrottle;
      
      return function executedFunction(...args) {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      };
    },
    
    /**
     * Get random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    getRandomInt: function(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray: function(array) {
      const shuffled = [...array];
      
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return shuffled;
    },
    
    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Create a UUID
     * @returns {string} UUID string
     */
    createUUID: function() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    
    /**
     * Get query parameter from URL
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value or null if not found
     */
    getQueryParam: function(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    },
    
    /**
     * Set query parameter in URL
     * @param {string} param - Parameter name
     * @param {string} value - Parameter value
     * @param {boolean} replace - Whether to replace current history entry
     */
    setQueryParam: function(param, value, replace = true) {
      const url = new URL(window.location.href);
      
      if (value === null || value === undefined) {
        url.searchParams.delete(param);
      } else {
        url.searchParams.set(param, value);
      }
      
      if (replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
    },
    
    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText: function(text, maxLength = 100) {
      if (!text || text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    },
    
    /**
     * Find the closest matching element
     * @param {HTMLElement} element - Starting element
     * @param {string} selector - CSS selector to match
     * @returns {HTMLElement|null} Matching element or null
     */
    closest: function(element, selector) {
      // Use native closest if available
      if (element.closest) {
        return element.closest(selector);
      }
      
      // Fallback for older browsers
      let current = element;
      
      while (current && current !== document) {
        if (current.matches(selector)) {
          return current;
        }
        current = current.parentElement;
      }
      
      return null;
    },
    
    /**
     * Create an HTML element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|HTMLElement|Array} content - Element content
     * @returns {HTMLElement} Created element
     */
    createElement: function(tag, attributes = {}, content = null) {
      const element = document.createElement(tag);
      
      // Set attributes
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class' || key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.entries(value).forEach(([prop, val]) => {
            element.style[prop] = val;
          });
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // Set content
      if (content !== null) {
        if (typeof content === 'string') {
          element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          element.appendChild(content);
        } else if (Array.isArray(content)) {
          content.forEach(item => {
            if (typeof item === 'string') {
              element.innerHTML += item;
            } else if (item instanceof HTMLElement) {
              element.appendChild(item);
            }
          });
        }
      }
      
      return element;
    },
    
    /**
     * Load HTML template from file
     * @param {string} url - Template URL
     * @returns {Promise} Promise that resolves with template HTML
     */
    loadTemplate: function(url) {
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .catch(error => {
          console.error('Error loading template:', error);
          return null;
        });
    },
    
    /**
     * Interpolate variables into a template string
     * @param {string} template - Template string with {{variable}} placeholders
     * @param {Object} variables - Variables to interpolate
     * @returns {string} Interpolated string
     */
    interpolate: function(template, variables = {}) {
      if (!template) return '';
      
      return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const keys = key.trim().split('.');
        let value = variables;
        
        for (const k of keys) {
          if (value === undefined || value === null) {
            return match;
          }
          value = value[k];
        }
        
        return value !== undefined && value !== null ? value : match;
      });
    },
    
    /**
     * Smoothly scroll to element
     * @param {HTMLElement|string} target - Target element or selector
     * @param {number} duration - Animation duration in milliseconds
     * @param {number} offset - Offset from top in pixels
     */
    scrollTo: function(target, duration = 500, offset = 0) {
      let targetElement;
      
      if (typeof target === 'string') {
        targetElement = document.querySelector(target);
      } else {
        targetElement = target;
      }
      
      if (!targetElement) {
        console.error('Target element not found');
        return;
      }
      
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      let startTime = null;
      
      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }
      
      function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }
      
      requestAnimationFrame(animation);
    }
  };
  
  // Make Utility available globally
  window.utility = Utility;
})(); 