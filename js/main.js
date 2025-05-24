
// Main JavaScript file for HIVE app
class HIVEApp {
    constructor() {
        this.initTheme();
        this.initNavigation();
        this.initAnimations();
        this.initMobileMenu();
    }

    // Theme Management
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('hive-theme') || 'light';
        
        this.setTheme(savedTheme);
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hive-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Mobile Menu Management
    initMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('active');
                
                if (isOpen) {
                    mobileMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                } else {
                    mobileMenu.classList.add('active');
                    menuToggle.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // Navigation
    initNavigation() {
        // Back button functionality
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                window.history.back();
            });
        });
    }

    // Animations
    initAnimations() {
        // Add fade-in animation to cards when they come into view
        const cards = document.querySelectorAll('.feature-card, .mobile-card, .result-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // Utility Methods
    static showMessage(message, type = 'success') {
        const messageEl = document.createElement('div');
        messageEl.className = `mobile-message ${type}`;
        messageEl.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageEl, container.firstChild);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Navigation function for homepage
function navigateTo(page) {
    window.location.href = page;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HIVEApp();
});

// Export for use in other modules
window.HIVEApp = HIVEApp;
