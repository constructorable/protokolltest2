document.addEventListener('DOMContentLoaded', function () {
    const moveOutButton = document.getElementById('auszugtenant');
    const signatureContainer = document.getElementById('signtenant1');
    let moveOutTenantCounter = 1;
    let headersCreated = false;

    // Erstelle die Überschriften
    function createHeaders() {
        if (headersCreated) return;
        
        const headerContainer = document.createElement('div');
        headerContainer.className = 'moveout-headers';
        
        // Hauptüberschrift
        const mainHeader = document.createElement('h2');
        mainHeader.textContent = 'Ausziehende Mieter';
        
        // Spaltenüberschriften
        const columnHeaders = document.createElement('div');
        columnHeaders.className = 'column-headers';
        
        const headers = ['Name, Vorname', 'Neue Straße', 'PLZ, Ort', 'E-Mail', ''];
        headers.forEach(headerText => {
            const header = document.createElement('span');
            header.textContent = headerText;
            columnHeaders.appendChild(header);
        });
        
        headerContainer.appendChild(mainHeader);
        headerContainer.appendChild(columnHeaders);
        moveOutButton.insertAdjacentElement('beforebegin', headerContainer);
        
        headersCreated = true;
    }

    // Funktion zum Erstellen eines neuen Mieter-Eintrags
    function createMoveOutEntry() {
        // Überschriften erstellen beim ersten Klick
        if (!headersCreated) {
            createHeaders();
        }

        const moveOutEntry = document.createElement('div');
        moveOutEntry.className = 'moveout-entry';
        moveOutEntry.id = `moveout-entry-${moveOutTenantCounter}`;
        
        // Name, Vorname
        const nameCell = document.createElement('div');
        nameCell.className = 'moveout-name';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = `moveout-name-${moveOutTenantCounter}`;
        nameInput.className = 'bemerkung-input';
        nameCell.appendChild(nameInput);
        
        // Neue Straße
        const streetCell = document.createElement('div');
        streetCell.className = 'moveout-street';
        const streetInput = document.createElement('input');
        streetInput.type = 'text';
        streetInput.id = `moveout-street-${moveOutTenantCounter}`;
        streetInput.className = 'bemerkung-input';
        streetCell.appendChild(streetInput);
        
        // PLZ, Ort
        const zipCityCell = document.createElement('div');
        zipCityCell.className = 'moveout-zipcity';
        const zipCityInput = document.createElement('input');
        zipCityInput.type = 'text';
        zipCityInput.id = `moveout-zipcity-${moveOutTenantCounter}`;
        zipCityInput.className = 'bemerkung-input';
        zipCityCell.appendChild(zipCityInput);
        
        // E-Mail
        const emailCell = document.createElement('div');
        emailCell.className = 'moveout-email';
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.id = `moveout-email-${moveOutTenantCounter}`;
        emailInput.className = 'bemerkung-input';
        emailCell.appendChild(emailInput);
        
        // Löschen-Button
        const deleteCell = document.createElement('div');
        deleteCell.className = 'moveout-delete';
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-moveout-btn';
        deleteBtn.id = `moveout-delete-btn-${moveOutTenantCounter}`;
        deleteBtn.dataset.tenantId = moveOutTenantCounter;
        deleteBtn.textContent = '×';
        deleteCell.appendChild(deleteBtn);
        
        // Alles zusammenfügen
        moveOutEntry.appendChild(nameCell);
        moveOutEntry.appendChild(streetCell);
        moveOutEntry.appendChild(zipCityCell);
        moveOutEntry.appendChild(emailCell);
        moveOutEntry.appendChild(deleteCell);
        
        // Einfügen in DOM
        moveOutButton.insertAdjacentElement('beforebegin', moveOutEntry);
        
        // Event Listener
        nameInput.addEventListener('change', updateMoveOutSignatureName);
        emailInput.addEventListener('input', validateMoveOutEmail);
        
        deleteBtn.addEventListener('click', function() {
            if (confirm('Möchten Sie diesen Mieter wirklich löschen?')) {
                moveOutEntry.remove();
                const signatureContainer = document.getElementById(`moveout-signature-container-${moveOutTenantCounter}`);
                if (signatureContainer) signatureContainer.remove();
            }
        });

        // Unterschriftenfeld erstellen
        createMoveOutSignatureField(moveOutTenantCounter, '');
        
        moveOutTenantCounter++;
    }

    // CSS dynamisch hinzufügen
    const style = document.createElement('style');
    style.textContent = `

    
        
        .moveout-headers h2 {
            font-size: 1.4rem;
            margin: 0 0 5px 0;
            color: #fff;
        }
        
        .column-headers {
            display: grid;
            grid-template-columns: 2fr 2fr 1.5fr 2fr 40px;
            gap: 10px;
            font-weight: bold;
            padding: 5px 0;
            border-bottom: 2px solid #ddd;
        }
        
        .moveout-entry {
            display: grid;
            grid-template-columns: 2fr 2fr 1.5fr 2fr 40px;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        
        .moveout-entry input {
            width: 100%;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        
        .delete-moveout-btn {
            background: none;
            border: none;
            color: #ff4444;
            font-size: 18px;
            cursor: pointer;
            padding: 0 8px;
        }
        
        
        .signature-block {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .signature-block canvas {
            background-color: #f9f9f9;
        }
        

    `;
    document.head.appendChild(style);

    // Event Listener für den "Mieter hinzufügen"-Button
    moveOutButton.addEventListener('click', createMoveOutEntry);

    // Funktion zur E-Mail-Validierung
    function validateMoveOutEmail(e) {
        const emailInput = e.target;
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email === '') {
            emailInput.style.border = '3px solid #ccc';
        } else if (!emailRegex.test(email)) {
            emailInput.style.border = '3px solid red';
        } else {
            emailInput.style.border = '3px solid green';
        }
    }

    function updateMoveOutSignatureName(e) {
        const tenantId = e.target.id.split('-')[2];
        const name = document.getElementById(`moveout-name-${tenantId}`).value;

        const signatureName = document.getElementById(`moveout-signature-name-${tenantId}`);
        if (signatureName) {
            signatureName.textContent = name;
        }
    }

    function createMoveOutSignatureField(tenantId, fullName) {
        const signatureContainer = document.createElement('div');
        signatureContainer.className = 'signature-block';
        signatureContainer.id = `moveout-signature-container-${tenantId}`;
        signatureContainer.innerHTML = `
            <canvas id="moveout-signature-canvas-${tenantId}" width="666" height="222" style="border:1px solid #000; touch-action: none;"></canvas>
            <p><strong>ausziehender Mieter: <span class="signature-name" id="moveout-signature-name-${tenantId}">${fullName}</span></strong></p>
            <div>
                <button type="button" id="moveout-clear-signature-${tenantId}" class="delete-key-btn">x</button>
            </div>
        `;

        document.getElementById('signtenant1').appendChild(signatureContainer);

        // Canvas initialisieren
        const canvas = document.getElementById(`moveout-signature-canvas-${tenantId}`);
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 7;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#373d41';

        let drawing = false;
        let lastX = 0;
        let lastY = 0;

        function startDrawing(e) {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX ? e.clientX : e.touches[0].clientX;
            const y = e.clientY ? e.clientY : e.touches[0].clientY;
            ctx.beginPath();
            ctx.moveTo(x - rect.left, y - rect.top);
            e.preventDefault();
        }

        function draw(e) {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX ? e.clientX : e.touches[0].clientX;
            const y = e.clientY ? e.clientY : e.touches[0].clientY;
            ctx.lineTo(x - rect.left, y - rect.top);
            ctx.stroke();
            e.preventDefault();
        }

        function stopDrawing() {
            drawing = false;
        }

        // Event Listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        // Löschen-Button
        document.getElementById(`moveout-clear-signature-${tenantId}`).addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }
});
