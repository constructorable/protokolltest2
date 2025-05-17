document.addEventListener('DOMContentLoaded', function () {
    const addKeyButton = document.getElementById('keysbtn');
    const keysContainer = document.getElementById('keys');
    let keyCounter = 1;
    let nextKeyNumber = 1;

    // Vordefinierte Schlüsseltypen
    const keyTypes = [
        "Haustürschlüssel",
        "Kellerschlüssel",
        "Dachbodenschlüssel",
        "Briefkastenschlüssel",
        "Zimmersschlüssel",
        "Garagentorschlüssel",
        "Müllraumschlüssel",
        "Sonstiger Schlüssel"
    ];

    // Funktion zur Steuerung der Zähler
    function setupNumberCounter(inputFeld, minusBtn, plusBtn) {
        if (!inputFeld) return;

        minusBtn.addEventListener('click', () => {
            let value = parseInt(inputFeld.value);
            if (value > 1) {  // Mindestanzahl auf 1 gesetzt
                inputFeld.value = value - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let value = parseInt(inputFeld.value);
            if (value < 9) {
                inputFeld.value = value + 1;
            }
        });

        inputFeld.addEventListener('change', () => {
            let value = parseInt(inputFeld.value);
            if (isNaN(value) || value < 1) {  // Mindestanzahl auf 1 gesetzt
                inputFeld.value = 1;
            } else if (value > 9) {
                inputFeld.value = 9;
            }
        });
    }

    // Funktion zum Erstellen eines neuen Schlüssel-Eintrags
    function createKeyEntry() {
        const currentKeyNumber = nextKeyNumber;
        const keyEntry = document.createElement('div');
        keyEntry.className = 'table-container key-entry';
        keyEntry.id = `key-entry-${keyCounter}`;
        keyEntry.innerHTML = `
            <table id="key-table-${keyCounter}">
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar" id="key-header-${keyCounter}">
                                Schlüssel ${currentKeyNumber}
                            </div>
                        </th>
                    </tr>
    
                </thead>
                <tbody>
                    <tr id="key-type-row-${keyCounter}">
                        <td>Schlüsselart*</td>
                        <td colspan="5">
                            <select id="key-type-select-${keyCounter}" required>
                                <option value="">-- Bitte auswählen --</option>
                                ${keyTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                            </select>
                            <div id="key-custom-container-${keyCounter}" style="display:none; margin-top:5px;">
                                <input type="text" class="no-spin" id="key-custom-type-${keyCounter}" placeholder="Schlüsselart eingeben">
                            </div>
                        </td>
                    </tr>
                    <tr id="key-amount-row-${keyCounter}">
                        <td>Anzahl*</td>
                        <td colspan="5">
                            <div class="number-input" id="key-number-input-${keyCounter}">
                                <button type="button" class="number-btn minus" id="key-minus-btn-${keyCounter}">-</button>
                                <input type="number" id="key-amount-input-${keyCounter}" min="1" max="9" value="1" class="no-spin">
                                <button type="button" class="number-btn plus" id="key-plus-btn-${keyCounter}">+</button>
                            </div>
                        </td>
                    </tr>
                    <tr id="key-note-row-${keyCounter}">
                        <td>Bemerkung</td>
                        <td colspan="5">
                            <input class="bemerkung-input" type="text" id="key-note-input-${keyCounter}">
                        </td>
                    </tr>
                   <tr class="key-actions-row" id="key-actions-row-${keyCounter}">
    <td></td>
    <td colspan="5" style="text-align: right;">
        <button type="button" class="delete-key-btn" id="key-delete-btn-${keyCounter}" data-key-id="${keyCounter}" style="margin-left: auto;">x</button>
    </td>
</tr>
                </tbody>
            </table>
        `;

        addKeyButton.insertAdjacentElement('beforebegin', keyEntry);

        // Event Listener für die Schlüsselart-Auswahl
        document.getElementById(`key-type-select-${keyCounter}`).addEventListener('change', function () {
            const customContainer = document.getElementById(`key-custom-container-${keyCounter}`);
            customContainer.style.display = this.value === "Sonstiger Schlüssel" ? "block" : "none";
        });

        // Initialisiere das Nummernfeld
        const amountInput = document.getElementById(`key-amount-input-${keyCounter}`);
        setupNumberCounter(
            amountInput,
            document.getElementById(`key-minus-btn-${keyCounter}`),
            document.getElementById(`key-plus-btn-${keyCounter}`)
        );

        // Event Listener für Löschen-Button
        document.getElementById(`key-delete-btn-${keyCounter}`).addEventListener('click', function () {
            if (confirm('Möchten Sie diesen Schlüssel wirklich löschen?')) {
                keyEntry.remove();
            }
        });

        keyCounter++;
        nextKeyNumber++;
    }

    // Event Listener für den "Schlüssel hinzufügen"-Button
    addKeyButton.addEventListener('click', createKeyEntry);

    // Funktion zum Sammeln aller Schlüsseldaten für das Formular
    window.getAllKeysData = function () {
        const keysData = [];
        document.querySelectorAll('.key-entry').forEach(entry => {
            const id = entry.id.split('-')[2];
            const keyTypeSelect = document.getElementById(`key-type-select-${id}`);
            const keyType = keyTypeSelect.value === "Sonstiger Schlüssel"
                ? document.getElementById(`key-custom-type-${id}`).value
                : keyTypeSelect.value;
            const amount = document.getElementById(`key-amount-input-${id}`).value;
            const note = document.getElementById(`key-note-input-${id}`).value;

            if (keyType) {  // Nur Schlüssel mit Typ speichern
                keysData.push({
                    id: id,
                    type: keyType,
                    amount: amount,
                    note: note
                });
            }
        });
        return keysData;
    };
});
