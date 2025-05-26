document.addEventListener('DOMContentLoaded', function () {
    // Konfiguration für alle Räume
    const roomConfigs = [
        {
            name: 'kueche',
            uploadBtnSelector: '.kueche .bilder-upload-btn',
            thumbnailContainerSelector: '.kueche .bilder-thumbnails',
            galleryContainerId: 'kueche-galerie',
            titleElementId: 'kueche-galerie-title'
        },
        {
            name: 'badezimmer',
            uploadBtnSelector: '.badezimmer .bilder-upload-btn',
            thumbnailContainerSelector: '.badezimmer .bilder-thumbnails',
            galleryContainerId: 'bad-galerie',
            titleElementId: 'bad-galerie-title'
        },
        {
            name: 'wc',
            uploadBtnSelector: '.wc .bilder-upload-btn',
            thumbnailContainerSelector: '.wc .bilder-thumbnails',
            galleryContainerId: 'wc-galerie',
            titleElementId: 'wc-galerie-title'
        },
        {
            name: 'flur',
            uploadBtnSelector: '.flur .bilder-upload-btn',
            thumbnailContainerSelector: '.flur .bilder-thumbnails',
            galleryContainerId: 'flur-galerie',
            titleElementId: 'flur-galerie-title'
        },
        {
            name: 'abstellraum',
            uploadBtnSelector: '.abstellraum .bilder-upload-btn',
            thumbnailContainerSelector: '.abstellraum .bilder-thumbnails',
            galleryContainerId: 'abstellraum-galerie',
            titleElementId: 'abstellraum-galerie-title'
        },
        {
            name: 'nebenraum',
            uploadBtnSelector: '.nebenraum .bilder-upload-btn',
            thumbnailContainerSelector: '.nebenraum .bilder-thumbnails',
            galleryContainerId: 'nebenraum-galerie',
            titleElementId: 'nebenraum-galerie-title'
        }
    ];

    // Bildersammlung für alle Räume
    const roomImages = {};
    roomConfigs.forEach(room => {
        roomImages[room.name] = [];
    });

    // Hilfsfunktion zum Warten auf Elemente
    function waitForElement(selector) {
        return new Promise(resolve => {
            const element = document.querySelector(selector);
            if (element) {
                return resolve(element);
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // Initialisierung für jeden Raum
    async function initializeRoom(room) {
        try {
            const [uploadBtn, thumbnailContainer] = await Promise.all([
                waitForElement(room.uploadBtnSelector),
                waitForElement(room.thumbnailContainerSelector)
            ]);

            const galleryContainer = document.getElementById(room.galleryContainerId);
            const titleElement = document.getElementById(room.titleElementId);

            console.log(`Successfully initialized ${room.name}:`, {
                uploadBtn,
                thumbnailContainer,
                galleryContainer,
                titleElement
            });

            // Event Listener für Upload-Button
            uploadBtn.addEventListener('click', () => {
                showImageSourceDialog(
                    roomImages[room.name],
                    thumbnailContainer,
                    galleryContainer,
                    titleElement
                );
            });

            // Event Delegation für Löschen von Thumbnails
            thumbnailContainer.addEventListener('click', function (e) {
                if (e.target.classList.contains('thumbnail-remove')) {
                    const index = e.target.getAttribute('data-index');

                    // URLs freigeben
                    if (roomImages[room.name][index]) {
                        URL.revokeObjectURL(roomImages[room.name][index].originalUrl);
                        URL.revokeObjectURL(roomImages[room.name][index].thumbnailUrl);
                        URL.revokeObjectURL(roomImages[room.name][index].galerieUrl);
                    }

                    roomImages[room.name].splice(index, 1);
                    updateThumbnails(roomImages[room.name], thumbnailContainer);
                    updateGalerie(roomImages[room.name], galleryContainer, titleElement);
                }
            });

            // Initiale Galerie aktualisieren
            updateGalerie(roomImages[room.name], galleryContainer, titleElement);

        } catch (error) {
            console.error(`Error initializing ${room.name}:`, error);
        }
    }

    // Dialog zur Auswahl der Bildquelle anzeigen
    function showImageSourceDialog(bilderArray, thumbnailContainer, galleryContainer, titleElement) {
        // Nur auf mobilen Geräten den Dialog anzeigen
        if (isMobileDevice()) {
            const dialog = document.createElement('div');
            dialog.style.position = 'fixed';
            dialog.style.top = '0';
            dialog.style.left = '0';
            dialog.style.width = '100%';
            dialog.style.height = '100%';
            dialog.style.backgroundColor = 'rgba(0,0,0,0.7)';
            dialog.style.display = 'flex';
            dialog.style.flexDirection = 'column';
            dialog.style.justifyContent = 'center';
            dialog.style.alignItems = 'center';
            dialog.style.zIndex = '1000';
            
            const dialogContent = document.createElement('div');
            dialogContent.style.backgroundColor = 'white';
            dialogContent.style.padding = '20px';
            dialogContent.style.borderRadius = '10px';
            dialogContent.style.textAlign = 'center';
            
            const title = document.createElement('h3');
            title.textContent = 'Bildquelle wählen';
            dialogContent.appendChild(title);
            
            const cameraBtn = document.createElement('button');
            cameraBtn.textContent = 'Kamera verwenden';
            cameraBtn.style.margin = '10px';
            cameraBtn.style.padding = '10px 20px';
            cameraBtn.style.backgroundColor = '#4CAF50';
            cameraBtn.style.color = 'white';
            cameraBtn.style.border = 'none';
            cameraBtn.style.borderRadius = '5px';
            cameraBtn.style.cursor = 'pointer';
            
            const galleryBtn = document.createElement('button');
            galleryBtn.textContent = 'Aus Galerie wählen';
            galleryBtn.style.margin = '10px';
            galleryBtn.style.padding = '10px 20px';
            galleryBtn.style.backgroundColor = '#2196F3';
            galleryBtn.style.color = 'white';
            galleryBtn.style.border = 'none';
            galleryBtn.style.borderRadius = '5px';
            galleryBtn.style.cursor = 'pointer';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Abbrechen';
            cancelBtn.style.margin = '10px';
            cancelBtn.style.padding = '10px 20px';
            cancelBtn.style.backgroundColor = '#f44336';
            cancelBtn.style.color = 'white';
            cancelBtn.style.border = 'none';
            cancelBtn.style.borderRadius = '5px';
            cancelBtn.style.cursor = 'pointer';
            
            cameraBtn.addEventListener('click', () => {
                document.body.removeChild(dialog);
                handleCameraImage(bilderArray, thumbnailContainer, galleryContainer, titleElement);
            });
            
            galleryBtn.addEventListener('click', () => {
                document.body.removeChild(dialog);
                handleImageUpload(bilderArray, thumbnailContainer, galleryContainer, titleElement);
            });
            
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(dialog);
            });
            
            dialogContent.appendChild(cameraBtn);
            dialogContent.appendChild(galleryBtn);
            dialogContent.appendChild(cancelBtn);
            dialog.appendChild(dialogContent);
            document.body.appendChild(dialog);
        } else {
            // Auf Desktop direkt den Dateiauswahldialog öffnen
            handleImageUpload(bilderArray, thumbnailContainer, galleryContainer, titleElement);
        }
    }

    // Funktion zur Erkennung mobiler Geräte
    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }

    // Kamera-Funktion
// [Vorheriger Code bleibt gleich bis zur handleCameraImage Funktion]

// Kamera-Funktion mit Rückkamera-Priorisierung
function handleCameraImage(bilderArray, thumbnailContainer, galleryContainer, titleElement) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Konfiguration für Rückkamera (environment)
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' }, // Priorisiert Rückkamera
                width: { ideal: 1920 },  // Höhere Auflösung für bessere Qualität
                height: { ideal: 1080 }
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                // Video-Element erstellen
                const video = document.createElement('video');
                video.style.position = 'fixed';
                video.style.top = '0';
                video.style.left = '0';
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.zIndex = '1000';
                video.style.backgroundColor = 'black';
                video.srcObject = stream;
                video.play();
                
                // Kamera-Info anzeigen (optional)
                const cameraInfo = document.createElement('div');
                cameraInfo.style.position = 'fixed';
                cameraInfo.style.top = '20px';
                cameraInfo.style.left = '0';
                cameraInfo.style.width = '100%';
                cameraInfo.style.textAlign = 'center';
                cameraInfo.style.color = 'white';
                cameraInfo.style.zIndex = '1001';
                cameraInfo.textContent = 'Rückkamera aktiv - Zimmer fotografieren';
                document.body.appendChild(cameraInfo);
                
                // Kontroll-Elemente erstellen
                const controls = document.createElement('div');
                controls.style.position = 'fixed';
                controls.style.bottom = '20px';
                controls.style.left = '0';
                controls.style.width = '100%';
                controls.style.display = 'flex';
                controls.style.justifyContent = 'center';
                controls.style.zIndex = '1001';
                
                const captureBtn = document.createElement('button');
                captureBtn.textContent = 'Foto aufnehmen';
                captureBtn.style.padding = '15px 30px';
                captureBtn.style.backgroundColor = '#4CAF50';
                captureBtn.style.color = 'white';
                captureBtn.style.border = 'none';
                captureBtn.style.borderRadius = '5px';
                captureBtn.style.margin = '0 10px';
                captureBtn.style.cursor = 'pointer';
                
                const switchCameraBtn = document.createElement('button');
                switchCameraBtn.textContent = 'Kamera wechseln';
                switchCameraBtn.style.padding = '15px 30px';
                switchCameraBtn.style.backgroundColor = '#FF9800';
                switchCameraBtn.style.color = 'white';
                switchCameraBtn.style.border = 'none';
                switchCameraBtn.style.borderRadius = '5px';
                switchCameraBtn.style.margin = '0 10px';
                switchCameraBtn.style.cursor = 'pointer';
                
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Abbrechen';
                cancelBtn.style.padding = '15px 30px';
                cancelBtn.style.backgroundColor = '#f44336';
                cancelBtn.style.color = 'white';
                cancelBtn.style.border = 'none';
                cancelBtn.style.borderRadius = '5px';
                cancelBtn.style.margin = '0 10px';
                cancelBtn.style.cursor = 'pointer';
                
                captureBtn.addEventListener('click', function() {
                    // Canvas erstellen um das Bild aufzunehmen
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Stream stoppen
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Elemente entfernen
                    document.body.removeChild(video);
                    document.body.removeChild(controls);
                    document.body.removeChild(cameraInfo);
                    
                    // Bild verarbeiten
                    canvas.toBlob(async function(blob) {
                        try {
                            const file = new File([blob], 'room-photo.jpg', { 
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            await processImageFile(file, bilderArray, thumbnailContainer, galleryContainer, titleElement);
                        } catch (error) {
                            console.error('Fehler beim Verarbeiten des Kamerabildes:', error);
                        }
                    }, 'image/jpeg', 0.9); // Hohe Qualität für Raumfotos
                });
                
                // Kamera-Wechsel-Funktion
                let currentFacingMode = 'environment';
                switchCameraBtn.addEventListener('click', function() {
                    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
                    
                    // Neuen Stream mit anderer Kamera erstellen
                    const newConstraints = {
                        video: {
                            facingMode: { ideal: currentFacingMode },
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        }
                    };
                    
                    // Alten Stream stoppen
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Neue Kamera starten
                    navigator.mediaDevices.getUserMedia(newConstraints)
                        .then(function(newStream) {
                            video.srcObject = newStream;
                            stream = newStream;
                            cameraInfo.textContent = currentFacingMode === 'environment' 
                                ? 'Rückkamera aktiv - Zimmer fotografieren' 
                                : 'Frontkamera aktiv';
                        })
                        .catch(function(error) {
                            console.error('Kamerawechsel fehlgeschlagen:', error);
                        });
                });
                
                cancelBtn.addEventListener('click', function() {
                    // Stream stoppen und Elemente entfernen
                    stream.getTracks().forEach(track => track.stop());
                    document.body.removeChild(video);
                    document.body.removeChild(controls);
                    document.body.removeChild(cameraInfo);
                });
                
                controls.appendChild(captureBtn);
                controls.appendChild(switchCameraBtn);
                controls.appendChild(cancelBtn);
                document.body.appendChild(video);
                document.body.appendChild(controls);
            })
            .catch(function(error) {
                console.error('Rückkamera konnte nicht gestartet werden:', error);
                // Fallback: Versuche mit beliebiger Kamera
                const fallbackConstraints = { video: true };
                navigator.mediaDevices.getUserMedia(fallbackConstraints)
                    .then(function(stream) {
                        // ... gleiche Implementierung wie oben ...
                    })
                    .catch(function(fallbackError) {
                        console.error('Auch Fallback-Kamera konnte nicht gestartet werden:', fallbackError);
                        // Finaler Fallback zum normalen Upload
                        handleImageUpload(bilderArray, thumbnailContainer, galleryContainer, titleElement);
                    });
            });
    } else {
        // Kamera-API nicht verfügbar, Fallback zum normalen Upload
        handleImageUpload(bilderArray, thumbnailContainer, galleryContainer, titleElement);
    }
}


    // Zentrale Upload-Funktion (für Galerie)
    function handleImageUpload(bilderArray, thumbnailContainer, galleryContainer, titleElement) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async function (e) {
            const files = e.target.files;
            if (files.length > 0) {
                for (const file of Array.from(files)) {
                    try {
                        await processImageFile(file, bilderArray, thumbnailContainer, galleryContainer, titleElement);
                    } catch (error) {
                        console.error('Fehler beim Verarbeiten des Bildes:', error);
                    }
                }
            }
        };

        input.click();
    }

    // Funktion zum Verarbeiten einer Bilddatei (wiederverwendbar für Kamera und Upload)
    async function processImageFile(file, bilderArray, thumbnailContainer, galleryContainer, titleElement) {
        const originalImage = await loadImage(file);

        // Originalbild (max 3500x3500)
        const resizedBlob = await resizeImage(originalImage, 3500, 3500);
        const resizedUrl = URL.createObjectURL(resizedBlob);

        // Thumbnail (75x75)
        const thumbnailBlob = await resizeImage(originalImage, 75, 75);
        const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

        // Galeriebild (1000x1000)
        const galerieBlob = await resizeImage(originalImage, 1000, 1000);
        const galerieUrl = URL.createObjectURL(galerieBlob);

        const bildData = {
            originalUrl: resizedUrl,
            thumbnailUrl: thumbnailUrl,
            galerieUrl: galerieUrl
        };

        bilderArray.push(bildData);
        updateThumbnails(bilderArray, thumbnailContainer);
        updateGalerie(bilderArray, galleryContainer, titleElement);
    }

    // Funktion zum Aktualisieren der Sichtbarkeit der Titel
    function updateTitleVisibility(container, titleElement) {
        if (!container || !titleElement) return;

        if (container.children.length > 0) {
            titleElement.style.display = 'block';
            titleElement.style.animation = '0.3s ease-in-out fadeIn';
        } else {
            titleElement.style.display = 'none';
        }
    }

    // Funktion zum Resizen von Bildern
    function resizeImage(image, maxWidth, maxHeight, quality = 0.7) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', quality);
        });
    }

    // Hilfsfunktion zum Laden eines Bildes
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Bild konnte nicht geladen werden'));
            };

            img.src = url;
        });
    }

    // Thumbnails aktualisieren
    function updateThumbnails(bilderArray, container) {
        if (!container) return;

        container.innerHTML = '';

        bilderArray.forEach((bild, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            thumb.innerHTML = `
                <img src="${bild.thumbnailUrl}" alt="Foto" style="width:75px; height:75px; object-fit:cover;">
                <button class="thumbnail-remove" data-index="${index}">×</button>
            `;
            container.appendChild(thumb);
        });
    }

    // Galerie aktualisieren
    function updateGalerie(bilderArray, container, titleElement) {
        if (!container || !titleElement) return;

        container.innerHTML = '';

        // Den Raumnamen aus dem Container ableiten (z. B. "kueche-galerie" → "kueche")
        const roomName = container.id.replace('-galerie', '');

        bilderArray.forEach((bild, index) => {
            const bildElement = document.createElement('div');
            bildElement.className = 'galerie-bild';
            bildElement.style.marginBottom = '20px';
            bildElement.innerHTML = `
                <div style="margin-bottom: 5px;">${roomName.charAt(0).toUpperCase() + roomName.slice(1)} – Bild ${index + 1}</div>
                <img src="${bild.galerieUrl}" alt="Foto" style="max-width:1000px;">
            `;
            container.appendChild(bildElement);
        });

        updateTitleVisibility(container, titleElement);
    }

    // Alle Räume initialisieren
    roomConfigs.forEach(room => {
        initializeRoom(room);
    });
});
