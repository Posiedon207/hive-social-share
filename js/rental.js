
// Item Rental Module
class ItemRental {
    constructor() {
        this.items = this.loadItems();
        this.mockItems = this.generateMockItems();
        this.allItems = [...this.items, ...this.mockItems];
        this.initEventListeners();
        this.renderItems();
    }

    loadItems() {
        return JSON.parse(localStorage.getItem('hive-rental-items') || '[]');
    }

    saveItems() {
        localStorage.setItem('hive-rental-items', JSON.stringify(this.items));
    }

    generateMockItems() {
        return [
            {
                id: 'mock_1',
                name: 'Professional DSLR Camera',
                category: 'electronics',
                imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300',
                condition: 'like-new',
                rentAmount: 25,
                duration: '1 week',
                description: 'Canon EOS 5D Mark IV with 24-70mm lens. Perfect for events and photography.',
                owner: 'Alex Photography',
                rating: 4.8,
                reviews: 12,
                dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                available: true
            },
            {
                id: 'mock_2',
                name: 'Power Drill Set',
                category: 'tools',
                imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300',
                condition: 'good',
                rentAmount: 8,
                duration: '1-3 days',
                description: 'Complete cordless drill set with various bits and batteries.',
                owner: 'Mike\'s Tools',
                rating: 4.5,
                reviews: 8,
                dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                available: true
            },
            {
                id: 'mock_3',
                name: 'Mountain Bike',
                category: 'sports',
                imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300',
                condition: 'good',
                rentAmount: 15,
                duration: 'flexible',
                description: 'Trek mountain bike, great for trails and city riding. Helmet included.',
                owner: 'Sarah Adventures',
                rating: 4.9,
                reviews: 15,
                dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                available: true
            },
            {
                id: 'mock_4',
                name: 'Textbook Collection',
                category: 'books',
                imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
                condition: 'fair',
                rentAmount: 3,
                duration: '1 month',
                description: 'Computer Science textbooks for various courses. Great condition.',
                owner: 'Student Library',
                rating: 4.2,
                reviews: 6,
                dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                available: false
            },
            {
                id: 'mock_5',
                name: 'Projector',
                category: 'electronics',
                imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
                condition: 'new',
                rentAmount: 20,
                duration: '2 weeks',
                description: '4K projector perfect for presentations and movie nights.',
                owner: 'Tech Rentals',
                rating: 4.7,
                reviews: 10,
                dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                available: true
            }
        ];
    }

    initEventListeners() {
        const form = document.getElementById('rentalForm');
        const categoryFilter = document.getElementById('filterCategory');
        const conditionFilter = document.getElementById('filterCondition');
        const sortBy = document.getElementById('sortBy');

        if (form) {
            form.addEventListener('submit', this.handleAddItem.bind(this));
        }

        [categoryFilter, conditionFilter, sortBy].forEach(element => {
            if (element) {
                element.addEventListener('change', this.renderItems.bind(this));
            }
        });
    }

    handleAddItem(e) {
        e.preventDefault();

        const newItem = {
            id: HIVEApp.generateId(),
            name: document.getElementById('itemName').value,
            category: document.getElementById('category').value,
            imageUrl: document.getElementById('imageUrl').value || this.getDefaultImage(document.getElementById('category').value),
            condition: document.getElementById('condition').value,
            rentAmount: parseFloat(document.getElementById('rentAmount').value),
            duration: document.getElementById('duration').value,
            description: document.getElementById('description').value,
            owner: 'You',
            rating: 0,
            reviews: 0,
            dateAdded: new Date(),
            available: true
        };

        this.items.push(newItem);
        this.allItems.push(newItem);
        this.saveItems();
        this.renderItems();

        // Reset form
        e.target.reset();
        
        HIVEApp.showMessage(`${newItem.name} listed successfully!`, 'success');
    }

    getDefaultImage(category) {
        const defaultImages = {
            electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300',
            tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300',
            sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
            books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
            furniture: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
            automotive: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300',
            other: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'
        };
        return defaultImages[category] || defaultImages.other;
    }

    renderItems() {
        const grid = document.getElementById('itemsGrid');
        const categoryFilter = document.getElementById('filterCategory').value;
        const conditionFilter = document.getElementById('filterCondition').value;
        const sortBy = document.getElementById('sortBy').value;

        let filteredItems = this.allItems;

        // Apply filters
        if (categoryFilter) {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }

        if (conditionFilter) {
            filteredItems = filteredItems.filter(item => item.condition === conditionFilter);
        }

        // Apply sorting
        filteredItems.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.rentAmount - b.rentAmount;
                case 'price-high':
                    return b.rentAmount - a.rentAmount;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                default:
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });

        if (filteredItems.length === 0) {
            grid.innerHTML = '<p class="empty-message">No items found matching your criteria.</p>';
            return;
        }

        grid.innerHTML = filteredItems.map(item => `
            <div class="rental-card ${!item.available ? 'unavailable' : ''}">
                <div class="rental-image">
                    <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'">
                    ${!item.available ? '<div class="unavailable-overlay">Not Available</div>' : ''}
                </div>
                
                <div class="rental-info">
                    <h3 class="rental-title">${item.name}</h3>
                    <div class="rental-details">
                        <span class="rental-category">${item.category}</span>
                        <span class="rental-condition condition-${item.condition}">${item.condition}</span>
                    </div>
                    
                    <div class="rental-price">
                        <strong>$${item.rentAmount}/day</strong>
                        <span class="rental-duration">${item.duration}</span>
                    </div>
                    
                    ${item.rating > 0 ? `
                        <div class="rental-rating">
                            <span class="stars">${'★'.repeat(Math.floor(item.rating))}${'☆'.repeat(5 - Math.floor(item.rating))}</span>
                            <span class="rating-text">${item.rating} (${item.reviews} reviews)</span>
                        </div>
                    ` : ''}
                    
                    <p class="rental-description">${item.description}</p>
                    
                    <div class="rental-owner">
                        <small>Listed by ${item.owner}</small>
                        <small>${HIVEApp.formatDate(item.dateAdded)}</small>
                    </div>
                    
                    <div class="rental-actions">
                        ${item.available ? `
                            <button class="btn" onclick="rentalApp.requestRental('${item.id}')">
                                Request Rental
                            </button>
                        ` : `
                            <button class="btn btn-secondary" disabled>
                                Not Available
                            </button>
                        `}
                        ${item.owner === 'You' ? `
                            <button class="btn btn-danger" onclick="rentalApp.deleteItem('${item.id}')">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    requestRental(itemId) {
        const item = this.allItems.find(i => i.id === itemId);
        if (item && item.available) {
            // In a real app, this would send a request to the owner
            HIVEApp.showMessage(`Rental request sent for ${item.name} to ${item.owner}!`, 'success');
        }
    }

    deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this listing?')) {
            this.items = this.items.filter(i => i.id !== itemId);
            this.allItems = this.allItems.filter(i => i.id !== itemId);
            this.saveItems();
            this.renderItems();
            HIVEApp.showMessage('Item deleted successfully!', 'success');
        }
    }
}

// Add rental-specific styles
const style = document.createElement('style');
style.textContent = `
    .rental-controls {
        margin-bottom: 2rem;
    }
    
    .filters {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }
    
    .filters select {
        flex: 1;
        min-width: 150px;
    }
    
    .rental-card {
        background: var(--bg-card);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
        position: relative;
    }
    
    .rental-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-hover);
    }
    
    .rental-card.unavailable {
        opacity: 0.7;
    }
    
    .rental-image {
        position: relative;
        height: 200px;
        overflow: hidden;
    }
    
    .rental-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    
    .rental-card:hover .rental-image img {
        transform: scale(1.05);
    }
    
    .unavailable-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .rental-info {
        padding: 1.5rem;
    }
    
    .rental-title {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
        font-size: 1.25rem;
    }
    
    .rental-details {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .rental-category {
        background: var(--accent-primary);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        text-transform: capitalize;
    }
    
    .rental-condition {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        text-transform: capitalize;
        font-weight: 500;
    }
    
    .condition-new { background: #22c55e; color: white; }
    .condition-like-new { background: #16a34a; color: white; }
    .condition-good { background: #84cc16; color: white; }
    .condition-fair { background: #eab308; color: white; }
    .condition-poor { background: #ef4444; color: white; }
    
    .rental-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        font-size: 1.125rem;
    }
    
    .rental-price strong {
        color: var(--accent-primary);
    }
    
    .rental-duration {
        color: var(--text-muted);
        font-size: 0.875rem;
    }
    
    .rental-rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .stars {
        color: #f59e0b;
        font-size: 1.125rem;
    }
    
    .rating-text {
        color: var(--text-muted);
        font-size: 0.875rem;
    }
    
    .rental-description {
        color: var(--text-secondary);
        margin-bottom: 1rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .rental-owner {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        color: var(--text-muted);
        font-size: 0.875rem;
    }
    
    .rental-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .rental-actions .btn {
        flex: 1;
    }
    
    @media (max-width: 768px) {
        .filters {
            flex-direction: column;
        }
        
        .rental-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// Initialize Item Rental
const rentalApp = new ItemRental();
