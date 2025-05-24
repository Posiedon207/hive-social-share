
// Game Partner Finder Module
class GamePartnerFinder {
    constructor() {
        this.partners = this.loadPartners();
        this.mockPartners = this.generateMockPartners();
        this.allPartners = [...this.partners, ...this.mockPartners];
        this.selectedGames = [];
        this.initGamesList();
        this.initEventListeners();
    }

    loadPartners() {
        return JSON.parse(localStorage.getItem('hive-game-partners') || '[]');
    }

    savePartners() {
        localStorage.setItem('hive-game-partners', JSON.stringify(this.partners));
    }

    initGamesList() {
        const popularGames = [
            'Valorant', 'League of Legends', 'Call of Duty', 'Fortnite', 'Apex Legends',
            'Counter-Strike 2', 'Overwatch 2', 'Rocket League', 'Minecraft', 'Among Us',
            'Fall Guys', 'Genshin Impact', 'FIFA 24', 'NBA 2K24', 'Destiny 2',
            'World of Warcraft', 'Dota 2', 'PUBG', 'Rainbow Six Siege', 'Forza Horizon',
            'Grand Theft Auto V', 'Red Dead Redemption 2', 'Cyberpunk 2077', 'Elden Ring',
            'Baldur\'s Gate 3', 'Diablo IV', 'Street Fighter 6', 'Tekken 8'
        ];

        const gamesList = document.getElementById('gamesList');
        gamesList.innerHTML = popularGames.map(game => `
            <label class="game-option">
                <input type="checkbox" value="${game}" onchange="gameApp.toggleGame('${game}')">
                <span>${game}</span>
            </label>
        `).join('');
    }

    generateMockPartners() {
        const gamerTags = ['ProGamer2024', 'ShadowStrike', 'PixelMaster', 'GameChanger', 'ElitePlayer', 'CyberNinja', 'GameWarden', 'DigitalHero'];
        const games = ['Valorant', 'League of Legends', 'Call of Duty', 'Fortnite', 'Apex Legends', 'Overwatch 2', 'Minecraft', 'Rocket League'];
        const platforms = ['pc', 'playstation', 'xbox', 'nintendo', 'mobile'];
        const skillLevels = ['beginner', 'casual', 'intermediate', 'advanced', 'expert'];
        const playTimes = ['morning', 'afternoon', 'evening', 'late-night', 'flexible'];

        return gamerTags.map((tag, index) => ({
            id: `mock_${index}`,
            gamerTag: tag,
            preferredGames: this.getRandomGames(games, 3),
            skillLevel: skillLevels[Math.floor(Math.random() * skillLevels.length)],
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            playTime: playTimes[Math.floor(Math.random() * playTimes.length)],
            gameModes: this.getRandomModes(),
            communication: ['voice', 'text', 'both'][Math.floor(Math.random() * 3)],
            rating: 3.5 + Math.random() * 1.5,
            gamesPlayed: Math.floor(Math.random() * 500) + 50,
            hoursPlayed: Math.floor(Math.random() * 2000) + 100,
            lastOnline: this.getRandomLastOnline(),
            isOnline: Math.random() > 0.7,
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        }));
    }

    getRandomGames(games, count) {
        const shuffled = [...games].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    getRandomModes() {
        const modes = ['competitive', 'casual', 'cooperative', 'solo', 'team'];
        const count = Math.floor(Math.random() * 3) + 1;
        return modes.sort(() => 0.5 - Math.random()).slice(0, count);
    }

    getRandomLastOnline() {
        const hours = Math.floor(Math.random() * 72);
        return new Date(Date.now() - hours * 60 * 60 * 1000);
    }

    initEventListeners() {
        const form = document.getElementById('gameForm');
        const customGameInput = document.getElementById('customGame');
        const filters = ['filterGame', 'filterSkill', 'filterPlatform', 'filterOnline'];

        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        if (customGameInput) {
            customGameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    this.addCustomGame(e.target.value.trim());
                    e.target.value = '';
                }
            });
        }

        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', this.renderPartners.bind(this));
            }
        });
    }

    toggleGame(game) {
        const checkbox = document.querySelector(`input[value="${game}"]`);
        if (checkbox.checked) {
            if (!this.selectedGames.includes(game)) {
                this.selectedGames.push(game);
            }
        } else {
            this.selectedGames = this.selectedGames.filter(g => g !== game);
        }
    }

    addCustomGame(game) {
        if (!this.selectedGames.includes(game)) {
            this.selectedGames.push(game);
            
            // Add to the visual list
            const gamesList = document.getElementById('gamesList');
            const newGameOption = document.createElement('label');
            newGameOption.className = 'game-option';
            newGameOption.innerHTML = `
                <input type="checkbox" value="${game}" checked onchange="gameApp.toggleGame('${game}')">
                <span>${game}</span>
            `;
            gamesList.appendChild(newGameOption);
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const gameModes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .filter(cb => cb.closest('.checkbox-group'))
            .map(cb => cb.value);

        const newPartner = {
            id: HIVEApp.generateId(),
            gamerTag: document.getElementById('gamerTag').value,
            preferredGames: this.selectedGames,
            skillLevel: document.getElementById('skillLevel').value,
            platform: document.getElementById('platform').value,
            playTime: document.getElementById('playTime').value,
            gameModes: gameModes,
            communication: document.getElementById('communication').value,
            rating: 0,
            gamesPlayed: 0,
            hoursPlayed: 0,
            lastOnline: new Date(),
            isOnline: true,
            joinDate: new Date()
        };

        this.partners.push(newPartner);
        this.allPartners.push(newPartner);
        this.savePartners();
        
        // Show AI suggestions
        this.showAISuggestions(newPartner);
        
        // Find and display matches
        const matches = this.findMatches(newPartner);
        this.populateGameFilter();
        this.renderPartners(matches);
        this.showControls();

        HIVEApp.showMessage('Profile created! Finding your gaming matches...', 'success');
    }

    showAISuggestions(partner) {
        const aiContainer = document.getElementById('aiSuggestions');
        const aiContent = document.getElementById('aiContent');
        
        const suggestions = this.generateAISuggestions(partner);
        
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

    generateAISuggestions(partner) {
        const suggestions = [];
        
        // Game-specific suggestions
        if (partner.preferredGames.includes('Valorant') || partner.preferredGames.includes('Counter-Strike 2')) {
            suggestions.push({
                type: "FPS Tip",
                text: "Tactical FPS players often practice aim training daily. Consider joining aim training groups!"
            });
        }
        
        if (partner.preferredGames.includes('League of Legends') || partner.preferredGames.includes('Dota 2')) {
            suggestions.push({
                type: "MOBA Insight",
                text: "MOBA games benefit from consistent team play. Look for players with similar roles!"
            });
        }

        // Skill level suggestions
        if (partner.skillLevel === 'beginner') {
            suggestions.push({
                type: "New Player Tip",
                text: "Connect with other beginners and casual players for a more enjoyable learning experience."
            });
        } else if (partner.skillLevel === 'expert') {
            suggestions.push({
                type: "Pro Player Insight",
                text: "Consider joining competitive teams or tournaments in your area!"
            });
        }

        // Platform suggestions
        const platformTips = {
            pc: "PC gaming offers the most flexibility for cross-platform play and competitive gaming.",
            playstation: "PlayStation has strong exclusive communities. Join PlayStation-specific Discord servers!",
            xbox: "Xbox Game Pass provides access to many multiplayer games. Great for finding diverse gaming groups!",
            mobile: "Mobile gaming is perfect for quick matches. Look for players in your timezone for consistent play."
        };

        if (platformTips[partner.platform]) {
            suggestions.push({
                type: "Platform Tip",
                text: platformTips[partner.platform]
            });
        }

        // Communication suggestions
        if (partner.communication === 'voice') {
            suggestions.push({
                type: "Communication Tip",
                text: "Voice chat players tend to perform better in team games. Great choice for competitive play!"
            });
        }

        return suggestions;
    }

    findMatches(userPartner) {
        return this.allPartners
            .filter(partner => partner.id !== userPartner.id)
            .map(partner => {
                const compatibility = this.calculateCompatibility(userPartner, partner);
                return { ...partner, compatibility };
            })
            .filter(partner => partner.compatibility > 30)
            .sort((a, b) => b.compatibility - a.compatibility);
    }

    calculateCompatibility(user, partner) {
        let score = 0;
        
        // Game compatibility (40% weight)
        const commonGames = user.preferredGames.filter(game => 
            partner.preferredGames.some(pg => pg.toLowerCase() === game.toLowerCase())
        ).length;
        const gameScore = (commonGames / Math.max(user.preferredGames.length, partner.preferredGames.length)) * 100;
        score += gameScore * 0.4;
        
        // Platform compatibility (25% weight)
        const platformScore = (user.platform === partner.platform || 
                              user.platform === 'multiple' || 
                              partner.platform === 'multiple') ? 100 : 20;
        score += platformScore * 0.25;
        
        // Skill level compatibility (20% weight)
        const skillLevels = ['beginner', 'casual', 'intermediate', 'advanced', 'expert'];
        const userSkillIndex = skillLevels.indexOf(user.skillLevel);
        const partnerSkillIndex = skillLevels.indexOf(partner.skillLevel);
        const skillDiff = Math.abs(userSkillIndex - partnerSkillIndex);
        const skillScore = Math.max(0, 100 - (skillDiff * 20));
        score += skillScore * 0.2;
        
        // Play time compatibility (15% weight)
        const timeScore = (user.playTime === partner.playTime || 
                          user.playTime === 'flexible' || 
                          partner.playTime === 'flexible') ? 100 : 40;
        score += timeScore * 0.15;
        
        return Math.round(score);
    }

    populateGameFilter() {
        const filterGame = document.getElementById('filterGame');
        const allGames = new Set();
        
        this.allPartners.forEach(partner => {
            partner.preferredGames.forEach(game => allGames.add(game));
        });
        
        const currentValue = filterGame.value;
        filterGame.innerHTML = '<option value="">All Games</option>' +
            Array.from(allGames).sort().map(game => 
                `<option value="${game}">${game}</option>`
            ).join('');
        filterGame.value = currentValue;
    }

    showControls() {
        document.querySelector('.partners-controls').style.display = 'block';
    }

    renderPartners(customPartners = null) {
        const grid = document.getElementById('partnersGrid');
        const gameFilter = document.getElementById('filterGame')?.value || '';
        const skillFilter = document.getElementById('filterSkill')?.value || '';
        const platformFilter = document.getElementById('filterPlatform')?.value || '';
        const onlineFilter = document.getElementById('filterOnline')?.value || '';

        let partnersToShow = customPartners || this.allPartners;

        // Apply filters
        if (gameFilter) {
            partnersToShow = partnersToShow.filter(partner =>
                partner.preferredGames.some(game => game.toLowerCase().includes(gameFilter.toLowerCase()))
            );
        }

        if (skillFilter) {
            partnersToShow = partnersToShow.filter(partner => partner.skillLevel === skillFilter);
        }

        if (platformFilter) {
            partnersToShow = partnersToShow.filter(partner => 
                partner.platform === platformFilter || partner.platform === 'multiple'
            );
        }

        if (onlineFilter === 'online') {
            partnersToShow = partnersToShow.filter(partner => partner.isOnline);
        } else if (onlineFilter === 'recent') {
            const recentThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
            partnersToShow = partnersToShow.filter(partner => 
                partner.lastOnline > recentThreshold
            );
        }

        if (partnersToShow.length === 0) {
            grid.innerHTML = '<p class="empty-message">No gaming partners found matching your criteria.</p>';
            return;
        }

        grid.innerHTML = partnersToShow.map(partner => `
            <div class="partner-card">
                <div class="partner-header">
                    <div class="partner-info">
                        <h3 class="partner-tag">${partner.gamerTag}</h3>
                        <div class="partner-status">
                            <span class="status-indicator ${partner.isOnline ? 'online' : 'offline'}">
                                ${partner.isOnline ? '🟢 Online' : '🔴 ' + this.getLastOnlineText(partner.lastOnline)}
                            </span>
                        </div>
                    </div>
                    ${partner.compatibility ? `
                        <div class="compatibility-score">
                            <strong>${partner.compatibility}%</strong>
                            <small>Match</small>
                        </div>
                    ` : ''}
                </div>
                
                <div class="partner-details">
                    <div class="detail-item">
                        <strong>Platform:</strong> 
                        <span class="platform-badge">${this.getPlatformIcon(partner.platform)} ${partner.platform}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Skill:</strong> 
                        <span class="skill-badge skill-${partner.skillLevel}">${partner.skillLevel}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Play Time:</strong> ${partner.playTime}
                    </div>
                    <div class="detail-item">
                        <strong>Communication:</strong> ${partner.communication}
                    </div>
                </div>
                
                <div class="partner-games">
                    <strong>Favorite Games:</strong>
                    <div class="games-tags">
                        ${partner.preferredGames.map(game => 
                            `<span class="game-tag">${game}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="partner-modes">
                    <strong>Game Modes:</strong>
                    <div class="modes-tags">
                        ${partner.gameModes.map(mode => 
                            `<span class="mode-tag">${mode}</span>`
                        ).join('')}
                    </div>
                </div>
                
                ${partner.rating > 0 ? `
                    <div class="partner-stats">
                        <div class="stat">
                            <span class="stat-value">⭐ ${partner.rating.toFixed(1)}</span>
                            <span class="stat-label">Rating</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${partner.gamesPlayed}</span>
                            <span class="stat-label">Games</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${partner.hoursPlayed}h</span>
                            <span class="stat-label">Hours</span>
                        </div>
                    </div>
                ` : ''}
                
                <div class="partner-actions">
                    <button class="btn" onclick="gameApp.sendFriendRequest('${partner.id}')">
                        Add Friend
                    </button>
                    <button class="btn btn-secondary" onclick="gameApp.sendMessage('${partner.id}')">
                        Message
                    </button>
                </div>
            </div>
        `).join('');
    }

    getPlatformIcon(platform) {
        const icons = {
            pc: '💻',
            playstation: '🎮',
            xbox: '🎮',
            nintendo: '🎮',
            mobile: '📱',
            multiple: '🌐'
        };
        return icons[platform] || '🎮';
    }

    getLastOnlineText(lastOnline) {
        const now = new Date();
        const diff = now - new Date(lastOnline);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Recently';
    }

    sendFriendRequest(partnerId) {
        const partner = this.allPartners.find(p => p.id === partnerId);
        if (partner) {
            HIVEApp.showMessage(`Friend request sent to ${partner.gamerTag}!`, 'success');
        }
    }

    sendMessage(partnerId) {
        const partner = this.allPartners.find(p => p.id === partnerId);
        if (partner) {
            HIVEApp.showMessage(`Message sent to ${partner.gamerTag}!`, 'success');
        }
    }
}

// Add game-partner specific styles
const style = document.createElement('style');
style.textContent = `
    .games-selection {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
        margin-bottom: 1rem;
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
    }
    
    .game-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .game-option:hover {
        background: var(--bg-secondary);
    }
    
    .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }
    
    .partner-card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }
    
    .partner-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-hover);
    }
    
    .partner-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }
    
    .partner-tag {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
        font-size: 1.25rem;
    }
    
    .partner-status {
        font-size: 0.875rem;
    }
    
    .status-indicator.online {
        color: #22c55e;
        font-weight: 500;
    }
    
    .status-indicator.offline {
        color: var(--text-muted);
    }
    
    .compatibility-score {
        text-align: center;
        background: var(--gradient);
        color: white;
        padding: 0.5rem;
        border-radius: 8px;
        min-width: 60px;
    }
    
    .compatibility-score strong {
        display: block;
        font-size: 1.25rem;
    }
    
    .compatibility-score small {
        font-size: 0.75rem;
        opacity: 0.9;
    }
    
    .partner-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .detail-item {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .platform-badge, .skill-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .platform-badge {
        background: var(--accent-primary);
        color: white;
    }
    
    .skill-beginner { background: #22c55e; color: white; }
    .skill-casual { background: #84cc16; color: white; }
    .skill-intermediate { background: #eab308; color: white; }
    .skill-advanced { background: #f59e0b; color: white; }
    .skill-expert { background: #ef4444; color: white; }
    
    .partner-games, .partner-modes {
        margin-bottom: 1rem;
    }
    
    .partner-games strong, .partner-modes strong {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .games-tags, .modes-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }
    
    .game-tag, .mode-tag {
        background: var(--bg-secondary);
        color: var(--text-secondary);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
    }
    
    .partner-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 1rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
    }
    
    .stat {
        text-align: center;
    }
    
    .stat-value {
        display: block;
        font-weight: bold;
        color: var(--accent-primary);
    }
    
    .stat-label {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .partner-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .partner-actions .btn {
        flex: 1;
    }
    
    @media (max-width: 768px) {
        .games-selection {
            grid-template-columns: 1fr;
        }
        
        .partner-header {
            flex-direction: column;
            gap: 1rem;
        }
        
        .partner-details {
            grid-template-columns: 1fr;
        }
        
        .partner-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// Initialize Game Partner Finder
const gameApp = new GamePartnerFinder();
