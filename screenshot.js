document.addEventListener('DOMContentLoaded', function () {
    // Bibliotheken laden
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

    document.getElementById('screenshot').addEventListener('click', async function () {
        const button = this;
        button.disabled = true;
        button.textContent = 'PDF wird erstellt...';

        // Modal-Elemente
        const modal = document.getElementById('pdf-modal-overlay');
        const closeButton = modal.querySelector('.pdf-modal-close');
        const progressBar = document.getElementById('pdf-progress-bar');
        const statusMessage = document.getElementById('pdf-status-message');

        // Modal vorbereiten
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        statusMessage.textContent = '';
        statusMessage.className = 'pdf-status-message';

        // Modal anzeigen (zuerst display:flex, dann opacity-Animation)
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);

        // Close-Handler
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        };
        closeButton.onclick = closeModal;

        // Startzeit speichern für Mindestdauer
        const startTime = Date.now();

        try {
            // Warte auf jsPDF
            await new Promise(resolve => {
                const checkJSPDF = () => window.jspdf ? resolve() : setTimeout(checkJSPDF, 100);
                checkJSPDF();
            });

            // Ladebalken animieren (0-50%)
            for (let i = 0; i <= 50; i++) {
                await new Promise(resolve => setTimeout(resolve, 50));
                progressBar.style.width = i + '%';
                progressBar.textContent = i + '%';
            }

            const { jsPDF } = window.jspdf;
            const container = document.querySelector('.container');

            // Erstelle vollständigen Screenshot
            const canvas = await html2canvas(container, {
                scale: 1,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            // Ladebalken aktualisieren (50-80%)
            for (let i = 51; i <= 80; i++) {
                await new Promise(resolve => setTimeout(resolve, 30));
                progressBar.style.width = i + '%';
                progressBar.textContent = i + '%';
            }

            // PDF-Einstellungen mit Seitenrändern
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm'
            });

            // Bilddimensionen berechnen
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Seitenberechnung mit Rändern
            const pageWidth = 210; // DIN A4 Breite in mm
            const pageHeight = 297; // DIN A4 Höhe in mm

            // Randdefinition (in mm)
            const marginLeft = 10;
            const marginRight = 10;
            const marginTop = 10;
            const marginBottom = 10;

            // Nutzbare Breite und Höhe
            const usableWidth = pageWidth - marginLeft - marginRight;
            const usableHeight = pageHeight - marginTop - marginBottom;

            const pxPerMm = imgWidth / usableWidth;
            const contentHeightPerPage = usableHeight * pxPerMm * 0.95; // 5% Überlapp

            let currentPosition = 0;
            let pageCount = 1;

            while (currentPosition < imgHeight) {
                if (pageCount > 1) {
                    pdf.addPage();
                    currentPosition -= (pxPerMm * marginTop); // Überlapp für Kontinuität
                }

                // Ausschnitt berechnen mit besonderer Behandlung der letzten Seite
                let sectionHeight;
                if (currentPosition + contentHeightPerPage >= imgHeight) {
                    // Letzte Seite - keine künstliche Streckung
                    sectionHeight = imgHeight - currentPosition;
                } else {
                    sectionHeight = Math.min(contentHeightPerPage, imgHeight - currentPosition);
                }

                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = imgWidth;
                tempCanvas.height = sectionHeight;

                // Bildausschnitt zeichnen
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(
                    canvas,
                    0, currentPosition, imgWidth, sectionHeight,
                    0, 0, imgWidth, sectionHeight
                );

                // PDF-Seite hinzufügen mit Rändern
                const imgData = tempCanvas.toDataURL('image/jpeg', 0.7);

                // Für die letzte Seite die tatsächliche Höhe verwenden
                const imgHeightInMM = sectionHeight / pxPerMm;

                pdf.addImage(
                    imgData,
                    'JPEG',
                    marginLeft,
                    marginTop,
                    usableWidth,
                    currentPosition + contentHeightPerPage >= imgHeight ? imgHeightInMM : usableHeight,
                    undefined,
                    'FAST'
                );

                currentPosition += contentHeightPerPage;
                pageCount++;

                // Ladebalken aktualisieren (80-95%)
                const progress = 80 + Math.min(15, (currentPosition / imgHeight) * 15);
                progressBar.style.width = progress + '%';
                progressBar.textContent = Math.round(progress) + '%';
                await new Promise(resolve => setTimeout(resolve, 50));
            }


            // Mindestdauer von 7 Sekunden einhalten
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 7000 - elapsedTime);

            // Restliche Zeit mit Ladebalken füllen (95-100%)
            if (remainingTime > 0) {
                const steps = 5;
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

            pdf.save('Wohnungsprotokoll.pdf');

            // Erfolgsmeldung anzeigen
            statusMessage.textContent = 'PDF erfolgreich erstellt und heruntergeladen!';
            statusMessage.classList.add('success');

        } catch (error) {
            console.error('Fehler:', error);

            // Fehlermeldung anzeigen
            statusMessage.textContent = 'Fehler beim Erstellen des PDFs: ' + error.message;
            statusMessage.classList.add('error');

        } finally {
            // Button zurücksetzen
            button.disabled = false;
            button.textContent = 'PDF erstellen';

            // Modal nach 5 Sekunden automatisch schließen
            setTimeout(closeModal, 25000);
        }
    });
});
