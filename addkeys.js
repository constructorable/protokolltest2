document.addEventListener('DOMContentLoaded', function () {
    const addKeyButton = document.getElementById('keysbtn');
    const keysContainer = document.getElementById('keys');
    let keyCounter = 1;
    let headersCreated = false; // Flag um zu prüfen ob Überschriften bereits erstellt wurden

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

    // Erstelle die Überschriften
    function createHeaders() {
        if (headersCreated) return;
        
        const headerContainer = document.createElement('div');
        headerContainer.className = 'key-headers';
        
        // Hauptüberschrift
        const mainHeader = document.createElement('h2');
        mainHeader.textContent = 'Schlüssel';
        
        // Spaltenüberschriften
        const columnHeaders = document.createElement('div');
        columnHeaders.className = 'column-key-headers';
        
        const headers = ['Art', 'Anzahl', 'Bemerkung', ''];
        headers.forEach(headerText => {
            const header = document.createElement('span');
            header.textContent = headerText;
            columnHeaders.appendChild(header);
        });
        
        headerContainer.appendChild(mainHeader);
        headerContainer.appendChild(columnHeaders);
        addKeyButton.insertAdjacentElement('beforebegin', headerContainer);
        
        headersCreated = true;
    }

    // Funktion zur Steuerung der Zähler
    function setupNumberCounter(inputFeld, minusBtn, plusBtn) {
        minusBtn.addEventListener('click', () => {
            let value = parseInt(inputFeld.value);
            if (value > 1) {
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
            if (isNaN(value) || value < 1) {
                inputFeld.value = 1;
            } else if (value > 9) {
                inputFeld.value = 9;
            }
        });
    }

    // Funktion zum Erstellen eines neuen Schlüssel-Eintrags
    function createKeyEntry() {
        // Überschriften erstellen beim ersten Klick
        if (!headersCreated) {
            createHeaders();
        }

        const keyEntry = document.createElement('div');
        keyEntry.className = 'key-entry';
        keyEntry.id = `key-entry-${keyCounter}`;
        
        // Bezeichnung
        const typeCell = document.createElement('div');
        typeCell.className = 'key-type';
        const typeSelect = document.createElement('select');
        typeSelect.id = `key-type-select-${keyCounter}`;
        typeSelect.required = true;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Bitte auswählen --';
        typeSelect.appendChild(defaultOption);
        
        keyTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
        
        const customContainer = document.createElement('div');
        customContainer.id = `key-custom-container-${keyCounter}`;
        customContainer.style.display = 'none';
        customContainer.style.marginTop = '5px';
        
        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.id = `key-custom-type-${keyCounter}`;
        customInput.placeholder = 'Eingabe';
        customInput.className = 'no-spin';
        customContainer.appendChild(customInput);
        
        typeCell.appendChild(typeSelect);
        typeCell.appendChild(customContainer);
        
        // Anzahl
        const amountCell = document.createElement('div');
        amountCell.className = 'key-amount';
        const numberInput = document.createElement('div');
        numberInput.className = 'number-input';
        
        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.className = 'number-btn minus';
        minusBtn.id = `key-minus-btn-${keyCounter}`;
        minusBtn.textContent = '-';
        
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.id = `key-amount-input-${keyCounter}`;
        amountInput.min = '1';
        amountInput.max = '9';
        amountInput.value = '1';
        amountInput.className = 'no-spin';
        
        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.className = 'number-btn plus';
        plusBtn.id = `key-plus-btn-${keyCounter}`;
        plusBtn.textContent = '+';
        
        numberInput.appendChild(minusBtn);
        numberInput.appendChild(amountInput);
        numberInput.appendChild(plusBtn);
        amountCell.appendChild(numberInput);
        
        // Bemerkung
        const noteCell = document.createElement('div');
        noteCell.className = 'key-note';
        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.id = `key-note-input-${keyCounter}`;
        noteInput.className = 'bemerkung-input';
        noteCell.appendChild(noteInput);
        
        // Löschen-Button
        const deleteCell = document.createElement('div');
        deleteCell.className = 'key-delete';
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-key-btn';
        deleteBtn.id = `key-delete-btn-${keyCounter}`;
        deleteBtn.dataset.keyId = keyCounter;
        deleteBtn.textContent = '×';
        deleteCell.appendChild(deleteBtn);
        
        // Alles zusammenfügen
        keyEntry.appendChild(typeCell);
        keyEntry.appendChild(amountCell);
        keyEntry.appendChild(noteCell);
        keyEntry.appendChild(deleteCell);
        
        // Einfügen in DOM
        addKeyButton.insertAdjacentElement('beforebegin', keyEntry);
        
        // Event Listener
        typeSelect.addEventListener('change', function() {
            customContainer.style.display = this.value === "Sonstiger Schlüssel" ? "block" : "none";
        });
        
        setupNumberCounter(amountInput, minusBtn, plusBtn);
        
        deleteBtn.addEventListener('click', function() {
            if (confirm('Möchten Sie diesen Schlüssel wirklich löschen?')) {
                keyEntry.remove();
            }
        });
        
        keyCounter++;
    }

    // CSS dynamisch hinzufügen
    const style = document.createElement('style');
    style.textContent = `
        .keys {
            width: 100%;
            font-family: Arial, sans-serif;
            margin: 20px 0;
        }
        
    `;
    document.head.appendChild(style);

    // Event Listener für den "Schlüssel hinzufügen"-Button
    addKeyButton.addEventListener('click', createKeyEntry);

    // Funktion zum Sammeln aller Schlüsseldaten
    window.getAllKeysData = function() {
        const keysData = [];
        document.querySelectorAll('.key-entry').forEach(entry => {
            const id = entry.id.split('-')[2];
            const keyTypeSelect = document.getElementById(`key-type-select-${id}`);
            const keyType = keyTypeSelect.value === "Sonstiger Schlüssel"
                ? document.getElementById(`key-custom-type-${id}`).value
                : keyTypeSelect.value;
            const amount = document.getElementById(`key-amount-input-${id}`).value;
            const note = document.getElementById(`key-note-input-${id}`).value;

            if (keyType) {
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
