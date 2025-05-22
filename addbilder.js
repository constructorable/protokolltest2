document.addEventListener('DOMContentLoaded', function () {
    // Konfiguration für alle Räume
    const roomConfigs = [
        {
            name: 'kueche',
            uploadBtnSelector: '.kueche .bilder-upload-btn',
            cameraBtnSelector: '.kueche .foto-upload-btn',
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
            const [uploadBtn, cameraBtn, thumbnailContainer] = await Promise.all([
                waitForElement(room.uploadBtnSelector),
                waitForElement(room.cameraBtnSelector),
                waitForElement(room.thumbnailContainerSelector)
            ]);

            const galleryContainer = document.getElementById(room.galleryContainerId);
            const titleElement = document.getElementById(room.titleElementId);

            console.log(`Successfully initialized ${room.name}:`, {
                uploadBtn,
                cameraBtn,
                thumbnailContainer,
                galleryContainer,
                titleElement
            });

            uploadBtn.addEventListener('click', () => {
                handleImageUpload(
                    roomImages[room.name],
                    thumbnailContainer,
                    galleryContainer,
                    titleElement
                );
            });

            cameraBtn.addEventListener('click', () => {
                handleCameraCapture(
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

    // Zentrale Upload-Funktion
    async function handleImageUpload(bilderArray, thumbnailContainer, galleryContainer, titleElement) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async function (e) {
            const files = e.target.files;
            if (files.length > 0) {
                for (const file of Array.from(files)) {
                    try {
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

                    } catch (error) {
                        console.error('Fehler beim Verarbeiten des Bildes:', error);
                    }
                }
            }
        };

        input.click();
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

        async function handleCameraCapture(bilderArray, thumbnailContainer, galleryContainer, titleElement) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Kamera-Zugriff wird in diesem Browser nicht unterstützt oder ist blockiert.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Create camera preview modal
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            modal.style.zIndex = '1000';
            modal.style.display = 'flex';
            modal.style.flexDirection = 'column';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            
            const video = document.createElement('video');
            video.autoplay = true;
            video.srcObject = stream;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '80vh';
            
            const buttonContainer = document.createElement('div');
            buttonContainer.style.marginTop = '20px';
            buttonContainer.style.display = 'flex';
            buttonContainer.style.gap = '10px';
            
            const captureBtn = document.createElement('button');
            captureBtn.textContent = 'Foto aufnehmen';
            captureBtn.style.padding = '10px 20px';
            captureBtn.style.fontSize = '16px';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Abbrechen';
            cancelBtn.style.padding = '10px 20px';
            cancelBtn.style.fontSize = '16px';
            
            buttonContainer.appendChild(captureBtn);
            buttonContainer.appendChild(cancelBtn);
            
            modal.appendChild(video);
            modal.appendChild(buttonContainer);
            document.body.appendChild(modal);
            
            // Handle capture
            captureBtn.addEventListener('click', async () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Stop all tracks in the stream
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Remove modal
                    document.body.removeChild(modal);
                    
                    // Process the captured image
                    canvas.toBlob(async (blob) => {
                        try {
                            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
                            const originalImage = await loadImage(file);

                            const resizedBlob = await resizeImage(originalImage, 3500, 3500);
                            const resizedUrl = URL.createObjectURL(resizedBlob);

                            const thumbnailBlob = await resizeImage(originalImage, 75, 75);
                            const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

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
                        } catch (error) {
                            console.error('Fehler beim Verarbeiten des aufgenommenen Bildes:', error);
                        }
                    }, 'image/jpeg', 0.9);
                } catch (error) {
                    console.error('Fehler beim Aufnehmen des Fotos:', error);
                    stream.getTracks().forEach(track => track.stop());
                    document.body.removeChild(modal);
                }
            });
            
            // Handle cancel
            cancelBtn.addEventListener('click', () => {
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(modal);
            });
            
        } catch (error) {
            console.error('Fehler beim Zugriff auf die Kamera:', error);
            if (error.name === 'NotAllowedError') {
                alert('Kamera-Zugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.');
            }
        }
    }
    
});
