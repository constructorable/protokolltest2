document.addEventListener('DOMContentLoaded', function () {
    // Event Delegation für alle Tabellen
    document.addEventListener('click', function (e) {
        // Küche
        if (e.target.classList.contains('add-bemerkung-btn') &&
            e.target.closest('.table-container.kueche')) {
            addBemerkungRow(e.target.closest('tr'), 'kueche');
        }
        // Bad
        else if (e.target.classList.contains('add-bemerkung-btn') &&
            e.target.closest('.table-container.bad')) {
            addBemerkungRow(e.target.closest('tr'), 'bad');
        }
        // Nebenräume
        else if (e.target.classList.contains('add-bemerkung-btn') &&
            e.target.closest('#nebenraumContainer')) {
            addBemerkungRow(e.target.closest('tr'), 'nebenraum');
        }

        // Regelungen
        else if (e.target.classList.contains('add-bemerkung-btn') &&
            e.target.closest('#regelungen')) {
            addBemerkungRow(e.target.closest('tr'), 'regelungen');
        }

        else if (e.target.classList.contains('add-bemerkung-btn') &&
            e.target.closest('#weiterebemerkungen')) {
            addBemerkungRow(e.target.closest('tr'), 'regelungen');
        }


        // Löschen für alle
        if (e.target.classList.contains('del-bemerkung-btn')) {
            deleteBemerkungRow(e.target.closest('tr'));
        }
    });

    function addBemerkungRow(sourceRow, raum) {
        const newRow = document.createElement('tr');
        newRow.className = 'bemerkung-row';

        newRow.innerHTML = `
            <td></td>
            <td colspan="5">
                <div class="bemerkung-container">
                    <input type="text" class="bemerkung-input" placeholder="Weitere Bemerkung" data-raum="${raum}">
                    <div class="bemerkung-actions">
                        <button type="button" class="add-bemerkung-btn">+</button>
                        <button type="button" class="del-bemerkung-btn" style="display:none;">×</button>
                    </div>
                </div>
            </td>
        `;

        sourceRow.parentNode.insertBefore(newRow, sourceRow.nextSibling);
        updateDeleteButtons(sourceRow.closest('table'));
    }

    function deleteBemerkungRow(row) {
        const table = row.closest('table');
        if (table.querySelectorAll('.bemerkung-row').length > 1) {
            row.remove();
            updateDeleteButtons(table);
        }
    }

    function updateDeleteButtons(table) {
        const rows = table.querySelectorAll('.bemerkung-row');
        rows.forEach((row, index) => {
            const delBtn = row.querySelector('.del-bemerkung-btn');
            if (delBtn) {
                delBtn.style.display = rows.length > 1 ? 'block' : 'none';
            }
        });
    }
});