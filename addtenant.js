document.addEventListener('DOMContentLoaded', function () {
    const tenantButton = document.getElementById('einzugtenant');
    let tenantCounter = 1;

    tenantButton.addEventListener('click', function () {
        // Erstelle eine neue Tabelle für den Mieter
        const tenantTable = document.createElement('div');
        tenantTable.className = 'table-container tenant-table';
        tenantTable.id = `tenant-table-${tenantCounter}`;
        tenantTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                Mieter ${tenantCounter} hinzufügen
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
                        <td>Name</td>
                        <td colspan="5">
                            <input type="text" id="tenant-name-${tenantCounter}" class="tenant-input" required>
                        </td>
                    </tr>
                    <tr>
                        <td>Vorname</td>
                        <td colspan="5">
                            <input type="text" id="tenant-vorname-${tenantCounter}" class="tenant-input" required>
                        </td>
                    </tr>
                    <tr>
                        <td>Telefon</td>
                        <td colspan="5">
                            <input type="tel" id="tenant-tel-${tenantCounter}" class="tenant-input">
                        </td>
                    </tr>
                    <tr>
                        <td>E-Mail</td>
                        <td colspan="5">
                            <input type="email" id="tenant-email-${tenantCounter}" class="tenant-input">
                        </td>
                    </tr>
                    <tr class="tenant-actions-row">
                        <td>Aktionen</td>
                        <td colspan="5">
                            <button type="button" class="save-tenant-btn" data-tenant-id="${tenantCounter}">Speichern</button>
                            <button type="button" class="cancel-tenant-btn" data-tenant-id="${tenantCounter}">Abbrechen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Füge die Tabelle vor dem Button ein
        tenantButton.parentNode.insertBefore(tenantTable, tenantButton);

        // Event Listener für die Buttons
        document.querySelector(`.save-tenant-btn[data-tenant-id="${tenantCounter}"]`).addEventListener('click', saveTenant);
        document.querySelector(`.cancel-tenant-btn[data-tenant-id="${tenantCounter}"]`).addEventListener('click', cancelTenant);

        tenantCounter++;
    });

    function saveTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const name = document.getElementById(`tenant-name-${tenantId}`).value;
        const vorname = document.getElementById(`tenant-vorname-${tenantId}`).value;
        const tel = document.getElementById(`tenant-tel-${tenantId}`).value;
        const email = document.getElementById(`tenant-email-${tenantId}`).value;

        if (!name || !vorname) {
            alert('Name und Vorname sind Pflichtfelder!');
            return;
        }

        // Erstelle eine Anzeige-Tabelle für den gespeicherten Mieter
        const tenantDisplay = document.createElement('div');
        tenantDisplay.className = 'table-container tenant-display';
        tenantDisplay.id = `tenant-display-${tenantId}`;
        tenantDisplay.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                Mieter ${tenantId}
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
                        <td>Name</td>
                        <td colspan="5">${name}</td>
                    </tr>
                    <tr>
                        <td>Vorname</td>
                        <td colspan="5">${vorname}</td>
                    </tr>
                    ${tel ? `<tr><td>Telefon</td><td colspan="5">${tel}</td></tr>` : ''}
                    ${email ? `<tr><td>E-Mail</td><td colspan="5">${email}</td></tr>` : ''}
                    <tr class="tenant-actions-row">
                        <td>Aktionen</td>
                        <td colspan="5">
                            <button type="button" class="edit-tenant-btn" data-tenant-id="${tenantId}">Bearbeiten</button>
                            <button type="button" class="delete-tenant-btn" data-tenant-id="${tenantId}">Löschen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Entferne das Eingabe-Formular
        const form = document.getElementById(`tenant-table-${tenantId}`);
        form.remove();

        // Füge die Anzeige hinzu
        document.querySelector('.tenant').appendChild(tenantDisplay);

        // Event Listener für die Buttons
        document.querySelector(`.edit-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', editTenant);
        document.querySelector(`.delete-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', deleteTenant);

        // Erstelle das Unterschriftenfeld mit Canvas
        const signatureContainer = document.createElement('div');
        signatureContainer.className = 'signature-block';
        signatureContainer.innerHTML = `
            <p><strong>Unterschrift Mieter ${tenantId}:</strong></p>
            <canvas id="signature-canvas-${tenantId}" width="300" height="100" style="border:1px solid #000;"></canvas>
            <div>
                <button type="button" id="clear-signature-${tenantId}">Unterschrift löschen</button>
            </div>
            <div class="signature-name" id="tenant-signature-name-${tenantId}">
                ${vorname} ${name}
            </div>
        `;

        document.getElementById('mainandtenant1').appendChild(signatureContainer);

        // Canvas zeichnen initialisieren
        const canvas = document.getElementById(`signature-canvas-${tenantId}`);
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
        document.getElementById(`clear-signature-${tenantId}`).addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });


    }

    function cancelTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const form = document.getElementById(`tenant-table-${tenantId}`);
        form.remove();
    }

    function editTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const display = document.getElementById(`tenant-display-${tenantId}`);

        // Hole die aktuellen Werte
        const rows = display.querySelectorAll('tbody tr');
        const name = rows[0].querySelector('td:last-child').textContent;
        const vorname = rows[1].querySelector('td:last-child').textContent;
        const tel = rows.length > 2 && rows[2].querySelector('td:first-child').textContent === 'Telefon'
            ? rows[2].querySelector('td:last-child').textContent : '';
        const email = rows.length > 2 && rows[rows.length - 2].querySelector('td:first-child').textContent === 'E-Mail'
            ? rows[rows.length - 2].querySelector('td:last-child').textContent : '';

        // Erstelle eine Bearbeitungstabelle
        const editTable = document.createElement('div');
        editTable.className = 'table-container tenant-table';
        editTable.id = `tenant-edit-${tenantId}`;
        editTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                Mieter ${tenantId} bearbeiten
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
                        <td>Name</td>
                        <td colspan="5">
                            <input type="text" id="edit-tenant-name-${tenantId}" class="tenant-input" value="${name}" required>
                        </td>
                    </tr>
                    <tr>
                        <td>Vorname</td>
                        <td colspan="5">
                            <input type="text" id="edit-tenant-vorname-${tenantId}" class="tenant-input" value="${vorname}" required>
                        </td>
                    </tr>
                    <tr>
                        <td>Telefon</td>
                        <td colspan="5">
                            <input type="tel" id="edit-tenant-tel-${tenantId}" class="tenant-input" value="${tel}">
                        </td>
                    </tr>
                    <tr>
                        <td>E-Mail</td>
                        <td colspan="5">
                            <input type="email" id="edit-tenant-email-${tenantId}" class="tenant-input" value="${email}">
                        </td>
                    </tr>
                    <tr class="tenant-actions-row">
                        <td>Aktionen</td>
                        <td colspan="5">
                            <button type="button" class="save-edit-tenant-btn" data-tenant-id="${tenantId}">Speichern</button>
                            <button type="button" class="cancel-edit-tenant-btn" data-tenant-id="${tenantId}">Abbrechen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Ersetze die Anzeige durch das Bearbeitungsformular
        display.replaceWith(editTable);

        // Event Listener für die Buttons
        document.querySelector(`.save-edit-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', saveEditedTenant);
        document.querySelector(`.cancel-edit-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', cancelEditTenant);
    }

    function saveEditedTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const name = document.getElementById(`edit-tenant-name-${tenantId}`).value;
        const vorname = document.getElementById(`edit-tenant-vorname-${tenantId}`).value;
        const tel = document.getElementById(`edit-tenant-tel-${tenantId}`).value;
        const email = document.getElementById(`edit-tenant-email-${tenantId}`).value;

        if (!name || !vorname) {
            alert('Name und Vorname sind Pflichtfelder!');
            return;
        }

        // Aktualisiere die Anzeige-Tabelle
        const tenantDisplay = document.createElement('div');
        tenantDisplay.className = 'table-container tenant-display';
        tenantDisplay.id = `tenant-display-${tenantId}`;
        tenantDisplay.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">
                                Mieter ${tenantId}
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
                        <td>Name</td>
                        <td colspan="5">${name}</td>
                    </tr>
                    <tr>
                        <td>Vorname</td>
                        <td colspan="5">${vorname}</td>
                    </tr>
                    ${tel ? `<tr><td>Telefon</td><td colspan="5">${tel}</td></tr>` : ''}
                    ${email ? `<tr><td>E-Mail</td><td colspan="5">${email}</td></tr>` : ''}
                    <tr class="tenant-actions-row">
                        <td>Aktionen</td>
                        <td colspan="5">
                            <button type="button" class="edit-tenant-btn" data-tenant-id="${tenantId}">Bearbeiten</button>
                            <button type="button" class="delete-tenant-btn" data-tenant-id="${tenantId}">Löschen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Ersetze das Bearbeitungsformular durch die aktualisierte Anzeige
        const form = document.getElementById(`tenant-edit-${tenantId}`);
        form.replaceWith(tenantDisplay);

        // Event Listener für die Buttons
        document.querySelector(`.edit-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', editTenant);
        document.querySelector(`.delete-tenant-btn[data-tenant-id="${tenantId}"]`).addEventListener('click', deleteTenant);
    }

    function cancelEditTenant(e) {
        const tenantId = e.target.getAttribute('data-tenant-id');
        const form = document.getElementById(`tenant-edit-${tenantId}`);

        // Hier könnten Sie die ursprünglichen Werte wiederherstellen
        // Für dieses Beispiel rufen wir einfach die saveEditedTenant-Funktion auf
        saveEditedTenant(e);
    }

function deleteTenant(e) {
    const tenantId = e.target.getAttribute('data-tenant-id');

    // Anzeige entfernen
    const display = document.getElementById(`tenant-display-${tenantId}`);
    if (display) {
        display.remove();
    }

    // Unterschriftenfeld entfernen
    const signatureBlock = document.getElementById(`signature-canvas-${tenantId}`);
    if (signatureBlock) {
        signatureBlock.parentElement.remove(); // Entfernt den gesamten div.signature-block
    }
}




});

