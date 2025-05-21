/**
 * Data Visualization Utility
 * Provides functions for visualizing data in the AidCraft simulation
 */
(function() {
    const DataVisualization = {
        /**
         * Create a relationship graph visualization
         * @param {string} containerId - ID of the container element
         * @param {Object} [options] - Visualization options
         */
        createRelationshipGraph: function(containerId, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container element with ID "${containerId}" not found`);
                return;
            }
            
            // Get stakeholder relationships from state
            const relationships = window.stateManager.getState('stakeholderRelationships', {});
            const stakeholders = window.dataLoader.getStakeholders() || [];
            
            if (stakeholders.length === 0) {
                container.innerHTML = '<div class="placeholder-message">No stakeholder data available</div>';
                return;
            }
            
            // Create canvas for graph visualization
            const canvas = document.createElement('canvas');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight || 400;
            container.innerHTML = '';
            container.appendChild(canvas);
            
            // Get canvas context
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                return;
            }
            
            // Draw the relationship graph
            this.drawRelationshipGraph(ctx, stakeholders, relationships, options);
        },
        
        /**
         * Draw a relationship graph on a canvas
         * @param {CanvasRenderingContext2D} ctx - Canvas context
         * @param {Array} stakeholders - Array of stakeholder objects
         * @param {Object} relationships - Stakeholder relationship data
         * @param {Object} options - Visualization options
         */
        drawRelationshipGraph: function(ctx, stakeholders, relationships, options) {
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            
            // Clear the canvas
            ctx.clearRect(0, 0, width, height);
            
            // Default options
            const defaults = {
                nodeRadius: 30,
                centerX: width / 2,
                centerY: height / 2,
                orbitRadius: Math.min(width, height) * 0.35,
                lineWidth: 2,
                textSize: 12,
                animationSpeed: 0.01
            };
            
            // Merge options with defaults
            const settings = { ...defaults, ...options };
            
            // Calculate node positions in a circle
            const nodePositions = {};
            const playerNode = { x: settings.centerX, y: settings.centerY };
            
            // Position stakeholders in a circle around the player
            stakeholders.forEach((stakeholder, index) => {
                const angle = (index / stakeholders.length) * Math.PI * 2;
                nodePositions[stakeholder.id] = {
                    x: settings.centerX + Math.cos(angle) * settings.orbitRadius,
                    y: settings.centerY + Math.sin(angle) * settings.orbitRadius
                };
            });
            
            // Draw relationships (edges)
            Object.entries(relationships).forEach(([stakeholderId, relations]) => {
                const sourceNode = nodePositions[stakeholderId];
                if (!sourceNode) return;
                
                // Draw edge to player if there's a player relationship
                if (relations.player) {
                    this.drawRelationshipEdge(ctx, sourceNode, playerNode, relations.player, settings);
                }
                
                // Draw edges between stakeholders
                Object.entries(relations).forEach(([targetId, relation]) => {
                    if (targetId === 'player') return; // Already handled
                    
                    const targetNode = nodePositions[targetId];
                    if (!targetNode) return;
                    
                    this.drawRelationshipEdge(ctx, sourceNode, targetNode, relation, settings);
                });
            });
            
            // Draw player node (center)
            this.drawNode(ctx, playerNode.x, playerNode.y, settings.nodeRadius, 'Player', '#3498db', settings);
            
            // Draw stakeholder nodes
            stakeholders.forEach(stakeholder => {
                const node = nodePositions[stakeholder.id];
                if (!node) return;
                
                this.drawNode(ctx, node.x, node.y, settings.nodeRadius, stakeholder.name, '#e74c3c', settings);
            });
        },
        
        /**
         * Draw a relationship edge between two nodes
         * @param {CanvasRenderingContext2D} ctx - Canvas context
         * @param {Object} sourceNode - Source node coordinates {x, y}
         * @param {Object} targetNode - Target node coordinates {x, y}
         * @param {Object} relation - Relationship data {strength, type}
         * @param {Object} settings - Visualization settings
         */
        drawRelationshipEdge: function(ctx, sourceNode, targetNode, relation, settings) {
            const strength = relation.strength || 0.5;
            const type = relation.type || 'neutral';
            
            // Determine line color based on relationship type
            let color = '#7f8c8d'; // Default (neutral)
            if (type === 'allied') color = '#2ecc71';
            if (type === 'opposed') color = '#e74c3c';
            
            // Determine line width based on relationship strength
            const lineWidth = settings.lineWidth * (0.5 + strength);
            
            // Start drawing
            ctx.beginPath();
            ctx.moveTo(sourceNode.x, sourceNode.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            
            // Use dashed line for weak relationships
            if (strength < 0.3) {
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }
            
            ctx.stroke();
            ctx.setLineDash([]); // Reset for next drawing
        },
        
        /**
         * Draw a node (circle with label)
         * @param {CanvasRenderingContext2D} ctx - Canvas context
         * @param {number} x - X coordinate
         * @param {number} y - Y coordinate
         * @param {number} radius - Node radius
         * @param {string} label - Node label
         * @param {string} color - Node color
         * @param {Object} settings - Visualization settings
         */
        drawNode: function(ctx, x, y, radius, label, color, settings) {
            // Draw circle
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            
            // Draw border
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
            
            // Draw label
            ctx.font = `${settings.textSize}px Arial`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Wrap text if needed
            const words = label.split(' ');
            let line = '';
            let lineHeight = settings.textSize * 1.2;
            let offsetY = 0;
            
            if (words.length > 1) {
                offsetY = -(lineHeight * (words.length - 1)) / 2;
            }
            
            for (let i = 0; i < words.length; i++) {
                // Draw each word on a new line
                ctx.fillText(words[i], x, y + offsetY + (i * lineHeight));
            }
        },
        
        /**
         * Create a bar chart visualization
         * @param {string} containerId - ID of the container element
         * @param {Array} data - Array of data objects {label, value, color}
         * @param {Object} [options] - Visualization options
         */
        createBarChart: function(containerId, data, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container element with ID "${containerId}" not found`);
                return;
            }
            
            if (!data || data.length === 0) {
                container.innerHTML = '<div class="placeholder-message">No data available for chart</div>';
                return;
            }
            
            // Default options
            const defaults = {
                width: container.clientWidth,
                height: 300,
                barSpacing: 10,
                showValues: true,
                showLabels: true,
                title: '',
                animationDuration: 1000
            };
            
            // Merge options with defaults
            const settings = { ...defaults, ...options };
            
            // Create chart HTML
            let chartHTML = `
                <div class="chart-container" style="width: ${settings.width}px; height: ${settings.height}px;">
                    ${settings.title ? `<h3 class="chart-title">${settings.title}</h3>` : ''}
                    <div class="bar-chart">
            `;
            
            // Calculate maximum value for scaling
            const maxValue = Math.max(...data.map(item => item.value));
            
            // Calculate bar width based on container width and number of bars
            const barWidth = (settings.width - (data.length + 1) * settings.barSpacing) / data.length;
            
            // Create bars
            data.forEach((item, index) => {
                const barHeight = (item.value / maxValue) * (settings.height - 60); // Leave space for labels
                const barLeft = settings.barSpacing + index * (barWidth + settings.barSpacing);
                
                chartHTML += `
                    <div class="chart-bar-container" style="left: ${barLeft}px; width: ${barWidth}px;">
                        <div class="chart-bar" style="height: 0; background-color: ${item.color || '#3498db'};" 
                            data-height="${barHeight}px">
                            ${settings.showValues ? `<div class="bar-value">${item.value}</div>` : ''}
                        </div>
                        ${settings.showLabels ? `<div class="bar-label">${item.label}</div>` : ''}
                    </div>
                `;
            });
            
            chartHTML += `
                    </div>
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
            // Animate bars
            setTimeout(() => {
                const bars = container.querySelectorAll('.chart-bar');
                bars.forEach(bar => {
                    const targetHeight = bar.getAttribute('data-height');
                    bar.style.height = targetHeight;
                    bar.style.transition = `height ${settings.animationDuration}ms ease-out`;
                });
            }, 50);
        },
        
        /**
         * Create a pie chart visualization
         * @param {string} containerId - ID of the container element
         * @param {Array} data - Array of data objects {label, value, color}
         * @param {Object} [options] - Visualization options
         */
        createPieChart: function(containerId, data, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container element with ID "${containerId}" not found`);
                return;
            }
            
            if (!data || data.length === 0) {
                container.innerHTML = '<div class="placeholder-message">No data available for chart</div>';
                return;
            }
            
            // Default options
            const defaults = {
                width: container.clientWidth,
                height: 300,
                radius: 100,
                showLegend: true,
                title: '',
                donut: false,
                donutHoleSize: 0.5, // As a proportion of radius
                animationDuration: 1000
            };
            
            // Merge options with defaults
            const settings = { ...defaults, ...options };
            
            // Calculate total for percentages
            const total = data.reduce((sum, item) => sum + item.value, 0);
            
            // Create canvas for pie chart
            const canvas = document.createElement('canvas');
            canvas.width = settings.width;
            canvas.height = settings.height;
            
            // Create chart container
            let chartHTML = `
                <div class="chart-container" style="width: ${settings.width}px; height: ${settings.height}px;">
                    ${settings.title ? `<h3 class="chart-title">${settings.title}</h3>` : ''}
                    <div class="pie-chart-container">
                        <div class="pie-canvas-container"></div>
                        ${settings.showLegend ? '<div class="pie-legend"></div>' : ''}
                    </div>
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
            // Add canvas to container
            const canvasContainer = container.querySelector('.pie-canvas-container');
            canvasContainer.appendChild(canvas);
            
            // Create legend if enabled
            if (settings.showLegend) {
                let legendHTML = '<ul class="legend-list">';
                
                data.forEach(item => {
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    
                    legendHTML += `
                        <li class="legend-item">
                            <span class="legend-color" style="background-color: ${item.color || '#3498db'}"></span>
                            <span class="legend-label">${item.label}</span>
                            <span class="legend-value">${percentage}%</span>
                        </li>
                    `;
                });
                
                legendHTML += '</ul>';
                
                const legendContainer = container.querySelector('.pie-legend');
                legendContainer.innerHTML = legendHTML;
            }
            
            // Draw pie chart
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                return;
            }
            
            // Calculate center position
            const centerX = settings.width / 2 - (settings.showLegend ? settings.width * 0.15 : 0);
            const centerY = settings.height / 2;
            
            // Draw pie/donut chart
            this.drawPieChart(ctx, data, {
                centerX: centerX,
                centerY: centerY,
                radius: settings.radius,
                total: total,
                donut: settings.donut,
                donutHoleSize: settings.donutHoleSize,
                animationDuration: settings.animationDuration
            });
        },
        
        /**
         * Draw a pie chart on a canvas
         * @param {CanvasRenderingContext2D} ctx - Canvas context
         * @param {Array} data - Array of data objects {label, value, color}
         * @param {Object} options - Drawing options
         */
        drawPieChart: function(ctx, data, options) {
            const { centerX, centerY, radius, total, donut, donutHoleSize } = options;
            
            // Animation frames
            const frames = 60;
            const animationDuration = options.animationDuration || 1000;
            const frameInterval = animationDuration / frames;
            
            let currentFrame = 0;
            let currentAngle = 0;
            
            // Animation function
            const animate = () => {
                // Clear canvas
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                
                // Draw slices
                currentAngle = 0;
                
                data.forEach(item => {
                    // Calculate slice angle
                    const sliceAngle = (item.value / total) * Math.PI * 2;
                    
                    // Calculate end angle for current animation frame
                    const endAngle = currentAngle + sliceAngle * (currentFrame / frames);
                    
                    // Draw slice
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
                    ctx.closePath();
                    
                    // Fill slice
                    ctx.fillStyle = item.color || '#3498db';
                    ctx.fill();
                    
                    // Add border
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#ffffff';
                    ctx.stroke();
                    
                    // Update angle for next slice
                    currentAngle = endAngle;
                });
                
                // Create donut hole if needed
                if (donut) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius * donutHoleSize, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                }
                
                // Continue animation until complete
                currentFrame++;
                if (currentFrame <= frames) {
                    setTimeout(animate, frameInterval);
                }
            };
            
            // Start animation
            animate();
        },
        
        /**
         * Create a line chart visualization
         * @param {string} containerId - ID of the container element
         * @param {Array} datasets - Array of dataset objects {label, data: [{x, y}], color}
         * @param {Object} [options] - Visualization options
         */
        createLineChart: function(containerId, datasets, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container element with ID "${containerId}" not found`);
                return;
            }
            
            if (!datasets || datasets.length === 0) {
                container.innerHTML = '<div class="placeholder-message">No data available for chart</div>';
                return;
            }
            
            // Default options
            const defaults = {
                width: container.clientWidth,
                height: 300,
                showPoints: true,
                showLabels: true,
                title: '',
                xAxis: { label: 'X Axis' },
                yAxis: { label: 'Y Axis' },
                gridLines: true,
                animationDuration: 1000
            };
            
            // Merge options with defaults
            const settings = { ...defaults, ...options };
            
            // Create canvas for line chart
            const canvas = document.createElement('canvas');
            canvas.width = settings.width;
            canvas.height = settings.height;
            
            // Create chart container
            let chartHTML = `
                <div class="chart-container" style="width: ${settings.width}px; height: ${settings.height}px;">
                    ${settings.title ? `<h3 class="chart-title">${settings.title}</h3>` : ''}
                    <div class="line-chart-container"></div>
                    ${settings.showLabels ? '<div class="chart-legend"></div>' : ''}
                </div>
            `;
            
            container.innerHTML = chartHTML;
            
            // Add canvas to container
            const chartContainer = container.querySelector('.line-chart-container');
            chartContainer.appendChild(canvas);
            
            // Create legend if showing labels
            if (settings.showLabels) {
                let legendHTML = '<ul class="legend-list">';
                
                datasets.forEach(dataset => {
                    legendHTML += `
                        <li class="legend-item">
                            <span class="legend-color" style="background-color: ${dataset.color || '#3498db'}"></span>
                            <span class="legend-label">${dataset.label}</span>
                        </li>
                    `;
                });
                
                legendHTML += '</ul>';
                
                const legendContainer = container.querySelector('.chart-legend');
                legendContainer.innerHTML = legendHTML;
            }
            
            // Draw line chart
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                return;
            }
            
            // Draw chart with animation
            this.drawLineChart(ctx, datasets, settings);
        },
        
        /**
         * Draw a line chart on a canvas
         * @param {CanvasRenderingContext2D} ctx - Canvas context
         * @param {Array} datasets - Array of dataset objects {label, data: [{x, y}], color}
         * @param {Object} settings - Drawing settings
         */
        drawLineChart: function(ctx, datasets, settings) {
            // Calculate chart area dimensions
            const padding = 40;
            const chartWidth = settings.width - padding * 2;
            const chartHeight = settings.height - padding * 2;
            
            // Find min/max values for scaling
            let minX = Number.MAX_VALUE;
            let maxX = Number.MIN_VALUE;
            let minY = Number.MAX_VALUE;
            let maxY = Number.MIN_VALUE;
            
            datasets.forEach(dataset => {
                dataset.data.forEach(point => {
                    minX = Math.min(minX, point.x);
                    maxX = Math.max(maxX, point.x);
                    minY = Math.min(minY, point.y);
                    maxY = Math.max(maxY, point.y);
                });
            });
            
            // Add some padding to max/min values
            const rangeX = maxX - minX;
            const rangeY = maxY - minY;
            
            minX -= rangeX * 0.05;
            maxX += rangeX * 0.05;
            minY -= rangeY * 0.05;
            maxY += rangeY * 0.05;
            
            // Clean min/max to avoid NaN
            if (minX === maxX) maxX += 1;
            if (minY === maxY) maxY += 1;
            
            // Animation frames
            const frames = 60;
            const frameInterval = settings.animationDuration / frames;
            let currentFrame = 0;
            
            // Animation function
            const animate = () => {
                // Clear canvas
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                
                // Draw axes and grid
                this.drawChartAxes(ctx, {
                    padding,
                    width: chartWidth,
                    height: chartHeight,
                    minX, maxX, minY, maxY,
                    xLabel: settings.xAxis.label,
                    yLabel: settings.yAxis.label,
                    gridLines: settings.gridLines
                });
                
                // Calculate animation progress
                const progress = currentFrame / frames;
                
                // Draw each dataset
                datasets.forEach(dataset => {
                    const color = dataset.color || '#3498db';
                    const points = dataset.data;
                    
                    // Only draw if there are at least 2 points
                    if (points.length >= 2) {
                        // Draw line
                        ctx.beginPath();
                        
                        // Calculate point positions
                        const pointPositions = points.map(point => ({
                            x: padding + ((point.x - minX) / (maxX - minX)) * chartWidth,
                            y: (settings.height - padding) - ((point.y - minY) / (maxY - minY)) * chartHeight
                        }));
                        
                        // Animate line drawing
                        for (let i = 0; i < pointPositions.length; i++) {
                            const pos = pointPositions[i];
                            
                            // For animation, only draw up to current progress
                            if (i / (pointPositions.length - 1) > progress) break;
                            
                            // First point: move to, then line to for subsequent points
                            if (i === 0) {
                                ctx.moveTo(pos.x, pos.y);
                            } else {
                                ctx.lineTo(pos.x, pos.y);
                            }
                        }
                        
                        // Set line style
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        
                        // Draw points if enabled
                        if (settings.showPoints) {
                            pointPositions.forEach((pos, i) => {
                                // Only draw points up to current progress
                                if (i / (pointPositions.length - 1) > progress) return;
                                
                                ctx.beginPath();
                                ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
                                ctx.fillStyle = color;
                                ctx.fill();
                                ctx.strokeStyle = '#ffffff';
                                ctx.lineWidth = 1;
                                ctx.stroke();
                            });
                        }
                    }
                });
                
                // Continue animation until complete
                currentFrame++;
                if (currentFrame <= frames) {
                    setTimeout(animate, frameInterval);
                }
            };
            
            // Start animation
            animate();
        },
        
        /**
         * Draw chart axes and grid
         * @param {CanvasRenderingContext2D} ctx - Canvas context
         * @param {Object} options - Axes options
         */
        drawChartAxes: function(ctx, options) {
            const {
                padding, width, height,
                minX, maxX, minY, maxY,
                xLabel, yLabel, gridLines
            } = options;
            
            // Draw axis lines
            ctx.beginPath();
            
            // X-axis
            ctx.moveTo(padding, ctx.canvas.height - padding);
            ctx.lineTo(padding + width, ctx.canvas.height - padding);
            
            // Y-axis
            ctx.moveTo(padding, ctx.canvas.height - padding);
            ctx.lineTo(padding, padding);
            
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw grid lines if enabled
            if (gridLines) {
                // Number of grid lines
                const gridLinesX = 5;
                const gridLinesY = 5;
                
                ctx.beginPath();
                ctx.setLineDash([2, 2]);
                
                // X-axis grid lines
                for (let i = 1; i <= gridLinesX; i++) {
                    const x = padding + (width / gridLinesX) * i;
                    ctx.moveTo(x, ctx.canvas.height - padding);
                    ctx.lineTo(x, padding);
                }
                
                // Y-axis grid lines
                for (let i = 1; i <= gridLinesY; i++) {
                    const y = ctx.canvas.height - padding - (height / gridLinesY) * i;
                    ctx.moveTo(padding, y);
                    ctx.lineTo(padding + width, y);
                }
                
                ctx.strokeStyle = '#dddddd';
                ctx.stroke();
                ctx.setLineDash([]);
            }
            
            // Draw axis labels
            ctx.font = '12px Arial';
            ctx.fillStyle = '#333333';
            ctx.textAlign = 'center';
            
            // X-axis label
            ctx.fillText(xLabel, padding + width / 2, ctx.canvas.height - padding / 3);
            
            // Y-axis label (rotated)
            ctx.save();
            ctx.translate(padding / 3, padding + height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(yLabel, 0, 0);
            ctx.restore();
            
            // Draw axis values
            ctx.font = '10px Arial';
            
            // X-axis values
            for (let i = 0; i <= 5; i++) {
                const value = minX + ((maxX - minX) / 5) * i;
                const x = padding + (width / 5) * i;
                ctx.fillText(value.toFixed(1), x, ctx.canvas.height - padding + 15);
            }
            
            // Y-axis values
            ctx.textAlign = 'right';
            for (let i = 0; i <= 5; i++) {
                const value = minY + ((maxY - minY) / 5) * i;
                const y = ctx.canvas.height - padding - (height / 5) * i;
                ctx.fillText(value.toFixed(1), padding - 5, y + 3);
            }
        }
    };
    
    // Register the module
    window.dataVisualization = DataVisualization;
})(); 