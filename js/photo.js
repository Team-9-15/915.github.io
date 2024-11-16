// js/photo.js
class PhotoManager {
    constructor() {
        this.photos = [];
        this.initializePhotoUpload();
    }

    initializePhotoUpload() {
        document.getElementById('photo-input').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });
    }

    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        const category = document.getElementById('photo-category').value;
        
        if (file) {
            try {
                const location = await this.getCurrentLocation();
                const photoData = {
                    file: file,
                    category: category,
                    location: location,
                    timestamp: new Date()
                };
                this.photos.push(photoData);
                this.saveToLocalStorage();
                this.displayPhotoMarker(photoData);
            } catch (error) {
                console.error('Photo upload failed:', error);
            }
        }
    }

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }),
                error => reject(error)
            );
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('routePlannerPhotos', JSON.stringify(this.photos));
    }
}
