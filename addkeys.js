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
            if (value > 0) {
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
            if (isNaN(value) || value < 0) {
                inputFeld.value = 0;
            } else if (value > 9) {
                inputFeld.value = 9;
            }
        });
    }

    addKeyButton.addEventListener('click', function() {
        const currentKeyNumber = nextKeyNumber;
        const keyForm = document.createElement('div');
        keyForm.className = 'table-container key-table';
        keyForm.id = `key-form-${keyCounter}`;
        keyForm.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                Schlüssel ${currentKeyNumber} hinzufügen
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th class="aa">Daten</th>
                        <th class="aa" colspan="5">Eingabe</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Schlüsselart*</td>
                        <td colspan="5">
                            <select id="key-type-${keyCounter}" required>
                                <option value="">-- Bitte auswählen --</option>
                                ${keyTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                            </select>
                            <div id="custom-key-container-${keyCounter}"  style="display:none; margin-top:5px;">
                                <input type="text" class="no-spin" id="custom-key-type-${keyCounter}" placeholder="Schlüsselart eingeben">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Anzahl*</td>
                        <td colspan="5">
                            <div class="number-input">
                                <button type="button" class="number-btn minus">-</button>
                                <input type="number" id="key-amount-${keyCounter}" min="1" max="9" value="1" class="no-spin">
                                <button type="button" class="number-btn plus">+</button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Bemerkung</td>
                        <td colspan="5">
                            <input class="bemerkung-input" type="text" id="key-note-${keyCounter}">
                        </td>
                    </tr>
                    <tr class="key-actions-row">
                        <td></td>
                        <td colspan="5">
                            <button type="button" class="save-key-btn" data-key-id="${keyCounter}" data-key-number="${currentKeyNumber}">Speichern</button>
                            <button type="button" class="cancel-key-btn" data-key-id="${keyCounter}">Abbrechen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        addKeyButton.insertAdjacentElement('afterend', keyForm);
        
        // Event Listener für die Schlüsselart-Auswahl
        document.getElementById(`key-type-${keyCounter}`).addEventListener('change', function() {
            const customContainer = document.getElementById(`custom-key-container-${keyCounter}`);
            customContainer.style.display = this.value === "Sonstiger Schlüssel" ? "block" : "none";
        });

        // Initialisiere das Nummernfeld
        const amountInput = document.getElementById(`key-amount-${keyCounter}`);
        const numberContainer = amountInput.closest('.number-input');
        setupNumberCounter(
            amountInput,
            numberContainer.querySelector('.minus'),
            numberContainer.querySelector('.plus')
        );

        // WICHTIG: Event Listener für Speichern-Button hinzufügen
        keyForm.querySelector(`.save-key-btn`).addEventListener('click', saveKey);
        keyForm.querySelector(`.cancel-key-btn`).addEventListener('click', cancelKey);

        keyCounter++;
        nextKeyNumber++;
    });

    function cancelKey(e) {
        const keyId = e.target.getAttribute('data-key-id');
        const form = document.getElementById(`key-form-${keyId}`);
        if (form) {
            form.remove();
        }
    }

    function saveKey(e) {
        const keyId = e.target.getAttribute('data-key-id');
        const keyNumber = e.target.getAttribute('data-key-number');
        const keyTypeSelect = document.getElementById(`key-type-${keyId}`);
        const keyType = keyTypeSelect.value === "Sonstiger Schlüssel" 
            ? document.getElementById(`custom-key-type-${keyId}`).value 
            : keyTypeSelect.value;
        const amount = document.getElementById(`key-amount-${keyId}`).value;
        const note = document.getElementById(`key-note-${keyId}`).value;

        if (!keyType || !amount) {
            alert('Bitte füllen Sie alle Pflichtfelder aus (mit * markiert)!');
            return;
        }

        const keyDisplay = document.createElement('div');
        keyDisplay.className = 'table-container key-display';
        keyDisplay.id = `key-display-${keyId}`;
        
        keyDisplay.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                Schlüssel ${keyNumber}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th class="aa">Daten</th>
                        <th class="aa" colspan="5">Informationen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Schlüsselart</td>
                        <td colspan="5">${keyType}</td>
                    </tr>
                    <tr>
                        <td>Anzahl</td>
                        <td colspan="5">${amount}</td>
                    </tr>
                    ${note ? `<tr><td>Bemerkung</td><td colspan="5">${note}</td></tr>` : ''}
                    <tr class="key-actions-row">
                        <td></td>
                        <td colspan="5">
                            <button type="button" class="edit-key-btn" data-key-id="${keyId}" data-key-number="${keyNumber}">Bearbeiten</button>
                            <button type="button" class="delete-key-btn" data-key-id="${keyId}">Löschen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        const form = document.getElementById(`key-form-${keyId}`);
        if (form) {
            form.replaceWith(keyDisplay);

            // Event Listener für die neuen Buttons setzen
            keyDisplay.querySelector(`.edit-key-btn`).addEventListener('click', editKey);
            keyDisplay.querySelector(`.delete-key-btn`).addEventListener('click', deleteKey);
        }
    }


    function cancelEditKey(e) {
        saveEditedKey(e);
    }

    function deleteKey(e) {
        if (confirm('Möchten Sie diesen Schlüssel wirklich löschen?')) {
            const keyId = e.target.getAttribute('data-key-id');
            const display = document.getElementById(`key-display-${keyId}`);
            if (display) {
                display.remove();
            }
        }
    }
});