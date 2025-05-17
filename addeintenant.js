document.addEventListener('DOMContentLoaded', function () {
    const tenantButton = document.getElementById('einzugtenant');
    let tenantCounter = 1;

    tenantButton.addEventListener('click', function () {
        const tenantDisplay = document.createElement('div');
        tenantDisplay.className = 'table-container tenant-display';
        tenantDisplay.id = `tenant-display-${tenantCounter}`;
        tenantDisplay.innerHTML = `
            <table id="tenant-display-table-${tenantCounter}">
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar" id="tenant-display-header-${tenantCounter}">
                                einziehender Mieter ${tenantCounter}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th class="aa">Daten</th>
                        <th class="aa" colspan="5">Informationen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="tenant-display-name-row-${tenantCounter}">
                        <td>Name</td>
                        <td colspan="5">
                            <input type="text" id="tenant-display-name-${tenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr id="tenant-display-firstname-row-${tenantCounter}">
                        <td>Vorname</td>
                        <td colspan="5">
                            <input type="text" id="tenant-display-firstname-${tenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr id="tenant-display-phone-row-${tenantCounter}">
                        <td>Telefon</td>
                        <td colspan="5">
                            <input type="tel" id="tenant-display-phone-${tenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr id="tenant-display-email-row-${tenantCounter}">
                        <td>E-Mail</td>
                        <td colspan="5">
                            <input type="email" id="tenant-display-email-${tenantCounter}" class="bemerkung-input">
                        </td>
                    </tr>
                    <tr class="tenant-actions-row" id="tenant-display-actions-row-${tenantCounter}">
                        <td>Aktionen</td>
                        <td colspan="5">
                            <button type="button" class="delete-tenant-btn" id="tenant-delete-btn-${tenantCounter}" data-tenant-id="${tenantCounter}">Löschen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Füge das Formular oberhalb des Buttons ein
        tenantButton.insertAdjacentElement('beforebegin', tenantDisplay);

        // Event Listener für den Löschen-Button
        document.getElementById(`tenant-delete-btn-${tenantCounter}`).addEventListener('click', deleteTenant);

        // Event Listener für Input-Änderungen
        document.getElementById(`tenant-display-name-${tenantCounter}`).addEventListener('change', updateSignatureName);
        document.getElementById(`tenant-display-firstname-${tenantCounter}`).addEventListener('change', updateSignatureName);

        // Unterschriftenfeld erstellen (mit leeren Werten initialisieren)
        createSignatureField(tenantCounter, '');

        tenantCounter++;
    });

    function updateSignatureName(e) {
        const tenantId = e.target.id.split('-')[3];
        const name = document.getElementById(`tenant-display-name-${tenantId}`).value;
        const firstname = document.getElementById(`tenant-display-firstname-${tenantId}`).value;
        
        const signatureName = document.getElementById(`tenant-signature-name-${tenantId}`);
        if (signatureName) {
            signatureName.textContent = `${firstname} ${name}`;
        }
    }

    function createSignatureField(tenantId, fullName) {
        const signatureContainer = document.createElement('div');
        signatureContainer.className = 'signature-block';
        signatureContainer.id = `tenant-signature-container-${tenantId}`;
        signatureContainer.innerHTML = `
            <canvas id="tenant-signature-canvas-${tenantId}" width="300" height="100" style="border:1px solid #000; touch-action: none;"></canvas>
            <p><strong>einziehender Mieter: <span class="signature-name" id="tenant-signature-name-${tenantId}">${fullName}</span></strong></p>
            <div>
                <button type="button" id="tenant-clear-signature-${tenantId}">Unterschrift löschen</button>
            </div>
        `;

        document.getElementById('signtenant1').appendChild(signatureContainer);

        // Canvas initialisieren
        const canvas = document.getElementById(`tenant-signature-canvas-${tenantId}`);
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
        document.getElementById(`tenant-clear-signature-${tenantId}`).addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }

    function deleteTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        
        if (confirm('Möchten Sie diesen Mieter wirklich löschen?')) {
            // Anzeige entfernen
            const display = document.getElementById(`tenant-display-${tenantId}`);
            if (display) {
                display.remove();
            }
            
            // Unterschriftsfeld entfernen
            const signatureContainer = document.getElementById(`tenant-signature-container-${tenantId}`);
            if (signatureContainer) {
                signatureContainer.remove();
            }
        }
    }
});
