document.addEventListener('DOMContentLoaded', function () {
    // Erweiterte Vorschlagsliste
    const zimmerVorschlaege = [
        'links', 'rechts', 'hinten', 'vorne', 'mitte',
        'links (hofseitig)', 'rechts (hofseitig)',
        'vorne (hofseitig)', 'hinten (hofseitig)', 'mitte (hofseitig)',
        'links (straßenseitig)', 'rechts (straßenseitig)',
        'vorne (straßenseitig)', 'hinten (straßenseitig)', 'mitte (straßenseitig)',
        'straßenseitig', 'hofseitig',
        'Wohnzimmer', 'Arbeitszimmer', 'Kinderzimmer',
        'Schlafzimmer', 'Abstellraum', 'Esszimmer', 'Hobbyraum'
    ];

    // Hauptfunktion für Autovervollständigung
    function initAutocomplete() {
        // Finde alle relevanten Input-Felder
        const inputs = document.querySelectorAll('input[id^="lageinputzimm"]');

        inputs.forEach(input => {
            const id = input.id;
            const zimmerNr = id.replace('lageinputzimm', '');
            const container = document.getElementById(`lagecontainerzimm${zimmerNr}`);

            if (!container) return;

            // Input-Event Listener
            input.addEventListener('input', function () {
                const value = this.value.toLowerCase();
                container.innerHTML = '';

                if (value.length === 0) {
                    container.style.display = 'none';
                    return;
                }

                // Filtere Vorschläge
                const suggestions = zimmerVorschlaege.filter(item =>
                    item.toLowerCase().includes(value)
                );

                if (suggestions.length === 0) {
                    container.style.display = 'none';
                    return;
                }

                // Erstelle Vorschlags-Elemente
                suggestions.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.textContent = item;
                    div.addEventListener('click', () => {
                        input.value = item;
                        container.style.display = 'none';
                    });
                    container.appendChild(div);
                });

                // Positioniere und zeige die Liste
                container.style.width = `${input.offsetWidth}px`;
                container.style.top = `${input.offsetTop + input.offsetHeight}px`;
                container.style.left = `${input.offsetLeft}px`;
                container.style.display = 'contents';
            });

            // Verstecke Vorschläge bei Klick außerhalb
            document.addEventListener('click', function (e) {
                if (e.target !== input && !container.contains(e.target)) {
                    container.style.display = 'none';
                }
            });
        });
    }

    // Initialisierung
    initAutocomplete();

    // Für dynamisch hinzugefügte Elemente
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
                initAutocomplete();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
