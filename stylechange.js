document.addEventListener('DOMContentLoaded', function() {
    const styleButton = document.getElementById('stylechange');
    let currentStyle = 'styles2.css'; // Standard-Stil, der im head geladen ist

    styleButton.addEventListener('click', function() {
        // Finde das Link-Element mit dem Stylesheet
        const styleLink = document.querySelector('link[rel="stylesheet"]');
        
        // Wechsle zwischen den beiden Stylesheets
        if (currentStyle === 'styles1.css') {
            styleLink.href = 'styles2.css';
            currentStyle = 'styles2.css';
        } else {
            styleLink.href = 'styles1.css';
            currentStyle = 'styles1.css';
        }
    });
});
