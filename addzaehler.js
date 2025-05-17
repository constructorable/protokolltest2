document.addEventListener('DOMContentLoaded', function() {
    const addZaehlerBtn = document.getElementById('addzaehlerbtn');
    const zaehlerContainer = document.getElementById('addzaehler');
    let zaehlerCounter = 1;
    let nextZaehlerNumber = 1;

    if (!addZaehlerBtn || !zaehlerContainer) {
        console.error("Element(e) nicht gefunden: addzaehlerbtn oder addzaehler");
        return;
    }

    const zaehlerTypes = [
        "Stromzähler",
        "Gaszähler",
        "Wärmezähler",
        "Wasserzähler",
        "Sonstiger Zähler"
    ];

    // Funktion zum Erstellen eines neuen Zähler-Eintrags
    function createZaehlerEntry() {
        const currentZaehlerNumber = nextZaehlerNumber;
        const zaehlerEntry = document.createElement('div');
        zaehlerEntry.className = 'table-container zaehler-entry';
        zaehlerEntry.id = `zaehler-entry-${zaehlerCounter}`;
        
        zaehlerEntry.innerHTML = `
            <table id="zaehler-table-${zaehlerCounter}">
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar" id="zaehler-header-${zaehlerCounter}">
                                Zähler ${currentZaehlerNumber}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th class="aa">Daten</th>
                        <th class="aa" colspan="5">Eingabe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="zaehler-type-row-${zaehlerCounter}">
                        <td>Zählertyp*</td>
                        <td colspan="5">
                            <select id="zaehler-type-select-${zaehlerCounter}" class="zaehler-type-select" required>
                                <option value="">-- Bitte auswählen --</option>
                                ${zaehlerTypes.filter(type => type !== "Sonstiger Zähler").map(type => 
                                    `<option value="${type}">${type}</option>`
                                ).join('')}
                                <option value="custom">Sonstiger Zähler</option>
                            </select>
                            <div id="zaehler-custom-container-${zaehlerCounter}" style="display:none; margin-top:5px;">
                                <input type="text" id="zaehler-custom-type-${zaehlerCounter}" placeholder="Zählertyp eingeben">
                            </div>
                        </td>
                    </tr>
                    <tr id="zaehler-number-row-${zaehlerCounter}">
                        <td>Zählernummer*</td>
                        <td colspan="5"><input type="text" class="textinput" id="zaehler-number-input-${zaehlerCounter}" required></td>
                    </tr>
                    <tr id="zaehler-location-row-${zaehlerCounter}">
                        <td>Einbaulage*</td>
                        <td colspan="5"><input type="text" class="textinput" id="zaehler-location-input-${zaehlerCounter}" required></td>
                    </tr>
                    <tr id="zaehler-value-row-${zaehlerCounter}">
                        <td>Zählerstand*</td>
                        <td colspan="5">
                            <input type="number" class="textinput" id="zaehler-value-input-${zaehlerCounter}" step="0.01" required>
                        </td>
                    </tr>
                    <tr class="zaehler-actions-row" id="zaehler-actions-row-${zaehlerCounter}">
                        <td></td>
                        <td colspan="5" style="text-align: right;">
                            <button type="button" class="delete-zaehler-btn" id="zaehler-delete-btn-${zaehlerCounter}" data-zaehler-id="${zaehlerCounter}">x</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        addZaehlerBtn.insertAdjacentElement('beforebegin', zaehlerEntry);
        
        // Event Listener für die Zählerart-Auswahl
        document.getElementById(`zaehler-type-select-${zaehlerCounter}`).addEventListener('change', function() {
            const customContainer = document.getElementById(`zaehler-custom-container-${zaehlerCounter}`);
            customContainer.style.display = this.value === "custom" ? "block" : "none";
        });

        // Event Listener für Löschen-Button
        document.getElementById(`zaehler-delete-btn-${zaehlerCounter}`).addEventListener('click', function() {
            if (confirm('Möchten Sie diesen Zähler wirklich löschen?')) {
                zaehlerEntry.remove();
            }
        });

        zaehlerCounter++;
        nextZaehlerNumber++;
    }

    // Event Listener für den "Zähler hinzufügen"-Button
    addZaehlerBtn.addEventListener('click', createZaehlerEntry);

    // Funktion zum Sammeln aller Zählerdaten für das Formular
    window.getAllZaehlerData = function() {
        const zaehlerData = [];
        document.querySelectorAll('.zaehler-entry').forEach(entry => {
            const id = entry.id.split('-')[2];
            const typeSelect = document.getElementById(`zaehler-type-select-${id}`);
            const type = typeSelect.value === "custom" 
                ? document.getElementById(`zaehler-custom-type-${id}`).value 
                : typeSelect.value;
            const number = document.getElementById(`zaehler-number-input-${id}`).value;
            const location = document.getElementById(`zaehler-location-input-${id}`).value;
            const value = document.getElementById(`zaehler-value-input-${id}`).value;

            if (type && number && location && value) {  // Nur vollständige Zähler speichern
                zaehlerData.push({
                    id: id,
                    type: type,
                    number: number,
                    location: location,
                    value: value
                });
            }
        });
        return zaehlerData;
    };
});
