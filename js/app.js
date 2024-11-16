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
        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;
        const mode = document.querySelector('.mode-button.active').dataset.mode;

        if (start && end) {
            const routeData = await this.mapManager.calculateRoute(start, end, mode);
            const impacts = this.calculateImpacts(routeData, mode);
            this.impactCalculator.visualizeImpacts(impacts);
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
