document.addEventListener('DOMContentLoaded', function () {

    if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        document.head.appendChild(script);
    }
    if (!window.jspdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
    }

    const pdfSections = [
        {
            name: 'Allgemein',
            selector: '#allgemein',
            type: 'main'
        },
        // Einzelne Räume (werden immer gerendert, Filterung erfolgt später)
        {
            name: 'Küche',
            selector: '.room-toggle[data-room="kueche"]',
            type: 'room'
        },
        {
            name: 'Bad',
            selector: '.room-toggle[data-room="bad"]',
            type: 'room'
        },
        {
            name: 'WC',
            selector: '.room-toggle[data-room="wc"]',
            type: 'room'
        },
        {
            name: 'Flur',
            selector: '.room-toggle[data-room="flur"]',
            type: 'room'
        },
        {
            name: 'Abstellraum',
            selector: '.room-toggle[data-room="abstellraum"]',
            type: 'room'
        },
        {
            name: 'Nebenraum',
            selector: '.room-toggle[data-room="nebenraum"]',
            type: 'room'
        },

        {
            name: 'Zimmer',
            selector: '.zimmer-n .zimmer-section',
            type: 'zimmer',
            processIndividually: true
        },

        // Kombinierte Rest-Sektionen inkl. nicht vorhandener Räume
        {
            name: 'Restliche Informationen',
            selector: '#rest1, #regelungen, #weiterebemerkungen, .room-toggle[data-room]',
            type: 'combined',
            combinedSections: [
                { name: 'Restliche Informationen', selector: '#rest1' },
                {
                    name: 'Nicht vorhandene Räume',
                    selector: '.room-toggle[data-room]',
                    process: (element) => {
                        const toggleOptions = element.querySelector('.toggle-options');
                        if (toggleOptions && toggleOptions.getAttribute('data-active-option') === '0') {
                            // 1. Versuche den Raumnamen aus dem Header zu extrahieren
                            let roomName = element.querySelector('.toggle-header')?.textContent || '';

                            // 2. Entferne alle unerwünschten Texte
                            roomName = roomName
                                .replace(/ vorhanden\?/gi, '')  // Entfernt " vorhanden?"
                                .replace(/:\s*(Ja|Nein)/gi, '')  // Entfernt ": Ja" oder ": Nein"
                                .replace(/\s*(Ja|Nein)\s*/gi, '') // Entfernt alle verbleibenden "Ja/Nein"
                                .trim();

                            // 3. Fallback auf data-room Attribut wenn kein brauchbarer Text
                            if (!roomName) {
                                roomName = element.getAttribute('data-room');
                            }

                            // 4. Formatierung bereinigen
                            roomName = roomName
                                .replace(/^./, c => c.toUpperCase()) // Ersten Buchstaben groß
                                .replace(/-/g, ' '); // Bindestriche durch Leerzeichen ersetzen

                            return `${roomName}: Nicht vorhanden`;
                        }
                        return null;
                    }
                },
                { name: 'Regelungen', selector: '#regelungen' },
                { name: 'Weitere Bemerkungen', selector: '#weiterebemerkungen' }
            ]
        },
        {
            name: 'Unterschriften',
            selector: '#sign',
            type: 'signatures'
        },
        {
            name: 'Bildergalerie',
            selector: '.bildergalerie-container',
            type: 'gallery',
            processIndividually: true
        }
    ];



    document.getElementById('screenshot').addEventListener('click', async function () {
        const button = this;

        // CSS-Profile definieren
        const cssProfiles = [
            {
                id: 'desktop',
                name: 'Desktop Design',
                description: 'Optimiert für Desktop-Ansicht und Bildschirmdarstellung',
                cssFile: 'stylesdesktop.css'
            },
            {
                id: 'pdf',
                name: 'PDF erstellen (hier klicken)',
                description: '',
                cssFile: 'stylespdf.css'
            },
            {
                id: 'mobile',
                name: 'Mobile Design',
                description: 'Responsive Design für mobile Geräte',
                cssFile: 'stylesmobile.css'
            }
        ];

        // Design-Auswahl Modal erstellen
        const selectedProfile = await showDesignSelectionModal(cssProfiles);

        if (!selectedProfile) {
            return; // Benutzer hat abgebrochen
        }

        button.disabled = true;
        button.textContent = `PDF wird mit ${selectedProfile.name} vorbereitet...`;

        // Gewähltes CSS-Profil laden
        const pdfStyleLink = document.createElement('link');
        pdfStyleLink.rel = 'stylesheet';
        pdfStyleLink.href = selectedProfile.cssFile + '?v=' + Date.now(); // Cache-Busting
        pdfStyleLink.id = 'pdf-styles';

        await new Promise((resolve) => {
            pdfStyleLink.onload = resolve;
            document.head.appendChild(pdfStyleLink);
            setTimeout(resolve, 2000); // Längeres Timeout
        });

        // Reflow erzwingen
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = '';
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log("Aktuelles CSS:", document.getElementById('pdf-styles')?.href);
        console.log("Aktive Stylesheets:",
            Array.from(document.styleSheets)
                .map(sheet => sheet.href)
                .filter(Boolean)
        );

        // Statt direkt das CSS zu laden:
        // applyStyle(selectedProfile.cssFile); // Ihre existierende Funktion aus dem Toggle-Button
        localStorage.setItem('currentStyle', selectedProfile.cssFile); // Zustand speichern
        applyStyle(selectedProfile.cssFile); // Gleiche Funktion wie beim Toggle
        await new Promise(resolve => setTimeout(resolve, 500)); // Warten, bis das CSS wirkt

        // Button-Text-Updates für bessere PDF-Darstellung
        const keysBtn = document.getElementById('keysbtn');
        if (keysBtn && keysBtn.textContent.trim() === '+ Schlüssel') {
            keysBtn.textContent = 'Schlüssel: nicht angegeben';
        }

        const zaehlerBtn = document.getElementById('addzaehlerbtn');
        if (zaehlerBtn && zaehlerBtn.textContent.trim() === '+ Zähler') {
            zaehlerBtn.textContent = 'Zähler: nicht angegeben';
        }

        const einzugBtn = document.getElementById('einzugtenant');
        if (einzugBtn && einzugBtn.textContent.trim() === '+ Mieter Einzug') {
            einzugBtn.textContent = 'einziehende Mieter: nicht zutreffend';
        }

        const auszugBtn = document.getElementById('auszugtenant');
        if (auszugBtn && auszugBtn.textContent.trim() === '+ Mieter Auszug') {
            auszugBtn.textContent = 'ausziehender Mieter: nicht zutreffend';
        }

        const modal = document.getElementById('pdf-modal-overlay');
        const closeButton = modal.querySelector('.pdf-modal-close');
        const progressBar = document.getElementById('pdf-progress-bar');
        const statusMessage = document.getElementById('pdf-status-message');
        const modalTitle = document.querySelector('.pdf-modal-title');

        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        statusMessage.textContent = '';
        statusMessage.className = 'pdf-status-message';

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);

            const pdfStyles = document.getElementById('pdf-styles');
            if (pdfStyles) {
                pdfStyles.remove();
            }
        };
        closeButton.onclick = closeModal;

        const startTime = Date.now();

        document.querySelectorAll('[placeholder]').forEach(el => {
            const originalColor = el.style.color;
            el.style.color = '#333';
            setTimeout(() => {
                el.style.color = originalColor;
            }, 5000);
        });

        try {
            // Warte auf jsPDF
            await new Promise(resolve => {
                const checkJSPDF = () => window.jspdf ? resolve() : setTimeout(checkJSPDF, 100);
                checkJSPDF();
            });

            const phase1Text = `Sektionen werden mit ${selectedProfile.name} analysiert...`;
            statusMessage.textContent = phase1Text;
            button.textContent = phase1Text;
            if (modalTitle) modalTitle.textContent = phase1Text;

            // Sammle alle verfügbaren Sektionen
            const availableSections = [];
            let totalProgress = 0;
            const progressStep = 30 / pdfSections.length;

            for (const section of pdfSections) {
                const element = section.selector ? document.querySelector(section.selector) : null;

                // Spezielle Behandlung für Zimmer-Sektionen
                if (section.type === 'zimmer' && section.processIndividually) {
                    const zimmerElements = document.querySelectorAll(section.selector);

                    zimmerElements.forEach((zimmerElement, index) => {
                        const zimmerHeader = zimmerElement.querySelector('.zimmer-header');
                        const zimmerName = zimmerHeader ? zimmerHeader.textContent.trim() : `Zimmer ${index + 1}`;

                        availableSections.push({
                            name: zimmerName,
                            selector: null,
                            type: 'zimmer',
                            element: zimmerElement,
                            isDynamic: true
                        });
                    });
                    continue;
                }

                if (element && element.offsetHeight > 0) {
                    const computedStyle = window.getComputedStyle(element);
                    if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {

                        if (section.type === 'gallery' && section.processIndividually) {
                            const galleryImages = element.querySelectorAll('.galerie-bild');

                            galleryImages.forEach((imageElement, index) => {
                                const imgElement = imageElement.querySelector('img');
                                const titleElement = imageElement.querySelector('.bild-info span, div');

                                if (imgElement && imgElement.src) {
                                    let imageName = 'Bild';

                                    if (titleElement) {
                                        imageName = titleElement.textContent.trim();
                                    } else {
                                        const textNodes = Array.from(imageElement.childNodes)
                                            .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE);

                                        if (textNodes.length > 0) {
                                            imageName = textNodes[0].textContent?.trim() || `Galeriebild ${index + 1}`;
                                        }
                                    }

                                    availableSections.push({
                                        name: imageName,
                                        selector: null,
                                        type: 'gallery_image',
                                        element: imageElement,
                                        imageElement: imgElement
                                    });
                                }
                            });
                        } else {
                            availableSections.push({
                                ...section,
                                element: element
                            });
                        }
                    }
                }

                totalProgress += progressStep;
                progressBar.style.width = Math.round(totalProgress) + '%';
                progressBar.textContent = Math.round(totalProgress) + '%';
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            if (availableSections.length === 0) {
                throw new Error('Keine PDF-Sektionen gefunden');
            }

            const phase2Text = `${availableSections.length} Sektionen werden mit ${selectedProfile.name} erfasst...`;
            statusMessage.textContent = phase2Text;
            button.textContent = phase2Text;
            if (modalTitle) modalTitle.textContent = phase2Text;

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm'
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const marginLeft = 10;
            const marginRight = 10;
            const marginTop = 10;
            const marginBottom = 10;
            const usableWidth = pageWidth - marginLeft - marginRight;
            const usableHeight = pageHeight - marginTop - marginBottom;

            let isFirstPage = true;
            const sectionProgressStep = 40 / availableSections.length;

            // Verarbeite jede Sektion einzeln
            for (let i = 0; i < availableSections.length; i++) {
                const section = availableSections[i];

                if (section.type === 'room') {
                    const element = document.querySelector(section.selector);
                    const toggleOptions = element?.querySelector('.toggle-options');
                    if (toggleOptions && toggleOptions.getAttribute('data-active-option') === '0') {
                        continue;
                    }
                }

                const sectionText = `Sektion "${section.name}" wird mit ${selectedProfile.name} verarbeitet... (${i + 1}/${availableSections.length})`;
                statusMessage.textContent = sectionText;
                button.textContent = sectionText;
                if (modalTitle) modalTitle.textContent = sectionText;

                let canvas;

                if (section.type === 'combined') {
                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.left = '-9999px';
                    tempContainer.style.width = '800px';
                    tempContainer.style.padding = '20px';
                    tempContainer.style.boxSizing = 'border-box';
                    tempContainer.style.backgroundColor = '#ffffff';

                    let hasContent = false;

                    for (const combinedSection of section.combinedSections) {
                        if (combinedSection.process) {
                            const roomElements = Array.from(document.querySelectorAll(combinedSection.selector));
                            const nonExistingRooms = roomElements
                                .map(element => combinedSection.process(element))
                                .filter(text => text !== null);

                            if (nonExistingRooms.length > 0) {
                                hasContent = true;
                                const heading = document.createElement('h2');
                                heading.textContent = combinedSection.name;
                                heading.style.marginTop = '20px';
                                heading.style.marginBottom = '10px';
                                tempContainer.appendChild(heading);

                                const list = document.createElement('ul');
                                list.style.listStyleType = 'none';
                                list.style.padding = '0';
                                list.style.margin = '0 0 20px 0';

                                nonExistingRooms.forEach(roomText => {
                                    const listItem = document.createElement('li');
                                    listItem.style.padding = '5px 0';
                                    listItem.style.borderBottom = '1px solid #eee';
                                    listItem.textContent = roomText;
                                    list.appendChild(listItem);
                                });

                                tempContainer.appendChild(list);
                            }
                        } else {
                            const element = document.querySelector(combinedSection.selector);
                            if (element && element.innerHTML.trim() !== '') {
                                hasContent = true;
                                const clone = element.cloneNode(true);
                                const heading = document.createElement('h2');
                                heading.textContent = combinedSection.name;
                                heading.style.marginTop = '20px';
                                heading.style.marginBottom = '10px';
                                tempContainer.appendChild(heading);
                                tempContainer.appendChild(clone);
                            }
                        }
                    }

                    if (!hasContent) {
                        continue;
                    }

                    document.body.appendChild(tempContainer);

                    try {
                        canvas = await html2canvas(tempContainer, {
                            scale: 1,
                            logging: false,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff'
                        });
                    } finally {
                        document.body.removeChild(tempContainer);
                    }
                }
                else if (section.type === 'zimmer') {
                    const removeButtons = section.element.querySelectorAll('.remove-zimmer-btn');
                    removeButtons.forEach(btn => btn.style.display = 'none');

                    canvas = await html2canvas(section.element, {
                        scale: 1,
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: section.element.offsetWidth,
                        height: section.element.offsetHeight,
                        imageTimeout: 0,
                        removeContainer: false
                    });

                    removeButtons.forEach(btn => btn.style.display = '');
                }
                else if (section.type === 'gallery_image') {
                    canvas = await html2canvas(section.element, {
                        scale: 1,
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: section.element.offsetWidth,
                        height: section.element.offsetHeight,
                        imageTimeout: 0,
                        removeContainer: false
                    });
                } else {
                    canvas = await html2canvas(section.element, {
                        scale: 1,
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff'
                    });
                }

                if (!isFirstPage) {
                    pdf.addPage();
                } else {
                    isFirstPage = false;
                }

                const imgWidth = canvas.width;
                const imgHeight = canvas.height;

                let scale, finalWidth, finalHeight, xOffset, yOffset;

                if (section.type === 'gallery_image') {
                    const scaleWidth = usableWidth / (imgWidth * 0.264583);
                    const scaleHeight = usableHeight / (imgHeight * 0.264583);
                    scale = Math.min(scaleWidth, scaleHeight);
                    finalWidth = (imgWidth * 0.264583) * scale;
                    finalHeight = (imgHeight * 0.264583) * scale;
                    xOffset = marginLeft + (usableWidth - finalWidth) / 2;
                    yOffset = marginTop + 5;
                } else {
                    const scaleWidth = usableWidth / (imgWidth * 0.264583);
                    const scaleHeight = usableHeight / (imgHeight * 0.264583);
                    scale = Math.min(scaleWidth, scaleHeight, 1);
                    finalWidth = (imgWidth * 0.264583) * scale;
                    finalHeight = (imgHeight * 0.264583) * scale;
                    xOffset = marginLeft + (usableWidth - finalWidth) / 2;
                    yOffset = marginTop + 5;
                }

                const imgData = canvas.toDataURL('image/jpeg',
                    section.type === 'gallery_image' ? 0.95 :
                        section.type === 'combined' ? 0.9 : 0.85);

                pdf.addImage(
                    imgData,
                    'JPEG',
                    xOffset,
                    yOffset,
                    finalWidth,
                    finalHeight,
                    `section_${i}`,
                    'FAST'
                );

                pdf.setFontSize(8);
                pdf.setTextColor(128, 128, 128);

                const pageNumberText = `Seite ${i + 1}`;
                const sectionName = section.name.replace(/\s*\([^)]*\)/, '');

                const rightPadding = 10;
                const bottomPadding = 10;

                const headerText = section.type === 'gallery_image'
                    ? `${section.name}`
                    : `${section.name} (Seite ${i + 1})`;

                const textWidth = pdf.getStringUnitWidth(headerText) * pdf.getFontSize() / 2.5;

                const textX = pageWidth - marginRight - textWidth;
                const textY = pageHeight - marginBottom + 5;

                pdf.text(sectionName, marginLeft, pageHeight - bottomPadding + 5);

                const pageNumWidth = pdf.getStringUnitWidth(pageNumberText) * pdf.getFontSize() / 2.5;
                pdf.text(pageNumberText, pageWidth - marginRight - pageNumWidth, pageHeight - bottomPadding + 5);

                const currentProgress = 30 + ((i + 1) * sectionProgressStep);
                progressBar.style.width = Math.round(currentProgress) + '%';
                progressBar.textContent = Math.round(currentProgress) + '%';

                await new Promise(resolve => setTimeout(resolve, section.type === 'gallery_image' ? 200 : 100));
            }

            const phase3Text = `PDF wird mit ${selectedProfile.name} finalisiert...`;
            statusMessage.textContent = phase3Text;
            button.textContent = phase3Text;
            if (modalTitle) modalTitle.textContent = phase3Text;

            for (let i = 71; i <= 95; i++) {
                await new Promise(resolve => setTimeout(resolve, 30));
                progressBar.style.width = i + '%';
                progressBar.textContent = i + '%';
            }

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);

            if (remainingTime > 0) {
                const steps = 4;
                const stepTime = remainingTime / steps;
                for (let i = 96; i <= 100; i++) {
                    await new Promise(resolve => setTimeout(resolve, stepTime));
                    progressBar.style.width = i + '%';
                    progressBar.textContent = i + '%';
                }
            } else {
                progressBar.style.width = '100%';
                progressBar.textContent = '100%';
            }

            // Speichere PDF mit Zeitstempel und Profil-Name
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
            pdf.save(`Wohnungsprotokoll_${selectedProfile.id}_${timestamp}.pdf`);

            statusMessage.textContent = `PDF erfolgreich mit ${selectedProfile.name} erstellt! ${availableSections.length} Sektionen auf ${availableSections.length} Seiten.`;
            statusMessage.classList.add('success');

        } catch (error) {
            console.error('Fehler:', error);
            statusMessage.textContent = 'Fehler beim Erstellen des PDFs: ' + error.message;
            statusMessage.classList.add('error');
        } finally {
            button.disabled = false;
            button.textContent = 'PDF erstellen';
            setTimeout(closeModal, 3000);
        }
    });

    // Funktion für Design-Auswahl Modal
    function showDesignSelectionModal(cssProfiles) {
        return new Promise((resolve) => {
            // Modal HTML erstellen
            const modalHTML = `
            <div id="design-selection-overlay" class="design-modal-overlay">
                <div class="design-modal-container">
                    <div class="design-modal-header">
                        
                        <button class="design-modal-close" type="button">&times;</button>
                    </div>
                    <div class="design-modal-content">
                        
                        <div class="design-profiles-grid">
                            ${cssProfiles.map(profile => `
                                <div class="design-profile-card" data-profile-id="${profile.id}">
                                    <div class="design-profile-preview">
                                        <div class="design-preview-placeholder ${profile.id}">
                                            <span>${profile.name}</span>
                                        </div>
                                    </div>
                            
                                  
                                </div>
                            `).join('')}
                        </div>
                    </div>
         
                </div>
            </div>
        `;

            // Modal zum DOM hinzufügen
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const modal = document.getElementById('design-selection-overlay');
            const closeBtn = modal.querySelector('.design-modal-close');
            /* const cancelBtn = modal.querySelector('.design-cancel-btn'); */
            const selectBtns = modal.querySelectorAll('.design-select-btn');
            const profileCards = modal.querySelectorAll('.design-profile-card');

            // Modal anzeigen
            setTimeout(() => modal.classList.add('active'), 10);

            // Event Handlers
            const closeModal = (selectedProfile = null) => {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                    resolve(selectedProfile);
                }, 300);
            };

            closeBtn.addEventListener('click', () => closeModal());
           /*  cancelBtn.addEventListener('click', () => closeModal()); */

            // Klick außerhalb des Modals
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Profil-Auswahl
            selectBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const profileId = btn.dataset.profileId;
                    const selectedProfile = cssProfiles.find(p => p.id === profileId);
                    closeModal(selectedProfile);
                });
            });

            // Hover-Effekte für Karten
            profileCards.forEach(card => {
                card.addEventListener('click', () => {
                    const profileId = card.dataset.profileId;
                    const selectedProfile = cssProfiles.find(p => p.id === profileId);
                    closeModal(selectedProfile);
                });
            });
        });
    }
});