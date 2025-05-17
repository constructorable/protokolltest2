document.addEventListener('DOMContentLoaded', function () {
    const moveOutButton = document.getElementById('auszugtenant');
    let moveOutTenantCounter = 1;

    moveOutButton.addEventListener('click', function () {
        const moveOutDisplay = document.createElement('div');
        moveOutDisplay.className = 'table-container tenant-display';
        moveOutDisplay.id = `moveout-display-${moveOutTenantCounter}`;
        moveOutDisplay.innerHTML = `
            <table id="moveout-display-table-${moveOutTenantCounter}">
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar" id="moveout-display-header-${moveOutTenantCounter}">
                                ausziehender Mieter ${moveOutTenantCounter}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th class="aa">Daten</th>
                        <th class="aa" colspan="5">Informationen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="moveout-display-name-row-${moveOutTenantCounter}">
                        <td>Name, Vorname</td>
                        <td colspan="5">
                            <input type="text" id="moveout-display-name-${moveOutTenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr id="moveout-display-street-row-${moveOutTenantCounter}">
                        <td>neue Straße</td>
                        <td colspan="5">
                            <input type="text" id="moveout-display-street-${moveOutTenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr id="moveout-display-zipcity-row-${moveOutTenantCounter}">
                        <td>PLZ, Ort</td>
                        <td colspan="5">
                            <input type="text" id="moveout-display-zipcity-${moveOutTenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr id="moveout-display-email-row-${moveOutTenantCounter}">
                        <td>E-Mail</td>
                        <td colspan="5">
                            <input type="email" id="moveout-display-email-${moveOutTenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr class="tenant-actions-row" id="moveout-display-actions-row-${moveOutTenantCounter}">
                        <td>Aktionen</td>
                        <td colspan="5">
                            <button type="button" class="delete-moveout-btn" id="moveout-delete-btn-${moveOutTenantCounter}" data-tenant-id="${moveOutTenantCounter}">Löschen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Füge das Formular oberhalb des Buttons ein
        moveOutButton.insertAdjacentElement('beforebegin', moveOutDisplay);

        // Event Listener für den Löschen-Button
        document.getElementById(`moveout-delete-btn-${moveOutTenantCounter}`).addEventListener('click', deleteMoveOutTenant);

        // Event Listener für Input-Änderungen
        document.getElementById(`moveout-display-name-${moveOutTenantCounter}`).addEventListener('change', updateMoveOutSignatureName);

        // Unterschriftenfeld erstellen (mit leeren Werten initialisieren)
        createMoveOutSignatureField(moveOutTenantCounter, '');

        moveOutTenantCounter++;
    });

    function updateMoveOutSignatureName(e) {
        const tenantId = e.target.id.split('-')[3];
        const name = document.getElementById(`moveout-display-name-${tenantId}`).value;
        
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
            <canvas id="moveout-signature-canvas-${tenantId}" width="300" height="100" style="border:1px solid #000; touch-action: none;"></canvas>
            <p><strong>ausziehender Mieter: <span class="signature-name" id="moveout-signature-name-${tenantId}">${fullName}</span></strong></p>
            <div>
                <button type="button" id="moveout-clear-signature-${tenantId}">Unterschrift löschen</button>
            </div>
        `;

        document.getElementById('signtenant1').appendChild(signatureContainer);

        // Canvas initialisieren
        const canvas = document.getElementById(`moveout-signature-canvas-${tenantId}`);
        const ctx = canvas.getContext('2d');
        let drawing = false;

        // Funktion zum Starten der Zeichnung
        function startDrawing(e) {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX ? e.clientX : e.touches[0].clientX;
            const y = e.clientY ? e.clientY : e.touches[0].clientY;
            ctx.beginPath();
            ctx.moveTo(x - rect.left, y - rect.top);
            e.preventDefault(); // Verhindert Scrollen bei Touch-Events
        }

        // Funktion zum Zeichnen
        function draw(e) {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX ? e.clientX : e.touches[0].clientX;
            const y = e.clientY ? e.clientY : e.touches[0].clientY;
            ctx.lineTo(x - rect.left, y - rect.top);
            ctx.stroke();
            e.preventDefault(); // Verhindert Scrollen bei Touch-Events
        }

        // Funktion zum Beenden der Zeichnung
        function stopDrawing() {
            drawing = false;
        }

        // Maus-Events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch-Events für mobile Geräte
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        // Löschen-Button
        document.getElementById(`moveout-clear-signature-${tenantId}`).addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }

    function deleteMoveOutTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        
        if (confirm('Möchten Sie diesen ausziehenden Mieter wirklich löschen?')) {
            // Anzeige entfernen
            const display = document.getElementById(`moveout-display-${tenantId}`);
            if (display) {
                display.remove();
            }
            
            // Unterschriftsfeld entfernen
            const signatureContainer = document.getElementById(`moveout-signature-container-${tenantId}`);
            if (signatureContainer) {
                signatureContainer.remove();
            }
        }
    }
});
