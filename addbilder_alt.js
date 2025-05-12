document.addEventListener('DOMContentLoaded', function () {
    // Bildersammlung für alle Räume (dynamisch)
    const roomImages = {};

    // Konfiguration und Event-Listener für das Hinzufügen von Bildern
    const addZimmerButton = document.getElementById('addzimmert');
    const zimmerContainer = document.getElementById('adzimmer');

    addZimmerButton.addEventListener('click', () => {
        // Zimmer wird hinzugefügt, dann werden Bilderfunktionen aktiviert
        const zimmerCount = zimmerContainer.children.length + 1;
        addZimmer(zimmerCount);
    });

    function addZimmer(count) {
        // Zimmer-Struktur, die zum Hinzufügen des neuen Zimmers verwendet wird
        const newZimmerSection = document.createElement('div');
        newZimmerSection.className = 'zimmer-section';
        newZimmerSection.innerHTML = `
            <div class="zimmer-toggle">
                <div class="zimmer-verfuegbar">
                    Zimmer Nr. ${count} vorhanden?
                    <div class="radio-group compact">
                        <label><input type="radio" name="zimmer-vorhanden-${count}" value="ja"> Ja</label>
                        <label><input type="radio" name="zimmer-vorhanden-${count}" value="nein" checked> Nein</label>
                    </div>
                </div>
            </div>
            <div class="table-container zimmer" id="zimmer-container-${count}" style="margin-top: 0; display: none;">
                <table>
                    <thead>
                        <tr>
                            <th colspan="6" class="zimmer-header">
                                <div class="zimmer-verfuegbar">
                                    Zimmer Nr. ${count}
                                </div>
                            </th>
                        </tr>
                        <tr class="zustandszeile">
                            <th class="aa">allgemeiner Zustand</th>
                            <th class="aa">in Ordnung</th>
                            <th class="aa">neuwertig</th>
                            <th class="aa">geringe Gebrauchsspuren</th>
                            <th class="aa">stärkere Gebrauchsspuren</th>
                            <th class="aa">nicht renoviert</th>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input type="checkbox" id="boden-pb1-${count}"></td>
                            <td><input type="checkbox" id="boden-pb2-${count}"></td>
                            <td><input type="checkbox" id="boden-pb3-${count}"></td>
                            <td>
                                <select id="boden-status-${count}">
                                    <option value="offen">Offen</option>
                                    <option value="in-arbeit">In Arbeit</option>
                                    <option value="fertig">Fertig</option>
                                </select>
                            </td>
                            <td><input type="checkbox" id="boden-pb4-${count}"></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bilder-row">
                            <td>Zimmerfotos</td>
                            <td colspan="5">
                                <div class="bilder-upload-container zimmer">
                                    <button type="button" class="bilder-upload-btn" data-zimmer-id="${count}">Fotos hinzufügen</button>
                                    <div class="bilder-thumbnails" id="zimmer-thumbnails-${count}"></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Das neue Zimmer zu dem Container hinzufügen
        zimmerContainer.appendChild(newZimmerSection);

        // Für jedes Zimmer eine eigene Bildersammlung erstellen
        roomImages[count] = [];

        // Event Listener für den „Zimmer vorhanden“-Radio-Button hinzufügen
        const radioButtons = newZimmerSection.querySelectorAll(`input[name="zimmer-vorhanden-${count}"]`);
        radioButtons.forEach(button => {
            button.addEventListener('change', function () {
                const tableContainer = document.getElementById(`zimmer-container-${count}`);
                if (this.value === 'ja') {
                    tableContainer.style.display = 'block';
                } else {
                    tableContainer.style.display = 'none';
                }
            });
        });

        // Event Listener für den „Fotos hinzufügen“-Button hinzufügen
        const uploadBtn = newZimmerSection.querySelector('.bilder-upload-btn');
        const thumbnailContainer = newZimmerSection.querySelector(`#zimmer-thumbnails-${count}`);

        uploadBtn.addEventListener('click', () => {
            handleImageUpload(count, thumbnailContainer);
        });
    }

    // Funktion zum Hochladen von Bildern für jedes Zimmer
    async function handleImageUpload(roomId, thumbnailContainer) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.onchange = async function (e) {
            const files = e.target.files;
            console.log(files);  // Prüfe, ob die Dateien korrekt ausgewählt wurden

            if (files.length > 0) {
                for (const file of Array.from(files)) {
                    try {
                        const originalImage = await loadImage(file);
                        console.log('Bild geladen:', originalImage);

                        const resizedBlob = await resizeImage(originalImage, 3500, 3500);
                        const resizedUrl = URL.createObjectURL(resizedBlob);
                        const thumbnailBlob = await resizeImage(originalImage, 75, 75);
                        const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
                        const galerieBlob = await resizeImage(originalImage, 800, 800);
                        const galerieUrl = URL.createObjectURL(galerieBlob);

                        console.log(resizedUrl, thumbnailUrl, galerieUrl);  // Überprüfe die URLs

                        const bildData = {
                            originalUrl: resizedUrl,
                            thumbnailUrl: thumbnailUrl,
                            galerieUrl: galerieUrl
                        };

                        roomImages[roomId].push(bildData);
                        updateThumbnails(roomImages[roomId], thumbnailContainer);

                    } catch (error) {
                        console.error('Fehler beim Verarbeiten des Bildes:', error);
                    }
                }
            }
        };

        input.click();
    }

    // Hilfsfunktion zum Laden eines Bildes
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Bild konnte nicht geladen werden'));
            };

            img.src = url;
        });
    }

    // Thumbnails aktualisieren
    function updateThumbnails(bilderArray, container) {
        container.innerHTML = '';

        bilderArray.forEach((bild, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            thumb.innerHTML = `
                <img src="${bild.thumbnailUrl}" alt="Foto" style="width:75px; height:75px; object-fit:cover;">
                <button class="thumbnail-remove" data-index="${index}">×</button>
            `;
            container.appendChild(thumb);
        });
    }
});
