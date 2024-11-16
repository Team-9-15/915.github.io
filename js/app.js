// js/app.js
class RoutePlanner {
    constructor() {
        this.mapManager = new MapManager();
        this.impactCalculator = new ImpactCalculator();
        this.photoManager = new PhotoManager();
        this.selectedMode = 'car'; // Default mode
        this.initializeUI();
    }

    initializeUI() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add button click handler
        document.getElementById('calculate-route').addEventListener('click', () => {
            this.updateRoute();
        });

        // Add enter key handler for inputs
        const inputs = ['start', 'end'].map(id => document.getElementById(id));
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.updateRoute();
                }
            });
        });

        // Mode selection
        document.querySelectorAll('.mode-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleModeSelection(e.target.dataset.mode);
            });
        });
    }

    handleModeSelection(mode) {
        // Remove active class from all buttons
        document.querySelectorAll('.mode-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected button
        const selectedButton = document.querySelector(`[data-mode="${mode}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
            this.selectedMode = mode;
        }
    }

    async updateRoute() {
        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;

        if (!start || !end) {
            alert('Please enter both start and end locations');
            return;
        }

        try {
            // Disable the calculate button and show loading state
            const calculateButton = document.getElementById('calculate-route');
            calculateButton.disabled = true;
            calculateButton.textContent = 'Calculating...';

            const routeData = await this.mapManager.calculateRoute(start, end, this.selectedMode);
            const impacts = this.calculateImpacts(routeData, this.selectedMode);
            this.impactCalculator.visualizeImpacts(impacts);

        } catch (error) {
            console.error('Failed to calculate route:', error);
            alert('Failed to calculate route. Please try again.');
        } finally {
            // Re-enable the calculate button
            const calculateButton = document.getElementById('calculate-route');
            calculateButton.disabled = false;
            calculateButton.textContent = 'Calculate Route';
        }
    }

    calculateImpacts(routeData, mode) {
        // Calculate all impact scores
        return {
            carbon: this.impactCalculator.calculateCarbonFootprint(routeData.distance, mode),
            pain: this.impactCalculator.calculatePainScore(routeData),
            time: this.impactCalculator.calculateTimeImpact(routeData, mode),
            health: this.impactCalculator.calculateHealthImpact(mode)
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new RoutePlanner();
});
