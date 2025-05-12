/**
 * Zimmerverwaltung mit Bildupload-Funktionalität
 * 
 * Diese Skript ermöglicht das dynamische Hinzufügen von Zimmern mit:
 * - Farbauswahl mit Vorschlägen
 * - Bemerkungsverwaltung
 * - Rauchmelder-Zähler
 * - Bildupload mit Thumbnails und Galerieansicht
 */

document.addEventListener('DOMContentLoaded', function () {
    // Konfiguration
    const CONFIG = {
        maxImages: 20, // Maximale Anzahl an Bildern pro Zimmer
        thumbnailSize: 75, // Größe der Thumbnails in Pixeln
        gallerySize: 800, // Größe der Galeriebilder in Pixeln
        maxImageSize: 3500 // Maximale Größe der Originalbilder
    };

    // Klassische Wandfarben für Vorschläge
    const CLASSIC_WALL_COLORS = [
        "Weiß", "Elfenbein", "Beige", "Creme", "Hellgrau",
        "Grau", "Taupe", "Weinrot", "Navyblau", "Dunkelgrün",
        "Pastellblau", "Himmelblau", "Terrakotta", "Ocker", "Vanille",
        "Magnolia", "Alabaster", "Champagner", "Mokka", "Anthrazit"
    ];

    // Globale Variablen
    let zimmerCount = 0;
    const zimmerBilder = {}; // Bilderspeicher für alle Zimmer
    const zimmerGalerien = {}; // Referenzen zu den Galerie-Containern

    // DOM-Elemente
    const addZimmerButton = document.getElementById('addzimmert');
   /*  const zimmerContainer = document.getElementById('adzimmer'); */
    const galerieContainer = document.querySelector('.bildergalerie-container');

    // Initialisierung
    init();

    // Funktionen
    function init() {
        addZimmerButton.addEventListener('click', addNewZimmer);

        // Galerie-Container für Zimmer erstellen, falls nicht vorhanden
        if (!document.getElementById('zimmer-galerien-container')) {
            const container = document.createElement('div');
            container.id = 'zimmer-galerien-container';
            galerieContainer.appendChild(container);
        }
    }

    function addNewZimmer() {
        zimmerCount++;
        zimmerBilder[zimmerCount] = [];
        createZimmerSection(zimmerCount);
        createGalerieSection(zimmerCount);
    }

    function createZimmerSection(count) {
        const section = document.createElement('div');
        section.className = 'zimmer-section';
        section.innerHTML = generateZimmerHTML(count);
        const zimmerContainer = document.querySelector('.table-container.zimmer-n');
        zimmerContainer.appendChild(section);


        initColorSuggestions(count);
        initBemerkungen(count);
        initRauchmelder(count);
        initImageUpload(count);
    }

    function createGalerieSection(count) {
        const container = document.getElementById('zimmer-galerien-container');

        const title = document.createElement('h3');
        title.id = `zimmer-${count}-galerie-title`;
        /* title.textContent = `Zimmer ${count} Bilder`; */
        title.style.display = 'none';

        const galerie = document.createElement('div');
        galerie.className = `zimmer-galerie zimmer-${count}-galerie`;
        galerie.id = `zimmer-${count}-galerie`;

        container.appendChild(title);
        container.appendChild(galerie);

        zimmerGalerien[count] = {
            title: title,
            container: galerie
        };
    }

    function generateZimmerHTML(count) {
        return `
        <div class="table-container zimmer" id="zimmer-container-${count}" style="margin-top: 0;">
            <table>
                <thead>
                    <tr>
                        <th colspan="6" class="zimmer-header">
                            <div class="zimmer-verfuegbar">
                                Zimmer Nr. ${count}
                            </div>
                        </th>
                    </tr>

                                            <tr>
                            <td colspan="1">Bezeichnung / Lage</td>
                            <td colspan="5"class="lage">
                                <input type="text" id="lageinputzimm${count}" class="textinput">
                                <div id="lagecontainerzimm${count}" class="suggestion-list"></div>
                            </td>


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
                        <td><input type="checkbox" id="boden-pb3b-${count}"></td>
                        <td><input type="checkbox" id="boden-pb4-${count}"></td>
                    </tr>
                    <tr>
                        <th class="aa1"></th>
                        <th class="aa1">in Ordnung</th>
                        <th class="aa1">geringe Gebrauchs - spuren</th>
                        <th class="aa1">repa. - bedürftig</th>
                        <th class="aa1">Reparatur durch den Mieter oder Vermieter</th>
                        <th class="aa1">nicht vor handen</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Türen</td>
                        <td><input type="checkbox" id="zimm${count}-waschbecken-p1"></td>
                        <td><input type="checkbox" id="zimm${count}-waschbecken-p2"></td>
                        <td><input type="checkbox" id="zimm${count}-waschbecken-p3"></td>
                        <td>
                            <select id="zimm${count}-waschbecken-status">
                                <option value="na">-</option>
                                <option value="mieter">Mieter</option>
                                <option value="landl">Vermieter</option>
                                <option value="klar">in Klärung</option>
                            </select>
                        </td>
                        <td><input type="checkbox" id="zimm${count}-waschbecken-p4"></td>
                    </tr>
                    <tr>
                        <td>Farbe der Wände</td>
                        <td colspan="5">
                            <input type="text" id="wandfarbe-${count}" placeholder="Farbe eingeben" class="farbe-input" autocomplete="off">
                            <div id="farbvorschlaege-${count}" class="farbvorschlaege-container" style="display:none;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td>Zimmerschlüssel vorhanden?</td>
                        <td class="radio-cell" colspan="2">
                            <div class="radio-group">
                                <label><input type="radio" name="schluessel-${count}" value="ja"> Ja</label>
                                <label><input type="radio" name="schluessel-${count}" value="nein"> Nein</label>
                            </div>
                        </td>
                        <td colspan="3"></td>
                    </tr>
                    <tr>
                        <td>Anzahl Rauchwarnmelder</td>
                        <td colspan="5">
                            <div class="number-input">
                                <button type="button" class="number-btn minus">-</button>
                                <input type="number" id="rauchmelder-anzahl-${count}" min="0" max="9" value="0" readonly>
                                <button type="button" class="number-btn plus">+</button>
                            </div>
                        </td>
                    </tr>
                    <tr class="bemerkung-row">
                        <td>Bemerkungen</td>
                        <td colspan="5">
                            <div class="bemerkungen-container" id="bemerkungen-container-${count}">
                                <div class="bemerkung-eingabe">
                                    <input type="text" class="bemerkung-input" placeholder="Bemerkung eingeben">
                                    <div class="bemerkung-actions">
                                        <button type="button" class="add-bemerkung-btn">+</button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr class="bilder-row">
                        <td>Fotos</td>
                        <td colspan="5">
                            <div class="bilder-upload-container">
                                <button type="button" class="bilder-upload-btn">Fotos hinzufügen</button>
                                <div class="bilder-thumbnails" id="bilder-thumbnails-${count}"></div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>`;
    }

    function initColorSuggestions(count) {
        const input = document.getElementById(`wandfarbe-${count}`);
        const suggestions = document.getElementById(`farbvorschlaege-${count}`);

        input.addEventListener('input', (e) => {
            const value = e.target.value.trim().toLowerCase();

            if (value.length > 0) {
                const filtered = CLASSIC_WALL_COLORS.filter(color =>
                    color.toLowerCase().includes(value)
                );

                if (filtered.length > 0) {
                    suggestions.innerHTML = filtered.map(color =>
                        `<div class="farbvorschlag" onclick="this.parentElement.previousElementSibling.value='${color}'; this.parentElement.style.display='none'">${color}</div>`
                    ).join('');
                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            } else {
                suggestions.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!suggestions.contains(e.target) && e.target !== input) {
                suggestions.style.display = 'none';
            }
        });
    }

    function initBemerkungen(count) {
        const container = document.getElementById(`bemerkungen-container-${count}`);

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-bemerkung-btn')) {
                const input = e.target.closest('.bemerkung-eingabe').querySelector('.bemerkung-input');
                const text = input.value.trim();

                if (text) {
                    const bemerkung = document.createElement('div');
                    bemerkung.className = 'bemerkung-zeile';
                    bemerkung.innerHTML = `
                        <div class="bemerkung-text">${text}</div>
                        <button type="button" class="del-bemerkung-btn">×</button>
                    `;
                    container.insertBefore(bemerkung, e.target.closest('.bemerkung-eingabe'));
                    input.value = '';
                }
            }

            if (e.target.classList.contains('del-bemerkung-btn')) {
                e.target.closest('.bemerkung-zeile').remove();
            }
        });
    }

    function initRauchmelder(count) {
        const input = document.getElementById(`rauchmelder-anzahl-${count}`);
        const minusBtn = input.previousElementSibling;
        const plusBtn = input.nextElementSibling;

        minusBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            if (value > 0) input.value = value - 1;
        });

        plusBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            if (value < 9) input.value = value + 1;
        });
    }

    function initImageUpload(count) {
        const uploadBtn = document.querySelector(`#zimmer-container-${count} .bilder-upload-btn`);
        const thumbnailContainer = document.getElementById(`bilder-thumbnails-${count}`);

        uploadBtn.addEventListener('click', () => {
            if (zimmerBilder[count].length >= CONFIG.maxImages) {
                alert(`Maximal ${CONFIG.maxImages} Bilder pro Zimmer erlaubt`);
                return;
            }

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;

            input.onchange = async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;

                for (const file of files.slice(0, CONFIG.maxImages - zimmerBilder[count].length)) {
                    try {
                        const imageData = await processImage(file);
                        zimmerBilder[count].push(imageData);
                        updateThumbnails(count);
                        updateGalerie(count);
                    } catch (error) {
                        console.error('Fehler beim Bildupload:', error);
                    }
                }
            };

            input.click();
        });

        thumbnailContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('thumbnail-remove')) {
                const index = e.target.getAttribute('data-index');
                removeImage(count, index);
            }
        });
    }

    async function processImage(file) {
        const img = await loadImage(file);

        const originalBlob = await resizeImage(img, CONFIG.maxImageSize, CONFIG.maxImageSize);
        const thumbnailBlob = await resizeImage(img, CONFIG.thumbnailSize, CONFIG.thumbnailSize);
        const galleryBlob = await resizeImage(img, CONFIG.gallerySize, CONFIG.gallerySize);

        return {
            originalUrl: URL.createObjectURL(originalBlob),
            thumbnailUrl: URL.createObjectURL(thumbnailBlob),
            galleryUrl: URL.createObjectURL(galleryBlob),
            name: file.name
        };
    }

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

    function resizeImage(img, maxWidth, maxHeight, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(resolve, 'image/jpeg', quality);
        });
    }

    function updateThumbnails(count) {
        const container = document.getElementById(`bilder-thumbnails-${count}`);
        container.innerHTML = '';

        zimmerBilder[count].forEach((img, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            thumb.innerHTML = `
                <img src="${img.thumbnailUrl}" alt="Thumbnail" loading="lazy">
                <button class="thumbnail-remove" data-index="${index}" title="Bild entfernen">×</button>
                <div class="thumbnail-name">${img.name}</div>
            `;
            container.appendChild(thumb);
        });
    }

    function updateGalerie(count) {
        const { container, title } = zimmerGalerien[count];
        container.innerHTML = '';

        if (zimmerBilder[count].length > 0) {
            title.style.display = 'block';

            zimmerBilder[count].forEach((img, index) => {
                const imgElement = document.createElement('div');
                imgElement.className = 'galerie-bild';
                imgElement.innerHTML = `
                    <div class="bild-info">
                        <span>Zimmer ${count} - Bild ${index + 1}</span>
                                           </div>
                    <img src="${img.galleryUrl}" alt="Galeriebild" loading="lazy">
                `;
                container.appendChild(imgElement);
            });
        } else {
            title.style.display = 'none';
        }
    }

    function removeImage(count, index) {
        const images = zimmerBilder[count];
        if (!images[index]) return;

        // Speicher freigeben
        URL.revokeObjectURL(images[index].originalUrl);
        URL.revokeObjectURL(images[index].thumbnailUrl);
        URL.revokeObjectURL(images[index].galleryUrl);

        // Bild entfernen
        images.splice(index, 1);

        // Anzeigen aktualisieren
        updateThumbnails(count);
        updateGalerie(count);
    }
});