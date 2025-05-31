document.addEventListener("DOMContentLoaded", (function () {
    const categories = [{
        name: "kueche",
        uploadBtnSelector: ".kueche .bilder-upload-btn",
        thumbnailContainerSelector: ".kueche .bilder-thumbnails",
        galleryContainerId: "kueche-galerie",
        titleElementId: "kueche-galerie-title"
    }, {
        name: "badezimmer",
        uploadBtnSelector: ".badezimmer .bilder-upload-btn",
        thumbnailContainerSelector: ".badezimmer .bilder-thumbnails",
        galleryContainerId: "bad-galerie",
        titleElementId: "bad-galerie-title"
    }, {
        name: "wc",
        uploadBtnSelector: ".wc .bilder-upload-btn",
        thumbnailContainerSelector: ".wc .bilder-thumbnails",
        galleryContainerId: "wc-galerie",
        titleElementId: "wc-galerie-title"
    }, {
        name: "flur",
        uploadBtnSelector: ".flur .bilder-upload-btn",
        thumbnailContainerSelector: ".flur .bilder-thumbnails",
        galleryContainerId: "flur-galerie",
        titleElementId: "flur-galerie-title"
    }, {
        name: "abstellraum",
        uploadBtnSelector: ".abstellraum .bilder-upload-btn",
        thumbnailContainerSelector: ".abstellraum .bilder-thumbnails",
        galleryContainerId: "abstellraum-galerie",
        titleElementId: "abstellraum-galerie-title"
    }, {
        name: "nebenraum",
        uploadBtnSelector: ".nebenraum .bilder-upload-btn",
        thumbnailContainerSelector: ".nebenraum .bilder-thumbnails",
        galleryContainerId: "nebenraum-galerie",
        titleElementId: "nebenraum-galerie-title"
    }];

    const imagesData = {};

    // Helper-Funktion um Elemente zu finden oder auf ihr Erscheinen zu warten
    async function waitForElement(selector) {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);
            
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

    // Verfügbare Kameras ermitteln
    async function getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Fehler beim Ermitteln der Kameras:', error);
            return [];
        }
    }

    // Touch-optimierte Kameraauswahl
    function showCameraSelectionDialog(cameras, callback) {
        const overlay = document.createElement("div");
        overlay.className = "camera-selection-overlay";
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            touch-action: manipulation;
        `;

        const dialog = document.createElement("div");
        dialog.className = "camera-selection-dialog";
        dialog.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            max-width: 90%;
            width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = document.createElement("h3");
        title.textContent = "Kamera auswählen";
        title.style.cssText = `
            margin: 0 0 20px 0;
            color: #333;
            font-size: 1.4rem;
        `;
        dialog.appendChild(title);

        // Kamera-Buttons erstellen
        cameras.forEach((camera, index) => {
            const button = document.createElement("button");
            button.className = "camera-selection-button";

            let cameraLabel = camera.label || `Kamera ${index + 1}`;
            if (cameraLabel.toLowerCase().includes('back') || cameraLabel.toLowerCase().includes('environment')) {
                cameraLabel = `Rückkamera`;
            } else if (cameraLabel.toLowerCase().includes('front') || cameraLabel.toLowerCase().includes('user')) {
                cameraLabel = `Front (Selfie)`;
            }

            button.textContent = cameraLabel;
            button.style.cssText = `
                display: block;
                width: 100%;
                margin: 10px 0;
                padding: 15px;
                background: linear-gradient(135deg, #466c9c, #466c9c);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.4rem;
                transition: all 0.3s ease;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            `;

            button.addEventListener('touchstart', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.3)';
            });

            button.addEventListener('touchend', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            });

            button.addEventListener('click', () => {
                document.body.removeChild(overlay);
                callback(camera.deviceId);
            });

            dialog.appendChild(button);
        });

        // Abbrechen-Button
        const cancelButton = document.createElement("button");
        cancelButton.className = "cancel-camera-selection";
        cancelButton.textContent = "Abbrechen";
        cancelButton.style.cssText = `
            display: block;
            width: 100%;
            margin: 20px 0 0 0;
            padding: 12px;
            background: rgb(117, 27, 20);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.4rem;
            touch-action: manipulation;
        `;

        cancelButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        dialog.appendChild(cancelButton);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Schließen bei Klick außerhalb des Dialogs
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    // Initialisiert eine Kategorie
    async function initCategory(category) {
        try {
            const [uploadBtn, thumbnailContainer] = await Promise.all([
                waitForElement(category.uploadBtnSelector),
                waitForElement(category.thumbnailContainerSelector)
            ]);
            
            const galleryContainer = document.getElementById(category.galleryContainerId);
            const titleElement = document.getElementById(category.titleElementId);

            console.log(`Successfully initialized ${category.name}:`, {
                uploadBtn,
                thumbnailContainer,
                galleryContainer,
                titleElement
            });

            // Touch-Optimierung für Upload-Button
            uploadBtn.style.cssText += `
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                min-width: 44px;
                min-height: 44px;
            `;

            uploadBtn.addEventListener("click", () => {
                showImageSourceDialog(imagesData[category.name], thumbnailContainer, galleryContainer, titleElement);
            });

            // Thumbnail-Container mit Touch-Optimierung
            thumbnailContainer.addEventListener("click", function (event) {
                if (event.target.classList.contains("thumbnail-remove")) {
                    const index = event.target.getAttribute("data-index");
                    if (imagesData[category.name][index]) {
                        URL.revokeObjectURL(imagesData[category.name][index].originalUrl);
                        URL.revokeObjectURL(imagesData[category.name][index].thumbnailUrl);
                        URL.revokeObjectURL(imagesData[category.name][index].galerieUrl);
                        imagesData[category.name].splice(index, 1);
                        updateThumbnails(imagesData[category.name], thumbnailContainer);
                        updateGallery(imagesData[category.name], galleryContainer, titleElement);
                    }
                }
            });

            updateGallery(imagesData[category.name], galleryContainer, titleElement);
        } catch (error) {
            console.error(`Error initializing ${category.name}:`, error);
        }
    }

    // Zeigt Dialog zur Bildquellen-Auswahl (optimiert für Touch)
    function showImageSourceDialog(imageArray, thumbnailContainer, galleryContainer, titleElement) {
        const isMobile = window.matchMedia("(max-width: 768px)").matches || 
                         void 0 !== window.orientation || 
                         -1 !== navigator.userAgent.indexOf("IEMobile");

        const overlay = document.createElement("div");
        overlay.className = "image-source-overlay";
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            touch-action: manipulation;
        `;

        const dialog = document.createElement("div");
        dialog.className = "image-source-dialog";
        dialog.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            width: ${isMobile ? '90%' : '400px'};
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        const title = document.createElement("h3");
        title.textContent = "Bildquelle wählen";
        title.style.cssText = `
            margin: 0 0 25px 0;
            color: #333;
            font-size: 1.4rem;
        `;
        dialog.appendChild(title);

        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: ${isMobile ? 'column' : 'row'};
            gap: 15px;
            justify-content: center;
        `;

        // Kamera-Button
        const cameraButton = document.createElement("button");
        cameraButton.className = "image-source-button camera";
        cameraButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Kamera
        `;
        cameraButton.style.cssText = `
            flex: ${isMobile ? '1' : '0'};
            min-width: ${isMobile ? '100%' : '140px'};
            padding: 15px;
            background: linear-gradient(135deg, #466c9c, #466c9c);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            min-height: 50px;
        `;

        // Galerie-Button
        const galleryButton = document.createElement("button");
        galleryButton.className = "image-source-button gallery";
        galleryButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
                <path d="M22 16.92V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V16.92M22 16.92C21.5364 15.8583 20.7379 14.9742 19.7286 14.4018C18.7193 13.8293 17.5552 13.5999 16.41 13.75L15.31 13.9C14.3735 14.0275 13.4265 14.0275 12.49 13.9L11.39 13.75C10.2448 13.5999 9.08066 13.8293 8.07138 14.4018C7.0621 14.9742 6.26361 15.8583 5.8 16.92M22 16.92V7C22 6.46957 21.7893 5.96086 21.4142 5.58579C21.0391 5.21071 20.5304 5 20 5H17.5L16.5 3H7.5L6.5 5H4C3.46957 5 2.96086 5.21071 2.58579 5.58579C2.21071 5.96086 2 6.46957 2 7V16.92" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Galerie
        `;
        galleryButton.style.cssText = cameraButton.style.cssText;
        galleryButton.style.background = 'linear-gradient(135deg, #6c466c, #6c466c)';

        // Abbrechen-Button
        const cancelButton = document.createElement("button");
        cancelButton.className = "image-source-button cancel";
        cancelButton.textContent = "Abbrechen";
        cancelButton.style.cssText = `
            flex: ${isMobile ? '1' : '0'};
            min-width: ${isMobile ? '100%' : '140px'};
            padding: 15px;
            background: rgb(117, 27, 20);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1.2rem;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            min-height: 50px;
            margin-top: ${isMobile ? '15px' : '0'};
        `;

        // Event-Handler für Kamera-Button
        cameraButton.addEventListener("click", async () => {
            document.body.removeChild(overlay);
            const cameras = await getAvailableCameras();

            if (cameras.length === 0) {
                alert('Keine Kameras gefunden!');
                selectFromGallery(imageArray, thumbnailContainer, galleryContainer, titleElement);
                return;
            }

            if (cameras.length === 1) {
                startCameraWithDeviceId(cameras[0].deviceId, imageArray, thumbnailContainer, galleryContainer, titleElement);
            } else {
                showCameraSelectionDialog(cameras, (deviceId) => {
                    startCameraWithDeviceId(deviceId, imageArray, thumbnailContainer, galleryContainer, titleElement);
                });
            }
        });

        // Event-Handler für Galerie-Button
        galleryButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            selectFromGallery(imageArray, thumbnailContainer, galleryContainer, titleElement);
        });

        // Event-Handler für Abbrechen-Button
        cancelButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
        });

        buttonContainer.appendChild(cameraButton);
        if (isMobile) {
            buttonContainer.appendChild(galleryButton);
            buttonContainer.appendChild(cancelButton);
        } else {
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(galleryButton);
        }

        dialog.appendChild(buttonContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Schließen bei Klick außerhalb des Dialogs
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    // Startet die Kamera mit spezifischer Device-ID
    function startCameraWithDeviceId(deviceId, imageArray, thumbnailContainer, galleryContainer, titleElement) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: deviceId ? undefined : (window.matchMedia("(orientation: portrait)").matches ? "user" : "environment")
                }
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    const video = document.createElement("video");
                    video.className = "camera-preview";
                    video.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 1000;
                        background-color: black;
                        object-fit: cover;
                        touch-action: none;
                    `;
                    video.srcObject = stream;
                    video.setAttribute("playsinline", "");
                    video.play();

                    const controls = document.createElement("div");
                    controls.className = "camera-controls";
                    controls.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        left: 0;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        z-index: 1001;
                        touch-action: manipulation;
                    `;

                    const captureButton = document.createElement("button");
                    captureButton.className = "camera-capture-button";
                    captureButton.innerHTML = `
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: white; border: 4px solid #f0f0f0;"></div>
                    `;
                    captureButton.style.cssText = `
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.3);
                        border: none;
                        cursor: pointer;
                        margin: 0 20px;
                        touch-action: manipulation;
                        -webkit-tap-highlight-color: transparent;
                    `;

                    const cancelCameraButton = document.createElement("button");
                    cancelCameraButton.className = "camera-cancel-button";
                    cancelCameraButton.innerHTML = `
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    `;
                    cancelCameraButton.style.cssText = `
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: rgba(117, 27, 20, 0.7);
                        color: white;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 20px;
                        touch-action: manipulation;
                    `;

                    // Event-Handler für Aufnahme-Button
                    captureButton.addEventListener("click", function () {
                        const canvas = document.createElement("canvas");
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

                        stream.getTracks().forEach(track => track.stop());
                        document.body.removeChild(video);
                        document.body.removeChild(controls);

                        canvas.toBlob(async function (blob) {
                            try {
                                const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
                                await processImage(file, imageArray, thumbnailContainer, galleryContainer, titleElement);
                            } catch (error) {
                                console.error("Fehler beim Verarbeiten des Kamerabildes:", error);
                            }
                        }, "image/jpeg", 0.9);
                    });

                    // Event-Handler für Abbrechen-Button
                    cancelCameraButton.addEventListener("click", function () {
                        stream.getTracks().forEach(track => track.stop());
                        document.body.removeChild(video);
                        document.body.removeChild(controls);
                    });

                    controls.appendChild(cancelCameraButton);
                    controls.appendChild(captureButton);
                    document.body.appendChild(video);
                    document.body.appendChild(controls);
                })
                .catch(function (error) {
                    console.error("Kamera konnte nicht gestartet werden:", error);
                    selectFromGallery(imageArray, thumbnailContainer, galleryContainer, titleElement);
                });
        } else {
            selectFromGallery(imageArray, thumbnailContainer, galleryContainer, titleElement);
        }
    }

    // Auswahl aus der Galerie
    function selectFromGallery(imageArray, thumbnailContainer, galleryContainer, titleElement) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.style.cssText = `
            position: fixed;
            top: -1000px;
            left: -1000px;
            visibility: hidden;
        `;

        input.onchange = async function (event) {
            const files = event.target.files;
            if (files.length > 0) {
                // Zeige Ladeindikator für mobile Geräte
                if (window.matchMedia("(max-width: 768px)").matches) {
                    const loadingOverlay = document.createElement("div");
                    loadingOverlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.7);
                        z-index: 1002;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    `;
                    
                    const loadingText = document.createElement("div");
                    loadingText.textContent = "Bilder werden verarbeitet...";
                    loadingText.style.cssText = `
                        color: white;
                        font-size: 1.2rem;
                        background: rgba(0, 0, 0, 0.8);
                        padding: 20px;
                        border-radius: 10px;
                    `;
                    
                    loadingOverlay.appendChild(loadingText);
                    document.body.appendChild(loadingOverlay);
                    
                    try {
                        for (const file of Array.from(files)) {
                            await processImage(file, imageArray, thumbnailContainer, galleryContainer, titleElement);
                        }
                    } finally {
                        document.body.removeChild(loadingOverlay);
                    }
                } else {
                    for (const file of Array.from(files)) {
                        await processImage(file, imageArray, thumbnailContainer, galleryContainer, titleElement);
                    }
                }
            }
            document.body.removeChild(input);
        };

        document.body.appendChild(input);
        input.click();
    }

    // Bildverarbeitung
    async function processImage(file, imageArray, thumbnailContainer, galleryContainer, titleElement) {
        try {
            const img = await loadImage(file);
            const [originalBlob, thumbnailBlob, galleryBlob] = await Promise.all([
                resizeImage(img, 3500, 3500),
                resizeImage(img, 150, 150), // Größere Thumbnails für bessere Sichtbarkeit auf Tablets
                resizeImage(img, 1000, 1000)
            ]);

            const imageData = {
                originalUrl: URL.createObjectURL(originalBlob),
                thumbnailUrl: URL.createObjectURL(thumbnailBlob),
                galerieUrl: URL.createObjectURL(galleryBlob),
                file: file // Originaldatei speichern für mögliche spätere Verwendung
            };

            imageArray.push(imageData);
            updateThumbnails(imageArray, thumbnailContainer);
            updateGallery(imageArray, galleryContainer, titleElement);
        } catch (error) {
            console.error("Fehler beim Verarbeiten des Bildes:", error);
            throw error;
        }
    }

    // Bild laden
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
                reject(new Error("Bild konnte nicht geladen werden"));
            };
            
            img.src = url;
        });
    }

    // Bild skalieren
    function resizeImage(img, maxWidth, maxHeight, quality = 0.8) {
        return new Promise(resolve => {
            const canvas = document.createElement("canvas");
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const scale = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * scale);
                height = Math.floor(height * scale);
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(blob => resolve(blob), "image/jpeg", quality);
        });
    }

    // Thumbnails aktualisieren
    function updateThumbnails(imageArray, container) {
        if (!container) return;

        container.innerHTML = "";
        
        // Flex-Container für bessere Darstellung auf Tablets
        container.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
        `;

        imageArray.forEach((imageData, index) => {
            const thumbnailWrapper = document.createElement("div");
            thumbnailWrapper.style.cssText = `
                position: relative;
                width: 80px;
                height: 80px;
            `;

            const thumbnail = document.createElement("img");
            thumbnail.src = imageData.thumbnailUrl;
            thumbnail.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
                border: 1px solid #ddd;
            `;

            const removeButton = document.createElement("button");
            removeButton.className = "thumbnail-remove";
            removeButton.textContent = "×";
            removeButton.setAttribute("data-index", index);
            removeButton.style.cssText = `
                position: absolute;
                top: -10px;
                right: -10px;
                width: 25px;
                height: 25px;
                background: rgb(117, 27, 20);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
            `;

            thumbnailWrapper.appendChild(thumbnail);
            thumbnailWrapper.appendChild(removeButton);
            container.appendChild(thumbnailWrapper);
        });
    }

    // Galerie aktualisieren
    function updateGallery(imageArray, container, titleElement) {
        if (!container || !titleElement) return;

        container.innerHTML = "";
        const categoryName = container.id.replace("-galerie", "");

        // Responsive Galerie
        container.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            width: 100%;
        `;

        imageArray.forEach((imageData, index) => {
            const galleryItem = document.createElement("div");
            galleryItem.className = "gallery-item";
            galleryItem.style.cssText = `
                position: relative;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            `;

            const imageLabel = document.createElement("div");
            imageLabel.textContent = `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} – Bild ${index + 1}`;
            imageLabel.style.cssText = `
                padding: 10px;
                background: #f5f5f5;
                font-weight: bold;
                font-size: 0.9rem;
            `;

            const imageWrapper = document.createElement("div");
            imageWrapper.style.cssText = `
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 250px;
            `;

            const image = document.createElement("img");
            image.src = imageData.galerieUrl;
            image.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            `;

            imageWrapper.appendChild(image);
            galleryItem.appendChild(imageLabel);
            galleryItem.appendChild(imageWrapper);
            container.appendChild(galleryItem);
        });

        // Titel-Element Sichtbarkeit
        titleElement.style.display = imageArray.length > 0 ? "block" : "none";
        if (imageArray.length > 0) {
            titleElement.style.animation = "fadeIn 0.3s ease-in-out";
        }
    }

    // Initialisierung aller Kategorien
    categories.forEach(category => {
        imagesData[category.name] = [];
    });

    categories.forEach(category => {
        initCategory(category);
    });
}));
