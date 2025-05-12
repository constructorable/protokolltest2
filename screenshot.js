// screenshot.js
document.addEventListener('DOMContentLoaded', function() {
    // HTML2Canvas einbinden (falls nicht schon im <head>)
    if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        document.head.appendChild(script);
    }

    // Screenshot-Funktion mit Ihrem Button verknüpfen
    document.getElementById('screenshot').addEventListener('click', function() {
        // Button während der Verarbeitung deaktivieren
        const button = this;
        button.disabled = true;
        button.textContent = 'Wird erstellt...';

        // Screenshot erstellen
        html2canvas(document.querySelector('.container'), {
            scale: 1,
            logging: false,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            // Bild-Daten als Data-URL
            const imgData = canvas.toDataURL('image/jpeg', 0.5); // 0.5 = 50% Qualität
            
            // Bild in neuem Tab öffnen (OHNE Download-Dialog)
            const newTab = window.open();
            newTab.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Wohnungsübergabeprotokoll</title>
                    <style>
                        body { margin: 0; padding: 20px; background: #f5f5f5; }
                        img { max-width: 100%; height: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                        .controls { margin-top: 20px; }
                        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
                    </style>
                </head>
                <body>
                    <img src="${imgData}" alt="Protokoll-Screenshot">
                    <div class="controls">
                        <button onclick="window.print()">Drucken</button>
                        <button onclick="window.close()">Schließen</button>
                    </div>
                </body>
                </html>
            `);

            // Button zurücksetzen
            button.disabled = false;
            button.textContent = 'Screenshot erstellen';
        }).catch(error => {
            console.error('Fehler:', error);
            alert('Screenshot konnte nicht erstellt werden.');
            button.disabled = false;
            button.textContent = 'Screenshot erstellen';
        });
    });
});