
// Common Cart Module
class CommonCart {
    constructor() {
        this.items = this.loadItems();
        this.initEventListeners();
        this.renderItems();
        this.updateStats();
    }

    loadItems() {
        return JSON.parse(localStorage.getItem('hive-cart-items') || '[]');
    }

    saveItems() {
        localStorage.setItem('hive-cart-items', JSON.stringify(this.items));
    }

    initEventListeners() {
        const form = document.getElementById('cartForm');
        const categoryFilter = document.getElementById('filterCategory');
        const statusFilter = document.getElementById('filterStatus');

        if (form) {
            form.addEventListener('submit', this.handleAddItem.bind(this));
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', this.renderItems.bind(this));
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', this.renderItems.bind(this));
        }
    }

    handleAddItem(e) {
        e.preventDefault();

        const newItem = {
            id: HIVEApp.generateId(),
            name: document.getElementById('itemName').value,
            category: document.getElementById('category').value,
            quantity: parseInt(document.getElementById('quantity').value),
            priority: document.getElementById('priority').value,
            notes: document.getElementById('notes').value,
            status: 'pending',
            addedBy: 'Current User',
            addedDate: new Date().toISOString(),
            estimatedCost: this.estimateItemCost(document.getElementById('itemName').value, document.getElementById('category').value)
        };

        this.items.push(newItem);
        this.saveItems();
        this.renderItems();
        this.updateStats();
        this.showAISuggestions(newItem);

        // Reset form
        e.target.reset();
        
        HIVEApp.showMessage(`${newItem.name} added to cart!`, 'success');
    }

    estimateItemCost(itemName, category) {
        // Simple cost estimation based on category and item name
        const baseCosts = {
            groceries: 5,
            household: 15,
            electronics: 50,
            clothing: 25,
            other: 10
        };

        const multipliers = {
            'milk': 0.8,
            'bread': 0.6,
            'laptop': 20,
            'phone': 15,
            'shampoo': 1.2,
            'detergent': 2,
            'rice': 0.4,
            'pasta': 0.8
        };

        let baseCost = baseCosts[category] || 10;
        
        // Check for specific item multipliers
        for (const [keyword, multiplier] of Object.entries(multipliers)) {
            if (itemName.toLowerCase().includes(keyword)) {
                baseCost *= multiplier;
                break;
            }
        }

        return Math.round(baseCost * 100) / 100; // Round to 2 decimal places
    }

    showAISuggestions(newItem) {
        const aiContainer = document.getElementById('aiSuggestions');
        const aiContent = document.getElementById('aiContent');
        
        const suggestions = this.generateAISuggestions(newItem);
        
        if (suggestions.length > 0) {
            aiContent.innerHTML = `
                <div class="ai-suggestions">
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item">
                            <strong>${suggestion.type}:</strong> ${suggestion.text}
                            ${suggestion.action ? `<button class="btn btn-secondary" onclick="cartApp.${suggestion.action}">${suggestion.actionText}</button>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            
            aiContainer.style.display = 'block';
        }
    }

    generateAISuggestions(item) {
        const suggestions = [];
        
        // Related items suggestions
        const relatedItems = {
            'milk': ['cereal', 'cookies', 'coffee'],
            'bread': ['butter', 'jam', 'cheese'],
            'pasta': ['tomato sauce', 'parmesan cheese', 'olive oil'],
            'rice': ['soy sauce', 'vegetables', 'chicken'],
            'shampoo': ['conditioner', 'body wash', 'towels'],
            'detergent': ['fabric softener', 'bleach', 'laundry basket']
        };

        for (const [keyword, related] of Object.entries(relatedItems)) {
            if (item.name.toLowerCase().includes(keyword)) {
                suggestions.push({
                    type: "Related Items",
                    text: `People who buy ${keyword} often also need: ${related.join(', ')}`
                });
                break;
            }
        }

        // Bulk buying suggestions
        if (item.category === 'groceries' && item.quantity === 1) {
            suggestions.push({
                type: "Bulk Savings",
                text: "Consider buying in bulk to save money and reduce shopping trips!"
            });
        }

        // Store recommendations
        const storeRecommendations = {
            groceries: "Costco, Walmart, or local grocery stores",
            electronics: "Best Buy, Amazon, or Newegg",
            clothing: "Target, Amazon, or department stores",
            household: "Home Depot, Lowe's, or Amazon"
        };

        if (storeRecommendations[item.category]) {
            suggestions.push({
                type: "Store Recommendation",
                text: `Best places to buy ${item.category}: ${storeRecommendations[item.category]}`
            });
        }

        return suggestions;
    }

    renderItems() {
        const container = document.getElementById('cartItems');
        const categoryFilter = document.getElementById('filterCategory').value;
        const statusFilter = document.getElementById('filterStatus').value;

        let filteredItems = this.items;

        if (categoryFilter) {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }

        if (statusFilter) {
            filteredItems = filteredItems.filter(item => item.status === statusFilter);
        }

        if (filteredItems.length === 0) {
            container.innerHTML = '<p class="empty-message">No items found. Add some items to get started!</p>';
            return;
        }

        container.innerHTML = filteredItems.map(item => `
            <div class="cart-item ${item.status}" data-id="${item.id}">
                <div class="item-info">
                    <h4 class="item-name">${item.name}</h4>
                    <div class="item-details">
                        <span class="item-category">${item.category}</span>
                        <span class="item-quantity">Qty: ${item.quantity}</span>
                        <span class="item-priority priority-${item.priority}">${item.priority}</span>
                        <span class="item-cost">~$${item.estimatedCost}</span>
                    </div>
                    ${item.notes ? `<p class="item-notes">${item.notes}</p>` : ''}
                    <div class="item-meta">
                        <small>Added by ${item.addedBy} on ${HIVEApp.formatDate(item.addedDate)}</small>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn ${item.status === 'bought' ? 'btn-secondary' : ''}" 
                            onclick="cartApp.toggleStatus('${item.id}')">
                        ${item.status === 'bought' ? 'Mark Pending' : 'Mark Bought'}
                    </button>
                    <button class="btn btn-danger" onclick="cartApp.deleteItem('${item.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleStatus(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.status = item.status === 'bought' ? 'pending' : 'bought';
            if (item.status === 'bought') {
                item.boughtDate = new Date().toISOString();
            }
            this.saveItems();
            this.renderItems();
            this.updateStats();
        }
    }

    deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.items = this.items.filter(i => i.id !== itemId);
            this.saveItems();
            this.renderItems();
            this.updateStats();
            HIVEApp.showMessage('Item deleted successfully!', 'success');
        }
    }

    clearBought() {
        if (confirm('Clear all bought items from the list?')) {
            this.items = this.items.filter(i => i.status !== 'bought');
            this.saveItems();
            this.renderItems();
            this.updateStats();
            HIVEApp.showMessage('Bought items cleared!', 'success');
        }
    }

    updateStats() {
        const totalItems = document.getElementById('totalItems');
        const totalCost = document.getElementById('totalCost');
        
        const pendingItems = this.items.filter(i => i.status === 'pending');
        const totalEstimatedCost = pendingItems.reduce((sum, item) => sum + (item.estimatedCost * item.quantity), 0);
        
        if (totalItems) {
            totalItems.textContent = `${pendingItems.length} items`;
        }
        
        if (totalCost) {
            totalCost.textContent = `~$${totalEstimatedCost.toFixed(2)}`;
        }
    }
}

// Add cart-specific styles
const style = document.createElement('style');
style.textContent = `
    .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .cart-stats {
        display: flex;
        gap: 1rem;
        font-weight: 600;
        color: var(--accent-primary);
    }
    
    .cart-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }
    
    .cart-filters select {
        flex: 1;
        min-width: 150px;
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1.5rem;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        margin-bottom: 1rem;
        background: var(--bg-card);
        transition: all 0.3s ease;
    }
    
    .cart-item:hover {
        box-shadow: var(--shadow);
    }
    
    .cart-item.bought {
        opacity: 0.7;
        border-color: #22c55e;
    }
    
    .item-info {
        flex: 1;
    }
    
    .item-name {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .item-details {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }
    
    .item-details span {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .item-category {
        background: var(--bg-secondary);
        color: var(--text-secondary);
    }
    
    .item-quantity {
        background: var(--accent-primary);
        color: white;
    }
    
    .priority-high {
        background: #ef4444;
        color: white;
    }
    
    .priority-medium {
        background: #f59e0b;
        color: white;
    }
    
    .priority-low {
        background: #10b981;
        color: white;
    }
    
    .item-cost {
        background: var(--bg-secondary);
        color: var(--text-secondary);
    }
    
    .item-notes {
        margin: 0.5rem 0;
        font-style: italic;
        color: var(--text-muted);
    }
    
    .item-meta {
        color: var(--text-muted);
        font-size: 0.875rem;
    }
    
    .item-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-left: 1rem;
    }
    
    .empty-message {
        text-align: center;
        color: var(--text-muted);
        padding: 2rem;
        font-style: italic;
    }
    
    @media (max-width: 768px) {
        .cart-item {
            flex-direction: column;
            gap: 1rem;
        }
        
        .item-actions {
            flex-direction: row;
            margin-left: 0;
        }
        
        .cart-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(style);

// Initialize Common Cart
const cartApp = new CommonCart();
