// Expense & Budget Visualizer - Main Application
class ExpenseTracker {
    constructor() {
        this.transactions = [];
        this.customCategories = new Set(['Food', 'Transport', 'Fun']);
        this.chart = null;
        this.currentTheme = 'light';
        
        this.init();
    }

    // Initialize the application
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupTheme();
        this.updateUI();
        this.renderChart();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('expenseForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Custom category functionality
        const showCustomBtn = document.getElementById('showCustomCategory');
        const addCustomBtn = document.getElementById('addCustomCategory');
        const customCategoryInput = document.getElementById('customCategory');

        showCustomBtn.addEventListener('click', () => this.toggleCustomCategory());
        addCustomBtn.addEventListener('click', () => this.addCustomCategory());
        customCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addCustomCategory();
            }
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Monthly summary toggle
        const summaryToggle = document.getElementById('toggleSummary');
        summaryToggle.addEventListener('click', () => this.toggleMonthlySummary());

        // Clear all button
        const clearAllBtn = document.getElementById('clearAll');
        clearAllBtn.addEventListener('click', () => this.clearAllTransactions());

        // Form input validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const formData = new FormData(e.target);
        const transaction = {
            id: Date.now().toString(),
            name: formData.get('itemName').trim(),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.addTransaction(transaction);
        this.resetForm();
    }

    // Validate entire form
    validateForm() {
        const form = document.getElementById('expenseForm');
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Validate individual field
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = `${this.getFieldLabel(fieldName)} is required`;
            isValid = false;
        }
        // Amount specific validation
        else if (fieldName === 'amount' && value) {
            const amount = parseFloat(value);
            if (isNaN(amount) || amount <= 0) {
                errorMessage = 'Amount must be a positive number';
                isValid = false;
            } else if (amount > 999999.99) {
                errorMessage = 'Amount is too large';
                isValid = false;
            }
        }
        // Item name specific validation
        else if (fieldName === 'itemName' && value) {
            if (value.length > 50) {
                errorMessage = 'Item name is too long (max 50 characters)';
                isValid = false;
            }
        }

        // Show error if validation failed
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    // Show field error
    showFieldError(field, message) {
        field.classList.add('error');
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // Clear field error
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = document.getElementById(field.name + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // Get user-friendly field label
    getFieldLabel(fieldName) {
        const labels = {
            'itemName': 'Item Name',
            'amount': 'Amount',
            'category': 'Category'
        };
        return labels[fieldName] || fieldName;
    }

    // Add new transaction
    addTransaction(transaction) {
        this.transactions.unshift(transaction); // Add to beginning for recent-first display
        this.saveToStorage();
        this.updateUI();
        this.renderChart();
        
        // Show success animation
        this.showSuccessMessage('Transaction added successfully!');
    }

    // Delete transaction
    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index > -1) {
            this.transactions.splice(index, 1);
            this.saveToStorage();
            this.updateUI();
            this.renderChart();
            this.showSuccessMessage('Transaction deleted!');
        }
    }

    // Clear all transactions
    clearAllTransactions() {
        if (this.transactions.length === 0) return;

        if (confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
            this.transactions = [];
            this.saveToStorage();
            this.updateUI();
            this.renderChart();
            this.showSuccessMessage('All transactions cleared!');
        }
    }

    // Update all UI elements
    updateUI() {
        this.updateBalance();
        this.renderTransactionsList();
        this.updateMonthlySummary();
        this.toggleClearAllButton();
    }

    // Update total balance display
    updateBalance() {
        const total = this.transactions.reduce((sum, t) => sum + t.amount, 0);
        const balanceElement = document.getElementById('totalBalance');
        balanceElement.textContent = this.formatCurrency(-total); // Negative because these are expenses
    }

    // Render transactions list
    renderTransactionsList() {
        const listElement = document.getElementById('transactionsList');
        const noTransactionsMsg = document.getElementById('noTransactionsMessage');

        if (this.transactions.length === 0) {
            listElement.style.display = 'none';
            noTransactionsMsg.style.display = 'block';
            return;
        }

        listElement.style.display = 'flex';
        noTransactionsMsg.style.display = 'none';

        listElement.innerHTML = this.transactions.map(transaction => `
            <li class="transaction-item category-${transaction.category.toLowerCase().replace(/\s+/g, '-')}" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-name">${this.escapeHtml(transaction.name)}</div>
                    <span class="transaction-category">${this.escapeHtml(transaction.category)}</span>
                </div>
                <div class="transaction-amount">${this.formatCurrency(transaction.amount)}</div>
                <button class="delete-btn" onclick="app.deleteTransaction('${transaction.id}')" aria-label="Delete transaction">
                    ✕
                </button>
            </li>
        `).join('');
    }

    // Toggle custom category section
    toggleCustomCategory() {
        const section = document.getElementById('customCategorySection');
        const button = document.getElementById('showCustomCategory');
        
        if (section.style.display === 'none') {
            section.style.display = 'block';
            button.textContent = '- Hide Custom Category';
            document.getElementById('customCategory').focus();
        } else {
            section.style.display = 'none';
            button.textContent = '+ Add Custom Category';
        }
    }

    // Add custom category
    addCustomCategory() {
        const input = document.getElementById('customCategory');
        const category = input.value.trim();

        if (!category) {
            this.showFieldError(input, 'Category name is required');
            return;
        }

        if (category.length > 20) {
            this.showFieldError(input, 'Category name is too long (max 20 characters)');
            return;
        }

        if (this.customCategories.has(category)) {
            this.showFieldError(input, 'Category already exists');
            return;
        }

        this.customCategories.add(category);
        this.updateCategoryDropdown();
        
        // Select the new category and hide the custom section
        const categorySelect = document.getElementById('category');
        categorySelect.value = category;
        
        input.value = '';
        this.toggleCustomCategory();
        this.saveCustomCategories();
        
        this.showSuccessMessage(`Category "${category}" added!`);
    }

    // Update category dropdown
    updateCategoryDropdown() {
        const select = document.getElementById('category');
        const currentValue = select.value;
        
        // Keep the default option and rebuild the rest
        select.innerHTML = '<option value="">Select a category</option>';
        
        Array.from(this.customCategories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        
        // Restore selection if it still exists
        if (this.customCategories.has(currentValue)) {
            select.value = currentValue;
        }
    }

    // Toggle theme
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // Set theme
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        
        localStorage.setItem('expenseTrackerTheme', theme);
        
        // Re-render chart with new theme
        setTimeout(() => this.renderChart(), 100);
    }

    // Setup theme from storage
    setupTheme() {
        const savedTheme = localStorage.getItem('expenseTrackerTheme') || 'light';
        this.setTheme(savedTheme);
    }

    // Toggle monthly summary
    toggleMonthlySummary() {
        const summary = document.getElementById('monthlySummary');
        const button = document.getElementById('toggleSummary');
        
        if (summary.style.display === 'none') {
            summary.style.display = 'block';
            button.textContent = 'Hide Monthly Summary';
            this.updateMonthlySummary();
        } else {
            summary.style.display = 'none';
            button.textContent = 'Show Monthly Summary';
        }
    }

    // Update monthly summary
    updateMonthlySummary() {
        const summaryContent = document.getElementById('summaryContent');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        if (monthlyTransactions.length === 0) {
            summaryContent.innerHTML = '<p class="no-data-message">No transactions this month</p>';
            return;
        }

        const categoryTotals = this.getCategoryTotals(monthlyTransactions);
        const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        summaryContent.innerHTML = `
            <h4>Summary for ${monthName}</h4>
            <div class="summary-stats">
                <div class="summary-item">
                    <span class="category">Total Transactions</span>
                    <span class="amount">${monthlyTransactions.length}</span>
                </div>
                <div class="summary-item">
                    <span class="category">Total Spent</span>
                    <span class="amount">${this.formatCurrency(monthlyTransactions.reduce((sum, t) => sum + t.amount, 0))}</span>
                </div>
            </div>
            <div class="category-breakdown">
                ${Object.entries(categoryTotals).map(([category, amount]) => `
                    <div class="summary-item">
                        <span class="category">${this.escapeHtml(category)}</span>
                        <span class="amount">${this.formatCurrency(amount)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Get category totals
    getCategoryTotals(transactions = this.transactions) {
        return transactions.reduce((totals, transaction) => {
            totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
            return totals;
        }, {});
    }

    // Toggle clear all button visibility
    toggleClearAllButton() {
        const clearAllBtn = document.getElementById('clearAll');
        clearAllBtn.style.display = this.transactions.length > 0 ? 'block' : 'none';
    }

    // Render chart (placeholder for Chart.js integration)
    renderChart() {
        const canvas = document.getElementById('expenseChart');
        const noDataMessage = document.getElementById('noDataMessage');

        if (this.transactions.length === 0) {
            canvas.style.display = 'none';
            noDataMessage.style.display = 'block';
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
            return;
        }

        canvas.style.display = 'block';
        noDataMessage.style.display = 'none';

        this.createPieChart();
    }

    // Create pie chart using Chart.js
    createPieChart() {
        const canvas = document.getElementById('expenseChart');
        const ctx = canvas.getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        const categoryTotals = this.getCategoryTotals();
        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);

        // Color scheme that works with both themes
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
            '#00D2D3', '#FF9F43', '#EE5A24', '#0984E3'
        ];

        const isDarkTheme = this.currentTheme === 'dark';
        const textColor = isDarkTheme ? '#ffffff' : '#212529';

        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderColor: isDarkTheme ? '#2d2d2d' : '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                const percentage = ((context.parsed / amounts.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    // Reset form
    resetForm() {
        const form = document.getElementById('expenseForm');
        form.reset();
        
        // Clear any error states
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => this.clearFieldError(input));
        
        // Hide custom category section if visible
        const customSection = document.getElementById('customCategorySection');
        if (customSection.style.display !== 'none') {
            this.toggleCustomCategory();
        }
        
        // Focus on first input
        document.getElementById('itemName').focus();
    }

    // Show success message
    showSuccessMessage(message) {
        // Create and show a temporary success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Save data to localStorage
    saveToStorage() {
        localStorage.setItem('expenseTrackerData', JSON.stringify(this.transactions));
    }

    // Save custom categories to localStorage
    saveCustomCategories() {
        localStorage.setItem('expenseTrackerCategories', JSON.stringify(Array.from(this.customCategories)));
    }

    // Load data from localStorage
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem('expenseTrackerData');
            if (savedData) {
                this.transactions = JSON.parse(savedData);
            }

            const savedCategories = localStorage.getItem('expenseTrackerCategories');
            if (savedCategories) {
                this.customCategories = new Set(JSON.parse(savedCategories));
            }
            
            this.updateCategoryDropdown();
        } catch (error) {
            console.error('Error loading data from storage:', error);
            this.transactions = [];
            this.customCategories = new Set(['Food', 'Transport', 'Fun']);
        }
    }

    // Utility function to format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ExpenseTracker();
});

// Add CSS for success notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);