// rwm.js - Rauchwarnmelder Logik für Küche und Bad
document.addEventListener('DOMContentLoaded', function () {
    // Initialisiere beide Rauchmelder-Zähler
    const rauchmelderInputs = {
        kueche: document.getElementById('rauchmelder-anzahl'),
        bad: document.getElementById('rauchmelder-anzahlbad'),
        flur: document.getElementById('rauchmelder-anzahl2'),
        abstell: document.getElementById('rauchmelder-anzahl3')
    };

    // Funktion zur Steuerung der Zähler
    function setupRauchmelderCounter(inputFeld, minusBtn, plusBtn) {
        if (!inputFeld) return;

        minusBtn.addEventListener('click', () => {
            let value = parseInt(inputFeld.value);
            if (value > 0) {
                inputFeld.value = value - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let value = parseInt(inputFeld.value);
            if (value < 9) {
                inputFeld.value = value + 1;
            }
        });

        inputFeld.addEventListener('change', () => {
            let value = parseInt(inputFeld.value);
            if (isNaN(value) || value < 0) {
                inputFeld.value = 0;
            } else if (value > 9) {
                inputFeld.value = 9;
            }
        });
    }

    // Küche einrichten
    if (rauchmelderInputs.kueche) {
        const kuecheContainer = rauchmelderInputs.kueche.closest('.number-input');
        setupRauchmelderCounter(
            rauchmelderInputs.kueche,
            kuecheContainer.querySelector('.minus'),
            kuecheContainer.querySelector('.plus')
        );
    }

    // Bad einrichten
    if (rauchmelderInputs.bad) {
        const badContainer = rauchmelderInputs.bad.closest('.number-input');
        setupRauchmelderCounter(
            rauchmelderInputs.bad,
            badContainer.querySelector('.minus'),
            badContainer.querySelector('.plus')
        );
    }

    if (rauchmelderInputs.flur) {
        const flurContainer = rauchmelderInputs.flur.closest('.number-input');
        setupRauchmelderCounter(
            rauchmelderInputs.flur,
            flurContainer.querySelector('.minus'),
            flurContainer.querySelector('.plus')
        );
    }

    if (rauchmelderInputs.abstell) {
        const abstellContainer = rauchmelderInputs.abstell.closest('.number-input');
        setupRauchmelderCounter(
            rauchmelderInputs.abstell,
            abstellContainer.querySelector('.minus'),
            abstellContainer.querySelector('.plus')
        );
    }

});