document.addEventListener('DOMContentLoaded', function () {
    // Event-Listener für Touch und Click
    const addUniversalListener = (element, event, handler) => {
        element.addEventListener(event, handler);
        if (event === 'click') {
            element.addEventListener('touchend', handler, { passive: true });
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
            html += `<li>
                <span>${name}</span>
                <div class="button-group">
                    <button class="load-btn" data-name="${name}">Laden</button>
                    <button class="delete-btn" data-name="${name}">Löschen</button>
                </div>
            </li>`;
        }

        html += '</ul></div>';

        // Dialog anzeigen
        // Dialog anzeigen
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = html; // verwende das zuvor generierte HTML

        document.body.appendChild(dialog);


        document.body.appendChild(dialog);

        // Event-Delegation für Buttons
        // Event-Delegation für Buttons
        dialog.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-dialog')) {
                dialog.remove();
            } else if (e.target.classList.contains('load-btn')) {
                loadSpecificState(e.target.dataset.name);
                dialog.remove();
            } else if (e.target.classList.contains('delete-btn')) {
                deleteState(e.target.dataset.name);
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
            } else if (target.classList.contains('delete-btn')) {
                deleteState(target.dataset.name);
            }
        });
    }

    // Mobile-freundliche Namenseingabe
    function promptSaveName() {
        const html = `
    <div class="modal-overlay">
        <div class="modal-box">
            <h3>Speicherstand benennen</h3>
            <input type="text" id="saveNameInput" class="modal-input" placeholder="Name eingeben">
            <div class="modal-buttons">
                <button id="cancelSave" class="modal-btn cancel">Abbrechen</button>
                <button id="confirmSave" class="modal-btn confirm">Speichern</button>
            </div>
        </div>
    </div>`;

        const dialog = document.createElement('div');
        dialog.innerHTML = html;
        document.body.appendChild(dialog);

        document.getElementById('confirmSave').addEventListener('click', () => {
            const name = document.getElementById('saveNameInput').value.trim();
            if (name) {
                saveFormData(name);
                dialog.remove();
            }
        });

        document.getElementById('cancelSave').addEventListener('click', () => dialog.remove());
    }


    // Mobile-freundliche Bestätigung
    function showMobileAlert(message) {
        const html = `
    <div class="modal-overlay">
        <div class="modal-box">
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="modal-btn confirm alert-ok">OK</button>
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
        /* alert(`Speicherstand "${saveName}" wurde gespeichert!`); */
    }

    // Funktion zum Laden eines bestimmten Zustands
    window.loadSpecificState = function (saveName) {
        const allSaves = getAllSaves();
        const formData = allSaves[saveName]?.data;

        if (!formData) {
            alert('Speicherstand nicht gefunden!');
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

        // Dialog schließen
        const dialog = document.querySelector('.saved-states-dialog');
        if (dialog) document.body.removeChild(dialog);

        /*  alert(`Speicherstand "${saveName}" wurde geladen!`); */
    }

    // Funktion zum Löschen eines bestimmten Zustands
    window.deleteState = function (saveName) {
        if (!confirm(`Speicherstand "${saveName}" wirklich löschen?`)) return;

        const allSaves = getAllSaves();
        delete allSaves[saveName];
        localStorage.setItem('formSaves', JSON.stringify(allSaves));

        // Dialog aktualisieren
        showSavedStates();
    }

    // Hilfsfunktion: Alle Speicherstände holen
    function getAllSaves() {
        return JSON.parse(localStorage.getItem('formSaves')) || {};
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
        }
    }

    // Nummern-Input Handhabung
    document.querySelectorAll('.number-btn').forEach(button => {
        button.addEventListener('click', function () {
            const input = this.parentElement.querySelector('input[type="number"]');
            if (input) {
                if (this.classList.contains('plus')) {
                    input.stepUp();
                } else if (this.classList.contains('minus')) {
                    input.stepDown();
                }
                const event = new Event('change');
                input.dispatchEvent(event);
            }
        });
    });

    if (!document.getElementById('savelocal') || !document.getElementById('loadlocal') || !document.getElementById('delete')) {
        console.error('Ein oder mehrere Buttons wurden nicht gefunden!');
    }

    function getAllSaves() {
        try {
            return JSON.parse(localStorage.getItem('formSaves')) || {};
        } catch (e) {
            console.error('Fehler beim Zugriff auf localStorage:', e);
            return {};
        }
    }

});

document.addEventListener('DOMContentLoaded', function () {
    // ... [vorheriger Code bleibt gleich bis zur mobileStyles Definition] ...
});

const mobileStyles = `
<style>
    /* Dialog-Hintergrund */
    .saved-states-dialog {
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
    
    /* Dialog-Container */
    .saved-states-container {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        position: relative;
        padding: 20px;
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    /* Titel */
    .saved-states-container h3 {
        margin: 0 0 15px 0;
        font-size: 1.3rem;
        color: #333;
        text-align: center;
    }
    
    /* Liste */
    .saved-states-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    /* Listenelemente */
    .saved-states-list li {
        display: flex;
        flex-direction: column;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    /* Name des Speicherstands */
    .saved-states-list li span {
        font-weight: 500;
        margin-bottom: 8px;
        word-break: break-word;
    }
    
    /* Button-Gruppe */
    .button-group {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    /* Allgemeine Button-Styles */
    .button-group button {
        padding: 8px 15px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    /* Laden-Button */
    .load-btn {
        background-color: #4CAF50;
        color: white;
    }
    
    .load-btn:hover {
        background-color: #3e8e41;
    }
    
    /* Löschen-Button */
    .delete-btn {
        background-color: #f44336;
        color: white;
    }
    
    .delete-btn:hover {
        background-color: #d32f2f;
    }
    
    /* Schließen-Button */
    .close-dialog {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #777;
        padding: 5px;
    }
    
    .close-dialog:hover {
        color: #333;
    }
    
    /* Responsive Anpassungen für sehr kleine Geräte */
    @media (max-width: 480px) {
        .saved-states-container {
            width: 95%;
            padding: 15px;
        }
        
        .button-group {
            flex-direction: column;
            gap: 8px;
        }
        
        .button-group button {
            width: 100%;
            padding: 10px;
        }
    }
    
    /* Scrollbar für die Liste */
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
    
    .saved-states-container::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
</style>
`;

document.head.insertAdjacentHTML('beforeend', mobileStyles);