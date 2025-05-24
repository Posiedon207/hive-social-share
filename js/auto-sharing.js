
// Auto Sharing Module
class AutoSharing {
    constructor() {
        this.rides = this.loadRides();
        this.mockRides = this.generateMockRides();
        this.allRides = [...this.rides, ...this.mockRides];
        this.initEventListeners();
        this.renderRides();
    }

    loadRides() {
        return JSON.parse(localStorage.getItem('hive-auto-rides') || '[]');
    }

    saveRides() {
        localStorage.setItem('hive-auto-rides', JSON.stringify(this.rides));
    }

    generateMockRides() {
        const now = new Date();
        return [
            {
                id: 'mock_1',
                startLocation: 'Downtown Mall',
                destination: 'University Campus',
                datetime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                vehicle: 'car',
                seats: 3,
                costShare: 4.50,
                notes: 'Meeting at main entrance. Non-smoking vehicle.',
                driver: 'Emma Student',
                rating: 4.8,
                completedRides: 25,
                createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
            },
            {
                id: 'mock_2',
                startLocation: 'Airport Terminal',
                destination: 'Downtown Mall',
                datetime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
                vehicle: 'car',
                seats: 2,
                costShare: 8.00,
                notes: 'Flight arrives at 3 PM. Luggage space available.',
                driver: 'Mike Travel',
                rating: 4.9,
                completedRides: 42,
                createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
            },
            {
                id: 'mock_3',
                startLocation: 'Business District',
                destination: 'Shopping Center',
                datetime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
                vehicle: 'bicycle',
                seats: 1,
                costShare: 0,
                notes: 'Bike riding group, helmets required. Free ride!',
                driver: 'Sarah Cyclist',
                rating: 4.7,
                completedRides: 15,
                createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
            },
            {
                id: 'mock_4',
                startLocation: 'University Campus',
                destination: 'Tech Park',
                datetime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours from now
                vehicle: 'motorcycle',
                seats: 1,
                costShare: 3.00,
                notes: 'Extra helmet provided. Experience required.',
                driver: 'Alex Rider',
                rating: 4.6,
                completedRides: 18,
                createdAt: new Date(now.getTime() - 30 * 60 * 1000)
            }
        ];
    }

    initEventListeners() {
        const form = document.getElementById('rideForm');
        const locationFilter = document.getElementById('filterLocation');
        const vehicleFilter = document.getElementById('filterVehicle');
        const timeFilter = document.getElementById('filterTime');
        const sortBy = document.getElementById('sortBy');

        if (form) {
            form.addEventListener('submit', this.handleCreateRide.bind(this));
        }

        [locationFilter, vehicleFilter, timeFilter, sortBy].forEach(element => {
            if (element) {
                element.addEventListener('change', this.renderRides.bind(this));
                element.addEventListener('input', this.renderRides.bind(this));
            }
        });

        // Set minimum datetime to now
        const datetimeInput = document.getElementById('datetime');
        if (datetimeInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            datetimeInput.min = now.toISOString().slice(0, 16);
        }
    }

    handleCreateRide(e) {
        e.preventDefault();

        const newRide = {
            id: HIVEApp.generateId(),
            startLocation: document.getElementById('startLocation').value,
            destination: document.getElementById('destination').value,
            datetime: new Date(document.getElementById('datetime').value),
            vehicle: document.getElementById('vehicle').value,
            seats: parseInt(document.getElementById('seats').value),
            costShare: parseFloat(document.getElementById('costShare').value || 0),
            notes: document.getElementById('notes').value,
            driver: 'You',
            rating: 0,
            completedRides: 0,
            createdAt: new Date()
        };

        this.rides.push(newRide);
        this.allRides.push(newRide);
        this.saveRides();
        this.renderRides();
        this.showAISuggestions(newRide);

        // Reset form
        e.target.reset();
        
        HIVEApp.showMessage('Ride created successfully!', 'success');
    }

    showAISuggestions(ride) {
        const aiContainer = document.getElementById('aiSuggestions');
        const aiContent = document.getElementById('aiContent');
        
        const suggestions = this.generateAISuggestions(ride);
        
        if (suggestions.length > 0) {
            aiContent.innerHTML = `
                <div class="ai-suggestions">
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item">
                            <strong>${suggestion.type}:</strong> ${suggestion.text}
                        </div>
                    `).join('')}
                </div>
            `;
            
            aiContainer.style.display = 'block';
        }
    }

    generateAISuggestions(ride) {
        const suggestions = [];
        
        // Popular route suggestions
        const popularRoutes = {
            'downtown': 'This is a popular route during evening hours. You might find more passengers.',
            'airport': 'Airport routes are in high demand. Consider adding extra time for traffic.',
            'university': 'University routes are busiest during weekdays and semester periods.',
            'mall': 'Shopping center routes are popular on weekends and evenings.'
        };

        for (const [keyword, suggestion] of Object.entries(popularRoutes)) {
            if (ride.startLocation.toLowerCase().includes(keyword) || 
                ride.destination.toLowerCase().includes(keyword)) {
                suggestions.push({
                    type: "Route Insight",
                    text: suggestion
                });
                break;
            }
        }

        // Time-based suggestions
        const hour = ride.datetime.getHours();
        if (hour >= 7 && hour <= 9) {
            suggestions.push({
                type: "Rush Hour",
                text: "Morning rush hour - expect heavy traffic. Allow extra time."
            });
        } else if (hour >= 17 && hour <= 19) {
            suggestions.push({
                type: "Rush Hour",
                text: "Evening rush hour - high demand for rides to avoid traffic."
            });
        }

        // Cost suggestions
        if (ride.costShare === 0) {
            suggestions.push({
                type: "Pricing Tip",
                text: "Free rides are great for building your reputation and finding regular passengers!"
            });
        } else if (ride.costShare > 10) {
            suggestions.push({
                type: "Pricing Tip",
                text: "Higher cost shares work best for longer distances or premium vehicles."
            });
        }

        // Vehicle-specific suggestions
        const vehicleTips = {
            bicycle: "Bike rides are eco-friendly and great for short distances. Weather permitting!",
            motorcycle: "Motorcycle rides are fast but ensure passengers have proper safety gear.",
            car: "Car rides offer comfort and weather protection. Good for longer distances.",
            scooter: "Electric scooters are perfect for quick city trips and short distances."
        };

        if (vehicleTips[ride.vehicle]) {
            suggestions.push({
                type: "Vehicle Tip",
                text: vehicleTips[ride.vehicle]
            });
        }

        return suggestions;
    }

    renderRides() {
        const grid = document.getElementById('ridesGrid');
        const locationFilter = document.getElementById('filterLocation').value.toLowerCase();
        const vehicleFilter = document.getElementById('filterVehicle').value;
        const timeFilter = document.getElementById('filterTime').value;
        const sortBy = document.getElementById('sortBy').value;

        let filteredRides = this.allRides.filter(ride => {
            const now = new Date();
            return ride.datetime > now; // Only show future rides
        });

        // Apply filters
        if (locationFilter) {
            filteredRides = filteredRides.filter(ride =>
                ride.startLocation.toLowerCase().includes(locationFilter) ||
                ride.destination.toLowerCase().includes(locationFilter)
            );
        }

        if (vehicleFilter) {
            filteredRides = filteredRides.filter(ride => ride.vehicle === vehicleFilter);
        }

        if (timeFilter) {
            const now = new Date();
            filteredRides = filteredRides.filter(ride => {
                const rideDate = new Date(ride.datetime);
                switch (timeFilter) {
                    case 'today':
                        return rideDate.toDateString() === now.toDateString();
                    case 'tomorrow':
                        const tomorrow = new Date(now);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return rideDate.toDateString() === tomorrow.toDateString();
                    case 'week':
                        const weekFromNow = new Date(now);
                        weekFromNow.setDate(weekFromNow.getDate() + 7);
                        return rideDate <= weekFromNow;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filteredRides.sort((a, b) => {
            switch (sortBy) {
                case 'cost-low':
                    return a.costShare - b.costShare;
                case 'seats':
                    return b.seats - a.seats;
                case 'time':
                default:
                    return new Date(a.datetime) - new Date(b.datetime);
            }
        });

        if (filteredRides.length === 0) {
            grid.innerHTML = '<p class="empty-message">No rides found matching your criteria.</p>';
            return;
        }

        grid.innerHTML = filteredRides.map(ride => `
            <div class="ride-card">
                <div class="ride-header">
                    <div class="ride-route">
                        <h3>${ride.startLocation} → ${ride.destination}</h3>
                        <span class="vehicle-type">
                            ${this.getVehicleIcon(ride.vehicle)} ${ride.vehicle}
                        </span>
                    </div>
                    <div class="ride-cost">
                        ${ride.costShare > 0 ? `$${ride.costShare.toFixed(2)}` : 'FREE'}
                    </div>
                </div>
                
                <div class="ride-details">
                    <div class="ride-time">
                        <strong>🕒 ${this.formatDateTime(ride.datetime)}</strong>
                    </div>
                    <div class="ride-seats">
                        <strong>👥 ${ride.seats} seat${ride.seats > 1 ? 's' : ''} available</strong>
                    </div>
                </div>
                
                ${ride.notes ? `<p class="ride-notes">${ride.notes}</p>` : ''}
                
                <div class="driver-info">
                    <div class="driver-name">
                        <strong>Driver: ${ride.driver}</strong>
                        ${ride.rating > 0 ? `
                            <span class="driver-rating">
                                ⭐ ${ride.rating} (${ride.completedRides} rides)
                            </span>
                        ` : ''}
                    </div>
                    <small class="posted-time">
                        Posted ${this.getTimeAgo(ride.createdAt)}
                    </small>
                </div>
                
                <div class="ride-actions">
                    ${ride.driver === 'You' ? `
                        <button class="btn btn-secondary" onclick="autoApp.editRide('${ride.id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="autoApp.cancelRide('${ride.id}')">
                            Cancel
                        </button>
                    ` : `
                        <button class="btn" onclick="autoApp.joinRide('${ride.id}')">
                            Join Ride
                        </button>
                        <button class="btn btn-secondary" onclick="autoApp.contactDriver('${ride.id}')">
                            Message
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    }

    getVehicleIcon(vehicle) {
        const icons = {
            car: '🚗',
            motorcycle: '🏍️',
            bicycle: '🚲',
            scooter: '🛴'
        };
        return icons[vehicle] || '🚗';
    }

    formatDateTime(datetime) {
        const date = new Date(datetime);
        const now = new Date();
        
        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (date.toDateString() === tomorrow.toDateString()) {
                return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    joinRide(rideId) {
        const ride = this.allRides.find(r => r.id === rideId);
        if (ride) {
            HIVEApp.showMessage(`Join request sent for ride from ${ride.startLocation} to ${ride.destination}!`, 'success');
        }
    }

    contactDriver(rideId) {
        const ride = this.allRides.find(r => r.id === rideId);
        if (ride) {
            HIVEApp.showMessage(`Message sent to ${ride.driver}!`, 'success');
        }
    }

    editRide(rideId) {
        HIVEApp.showMessage('Edit functionality would open a form to modify the ride details.', 'success');
    }

    cancelRide(rideId) {
        if (confirm('Are you sure you want to cancel this ride?')) {
            this.rides = this.rides.filter(r => r.id !== rideId);
            this.allRides = this.allRides.filter(r => r.id !== rideId);
            this.saveRides();
            this.renderRides();
            HIVEApp.showMessage('Ride cancelled successfully!', 'success');
        }
    }
}

// Add auto-sharing specific styles
const style = document.createElement('style');
style.textContent = `
    .rides-controls {
        margin-bottom: 2rem;
    }
    
    .ride-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }
    
    .ride-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-hover);
    }
    
    .ride-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }
    
    .ride-route h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
        font-size: 1.25rem;
    }
    
    .vehicle-type {
        background: var(--bg-secondary);
        color: var(--text-secondary);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        text-transform: capitalize;
    }
    
    .ride-cost {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--accent-primary);
    }
    
    .ride-details {
        display: flex;
        gap: 2rem;
        margin-bottom: 1rem;
        color: var(--text-secondary);
    }
    
    .ride-notes {
        background: var(--bg-secondary);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        font-style: italic;
        color: var(--text-secondary);
    }
    
    .driver-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }
    
    .driver-rating {
        margin-left: 0.5rem;
        color: var(--text-muted);
        font-weight: normal;
        font-size: 0.875rem;
    }
    
    .posted-time {
        color: var(--text-muted);
    }
    
    .ride-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .ride-actions .btn {
        flex: 1;
    }
    
    @media (max-width: 768px) {
        .ride-header {
            flex-direction: column;
            gap: 1rem;
        }
        
        .ride-details {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .driver-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .ride-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// Initialize Auto Sharing
const autoApp = new AutoSharing();
