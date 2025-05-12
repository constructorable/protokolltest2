document.addEventListener('DOMContentLoaded', function() {
    // Küche Toggle
    const kuecheRadios = document.querySelectorAll('input[name="kuchvor"]');
    const kuecheContainer = document.getElementById('kueche-container');
    const kuecheGalerie = document.getElementById('kueche-galerie');
    const kuecheGalerieTitle = document.getElementById('kueche-galerie-title');
   
    // Badezimmer Toggle
    const badRadios = document.querySelectorAll('input[name="bad-vorhanden"]');
    const badContainer = document.getElementById('bad-container');
    const badGalerie = document.getElementById('bad-galerie');
    const badGalerieTitle = document.getElementById('bad-galerie-title');
   
    // Initialen Zustand setzen
    updateRoomVisibility();
   
    // Event Listener für Küche
    kuecheRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateRoomVisibility();
        });
    });
   
    // Event Listener für Badezimmer
    badRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateRoomVisibility();
        });
    });

    // Prüfe die Bildergalerien sofort und bei Änderungen
    checkGalleryImages();
    
    // Observer für Änderungen in den Galerien (für neue hochgeladene Bilder)
    observeGalleryChanges();
   
    function updateRoomVisibility() {
        // Küche Sichtbarkeit
        const kuecheVorhanden = document.querySelector('input[name="kuchvor"]:checked')?.value === 'ja';
        toggleSection(kuecheContainer, kuecheVorhanden);
        
        // Die Galerie- und Titel-Sichtbarkeit wird nicht mehr hier gesteuert,
        // sondern in checkGalleryImages() basierend auf Bildervorhandensein
        
        // Badezimmer Sichtbarkeit
        const badVorhanden = document.querySelector('input[name="bad-vorhanden"]:checked')?.value === 'ja';
        toggleSection(badContainer, badVorhanden);
        
        // Die Galerie- und Titel-Sichtbarkeit wird nicht mehr hier gesteuert,
        // sondern in checkGalleryImages() basierend auf Bildervorhandensein
       
        // Abstand anpassen
        if (badContainer) {
            badContainer.style.marginTop = kuecheVorhanden ? '20px' : '0';
        }
        
        // Nach Änderung der Raumauswahl auch Galerien prüfen
        checkGalleryImages();
    }
   
    function toggleSection(element, show) {
        if (!element) return;
       
        if (show) {
            element.style.display = 'block';
            element.style.animation = 'fadeIn 0.3s ease-in-out';
        } else {
            element.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                element.style.display = 'none';
            }, 300);
        }
    }
    
    // Neue Funktion: Prüft, ob Bilder in den Galerien vorhanden sind
    function checkGalleryImages() {
        checkRoomGallery('kueche', kuecheGalerie, kuecheGalerieTitle);
        checkRoomGallery('bad', badGalerie, badGalerieTitle);
    }
    
    // Prüft einen bestimmten Raum
    function checkRoomGallery(roomType, galleryElement, titleElement) {
        if (!galleryElement || !titleElement) return;
        
        // Prüfen, ob der Raum aktiviert ist (Radio-Button)
        let roomEnabled = false;
        if (roomType === 'kueche') {
            roomEnabled = document.querySelector('input[name="kuchvor"]:checked')?.value === 'ja';
        } else if (roomType === 'bad') {
            roomEnabled = document.querySelector('input[name="bad-vorhanden"]:checked')?.value === 'ja';
        }
        
        // Nur prüfen, wenn der Raum aktiviert ist
        if (!roomEnabled) {
            titleElement.style.display = 'none';
            galleryElement.style.display = 'none';
            return;
        }
        
        // Prüfen, ob Bilder in der Galerie vorhanden sind
        const hasImages = galleryElement.querySelectorAll('img').length > 0;
        
        // Titel und Galerie entsprechend anzeigen oder verstecken
        if (hasImages) {
            titleElement.style.display = 'block';
            galleryElement.style.display = 'block';
            titleElement.style.animation = 'fadeIn 0.3s ease-in-out';
            galleryElement.style.animation = 'fadeIn 0.3s ease-in-out';
        } else {
            titleElement.style.display = 'none';
            galleryElement.style.display = 'none';
        }
    }
    
    // Beobachter für Änderungen in den Galerien einrichten
    function observeGalleryChanges() {
        const config = { childList: true, subtree: true };
        
        // Beobachter für Küchengalerie
        if (kuecheGalerie) {
            const kuecheObserver = new MutationObserver(function() {
                checkRoomGallery('kueche', kuecheGalerie, kuecheGalerieTitle);
            });
            kuecheObserver.observe(kuecheGalerie, config);
        }
        
        // Beobachter für Badgalerie
        if (badGalerie) {
            const badObserver = new MutationObserver(function() {
                checkRoomGallery('bad', badGalerie, badGalerieTitle);
            });
            badObserver.observe(badGalerie, config);
        }
    }
});