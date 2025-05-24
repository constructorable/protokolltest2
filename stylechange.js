document.addEventListener('DOMContentLoaded', function() {
    // Beim Laden der Seite den gespeicherten Stil anwenden (oder Standard: desktop)
    applyStyle(localStorage.getItem('currentStyle') || 'stylesdesktop.css');
    
    // Button-Event hinzufügen
    document.getElementById('stylechange').addEventListener('click', toggleStyle);
});

function toggleStyle() {
    const currentStyle = localStorage.getItem('currentStyle') || 'stylesdesktop.css';
    let newStyle;
    
    // Rotiere durch die verfügbaren Styles
    switch(currentStyle) {
        case 'stylesdesktop.css':
            newStyle = 'stylesmobile.css';
            break;
        case 'stylesmobile.css':
            newStyle = 'stylespdf.css';
            break;
        case 'stylespdf.css':
            newStyle = 'stylesdesktop.css';
            break;
        default:
            newStyle = 'stylesdesktop.css';
    }
    
    // Neuen Stil speichern und anwenden
    localStorage.setItem('currentStyle', newStyle);
    applyStyle(newStyle);
}

function applyStyle(styleFile) {
    // Alle vorhandenen Stylesheets entfernen
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (link.href.includes('stylesdesktop.css') || 
            link.href.includes('stylesmobile.css') || 
            link.href.includes('stylespdf.css')) {
            link.remove();
        }
    });
    
    // Neues Stylesheet hinzufügen
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = styleFile;
    document.head.appendChild(link);
    
    // Optional: Logging für Debugging
    console.log('Aktuelles Style:', styleFile);
}