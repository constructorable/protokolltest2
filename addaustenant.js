document.addEventListener('DOMContentLoaded', function () {
    const moveOutButton = document.getElementById('auszugtenant');
    let moveOutTenantCounter = 10;

    moveOutButton.addEventListener('click', function () {
        // Erstelle eine neue Tabelle für den ausziehenden Mieter
        const moveOutTenantTable = document.createElement('div');
        moveOutTenantTable.className = 'table-container tenant-table';
        moveOutTenantTable.id = `auszug-tenant-table-${moveOutTenantCounter}`;
        moveOutTenantTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                ausziehenden Mieter hinzufügen (${moveOutTenantCounter})
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Name, Vorname</td>
                        <td colspan="5">
                            <input type="text" id="auszug-tenant-fullname-${moveOutTenantCounter}" class="tenant-input" required>
                        </td>
                    </tr>
                    <tr>
                        <td>neue Straße</td>
                        <td colspan="5">
                            <input type="text" id="auszug-tenant-street-${moveOutTenantCounter}" class="tenant-input">
                        </td>
                    </tr>
                    <tr>
                        <td>PLZ, Ort</td>
                        <td colspan="5">
                            <input type="tel" id="auszug-tenant-ortplz-${moveOutTenantCounter}" class="tenant-input">
                        </td>
                    </tr>
                    <tr>
                        <td>E-Mail</td>
                        <td colspan="5">
                            <input type="email" id="auszug-tenant-email-${moveOutTenantCounter}" class="tenant-input">
                        </td>
                    </tr>
                    <tr class="tenant-actions-row">
                        <td></td>
                        <td colspan="5">
                            <button type="button" class="save-auszug-tenant-btn" data-tenant-id="${moveOutTenantCounter}">Speichern</button>
                            <button type="button" class="cancel-auszug-tenant-btn" data-tenant-id="${moveOutTenantCounter}">Abbrechen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Füge die Tabelle vor dem Button ein
        moveOutButton.parentNode.insertBefore(moveOutTenantTable, moveOutButton);

        // Event Listener für die Buttons
        document.querySelector(`.save-auszug-tenant-btn[data-tenant-id="${moveOutTenantCounter}"]`).addEventListener('click', saveMoveOutTenant);
        document.querySelector(`.cancel-auszug-tenant-btn[data-tenant-id="${moveOutTenantCounter}"]`).addEventListener('click', cancelMoveOutTenant);

        moveOutTenantCounter++;
    });

    function saveMoveOutTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const fullname = document.getElementById(`auszug-tenant-fullname-${tenantId}`).value;
        const street = document.getElementById(`auszug-tenant-street-${tenantId}`).value;
        const ortplz = document.getElementById(`auszug-tenant-ortplz-${tenantId}`).value;
        const email = document.getElementById(`auszug-tenant-email-${tenantId}`).value;

        if (!fullname) {
            alert('Name ist Pflichtfeld!');
            return;
        }

        // Erstelle eine Anzeige-Tabelle für den gespeicherten Mieter
        const tenantDisplay = document.createElement('div');
        tenantDisplay.className = 'table-container tenant-display';
        tenantDisplay.id = `auszug-tenant-display-${tenantId}`;
        tenantDisplay.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                ausziehender Mieter 
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
                        <td>Name, Vorname</td>
                        <td colspan="5">${fullname}</td>
                    </tr>
                    <tr>
                        <td>neue Straße</td>
                        <td colspan="5">${street}</td>
                    </tr>
                    ${ortplz ? `<tr><td>PLZ, Ort</td><td colspan="5">${ortplz}</td></tr>` : ''}
                    ${email ? `<tr><td>E-Mail</td><td colspan="5">${email}</td></tr>` : ''}
                    <tr class="tenant-actions-row">
                        <td></td>
                        <td colspan="5">
                            <button type="button" class="edit-auszug-tenant-btn" data-tenant-id="${tenantId}">Bearbeiten</button>
                            <button type="button" class="delete-auszug-tenant-btn" data-tenant-id="${tenantId}">Löschen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Entferne das Eingabe-Formular
        const form = document.getElementById(`auszug-tenant-table-${tenantId}`);
        form.remove();

        // Füge die Anzeige hinzu
        document.querySelector('.tenant').appendChild(tenantDisplay);

        // Event Listener für die Buttons
        document.querySelector(`.edit-auszug-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', editMoveOutTenant);
        document.querySelector(`.delete-auszug-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', deleteMoveOutTenant);

        // Erstelle das Unterschriftenfeld mit Canvas
        const signatureContainer = document.createElement('div');
        signatureContainer.className = 'signature-block';
        signatureContainer.innerHTML = `
            <canvas id="auszug-signature-canvas-${tenantId}" width="300" height="100" style="border:1px solid #000;"></canvas>
            <p><strong>ausziehender Mieter: <span class="signature-name" id="auszug-tenant-signature-name-${tenantId}">${fullname}</span></strong></p>
            <div>
                <button type="button" id="clear-auszug-signature-${tenantId}">x</button>
            </div>
        `;

        document.getElementById('signtenant1').appendChild(signatureContainer);

        // Canvas zeichnen initialisieren
        const canvas = document.getElementById(`auszug-signature-canvas-${tenantId}`);
        const ctx = canvas.getContext('2d');
        let drawing = false;

        canvas.addEventListener('mousedown', () => drawing = true);
        canvas.addEventListener('mouseup', () => drawing = false);
        canvas.addEventListener('mouseout', () => drawing = false);
        canvas.addEventListener('mousemove', (e) => {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        });

        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        // Unterschrift löschen
        document.getElementById(`clear-auszug-signature-${tenantId}`).addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    }

    function cancelMoveOutTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const form = document.getElementById(`auszug-tenant-table-${tenantId}`);
        form.remove();
    }

    function editMoveOutTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const display = document.getElementById(`auszug-tenant-display-${tenantId}`);

        // Hole die aktuellen Werte
        const rows = display.querySelectorAll('tbody tr');
        const fullname = rows[0].querySelector('td:last-child').textContent;
        const street = rows[1].querySelector('td:last-child').textContent;
        const ortplz = rows.length > 2 && rows[2].querySelector('td:first-child').textContent === 'PLZ, Ort'
            ? rows[2].querySelector('td:last-child').textContent : '';
        const email = rows.length > 2 && rows[rows.length - 2].querySelector('td:first-child').textContent === 'E-Mail'
            ? rows[rows.length - 2].querySelector('td:last-child').textContent : '';

        // Erstelle eine Bearbeitungstabelle
        const editTable = document.createElement('div');
        editTable.className = 'table-container tenant-table';
        editTable.id = `auszug-tenant-edit-${tenantId}`;
        editTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                ausziehender Mieter ${tenantId} bearbeiten
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
                        <td>Name, Vorname</td>
                        <td colspan="5">
                            <input type="text" id="edit-auszug-tenant-fullname-${tenantId}" class="tenant-input" value="${fullname}" required>
                        </td>
                    </tr>
                    <tr>
                        <td>neue Straße</td>
                        <td colspan="5">
                            <input type="text" id="edit-auszug-tenant-street-${tenantId}" class="tenant-input" value="${street}">
                        </td>
                    </tr>
                    <tr>
                        <td>PLZ, Ort</td>
                        <td colspan="5">
                            <input type="tel" id="edit-auszug-tenant-ortplz-${tenantId}" class="tenant-input" value="${ortplz}">
                        </td>
                    </tr>
                    <tr>
                        <td>E-Mail</td>
                        <td colspan="5">
                            <input type="email" id="edit-auszug-tenant-email-${tenantId}" class="tenant-input" value="${email}">
                        </td>
                    </tr>
                    <tr class="tenant-actions-row">
                        <td></td>
                        <td colspan="5">
                            <button type="button" class="save-edit-auszug-tenant-btn" data-tenant-id="${tenantId}">Speichern</button>
                            <button type="button" class="cancel-edit-auszug-tenant-btn" data-tenant-id="${tenantId}">Abbrechen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Ersetze die Anzeige durch das Bearbeitungsformular
        display.replaceWith(editTable);

        // Event Listener für die Buttons
        document.querySelector(`.save-edit-auszug-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', saveEditedMoveOutTenant);
        document.querySelector(`.cancel-edit-auszug-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', cancelEditMoveOutTenant);
    }

    function saveEditedMoveOutTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const fullname = document.getElementById(`edit-auszug-tenant-fullname-${tenantId}`).value;
        const street = document.getElementById(`edit-auszug-tenant-street-${tenantId}`).value;
        const ortplz = document.getElementById(`edit-auszug-tenant-ortplz-${tenantId}`).value;
        const email = document.getElementById(`edit-auszug-tenant-email-${tenantId}`).value;

/*         if (!fullname || !street) {
            alert('Name und neue Straße sind Pflichtfelder!');
            return;
        } */

            if (!fullname) {
            alert('Name ist Pflichtfeld!');
            return;
        }

        // Aktualisiere die Anzeige-Tabelle
        const tenantDisplay = document.createElement('div');
        tenantDisplay.className = 'table-container tenant-display';
        tenantDisplay.id = `auszug-tenant-display-${tenantId}`;
        tenantDisplay.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                ausziehender Mieter ${tenantId}
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
                        <td>Name, Vorname</td>
                        <td colspan="5">${fullname}</td>
                    </tr>
                    <tr>
                        <td>neue Straße</td>
                        <td colspan="5">${street}</td>
                    </tr>
                    ${ortplz ? `<tr><td>PLZ, Ort</td><td colspan="5">${ortplz}</td></tr>` : ''}
                    ${email ? `<tr><td>E-Mail</td><td colspan="5">${email}</td></tr>` : ''}
                    <tr class="tenant-actions-row">
                        <td></td>
                        <td colspan="5">
                            <button type="button" class="edit-auszug-tenant-btn" data-tenant-id="${tenantId}">Bearbeiten</button>
                            <button type="button" class="delete-auszug-tenant-btn" data-tenant-id="${tenantId}">Löschen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Ersetze das Bearbeitungsformular durch die aktualisierte Anzeige
        const form = document.getElementById(`auszug-tenant-edit-${tenantId}`);
        form.replaceWith(tenantDisplay);

        // Event Listener für die Buttons
        document.querySelector(`.edit-auszug-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', editMoveOutTenant);
        document.querySelector(`.delete-auszug-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', deleteMoveOutTenant);
    }

    function cancelEditMoveOutTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const form = document.getElementById(`auszug-tenant-edit-${tenantId}`);

        // Hier könnten Sie die ursprünglichen Werte wiederherstellen
        // Für dieses Beispiel rufen wir einfach die saveEditedMoveOutTenant-Funktion auf
        saveEditedMoveOutTenant(e);
    }

    function deleteMoveOutTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');

        // Anzeige entfernen
        const display = document.getElementById(`auszug-tenant-display-${tenantId}`);
        if (display) {
            display.remove();
        }

        // Unterschriftenfeld entfernen
        const signatureBlock = document.getElementById(`auszug-signature-canvas-${tenantId}`);
        if (signatureBlock) {
            signatureBlock.parentElement.remove(); // Entfernt den gesamten div.signature-block
        }
    }
});