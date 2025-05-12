document.addEventListener('DOMContentLoaded', function() {
    const pdfButton = document.getElementById('pdf-button');
    const styleLink = document.querySelector('link[rel="stylesheet"]');
    const originalStyle = 'styles1.css';
    const pdfStyle = 'styles2.css';

    pdfButton.addEventListener('click', async function() {
        // 1. Vorbereitung
        const pdfStyleElement = document.createElement('style');
        pdfStyleElement.innerHTML = `
            body { 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color: #000 !important;
                background: #fff !important;
            }
            .pdf-page {
                page-break-after: always;
                padding: 15mm;
                box-sizing: border-box;
                width: 100%;
            }
            .pdf-page:last-child {
                page-break-after: auto;
            }
            table {
                page-break-inside: avoid;
                break-inside: avoid-page;
                width: 100% !important;
            }
        `;
        document.head.appendChild(pdfStyleElement);
        styleLink.href = pdfStyle;

        // 2. Temporäre Anpassungen
        const originalButtons = document.querySelectorAll('button');
        originalButtons.forEach(btn => btn.style.display = 'none');

        const hiddenElements = document.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach(el => {
            el.style.display = '';
            el.dataset.wasHidden = 'true';
        });

        // 3. PDF-Generierung
        try {
            const sections = [
                { 
                    element: document.querySelector('.kueche-section .table-container'),
                    title: 'Küchen-Checkliste'
                },
                { 
                    element: document.querySelector('.bad-section .table-container'),
                    title: 'Badezimmer-Checkliste'
                }
                // Weitere Räume hier hinzufügen
            ];

            const opt = {
                margin: 10,
                filename: 'Raumcheckliste.pdf',
                image: { type: 'jpeg', quality: 1 },
                html2canvas: {
                    scale: 1.5,
                    letterRendering: true,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 1200,
                    backgroundColor: '#FFFFFF'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                }
            };

            // PDF-Worker erstellen
            const pdf = html2pdf().set(opt);
            
            // Temporäres Container-Div erstellen
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = 'absolute';
            pdfContainer.style.left = '-9999px';
            document.body.appendChild(pdfContainer);

            // Jede Section als separate Seite hinzufügen
            for (const section of sections) {
                if (section.element) {
                    const pageDiv = document.createElement('div');
                    pageDiv.className = 'pdf-page';
                    
                    // Titel hinzufügen
                    const title = document.createElement('h2');
                    title.textContent = section.title;
                    title.style.textAlign = 'center';
                    title.style.marginBottom = '20px';
                    pageDiv.appendChild(title);
                    
                    // Inhalt hinzufügen
                    pageDiv.appendChild(section.element.cloneNode(true));
                    pdfContainer.appendChild(pageDiv);
                }
            }

            // PDF generieren
            await pdf.from(pdfContainer).save();
            
            // Aufräumen
            document.body.removeChild(pdfContainer);

        } catch (error) {
            console.error('Fehler bei PDF-Generierung:', error);
        } finally {
            // 4. Zurücksetzen
            styleLink.href = originalStyle;
            document.head.removeChild(pdfStyleElement);
            
            originalButtons.forEach(btn => btn.style.display = '');
            
            document.querySelectorAll('[data-was-hidden="true"]').forEach(el => {
                el.style.display = 'none';
                el.removeAttribute('data-was-hidden');
            });
        }
    });
});