/**
 * Performance Utility
 * Provides functions for optimizing performance in the AidCraft simulation
 */
(function() {
    const Performance = {
        metrics: {},
        timers: {},
        
        /**
         * Start timing a performance metric
         * @param {string} metricName - Name of the metric to time
         */
        startTimer: function(metricName) {
            this.timers[metricName] = performance.now();
        },
        
        /**
         * End timing a performance metric and record the result
         * @param {string} metricName - Name of the metric to end timing
         * @returns {number} Duration in milliseconds
         */
        endTimer: function(metricName) {
            if (!this.timers[metricName]) {
                console.warn(`No timer started for metric: ${metricName}`);
                return 0;
            }
            
            const duration = performance.now() - this.timers[metricName];
            
            // Record the metric
            if (!this.metrics[metricName]) {
                this.metrics[metricName] = {
                    counts: 0,
                    totalDuration: 0,
                    min: Number.MAX_VALUE,
                    max: 0,
                    recent: []
                };
            }
            
            const metric = this.metrics[metricName];
            metric.counts++;
            metric.totalDuration += duration;
            metric.min = Math.min(metric.min, duration);
            metric.max = Math.max(metric.max, duration);
            
            // Track recent values (last 10)
            metric.recent.push(duration);
            if (metric.recent.length > 10) {
                metric.recent.shift();
            }
            
            // Clean up timer
            delete this.timers[metricName];
            
            return duration;
        },
        
        /**
         * Get performance metrics for a specific metric or all metrics
         * @param {string} [metricName] - Optional name of specific metric to get
         * @returns {Object} Performance metrics
         */
        getMetrics: function(metricName) {
            if (metricName) {
                const metric = this.metrics[metricName];
                
                if (!metric) {
                    return null;
                }
                
                return {
                    count: metric.counts,
                    totalDuration: metric.totalDuration,
                    averageDuration: metric.totalDuration / metric.counts,
                    min: metric.min,
                    max: metric.max,
                    recent: [...metric.recent]
                };
            }
            
            // Return all metrics
            const result = {};
            
            Object.keys(this.metrics).forEach(name => {
                const metric = this.metrics[name];
                
                result[name] = {
                    count: metric.counts,
                    totalDuration: metric.totalDuration,
                    averageDuration: metric.totalDuration / metric.counts,
                    min: metric.min,
                    max: metric.max,
                    recent: [...metric.recent]
                };
            });
            
            return result;
        },
        
        /**
         * Clear recorded performance metrics
         * @param {string} [metricName] - Optional name of specific metric to clear
         */
        clearMetrics: function(metricName) {
            if (metricName) {
                delete this.metrics[metricName];
            } else {
                this.metrics = {};
            }
        },
        
        /**
         * Throttle a function to limit its execution frequency
         * @param {Function} func - Function to throttle
         * @param {number} limit - Minimum time between executions in milliseconds
         * @returns {Function} Throttled function
         */
        throttle: function(func, limit) {
            let lastCall = 0;
            
            return function(...args) {
                const now = Date.now();
                
                if (now - lastCall < limit) {
                    return;
                }
                
                lastCall = now;
                return func.apply(this, args);
            };
        },
        
        /**
         * Debounce a function to delay execution until after wait period
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @param {boolean} [immediate=false] - Whether to call immediately on the leading edge
         * @returns {Function} Debounced function
         */
        debounce: function(func, wait, immediate = false) {
            let timeout;
            
            return function(...args) {
                const context = this;
                
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                
                const callNow = immediate && !timeout;
                
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                
                if (callNow) func.apply(context, args);
            };
        },
        
        /**
         * Batch DOM operations to reduce reflows
         * @param {Function} updateFunction - Function that performs DOM updates
         * @param {Object} [options] - Batching options
         * @param {number} [options.delay=0] - Delay in milliseconds before applying updates
         * @param {boolean} [options.useRAF=true] - Whether to use requestAnimationFrame
         */
        batchDOMUpdates: function(updateFunction, options = {}) {
            const defaults = {
                delay: 0,
                useRAF: true
            };
            
            const settings = { ...defaults, ...options };
            
            if (settings.useRAF) {
                // Use requestAnimationFrame for smooth animations
                if (settings.delay > 0) {
                    setTimeout(() => {
                        requestAnimationFrame(updateFunction);
                    }, settings.delay);
                } else {
                    requestAnimationFrame(updateFunction);
                }
            } else {
                // Use setTimeout for delayed updates without animation frame
                setTimeout(updateFunction, settings.delay);
            }
        },
        
        /**
         * Create a document fragment for batch DOM insertions
         * @param {Function} populateFunction - Function to populate the fragment (receives fragment as argument)
         * @param {HTMLElement} targetElement - Element to append the fragment to
         */
        createFragmentAndAppend: function(populateFunction, targetElement) {
            const fragment = document.createDocumentFragment();
            
            // Let the caller populate the fragment
            populateFunction(fragment);
            
            // Append fragment to target element (single reflow/repaint)
            targetElement.appendChild(fragment);
        },
        
        /**
         * Optimize an operation by chunking it into smaller batches
         * @param {Array} items - Array of items to process
         * @param {Function} processFunction - Function to process each chunk of items
         * @param {Object} [options] - Chunking options
         * @param {number} [options.chunkSize=100] - Number of items per chunk
         * @param {number} [options.delay=0] - Delay between chunks in milliseconds
         * @returns {Promise} Promise that resolves when all chunks are processed
         */
        processInChunks: function(items, processFunction, options = {}) {
            const defaults = {
                chunkSize: 100,
                delay: 0
            };
            
            const settings = { ...defaults, ...options };
            
            return new Promise((resolve) => {
                if (!items || !items.length) {
                    resolve();
                    return;
                }
                
                const totalItems = items.length;
                let currentIndex = 0;
                
                const processNextChunk = () => {
                    // Calculate end index for current chunk
                    const endIndex = Math.min(currentIndex + settings.chunkSize, totalItems);
                    
                    // Process current chunk
                    const chunk = items.slice(currentIndex, endIndex);
                    processFunction(chunk, currentIndex, endIndex);
                    
                    // Update current index
                    currentIndex = endIndex;
                    
                    // If there are more items, schedule next chunk
                    if (currentIndex < totalItems) {
                        setTimeout(processNextChunk, settings.delay);
                    } else {
                        // All chunks processed
                        resolve();
                    }
                };
                
                // Start processing
                processNextChunk();
            });
        },
        
        /**
         * Preload images to ensure they're cached for smoother display
         * @param {Array} imageSources - Array of image URLs to preload
         * @param {Function} [progressCallback] - Optional callback to report loading progress
         * @returns {Promise} Promise that resolves when all images are loaded
         */
        preloadImages: function(imageSources, progressCallback) {
            if (!imageSources || !imageSources.length) {
                return Promise.resolve([]);
            }
            
            let loadedCount = 0;
            const totalCount = imageSources.length;
            
            // Create array of promises for each image load
            const promises = imageSources.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    
                    img.onload = () => {
                        loadedCount++;
                        
                        if (progressCallback) {
                            progressCallback(loadedCount, totalCount, src);
                        }
                        
                        resolve(img);
                    };
                    
                    img.onerror = () => {
                        loadedCount++;
                        
                        if (progressCallback) {
                            progressCallback(loadedCount, totalCount, src, true);
                        }
                        
                        // Resolve with null for failed loads instead of rejecting
                        resolve(null);
                    };
                    
                    img.src = src;
                });
            });
            
            return Promise.all(promises);
        },
        
        /**
         * Optimize heavy calculations by memoizing results
         * @param {Function} func - Function to memoize
         * @param {Function} [keyResolver] - Optional function to generate cache keys
         * @returns {Function} Memoized function
         */
        memoize: function(func, keyResolver) {
            const cache = new Map();
            
            return function(...args) {
                const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);
                
                if (cache.has(key)) {
                    return cache.get(key);
                }
                
                const result = func.apply(this, args);
                cache.set(key, result);
                
                return result;
            };
        },
        
        /**
         * Limit the rate of garbage collection triggers
         * by reusing objects instead of creating new ones
         * @returns {Object} Object pool manager
         */
        createObjectPool: function() {
            const pools = {};
            
            return {
                /**
                 * Get an object from the pool or create a new one
                 * @param {string} type - Pool type identifier
                 * @param {Function} factory - Factory function to create new objects
                 * @returns {Object} Object from the pool or newly created
                 */
                get: function(type, factory) {
                    if (!pools[type]) {
                        pools[type] = [];
                    }
                    
                    if (pools[type].length > 0) {
                        return pools[type].pop();
                    }
                    
                    return factory();
                },
                
                /**
                 * Return an object to the pool for reuse
                 * @param {string} type - Pool type identifier
                 * @param {Object} obj - Object to return to the pool
                 * @param {Function} [reset] - Optional function to reset the object
                 */
                release: function(type, obj, reset) {
                    if (!pools[type]) {
                        pools[type] = [];
                    }
                    
                    if (reset) {
                        reset(obj);
                    }
                    
                    pools[type].push(obj);
                },
                
                /**
                 * Clear a specific pool or all pools
                 * @param {string} [type] - Optional pool type to clear
                 */
                clear: function(type) {
                    if (type) {
                        delete pools[type];
                    } else {
                        for (const key in pools) {
                            delete pools[key];
                        }
                    }
                }
            };
        },
        
        /**
         * Detect when browser visibility changes to optimize resource usage
         * @param {Function} visibleCallback - Called when page becomes visible
         * @param {Function} hiddenCallback - Called when page becomes hidden
         * @returns {Function} Function to remove the event listeners
         */
        handleVisibilityChange: function(visibleCallback, hiddenCallback) {
            const handleChange = () => {
                if (document.hidden) {
                    if (hiddenCallback) hiddenCallback();
                } else {
                    if (visibleCallback) visibleCallback();
                }
            };
            
            document.addEventListener('visibilitychange', handleChange);
            
            // Initial call based on current state
            handleChange();
            
            // Return function to remove listener
            return function() {
                document.removeEventListener('visibilitychange', handleChange);
            };
        }
    };
    
    // Register the module
    window.performance = Performance;
})(); 