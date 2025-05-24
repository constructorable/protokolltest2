document.addEventListener('DOMContentLoaded', function () {
    const addZaehlerBtn = document.getElementById('addzaehlerbtn');
    const zaehlerContainer = document.getElementById('addzaehler');
    let zaehlerCounter = 1;
    let headersCreated = false;

    const zaehlerTypes = [
        "Stromzähler",
        "Gaszähler",
        "Wärmezähler",
        "Wasserzähler (kalt)",
        "Wasserzähler (warm)",
        "Heizkostenverteiler",
        "Fernwärmezähler",
        "Sonstiger Zähler"
    ];

    // Erstelle die Überschriften
    function createHeaders() {
        if (headersCreated) return;

        const headerContainer = document.createElement('div');
        headerContainer.className = 'zaehler-headers';

        // Hauptüberschrift
        const mainHeader = document.createElement('h2');
        mainHeader.innerHTML = '<i class="fas fa-tachometer-alt"></i> Zähler'; 

        

        // Spaltenüberschriften
        const columnHeaders = document.createElement('div');
        columnHeaders.className = 'column-zaehler-headers';

        const headers = ['Typ', 'Zählernummer', 'Einbaulage', 'Zählerstand', ''];
        headers.forEach(headerText => {
            const header = document.createElement('span');
            header.textContent = headerText;
            columnHeaders.appendChild(header);
        });

        headerContainer.appendChild(mainHeader);
        headerContainer.appendChild(columnHeaders);
        addZaehlerBtn.insertAdjacentElement('beforebegin', headerContainer);

        headersCreated = true;
    }

    // Funktion zum Erstellen eines neuen Zähler-Eintrags
    function createZaehlerEntry() {
        // Überschriften erstellen beim ersten Klick
        if (!headersCreated) {
            createHeaders();
        }

        // Button anpassen
        addZaehlerBtn.classList.add('keybtnhide');
        addZaehlerBtn.style.backgroundColor = '#fff';
        addZaehlerBtn.style.color = '#888';
        addZaehlerBtn.style.fontSize = '1.5rem';
        addZaehlerBtn.style.marginTop = '-10px';
        addZaehlerBtn.textContent = '+';

        // Button-Text ändern
        if (addZaehlerBtn.textContent.trim() === '+ Zähler hinzufügen') {
            addZaehlerBtn.textContent = '+';
            addZaehlerBtn.classList.add('zaehleraddhide');
        }

        const zaehlerEntry = document.createElement('div');
        zaehlerEntry.className = 'zaehler-entry';
        zaehlerEntry.id = `zaehler-entry-${zaehlerCounter}`;

        // Zählertyp
        const typeCell = document.createElement('div');
        typeCell.className = 'zaehler-type';
        const typeSelect = document.createElement('select');
        typeSelect.id = `zaehler-type-select-${zaehlerCounter}`;
        typeSelect.required = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '';
        typeSelect.appendChild(defaultOption);

        zaehlerTypes.forEach(type => {
            if (type !== "Sonstiger Zähler") {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            }
        });

        const customOption = document.createElement('option');
        customOption.value = "custom";
        customOption.textContent = "Sonstiger Zähler";
        typeSelect.appendChild(customOption);

        const customContainer = document.createElement('div');
        customContainer.id = `zaehler-custom-container-${zaehlerCounter}`;
        customContainer.style.display = 'none';
        customContainer.style.marginTop = '5px';

        const customInput = document.createElement('input');
        customInput.type = 'text';
        customInput.id = `zaehler-custom-type-${zaehlerCounter}`;
        customInput.placeholder = 'Zählertyp eingeben';
        customContainer.appendChild(customInput);

        typeCell.appendChild(typeSelect);
        typeCell.appendChild(customContainer);

        // Zählernummer
        const numberCell = document.createElement('div');
        numberCell.className = 'zaehler-number';
        const numberInput = document.createElement('input');
        numberInput.type = 'text';
        numberInput.id = `zaehler-number-input-${zaehlerCounter}`;
        numberInput.required = true;
        numberCell.appendChild(numberInput);

        // Einbaulage
        const locationCell = document.createElement('div');
        locationCell.className = 'zaehler-location';
        const locationInput = document.createElement('input');
        locationInput.type = 'text';
        locationInput.id = `zaehler-location-input-${zaehlerCounter}`;
        locationInput.required = true;
        locationCell.appendChild(locationInput);

        // Zählerstand
        const valueCell = document.createElement('div');
        valueCell.className = 'zaehler-value';
        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.id = `zaehler-value-input-${zaehlerCounter}`;
        valueInput.step = '0.01';
        valueInput.required = true;
        valueCell.appendChild(valueInput);

        // Löschen-Button
        const deleteCell = document.createElement('div');
        deleteCell.className = 'zaehler-delete';
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-zaehler-btn';
        deleteBtn.id = `zaehler-delete-btn-${zaehlerCounter}`;
        deleteBtn.dataset.zaehlerId = zaehlerCounter;
        deleteBtn.textContent = '×';
        deleteCell.appendChild(deleteBtn);

        // Alles zusammenfügen
        zaehlerEntry.appendChild(typeCell);
        zaehlerEntry.appendChild(numberCell);
        zaehlerEntry.appendChild(locationCell);
        zaehlerEntry.appendChild(valueCell);
        zaehlerEntry.appendChild(deleteCell);

        // Einfügen in DOM
        addZaehlerBtn.insertAdjacentElement('beforebegin', zaehlerEntry);

        // Event Listener
        typeSelect.addEventListener('change', function () {
            customContainer.style.display = this.value === "custom" ? "block" : "none";
        });

        deleteBtn.addEventListener('click', function () {
            if (confirm('Möchten Sie diesen Zähler wirklich löschen?')) {
                zaehlerEntry.remove();
            }
        });

        zaehlerCounter++;
    }

    // CSS dynamisch hinzufügen
    const style = document.createElement('style');
    style.textContent = `
        .addzaehler {
            width: 100%;
            font-family: Arial, sans-serif;
            margin: 20px 0;
        }
        
        .zaehler-headers {
            margin-bottom: 10px;
        }
        
        .zaehler-headers h2 {
            font-size: 1.4rem;
            margin: 0 0 5px 0;
            color: #333;
        }
        
        .column-zaehler-headers {
            display: grid;
            grid-template-columns: 1.8fr 1.8fr 2.2fr 1.2fr auto;
            gap: 10px;
            font-weight: bold;
            padding: 5px 0;
           
        }
        
        .zaehler-entry {
            display: grid;
            grid-template-columns: 1.8fr 1.8fr 2.2fr 1.2fr auto;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        
        select, input[type="text"], input[type="number"] {
            width: 100%;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        
        .delete-zaehler-btn {
            background: none;
            border: none;
            color: #ff4444;
            font-size: 18px;
            cursor: pointer;
            padding: 0 8px;
        }
        
        #addzaehlerbtn {
            margin-top: 10px;
            padding: 8px 15px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // Event Listener für den "Zähler hinzufügen"-Button
    addZaehlerBtn.addEventListener('click', createZaehlerEntry);

    // Funktion zum Sammeln aller Zählerdaten
    window.getAllZaehlerData = function () {
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

            if (type && number && location && value) {
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