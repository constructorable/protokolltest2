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
        button.disabled = true;
        button.textContent = 'PDF wird vorbereitet...';

        const pdfStyleLink = document.createElement('link');
        pdfStyleLink.rel = 'stylesheet';
        pdfStyleLink.href = 'stylespdf.css';
        pdfStyleLink.id = 'pdf-styles';

        await new Promise((resolve) => {
            pdfStyleLink.onload = resolve;
            document.head.appendChild(pdfStyleLink);

            // Fallback für den Fall, dass onload nicht ausgelöst wird
            setTimeout(resolve, 1000); // 1 Sekunde Wartezeit als Fallback
        });

        await new Promise(resolve => setTimeout(resolve, 500));

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

            // Stelle die ursprüngliche Farbe nach der PDF-Erstellung wieder her
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

            const phase1Text = 'Sektionen werden analysiert...';
            statusMessage.textContent = phase1Text;
            button.textContent = phase1Text;
            if (modalTitle) modalTitle.textContent = phase1Text;

            // Sammle alle verfügbaren Sektionen
            const availableSections = [];
            let totalProgress = 0;
            const progressStep = 30 / pdfSections.length;

            for (const section of pdfSections) {
                const element = document.querySelector(section.selector);

                if (element && element.offsetHeight > 0) {
                    // Prüfe ob Element sichtbar und hat Inhalt
                    const computedStyle = window.getComputedStyle(element);
                    if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {

                        // Spezialbehandlung für Bildergalerie
                        if (section.type === 'gallery' && section.processIndividually) {
                            const galleryImages = element.querySelectorAll('.galerie-bild');

                            galleryImages.forEach((imageElement, index) => {
                                const imgElement = imageElement.querySelector('img');
                                const titleElement = imageElement.querySelector('.bild-info span, div');

                                if (imgElement && imgElement.src) {
                                    let imageName = 'Bild';

                                    // Extrahiere Bildname aus verschiedenen Strukturen
                                    if (titleElement) {
                                        imageName = titleElement.textContent.trim();
                                    } else {
                                        // Fallback: suche nach dem ersten Text-Node
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

            const phase2Text = `${availableSections.length} Sektionen werden erfasst...`;
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
                        continue; // Überspringen wenn Raum nicht vorhanden
                    }
                }





                const sectionText = `Sektion "${section.name}" wird verarbeitet... (${i + 1}/${availableSections.length})`;
                statusMessage.textContent = sectionText;
                 button.textContent = sectionText; 
                if (modalTitle) modalTitle.textContent = sectionText;

                let canvas;

















                if (section.type === 'combined') {
                    // Erstelle einen temporären Container für kombinierte Sektionen
                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.left = '-9999px';
                    tempContainer.style.width = '800px';
                    tempContainer.style.padding = '20px';
                    tempContainer.style.boxSizing = 'border-box';
                    tempContainer.style.backgroundColor = '#ffffff';

                    let hasContent = false;

                    // Verarbeite jede kombinierte Sektion
                    for (const combinedSection of section.combinedSections) {
                        if (combinedSection.process) {
                            // Spezialbehandlung für nicht vorhandene Räume
                            const roomElements = Array.from(document.querySelectorAll(combinedSection.selector));
                            const nonExistingRooms = roomElements
                                .map(element => combinedSection.process(element))
                                .filter(text => text !== null);

                            if (nonExistingRooms.length > 0) {
                                hasContent = true;
                                // Überschrift für nicht vorhandene Räume
                                const heading = document.createElement('h2');
                                heading.textContent = combinedSection.name;
                                heading.style.marginTop = '20px';
                                heading.style.marginBottom = '10px';
                                tempContainer.appendChild(heading);

                                // Liste der nicht vorhandenen Räume
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
                            // Normale Sektionen
                            const element = document.querySelector(combinedSection.selector);
                            if (element && element.innerHTML.trim() !== '') {
                                hasContent = true;
                                const clone = element.cloneNode(true);
                                // Überschrift hinzufügen
                                const heading = document.createElement('h2');
                                heading.textContent = combinedSection.name;
                                heading.style.marginTop = '20px';
                                heading.style.marginBottom = '10px';
                                tempContainer.appendChild(heading);
                                tempContainer.appendChild(clone);
                            }
                        }
                    }

                    // Nur fortfahren, wenn Inhalte vorhanden sind
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

                pdf.setFontSize(section.type === 'gallery_image' ? 10 : 8);
                pdf.setTextColor(section.type === 'gallery_image' ? 64 : 128, 128, 128);

                const headerText = section.type === 'gallery_image'
                    ? `${section.name}`
                    : `${section.name} (Seite ${i + 1})`;

                pdf.text(headerText, pageWidth - marginRight - pdf.getStringUnitWidth(headerText) * pdf.getFontSize() / 2.5, pageHeight - marginBottom + 5);

                // Für Galeriebilder (unten rechts)
                pdf.text(headerText, pageWidth - marginRight - pdf.getStringUnitWidth(headerText) * pdf.getFontSize() / 2.5, pageHeight - marginBottom + 5);

                const currentProgress = 30 + ((i + 1) * sectionProgressStep);
                progressBar.style.width = Math.round(currentProgress) + '%';
                progressBar.textContent = Math.round(currentProgress) + '%';

                await new Promise(resolve => setTimeout(resolve, section.type === 'gallery_image' ? 200 : 100));
            }

















            const phase3Text = 'PDF wird finalisiert...';
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

            // Speichere PDF mit Zeitstempel
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
            pdf.save(`Wohnungsprotokoll_${timestamp}.pdf`);

            statusMessage.textContent = `PDF erfolgreich erstellt! ${availableSections.length} Sektionen auf ${availableSections.length} Seiten.`;
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
});
