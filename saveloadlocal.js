document.addEventListener('DOMContentLoaded', function () {
    // Event-Listener für Touch und Click
    const addUniversalListener = (element, event, handler) => {
        if (element) {
            element.addEventListener(event, handler);
            if (event === 'click') {
                element.addEventListener('touchend', handler, { passive: true });
            }
        }
    };

    addUniversalListener(document.getElementById('savelocal'), 'click', promptSaveName);
    addUniversalListener(document.getElementById('loadlocal'), 'click', showSavedStates);
    addUniversalListener(document.getElementById('delete'), 'click', clearAllInputs);

    // Funktion zum Anzeigen aller gespeicherten Zustände

    function showSavedStates() {
        const saves = getAllSaves();

        if (Object.keys(saves).length === 0) {
            showMobileAlert('Keine gespeicherten Zustände gefunden!');
            return;
        }

        let html = `
        <div class="saved-states-container">
            <h3>Gespeicherte Zustände:</h3>
            <button class="close-dialog">×</button>
            <ul class="saved-states-list">`;

        for (const [name, data] of Object.entries(saves)) {
            const timestamp = new Date(data.timestamp).toLocaleString();
            html += `
            <li class="saved-state-item">
                <div class="saved-state-row">
                    <span class="saved-state-name">${name}</span>
                    <span class="saved-state-date">${timestamp}</span>
                    <div class="saved-state-buttons">
                        <button class="button load-btn" data-name="${name}">Laden</button>
                        <button class="delete-btn2" data-name="${name}">x</button>
                    </div>
                </div>
            </li>`;
        }

        html += '</ul></div>';

        // Dialog anzeigen
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay saved-states-dialog';
        dialog.innerHTML = html;
        document.body.appendChild(dialog);

        // Event-Delegation für Buttons
        dialog.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = e.target;

            if (target.classList.contains('close-dialog')) {
                dialog.remove();
            } else if (target.classList.contains('load-btn')) {
                loadSpecificState(target.dataset.name);
                dialog.remove();
            } else if (target.classList.contains('delete-btn2')) {
                if (confirm(`Speicherstand "${target.dataset.name}" wirklich löschen?`)) {
                    deleteState(target.dataset.name);
                    dialog.remove();
                    showSavedStates(); // Aktualisierte Liste anzeigen
                }
            }
        });

        // Touch-Events für mobile Geräte
        dialog.addEventListener('touchend', (e) => {
            e.preventDefault();
            const target = e.target;
            if (target.classList.contains('close-dialog')) {
                dialog.remove();
            } else if (target.classList.contains('load-btn')) {
                loadSpecificState(target.dataset.name);
                dialog.remove();
            } else if (target.classList.contains('delete-btn2')) {
                if (confirm(`Speicherstand "${target.dataset.name}" wirklich löschen?`)) {
                    deleteState(target.dataset.name);
                    dialog.remove();
                    showSavedStates(); // Aktualisierte Liste anzeigen
                }
            }
        }, { passive: false });
    }

    // Mobile-freundliche Namenseingabe
    // Mobile-freundliche Namenseingabe
    function promptSaveName() {
        // Wert aus dem strasseeinzug-Feld holen und Unterstrich anhängen
        const strasseValue = document.getElementById('strasseeinzug').value.trim();
        const defaultName = strasseValue ? `${strasseValue}_` : `Speicherstand_${new Date().toLocaleDateString('de-DE')}`;

        const html = `
    <div class="modal-overlay save-name-dialog">
        <div class="modal-box">
            <h3>Speicherstand benennen</h3>
            <input type="text" id="saveNameInput" class="textinput" placeholder="Name eingeben" value="${defaultName}">
            <div class="modal-buttons">
                <button id="cancelSave" class="modal-btn cancel button">Abbrechen</button>
                <button id="confirmSave" class="modal-btn button">Speichern</button>
            </div>
        </div>
    </div>`;

        const dialog = document.createElement('div');
        dialog.innerHTML = html;
        document.body.appendChild(dialog);

        const inputField = document.getElementById('saveNameInput');
        inputField.focus();
        // Cursor an das Ende setzen, ohne Text zu markieren
        inputField.selectionStart = inputField.selectionEnd = defaultName.length;

        document.getElementById('confirmSave').addEventListener('click', () => {
            const name = inputField.value.trim();
            if (name) {
                saveFormData(name);
                dialog.remove();
                showMobileAlert('Speicherstand erfolgreich gespeichert!', 'success');
            } else {
                inputField.focus();
            }
        });

        document.getElementById('cancelSave').addEventListener('click', () => dialog.remove());
    }

    // Mobile-freundliche Bestätigung mit Erfolgs-/Fehlermeldung
    function showMobileAlert(message, type = 'info') {
        const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : '';
        const html = `
        <div class="modal-overlay alert-dialog ${type}">
            <div class="modal-box">
                <p>${icon} ${message}</p>
                <div class="modal-buttons">
                    <button class="modal-btn confirm alert-ok button">OK</button>
                </div>
            </div>
        </div>`;

        const alertDiv = document.createElement('div');
        alertDiv.innerHTML = html;
        document.body.appendChild(alertDiv);

        alertDiv.querySelector('.alert-ok').addEventListener('click', () => {
            alertDiv.remove();
        });
    }

    // Funktion zum Speichern mit bestimmten Namen
    function saveFormData(saveName) {
        const formData = {};

        // Daten sammeln
        document.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.id) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    formData[element.id] = element.checked;
                } else if (element.type === 'select-one') {
                    formData[element.id] = element.value;
                } else {
                    formData[element.id] = element.value;
                }
            }
        });

        // Radio-Buttons speichern
        const radioGroups = {};
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            if (!radioGroups[radio.name]) {
                radioGroups[radio.name] = document.querySelector(`input[name="${radio.name}"]:checked`)?.value || '';
            }
        });
        formData.radioGroups = radioGroups;

        // Alle bisherigen Speicherstände holen
        const allSaves = getAllSaves();

        // Neuen Speicherstand hinzufügen
        allSaves[saveName] = {
            data: formData,
            timestamp: new Date().toISOString()
        };

        // Speichern
        localStorage.setItem('formSaves', JSON.stringify(allSaves));
    }







    // Funktion zum Laden eines bestimmten Zustands
    window.loadSpecificState = function (saveName) {
        const allSaves = getAllSaves();
        const formData = allSaves[saveName]?.data;

        if (!formData) {
            showMobileAlert('Speicherstand nicht gefunden!', 'error');
            return;
        }

        // Formular zurücksetzen
        clearAllInputs(false); // ohne LocalStorage zu löschen

        // Daten laden
        for (const [id, value] of Object.entries(formData)) {
            if (id === 'radioGroups') continue;

            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'select-one') {
                    element.value = value;
                } else {
                    element.value = value;
                }
            }
        }

        // Radio-Buttons laden
        if (formData.radioGroups) {
            for (const [name, value] of Object.entries(formData.radioGroups)) {
                const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
                if (radio) radio.checked = true;
            }
        }

        // Erfolgsmeldung anzeigen
        showMobileAlert('Speicherstand erfolgreich geladen!', 'success');
    }

    // Funktion zum Löschen eines bestimmten Zustands
    window.loadSpecificState = function (saveName) {
        const allSaves = getAllSaves();
        const formData = allSaves[saveName]?.data;

        if (!formData) {
            showMobileAlert('Speicherstand nicht gefunden!', 'error');
            return;
        }

        // Formular zurücksetzen
        clearAllInputs(false); // ohne LocalStorage zu löschen

        // Daten laden
        for (const [id, value] of Object.entries(formData)) {
            if (id === 'radioGroups') continue;

            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'select-one') {
                    element.value = value;
                } else {
                    element.value = value;
                }
            }
        }

        // Radio-Buttons laden
        if (formData.radioGroups) {
            for (const [name, value] of Object.entries(formData.radioGroups)) {
                const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
                if (radio) radio.checked = true;
            }
        }

        // Erfolgsmeldung anzeigen
        showMobileAlert('Speicherstand erfolgreich geladen!', 'success');
    }

    // Funktion zum Löschen eines bestimmten Zustands
    window.deleteState = function (saveName) {
        const allSaves = getAllSaves();
        delete allSaves[saveName];
        localStorage.setItem('formSaves', JSON.stringify(allSaves));
        showMobileAlert('Speicherstand erfolgreich gelöscht!', 'success');
    }

    // Hilfsfunktion: Alle Speicherstände holen
    function getAllSaves() {
        try {
            return JSON.parse(localStorage.getItem('formSaves')) || {};
        } catch (e) {
            console.error('Fehler beim Zugriff auf localStorage:', e);
            return {};
        }
    }

    // Funktion zum Löschen aller Eingaben
    function clearAllInputs(clearStorage = true) {
        if (clearStorage && !confirm('Wirklich alle Eingaben löschen?')) return;

        document.querySelectorAll('input, select, textarea').forEach(element => {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = false;
            } else if (element.type === 'select-one') {
                element.selectedIndex = 0;
            } else if (element.type === 'number') {
                element.value = element.min || '0';
            } else {
                element.value = '';
            }
        });

        document.querySelectorAll('input[type="radio"][value="nein"]').forEach(radio => {
            radio.checked = true;
        });

        if (clearStorage) {
            localStorage.removeItem('formData');
            showMobileAlert('Alle Eingaben wurden gelöscht!', 'success');
        }
    }
});

// Styling für die Dialoge
const mobileStyles = `
<style>
    /* Allgemeine Dialog-Stile */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 15px;
        box-sizing: border-box;
    }

    .close-dialog {
    position: absolute;
    top: 10px;
    right: 15px;
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #444;
}
    
    .modal-box {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        position: relative;
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Speicherstände Dialog spezifisch */
    .saved-states-container {
        max-height: 80vh;
        overflow-y: auto;
    }

    .saved-states-container {
    position: relative; /* WICHTIG für .close-dialog */
    padding-top: 40px;   /* damit der Button nicht überlappt */
}
    
    .saved-states-container h3 {
        margin: 0 0 15px 0;
        font-size: 1.3rem;
        color: #333;
        text-align: center;
    }
    
    .saved-states-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .saved-state-item {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .saved-state-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .saved-state-name {
        font-weight: 400;
        flex: 3;
        min-width: 120px;
        width:444px;

    }
    
    .saved-state-date {
        font-size: 0.9rem;
        color: #666;
        flex: 1;
        min-width: 150px;
    }
    
    .saved-state-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: nowrap;
    }
    
    /* Button-Styles */
    .button {
        padding: 8px 15px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    
    .load-btn {
        background-color: #4CAF50;
        color: white;
    }
    
    .delete-btn2 {
padding: 0px 15px;
  border: none;
  border-radius: 5px;
  background-color: #a62e2e;
  color:#fff;
    }
    
    .delete-btn2:hover {
        background-color: #d32f2f;
    }
    
    .close-dialog {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #777;
        padding: 5px;
        line-height: 1;
    }
    
    /* Responsive Anpassungen */
    @media (max-width: 600px) {
        .saved-state-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .saved-state-buttons {
            width: 100%;
            justify-content: flex-end;
        }
        
        .button {
            padding: 10px;
            width: 100%;
        }
    }
    
    /* Scrollbar */
    .saved-states-container::-webkit-scrollbar {
        width: 6px;
    }
    
    .saved-states-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 0 12px 12px 0;
    }
    
    .saved-states-container::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
    }

        /* Allgemeine Dialog-Stile */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 15px;
        box-sizing: border-box;
    }

    
    .alert-dialog.error .modal-box {
        border-top: 4px solid #f44336;
    }
    
    .alert-dialog.success p {
        color:rgb(18, 31, 148);
    }
    
    .alert-dialog.error p {
        color: #f44336;
    }

    .alert-dialog.success .modal-box, .alert-dialog.success .modal-box p {
  border-top: none;
  text-align: center;
  font-size: 1.4rem;
  color: #333;
}

</style>
`;

document.head.insertAdjacentHTML('beforeend', mobileStyles);