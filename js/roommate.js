
// Roommate Finder Module
class RoommateFinder {
    constructor() {
        this.mockUsers = this.generateMockUsers();
        this.userProfiles = this.loadUserProfiles();
        this.initEventListeners();
    }

    generateMockUsers() {
        const names = ['Alex Chen', 'Jordan Smith', 'Sam Wilson', 'Casey Brown', 'Taylor Davis', 'Morgan Lee', 'Riley Park', 'Avery Johnson'];
        const locations = ['Downtown', 'Midtown', 'Suburb', 'University District', 'Arts District', 'Financial District'];
        const interests = [
            ['cooking', 'hiking', 'movies'],
            ['gaming', 'music', 'coding'],
            ['fitness', 'yoga', 'reading'],
            ['art', 'photography', 'travel'],
            ['sports', 'outdoor activities', 'socializing'],
            ['books', 'cooking', 'gardening'],
            ['music', 'concerts', 'dancing'],
            ['technology', 'startups', 'networking']
        ];

        return names.map((name, index) => ({
            id: `user_${index}`,
            name,
            age: 22 + Math.floor(Math.random() * 8),
            gender: ['male', 'female', 'non-binary'][Math.floor(Math.random() * 3)],
            budget: 600 + Math.floor(Math.random() * 800),
            location: locations[Math.floor(Math.random() * locations.length)],
            interests: interests[index] || interests[0],
            compatibility: 0,
            joinDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
        }));
    }

    loadUserProfiles() {
        return JSON.parse(localStorage.getItem('hive-roommate-profiles') || '[]');
    }

    saveUserProfile(profile) {
        const profiles = this.loadUserProfiles();
        profiles.push(profile);
        localStorage.setItem('hive-roommate-profiles', JSON.stringify(profiles));
    }

    initEventListeners() {
        const form = document.getElementById('roommateForm');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            budget: parseInt(document.getElementById('budget').value),
            location: document.getElementById('location').value,
            interests: document.getElementById('interests').value.split(',').map(i => i.trim())
        };

        // Show loading state
        this.showLoading(true);

        // Save user profile
        this.saveUserProfile(formData);

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show AI suggestions
        this.showAISuggestions(formData);

        // Find matches
        const matches = this.findMatches(formData);
        
        // Show results
        this.displayMatches(matches);
        this.showLoading(false);
    }

    showLoading(show) {
        const searchText = document.getElementById('searchText');
        const searchLoader = document.getElementById('searchLoader');
        
        if (show) {
            searchText.style.display = 'none';
            searchLoader.style.display = 'inline-block';
        } else {
            searchText.style.display = 'inline';
            searchLoader.style.display = 'none';
        }
    }

    showAISuggestions(userProfile) {
        const aiContainer = document.getElementById('aiSuggestions');
        const aiContent = document.getElementById('aiContent');
        
        const suggestions = this.generateAISuggestions(userProfile);
        
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

    generateAISuggestions(profile) {
        const suggestions = [];
        
        // Budget suggestions
        if (profile.budget < 700) {
            suggestions.push({
                type: "Budget Tip",
                text: "Consider looking in suburban areas for better value within your budget range."
            });
        }
        
        // Interest-based suggestions
        if (profile.interests.includes('cooking')) {
            suggestions.push({
                type: "Compatibility Insight",
                text: "Look for roommates who also enjoy cooking - you could share meal prep and grocery costs!"
            });
        }
        
        if (profile.interests.includes('gaming')) {
            suggestions.push({
                type: "Social Tip",
                text: "Gaming roommates often have similar schedules and can become great friends."
            });
        }
        
        // Location suggestions
        suggestions.push({
            type: "Location Insight",
            text: `${profile.location} is popular among people aged ${profile.age-2}-${profile.age+5}. You'll likely find compatible matches here.`
        });
        
        return suggestions;
    }

    findMatches(userProfile) {
        return this.mockUsers.map(user => {
            const compatibility = this.calculateCompatibility(userProfile, user);
            return { ...user, compatibility };
        })
        .filter(user => user.compatibility > 40)
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 6);
    }

    calculateCompatibility(user1, user2) {
        let score = 0;
        
        // Budget compatibility (30% weight)
        const budgetDiff = Math.abs(user1.budget - user2.budget);
        const budgetScore = Math.max(0, 100 - (budgetDiff / 10));
        score += budgetScore * 0.3;
        
        // Location compatibility (25% weight)
        const locationScore = user1.location.toLowerCase() === user2.location.toLowerCase() ? 100 : 20;
        score += locationScore * 0.25;
        
        // Age compatibility (20% weight)
        const ageDiff = Math.abs(user1.age - user2.age);
        const ageScore = Math.max(0, 100 - (ageDiff * 5));
        score += ageScore * 0.2;
        
        // Interest compatibility (25% weight)
        const commonInterests = user1.interests.filter(interest => 
            user2.interests.some(i => i.toLowerCase().includes(interest.toLowerCase()))
        ).length;
        const interestScore = (commonInterests / Math.max(user1.interests.length, user2.interests.length)) * 100;
        score += interestScore * 0.25;
        
        return Math.round(score);
    }

    displayMatches(matches) {
        const container = document.getElementById('matchesContainer');
        const grid = document.getElementById('matchesGrid');
        
        if (matches.length === 0) {
            grid.innerHTML = '<p>No matches found. Try adjusting your criteria!</p>';
        } else {
            grid.innerHTML = matches.map(match => `
                <div class="result-card">
                    <h3>${match.name}</h3>
                    <div class="match-details">
                        <p><strong>Age:</strong> ${match.age}</p>
                        <p><strong>Budget:</strong> $${match.budget}/month</p>
                        <p><strong>Location:</strong> ${match.location}</p>
                        <p><strong>Interests:</strong> ${match.interests.join(', ')}</p>
                        <div class="compatibility-score">
                            <strong>Compatibility: ${match.compatibility}%</strong>
                            <div class="compatibility-bar">
                                <div class="compatibility-fill" style="width: ${match.compatibility}%"></div>
                            </div>
                        </div>
                        <button class="btn" onclick="roommateApp.contactUser('${match.id}')">
                            Contact
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }

    contactUser(userId) {
        const user = this.mockUsers.find(u => u.id === userId);
        if (user) {
            HIVEApp.showMessage(`Contact request sent to ${user.name}! They'll receive your profile.`, 'success');
        }
    }
}

// Add compatibility styles
const style = document.createElement('style');
style.textContent = `
    .ai-suggestions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .suggestion-item {
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
        border-left: 4px solid var(--accent-primary);
    }
    
    .match-details p {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }
    
    .compatibility-score {
        margin: 1rem 0;
    }
    
    .compatibility-bar {
        width: 100%;
        height: 8px;
        background: var(--border-color);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 0.5rem;
    }
    
    .compatibility-fill {
        height: 100%;
        background: var(--gradient);
        transition: width 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialize Roommate Finder
const roommateApp = new RoommateFinder();
