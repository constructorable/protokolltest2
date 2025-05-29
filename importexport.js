// importexport.js
console.log("Import/Export-Skript geladen");

document.addEventListener('DOMContentLoaded', () => {
    // Feedback-System
    const feedback = createFeedbackElement();
    const showFeedback = (message, isSuccess) => {
        // Message Content (erstes Child ist der close button)
        if (feedback.childNodes.length > 1) {
            feedback.childNodes[1].textContent = message;
        } else {
            const msg = document.createElement('div');
            msg.textContent = message;
            msg.style.padding = '58px 60px 60px 56px';
            msg.style.fontSize = '1.5rem';
            feedback.appendChild(msg);
        }

        feedback.style.backgroundColor = isSuccess ? '#466c9c' : '#F44336';

        // Stile für zentrierte Positionierung
        feedback.style.position = 'fixed';
        feedback.style.top = '50%';
        feedback.style.left = '50%';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.zIndex = '1000';
        feedback.style.borderRadius = '5px';
        feedback.style.color = 'rgb(255, 255, 255)';
        feedback.style.textAlign = 'center';
        feedback.style.boxShadow = '0 0 34px 1555px rgba(0,0,0,0.2)';
        feedback.style.maxWidth = '90%';
        feedback.style.minWidth = '500px';
        feedback.style.width = 'auto';

        // Animationseinstellungen
        feedback.style.display = 'flex';
        feedback.style.alignItems = 'center';
        feedback.style.justifyContent = 'center';
        feedback.style.opacity = '1';

        // Automatisches Ausblenden nach 5 Sekunden
        const timeoutId = setTimeout(() => {
            hideFeedback(feedback);
        }, 115000);

        // Timeout bei manuellem Schließen löschen
        feedback.closeBtn = feedback.querySelector('span');
        feedback.closeBtn.timeoutId = timeoutId;
        feedback.closeBtn.addEventListener('click', () => {
            clearTimeout(timeoutId);
        });
    };

    // Export-Funktion
    document.getElementById('export').addEventListener('click', () => {
        try {
            const formData = {};
            let hasData = false;

            // Alle relevanten Elemente sammeln
            document.querySelectorAll('input, select, textarea').forEach(element => {
                if (element.type === 'button' || element.type === 'submit') return;

                const identifier = element.name || element.id;
                if (!identifier) return;

                if (element.type === 'checkbox' || element.type === 'radio') {
                    formData[identifier] = element.checked;
                    if (element.checked) hasData = true;
                } else {
                    formData[identifier] = element.value;
                    if (element.value) hasData = true;
                }
            });

            // Spezielle Behandlung für Toggle-Optionen
            document.querySelectorAll('.room-toggle .toggle-option').forEach(option => {
                const room = option.closest('.room-toggle').dataset.room;
                const identifier = `room_${room}_toggle`;
                if (option.classList.contains('active')) {
                    formData[identifier] = option.dataset.value;
                    hasData = true;
                }
            });

            if (!hasData) {
                showFeedback("Keine Daten zum Export gefunden", false);
                return;
            }

            // Dateinamen generieren
            const straßenname = document.getElementById('strasseeinzug').value || 'UnbekannteStrasse';
            const now = new Date();
            const datumZeit = now.toISOString()
                .replace(/[:.]/g, '-')
                .replace('T', '_')
                .slice(0, 19);

            // Sonderzeichen aus Straßennamen entfernen
            const cleanStraßenname = straßenname
                .replace(/[^a-zA-Z0-9äöüÄÖÜß\- ]/g, '')
                .trim()
                .replace(/\s+/g, '_');

            const dateiname = `Export_${cleanStraßenname}_${datumZeit}.json`;

            // Datei erstellen und herunterladen
            const dataStr = JSON.stringify(formData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = dateiname;
            link.click();

            showFeedback("Daten erfolgreich exportiert", true);
            setTimeout(() => URL.revokeObjectURL(url), 100);

        } catch (error) {
            console.error("Export-Fehler:", error);
            showFeedback("Fehler beim Export: " + error.message, false);
        }
    });

    // Import-Funktion (unverändert)
    document.getElementById('import').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const formData = JSON.parse(e.target.result);

                    /*                     if (!confirm(`Daten aus "${file.name}" importieren?`)) {
                                            showFeedback("Import abgebrochen", false);
                                            return;
                                        } */

                    let importedCount = 0;

                    // Standard-Elemente importieren
                    document.querySelectorAll('input, select, textarea').forEach(element => {
                        const identifier = element.name || element.id;
                        if (!identifier || !formData.hasOwnProperty(identifier)) return;

                        if (element.type === 'checkbox' || element.type === 'radio') {
                            element.checked = formData[identifier];
                        } else {
                            element.value = formData[identifier];
                        }
                        importedCount++;
                        element.dispatchEvent(new Event('change'));
                    });

                    // Toggle-Optionen importieren
                    document.querySelectorAll('.room-toggle').forEach(toggle => {
                        const room = toggle.dataset.room;
                        const identifier = `room_${room}_toggle`;
                        if (formData[identifier]) {
                            const options = toggle.querySelectorAll('.toggle-option');
                            options.forEach(opt => {
                                opt.classList.toggle('active', opt.dataset.value === formData[identifier]);
                            });
                            importedCount++;
                        }
                    });

                    showFeedback(`${importedCount} Felder erfolgreich importiert`, true);

                } catch (error) {
                    showFeedback("Ungültige Datei: " + error.message, false);
                }
            };
            reader.readAsText(file);
        });
        fileInput.click();
    });

    function createFeedbackElement() {
        const feedback = document.createElement('div');
        feedback.style.display = 'none';
        feedback.style.transition = 'opacity 0.5s ease';
        feedback.style.opacity = '0';

        // Close Button erstellen
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '10px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '2rem';
        closeBtn.addEventListener('click', () => {
            hideFeedback(feedback);
        });

        feedback.appendChild(closeBtn);
        document.body.appendChild(feedback);
        return feedback;
    }

    function hideFeedback(element) {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
        }, 500);
    }


});