document.addEventListener('DOMContentLoaded', function() {
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

    document.getElementById('screenshot').addEventListener('click', async function() {
        const button = this;
        button.disabled = true;
        button.textContent = 'PDF wird erstellt...';

        try {
            // Warte auf jsPDF
            await new Promise(resolve => {
                const checkJSPDF = () => window.jspdf ? resolve() : setTimeout(checkJSPDF, 100);
                checkJSPDF();
            });

            const { jsPDF } = window.jspdf;
            const container = document.querySelector('.container');
            
            // Erstelle vollständigen Screenshot
            const canvas = await html2canvas(container, {
                scale: 1,
                logging: false,
                useCORS: true,
                allowTaint: true
            });

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
                
                // Ausschnitt berechnen
                const sectionHeight = Math.min(contentHeightPerPage, imgHeight - currentPosition);
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
                pdf.addImage(
                    imgData, 
                    'JPEG', 
                    marginLeft, 
                    marginTop, 
                    usableWidth, 
                    usableHeight,
                    undefined, 
                    'FAST'
                );

                currentPosition += contentHeightPerPage;
                pageCount++;
            }

            pdf.save('Wohnungsprotokoll.pdf');

        } catch (error) {
            console.error('Fehler:', error);
            alert('PDF konnte nicht erstellt werden: ' + error.message);
        } finally {
            button.disabled = false;
            button.textContent = 'PDF erstellen';
        }
    });
});
