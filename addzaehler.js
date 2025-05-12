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

    addZaehlerBtn.addEventListener('click', () => renderZaehlerForm(zaehlerCounter++, nextZaehlerNumber++));

    function renderZaehlerForm(id, number, values = {}) {
        const zaehlerForm = document.createElement('div');
        zaehlerForm.className = 'table-container zaehler-table';
        zaehlerForm.id = `zaehler-form-${id}`;
        const selectedType = values.type || "";
        const isCustom = selectedType && !zaehlerTypes.includes(selectedType);

        zaehlerForm.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="kueche-header">
                            <div class="kueche-verfuegbar">Zähler ${number} ${values.edit ? 'bearbeiten' : 'hinzufügen'}</div>
                        </th>
                    </tr>
                    <tr><th class="aa">Daten</th><th class="aa" colspan="5">Eingabe</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Zählertyp*</td>
                        <td colspan="5">
                            <select id="zaehler-type-${id}" class="zaehler-type-select" required>
                                <option value="">-- Bitte auswählen --</option>
                                ${zaehlerTypes.filter(type => type !== "Sonstiger Zähler").map(type => 
                                    `<option value="${type}" ${selectedType === type ? 'selected' : ''}>${type}</option>`
                                ).join('')}
                                <option value="custom" ${isCustom ? 'selected' : ''}>Sonstiger Zähler</option>
                            </select>
                            <div id="custom-zaehler-container-${id}" style="display:${isCustom ? 'block' : 'none'}; margin-top:5px;">
                                <input type="text" id="custom-zaehler-type-${id}" placeholder="Zählertyp eingeben" value="${isCustom ? selectedType : ''}">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Zählernummer*</td>
                        <td colspan="5"><input type="text" class="textinput" id="zaehler-number-${id}" required value="${values.number || ''}"></td>
                    </tr>
                    <tr>
                        <td>Einbaulage</td>
                        <td colspan="5"><input type="text" class="textinput" id="zaehler-value-${id}" required value="${values.value || ''}"></td>
                    </tr>
                    <tr>
                        <td>Zählerstand</td>
                        <td colspan="5">
                            <input type="number" class="textinput" id="zaehler-stand-${id}" step="0.01" value="${values.stand || ''}">
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td colspan="5">
                            <button type="button" class="save-zaehler-btn primary-btn" data-zaehler-id="${id}" data-zaehler-number="${number}">Speichern</button>
                            <button type="button" class="cancel-zaehler-btn secondary-btn" data-zaehler-id="${id}">Abbrechen</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

        // Einfügen oberhalb des Buttons
        addZaehlerBtn.insertAdjacentElement('beforebegin', zaehlerForm);

        // Event-Listener für Typ-Änderungen
        const typeSelect = document.getElementById(`zaehler-type-${id}`);
        typeSelect.addEventListener('change', function() {
            const customContainer = document.getElementById(`custom-zaehler-container-${id}`);
            if (this.value === "custom") {
                customContainer.style.display = "block";
            } else {
                customContainer.style.display = "none";
            }
        });

        // Event-Listener für Buttons
        document.querySelector(`#zaehler-form-${id} .save-zaehler-btn`).addEventListener('click', () => saveZaehler(id, number));
        document.querySelector(`#zaehler-form-${id} .cancel-zaehler-btn`).addEventListener('click', () => cancelZaehler(id));
    }

    function saveZaehler(id, number) {
        const typeSelect = document.getElementById(`zaehler-type-${id}`);
        const type = typeSelect.value === "custom" 
            ? document.getElementById(`custom-zaehler-type-${id}`).value
            : typeSelect.value;
            
        const num = document.getElementById(`zaehler-number-${id}`).value;
        const val = document.getElementById(`zaehler-value-${id}`).value;
        const stand = document.getElementById(`zaehler-stand-${id}`).value;

        if (!type || !num || !val || !stand) {
            alert("Bitte füllen Sie alle Pflichtfelder aus!");
            return;
        }

        const displayHTML = `
            <div class="table-container zaehler-display" id="zaehler-display-${id}">
                <table>
                    <thead>
                        <tr><th colspan="6" class="kueche-header"><div class="kueche-verfuegbar">Zähler ${number}</div></th></tr>
                        <tr><th class="aa">Daten</th><th class="aa" colspan="5">Informationen</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Zählertyp</td><td colspan="5">${type}</td></tr>
                        <tr><td>Zählernummer</td><td colspan="5">${num}</td></tr>
                        <tr><td>Einbaulage</td><td colspan="5">${val}</td></tr>
                        <tr><td>Zählerstand</td><td colspan="5">${stand}</td></tr>
                        <tr><td></td><td colspan="5">
                            <button type="button" class="edit-zaehler-btn primary-btn" data-zaehler-id="${id}">Bearbeiten</button>
                            <button type="button" class="delete-zaehler-btn secondary-btn" data-zaehler-id="${id}">Löschen</button>
                        </td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Ersetzen des Formulars durch die Anzeige oberhalb des Buttons
        const formElement = document.getElementById(`zaehler-form-${id}`);
        formElement.insertAdjacentHTML('beforebegin', displayHTML);
        formElement.remove();

        // Event-Listener für die neuen Buttons
        document.querySelector(`#zaehler-display-${id} .edit-zaehler-btn`).addEventListener('click', () => editZaehler(id, number));
        document.querySelector(`#zaehler-display-${id} .delete-zaehler-btn`).addEventListener('click', () => deleteZaehler(id));
    }

    function editZaehler(id, number) {
        const display = document.getElementById(`zaehler-display-${id}`);
        if (!display) return;

        const rows = display.querySelectorAll('tbody tr');
        const type = rows[0].querySelector('td:last-child').textContent.trim();
        const num = rows[1].querySelector('td:last-child').textContent.trim();
        const val = rows[2].querySelector('td:last-child').textContent.trim();
        const stand = rows[3].querySelector('td:last-child').textContent.trim();

        display.remove();
        renderZaehlerForm(id, number, {
            type,
            number: num,
            value: val,
            stand,
            edit: true
        });
    }

    function deleteZaehler(id) {
        document.getElementById(`zaehler-display-${id}`)?.remove();
    }
});