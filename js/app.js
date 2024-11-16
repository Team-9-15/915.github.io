// js/app.js
class RoutePlanner {
    constructor() {
        this.mapManager = new MapManager();
        this.impactCalculator = new ImpactCalculator();
        this.photoManager = new PhotoManager();
        this.initializeUI();
    }

    initializeUI() {
        this.createTransportModeButtons();
        this.setupEventListeners();
    }

    createTransportModeButtons() {
        const container = document.querySelector('.transport-modes');
        Object.entries(CONFIG.transportModes).forEach(([mode, data]) => {
            const button = document.createElement('button');
            button.className = 'mode-button';
            button.dataset.mode = mode;
            button.textContent = data.name;
            container.appendChild(button);
        });
    }

    setupEventListeners() {
        document.querySelector('.route-inputs').addEventListener('change', () => {
            this.updateRoute();
        });

        document.querySelectorAll('.mode-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleModeSelection(e.target.dataset.mode);
            });
        });
    }

    async updateRoute() {
        try {
            const start = document.getElementById('start').value;
            const end = document.getElementById('end').value;
            const mode = document.querySelector('.mode-button.active').dataset.mode;
    
            if (start && end) {
                // Show loading state
                this.showLoading();
    
                // Calculate route
                const routeData = await this.mapManager.calculateRoute(start, end, mode);
                
                // Get elevation data
                const elevationData = await this.mapManager.getElevationProfile(routeData.segments);
                
                // Display elevation profile
                if (elevationData) {
                    this.mapManager.displayElevationProfile(elevationData);
                }
    
                // Calculate impacts
                const impacts = this.calculateImpacts(routeData, mode);
                this.impactCalculator.visualizeImpacts(impacts);
    
                // Hide loading state
                this.hideLoading();
            }
        } catch (error) {
            console.error('Route update failed:', error);
            this.showError('Failed to calculate route. Please try again.');
            this.hideLoading();
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
