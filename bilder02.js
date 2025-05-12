// bilder03.js - Bildverwaltung für Küche und Badezimmer mit Galerieanzeige
document.addEventListener('DOMContentLoaded', function() {
    // Küche Bildverwaltung
    const kuecheUploadBtn = document.querySelector('.kueche .bilder-upload-btn');
    const kuecheThumbnailContainer = document.querySelector('.kueche .bilder-thumbnails');
    const kuecheGalerieContainer = document.querySelector('.kueche-galerie');
    let kuecheBilder = [];
    
    // Badezimmer Bildverwaltung
    const badezimmerUploadBtn = document.querySelector('.badezimmer .bilder-upload-btn');
    const badezimmerThumbnailContainer = document.querySelector('.badezimmer .bilder-thumbnails');
    const badezimmerGalerieContainer = document.querySelector('.badezimmer-galerie');
    let badezimmerBilder = [];
    
    // Küche Funktionen
    kuecheUploadBtn.addEventListener('click', function() {
        handleImageUpload(kuecheBilder, kuecheThumbnailContainer, kuecheGalerieContainer);
    });
    
    // Badezimmer Funktionen
    badezimmerUploadBtn.addEventListener('click', function() {
        handleImageUpload(badezimmerBilder, badezimmerThumbnailContainer, badezimmerGalerieContainer);
    });
    
    // Gemeinsame Funktion für Bild-Upload
    function handleImageUpload(bilderArray, thumbnailContainer, galerieContainer) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        
        input.onchange = function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        const bildData = {
                            url: event.target.result,
                            name: file.name
                        };
                        
                        bilderArray.push(bildData);
                        updateThumbnails(bilderArray, thumbnailContainer);
                        updateGalerie(bilderArray, galerieContainer);
                    };
                    
                    reader.readAsDataURL(file);
                });
            }
        };
        
        input.click();
    }
    
    function updateThumbnails(bilderArray, container) {
        container.innerHTML = '';
        
        bilderArray.forEach((bild, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            thumb.innerHTML = `
                <img src="${bild.url}" alt="Foto">
                <span class="thumbnail-name">${bild.name}</span>
                <button class="thumbnail-remove" data-index="${index}">×</button>
            `;
            container.appendChild(thumb);
        });
    }
    
    function updateGalerie(bilderArray, container) {
        if (!container) return;
        
        container.innerHTML = '';
        
        bilderArray.forEach((bild, index) => {
            const bildElement = document.createElement('div');
            bildElement.className = 'galerie-bild';
            bildElement.innerHTML = `
                <img src="${bild.url}" alt="${bild.name}">
                <div class="galerie-bild-name">${bild.name}</div>
            `;
            container.appendChild(bildElement);
        });
    }
    
    // Event Delegation für Löschen von Thumbnails (Küche)
    kuecheThumbnailContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('thumbnail-remove')) {
            const index = e.target.getAttribute('data-index');
            kuecheBilder.splice(index, 1);
            updateThumbnails(kuecheBilder, kuecheThumbnailContainer);
            updateGalerie(kuecheBilder, kuecheGalerieContainer);
        }
    });
    
    // Event Delegation für Löschen von Thumbnails (Badezimmer)
    badezimmerThumbnailContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('thumbnail-remove')) {
            const index = e.target.getAttribute('data-index');
            badezimmerBilder.splice(index, 1);
            updateThumbnails(badezimmerBilder, badezimmerThumbnailContainer);
            updateGalerie(badezimmerBilder, badezimmerGalerieContainer);
        }
    });
});