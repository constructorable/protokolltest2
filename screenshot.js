

document.addEventListener('DOMContentLoaded', function () {

    function getAllSaves() { /* ... */ }
    function generateAutoSaveName() { /* ... */ }
    function saveFormData() { /* ... */ }
    function limitAutosaves() { /* ... */ }

    // Hilfsfunktion: Alle Speicherstände holen
    function getAllSaves() {
        try {
            const saves = localStorage.getItem('formSaves');
            // Sicherstellen, dass wir immer ein Objekt zurückgeben
            return saves ? JSON.parse(saves) : {};
        } catch (e) {
            console.error('Fehler beim Zugriff auf localStorage:', e);
            return {}; // Immer ein Objekt zurückgeben
        }
    }


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

        // Kombinierte Rest-Abschnitte inkl. nicht vorhandener Räume
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
        // 1. Button-Referenz zuerst speichern
        const button = this;

        try {
            // Automatische Speicherung vor der PDF-Erstellung
            const saveName = generateAutoSaveName();
            saveFormData(saveName);
        } catch (e) {
            console.error('Automatische Speicherung fehlgeschlagen:', e);
            // Kein Abbruch, nur loggen
        }

        const saveName = generateAutoSaveName();
        saveFormData(saveName);




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



        button.disabled = true;
        /*     button.textContent = `PDF wird mit ${selectedProfile.name} vorbereitet...`; */
        button.textContent = `PDF erstellen`;

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
        /* const statusMessage = "test2"; */
        const modalTitle = document.querySelector('.pdf-modal-title');
        /*    const modalTitle = "test"; */

        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        statusMessage.textContent = '';
        statusMessage.className = 'pdf-status-message';

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);

            // PDF-spezifisches CSS entfernen
            const pdfStyles = document.getElementById('pdf-styles');
            if (pdfStyles) {
                pdfStyles.remove();
            }

            // HIER HINZUFÜGEN: Zurück zu stylesmobile.css schalten
            applyStyle('stylesmobile.css');
            localStorage.setItem('currentStyle', 'stylesmobile.css');
        };

        const pdfStyles = document.getElementById('pdf-styles');
        if (pdfStyles) {
            pdfStyles.remove();
        }

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

            /*  const phase1Text = `Abschnitte werden mit ${selectedProfile.name} analysiert...`; */
            const phase1Text = `Abschnitte werden ermittelt...`;
            statusMessage.textContent = phase1Text;
            /*   button.textContent = phase1Text; */
            button.textContent = "PDF wird erstellt...";
            if (modalTitle) modalTitle.textContent = phase1Text;

            // Sammle alle verfügbaren Abschnitte
            const availableSections = [];
            let totalProgress = 0;
            const progressStep = 30 / pdfSections.length;

            for (const section of pdfSections) {
                const element = section.selector ? document.querySelector(section.selector) : null;

                // Spezielle Behandlung für Zimmer-Abschnitte
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
                throw new Error('Keine PDF-Abschnitte gefunden');
            }

            /* const phase2Text = `${availableSections.length} Abschnitte werden mit ${selectedProfile.name} erfasst...`; */
            const phase2Text = `Abschnitt ${availableSections.length} wird erstellt...`;
            statusMessage.textContent = phase2Text;
            /*  button.textContent = phase2Text; */
            button.textContent = "PDF wird erstellt...";
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

                /* const sectionText = `Abschnitt "${section.name}" wird mit ${selectedProfile.name} verarbeitet... (${i + 1}/${availableSections.length})`; */
                const sectionText = `Abschnitt "${section.name}" wird verarbeitet... (${i + 1}/${availableSections.length})`;
                statusMessage.textContent = sectionText;
                /*   button.textContent = sectionText; */
                button.textContent = "PDF wird erstellt...";
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

            /*  const phase3Text = `PDF wird mit ${selectedProfile.name} finalisiert...`; */
            const phase3Text = ``;
            /* statusMessage.textContent = phase3Text; */
            statusMessage.textContent = "";
            /* button.textContent = phase3Text; */
            button.textContent = "PDF wird erstellt...";
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
            /*  const now = new Date();
             const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-'); */


            /*  statusMessage.textContent = `PDF erfolgreich mit ${selectedProfile.name} erstellt! ${availableSections.length} Abschnitte auf ${availableSections.length} Seiten.`; */
            statusMessage.textContent = `PDF erfolgreich erstellt!`;
            statusMessage.classList.add('success');

            const emailButton = document.createElement('button');
            emailButton.id = 'mail';
            emailButton.className = 'email-button'; // Für bessere Stil-Kontrolle
            emailButton.style.marginTop = '15px';
            emailButton.style.padding = '10px 15px 10px 40px'; // Mehr Platz links für Icon
            emailButton.style.backgroundColor = '#466c9c';
            emailButton.style.color = 'white';
            emailButton.style.border = 'none';
            emailButton.style.borderRadius = '4px';
            emailButton.style.cursor = 'pointer';
            emailButton.style.fontSize = '1.4rem';
            emailButton.style.position = 'relative';

            // Font Awesome Icon + Text
            emailButton.innerHTML = `
  <i class="fas fa-envelope" style="
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2em;
  "></i>
  E-Mail erstellen
`;


            // Dateiname für E-Mail speichern
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
            const pdfFileName = `Wohnungsprotokoll_${selectedProfile.id}_${timestamp}.pdf`;
            pdf.save(`Wohnungsprotokoll_${selectedProfile.id}_${timestamp}.pdf`);
            localStorage.setItem('lastGeneratedPdfName', pdfFileName);

            // Button zum Modal hinzufügen
            statusMessage.insertAdjacentElement('afterend', emailButton);

            // Event Listener für den Button
            emailButton.addEventListener('click', function () {
                closeModal(); // Schließt zuerst das PDF-Modal
                setTimeout(() => {
                    showEmailMenu(pdfFileName); // Öffnet dann das E-Mail-Modal
                }, 300); // Kleine Verzögerung für den Übergang
            });

            function showEmailMenu(fileName) {
                const validEmails = findValidEmails();

                // Zuerst alle vorhandenen E-Mail-Menüs entfernen
                closeEmailMenu();

                // Overlay erstellen
                const overlay = document.createElement('div');
                overlay.id = 'emailMenuOverlay';

                // Modal erstellen
                const emailMenu = document.createElement('div');
                emailMenu.id = 'emailMenu';
                emailMenu.innerHTML = `
        <button id="closeModal" aria-label="Schließen" style="
            position: absolute;
            top: 10px;
            right: 10px;
            background: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
        ">×</button>
        <div style="padding: 15px;">
            <div class="pdf-hinweis">
                Hinweis: Bitte PDF-Datei manuell im E-Mail-Client anhängen
            </div>
            <h3>Gültige E-Mail-Adressen:</h3>
            <ul>
                ${validEmails.map(email => `<li>${email}</li>`).join('')}
            </ul>
            <div style="margin-top: 20px;">
                <button id="defaultMailClient" class="button">E-Mail öffnen</button>
                <button id="cancel" class="button">← zurück</button>
            </div>
        </div>
    `;

                // Elemente einfügen
                document.body.appendChild(overlay);
                document.body.appendChild(emailMenu);

                // Event-Listener mit besserer Fehlerbehandlung
                const setupListeners = () => {
                    const closeModal = () => closeEmailMenu();

                    const closeBtn = document.getElementById('closeModal');
                    const mailBtn = document.getElementById('defaultMailClient');
                    const cancelBtn = document.getElementById('cancel');

                    if (closeBtn) closeBtn.addEventListener('click', closeModal);
                    if (mailBtn) mailBtn.addEventListener('click', () => {
                        sendEmail(fileName, validEmails, 'default');
                        closeModal();
                    });
                    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

                    overlay.addEventListener('click', closeModal);
                    emailMenu.addEventListener('click', e => e.stopPropagation());
                };

                // Listener nach kurzer Verzögerung anbringen (für dynamische Elemente)
                setTimeout(setupListeners, 50);
            }

            // Stil für den Button hinzufügen (falls nicht bereits vorhanden)
            if (!document.getElementById('emailButtonStyle')) {
                const style = document.createElement('style');
                style.id = 'emailButtonStyle';
                style.textContent = `
        #mail:hover {
            background-color: #476c9c !important;
        }
        #mail:active {
            background-color: #476c9c !important;
        }
    `;
                document.head.appendChild(style);
            }





        } catch (error) {
            console.error('Fehler:', error);
            statusMessage.textContent = 'Fehler beim Erstellen des PDFs: ' + error.message;
            statusMessage.classList.add('error');
        } finally {
            button.disabled = false;
            button.textContent = 'PDF erstellen';
            setTimeout(closeModal, 600000);
        }

        button.disabled = true;
        button.textContent = `PDF erstellen`;

    });

    // Generiert automatischen Speichernamen
    function generateAutoSaveName() {
        try {
            const strasse = document.getElementById('strasseeinzug')?.value.trim() || 'Protokoll';
            const now = new Date();
            const dateStr = now.toLocaleDateString('de-DE') || now.toISOString().slice(0, 10);
            const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) ||
                now.toTimeString().slice(0, 5);

            return `AutoSave_${strasse}_${dateStr}_${timeStr}`.replace(/[/\\?%*:|"<>]/g, '_');
        } catch (e) {
            console.error('Fehler bei der Namensgenerierung:', e);
            return `AutoSave_${Date.now()}`; // Fallback
        }
    }
    // Speichert Formulardaten
    function saveFormData(saveName, isAutosave = true) {
        try {
            const formData = {};

            // Daten sammeln
            document.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.id) {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        formData[element.id] = element.checked;
                    } else if (element.type === 'select-one') {
                        formData[element.id] = element.value;
                    } else {
                        formData[element.id] = element.value;
                    }
                }
            });

            // Radio-Buttons speichern
            const radioGroups = {};
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                if (!radioGroups[radio.name]) {
                    radioGroups[radio.name] = document.querySelector(`input[name="${radio.name}"]:checked`)?.value || '';
                }
            });
            formData.radioGroups = radioGroups;

            // Sicherstellen, dass allSaves immer ein Objekt ist
            const allSaves = getAllSaves() || {}; // Fallback auf leeres Objekt

            // Neuen Speicherstand hinzufügen
            allSaves[saveName] = {
                data: formData,
                timestamp: new Date().toISOString(),
                isAutosave: isAutosave
            };

            // Speichern
            localStorage.setItem('formSaves', JSON.stringify(allSaves));

            // Automatische Speicherungen begrenzen
            if (isAutosave) {
                limitAutosaves(allSaves);
            }
        } catch (e) {
            console.error('Speicherung fehlgeschlagen:', e);
            throw e; // Fehler weiterwerfen für bessere Debugging
        }
    }

    // Begrenzt automatische Speicherungen auf 5
    function limitAutosaves(allSaves) {
        try {
            if (!allSaves) return; // Sicherheitscheck

            const autosaves = Object.entries(allSaves)
                .filter(([name, data]) => data && data.isAutosave)
                .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));

            if (autosaves.length > 5) {
                autosaves.slice(5).forEach(([name]) => {
                    if (allSaves[name]) {
                        delete allSaves[name];
                    }
                });
                localStorage.setItem('formSaves', JSON.stringify(allSaves));
            }
        } catch (e) {
            console.error('Fehler beim Begrenzen der Autosaves:', e);
        }
    }

    function showSavedStates() {
        const saves = getAllSaves();

        if (Object.keys(saves).length === 0) {
            showMobileAlert('Keine gespeicherten Zustände gefunden!');
            return;
        }

        let html = `
    <div class="saved-states-container">
        <h3>Gespeicherte Zustände:</h3>
        <button class="close-dialog">×</button>
        <ul class="saved-states-list">`;

        // Sortieren: zuerst manuelle Speicherungen, dann automatische (neueste zuerst)
        const sortedSaves = Object.entries(saves).sort((a, b) => {
            if (a[1].isAutosave === b[1].isAutosave) {
                return new Date(b[1].timestamp) - new Date(a[1].timestamp);
            }
            return a[1].isAutosave ? 1 : -1;
        });

        for (const [name, data] of sortedSaves) {
            const timestamp = new Date(data.timestamp).toLocaleString();
            const isAutosave = data.isAutosave ? ' (Automatisch)' : '';
            html += `
        <li class="saved-state-item ${data.isAutosave ? 'autosave' : ''}">
            <div class="saved-state-row">
                <span class="saved-state-name">${name}${isAutosave}</span>
                <span class="saved-state-date">${timestamp}</span>
                <div class="saved-state-buttons">
                    <button class="button load-btn" data-name="${name}">Laden</button>
                    <button class="delete-btn2" data-name="${name}">x</button>
                </div>
            </div>
        </li>`;
        }

        html += '</ul></div>';

        // Rest der bestehenden Funktion...

        const additionalStyles = `
<style>
    .saved-state-item.autosave {
        opacity: 0.9;
        background-color: #f9f9f9;
    }
    
    .saved-state-item.autosave .saved-state-name {
        font-style: italic;
    }
    
    .saved-state-item.autosave .saved-state-date {
        color: #888;
    }
</style>
`;

        document.head.insertAdjacentHTML('beforeend', additionalStyles);

    }

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