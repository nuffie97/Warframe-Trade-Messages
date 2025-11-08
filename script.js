document.addEventListener('DOMContentLoaded', () => {
    
    // Globaler Zustand
    let currentItems = []; // Array für {name: 'Volt Prime', price: '150'}
    let primeSetDB = [];   // Unsere GEFILTERTE Datenbank

    // Wörter, die Prime-TEILE definieren (zum Herausfiltern)
    const PART_KEYWORDS = [
        'Gehäuse', 'Chassis', 'Neuroptik', 'Neuroptics', 'Systeme', 'Systems', 
        'Blaupause', 'Blueprint', 'Lauf', 'Barrel', 'Empfänger', 'Receiver', 
        'Schaft', 'Stock', 'Griff', 'Grip', 'Klinge', 'Blade', 'Kopf', 'Head', 
        'Verbindung', 'Link', 'Heatsink', 'String', 'Lower Limb', 'Upper Limb', 
        'Pouch', 'Carapace', 'Cerebrum', 'Set' // "Set" auch, da "Volt Prime Set" kein Item-Name ist
    ];

    // DOM-Elemente
    const loadingStatus = document.getElementById('loading-status');
    const inputSection = document.getElementById('input-section');
    const datalist = document.getElementById('item-list');
    const smartInput = document.getElementById('smart-input');
    const addItemBtn = document.getElementById('add-item-btn');
    const listDisplay = document.getElementById('current-list-display');
    const emptyListMsg = document.querySelector('.empty-list-msg');
    const previewArea = document.getElementById('message-preview');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');

    /**
     * Lädt und filtert die Datenbank.
     */
    async function initDatabase() {
        try {
            const response = await fetch('/vk/database.json');
            if (!response.ok) throw new Error('database.json nicht gefunden');
            
            const allItems = await response.json();

            // DER NEUE FILTER:
            primeSetDB = allItems.filter(item => {
                const name = item.name;
                
                // 1. Muss handelbar sein und "Prime" im Namen haben
                if (!item.tradable || !name.includes('Prime')) {
                    return false;
                }
                
                // 2. Darf KEINES der Schlüsselwörter für Teile enthalten
                // .some() prüft, ob *irgendein* Wort aus der Liste im Namen vorkommt
                const isPart = PART_KEYWORDS.some(keyword => name.includes(keyword));
                
                return !isPart; // Behalte es, wenn es KEIN Teil ist
            });

            // Fülle die Datalist
            primeSetDB.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;
                datalist.appendChild(option);
            });

            loadingStatus.style.display = 'none';
            inputSection.style.display = 'block';

        } catch (error) {
            loadingStatus.textContent = 'Fehler: "database.json" konnte nicht geladen werden.';
            loadingStatus.style.color = 'var(--color-reset)';
            console.error(error);
        }
    }

    /**
     * Parst die Eingabe und fügt sie der Liste hinzu.
     */
    function addItemToList() {
        const rawInput = smartInput.value.trim();
        if (rawInput === "") return;

        const words = rawInput.split(' ');
        const lastWord = words[words.length - 1];
        
        let price = '';
        let itemName = '';

        if (!isNaN(parseInt(lastWord)) && parseInt(lastWord) > 0) {
            price = words.pop();
            itemName = words.join(' ').trim();
        } else {
            itemName = rawInput;
        }

        // Füge das Objekt zum Array hinzu
        currentItems.push({ name: itemName, price: price });

        // Aktualisiere die UI
        updateCurrentListDisplay();
        updateFinalPreview();

        // Setze das Eingabefeld zurück
        smartInput.value = '';
    }

    /**
     * Zeigt die "Pills" der hinzugefügten Items an.
     */
    function updateCurrentListDisplay() {
        listDisplay.innerHTML = ''; // Leere die Liste
        
        if (currentItems.length === 0) {
            listDisplay.innerHTML = '<p class="empty-list-msg">Noch keine Items hinzugefügt.</p>';
            return;
        }

        currentItems.forEach((item, index) => {
            const pill = document.createElement('div');
            pill.className = 'item-pill';
            
            const priceTag = item.price ? `<span class="item-price">${item.price}p</span>` : '';
            
            pill.innerHTML = `
                <span class="item-name">${item.name}</span>
                ${priceTag}
                <span class="remove-item" data-index="${index}">✖</span>
            `;
            
            listDisplay.appendChild(pill);
        });
    }

    /**
     * Aktualisiert die finale "VK..." Nachricht.
     */
    function updateFinalPreview() {
        if (currentItems.length === 0) {
            previewArea.value = '';
            return;
        }
        
        const messageParts = currentItems.map(item => {
            const itemFormatted = `[${item.name}]`;
            const priceFormatted = item.price ? `${item.price}p` : '';
            return `${itemFormatted} ${priceFormatted}`.trim();
        });
        
        previewArea.value = `VK ${messageParts.join(' ')}`;
    }

    /**
     * Entfernt ein Item aus der Liste (wenn 'x' geklickt wird).
     */
    function handleListClick(e) {
        if (e.target.classList.contains('remove-item')) {
            const indexToRemove = parseInt(e.target.dataset.index);
            currentItems.splice(indexToRemove, 1); // Entferne das Item am Index
            
            updateCurrentListDisplay();
            updateFinalPreview();
        }
    }

    /**
     * Kopiert die finale Nachricht.
     */
    function copyMessage() {
        if (!previewArea.value) return; 

        navigator.clipboard.writeText(previewArea.value)
            .then(() => {
                copyBtn.textContent = 'Kopiert!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = 'Nachricht Kopieren';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
    }

    /**
     * Setzt die gesamte App zurück.
     */
    function resetAll() {
        currentItems = [];
        smartInput.value = '';
        updateCurrentListDisplay();
        updateFinalPreview();
    }

    // --- Event Listeners ---
    addItemBtn.addEventListener('click', addItemToList);
    
    // Erlaube "Enter" im Input-Feld, um ein Item hinzuzufügen
    smartInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Verhindert, dass das Formular abgeschickt wird
            addItemToList();
        }
    });
    
    listDisplay.addEventListener('click', handleListClick);
    copyBtn.addEventListener('click', copyMessage);
    resetBtn.addEventListener('click', resetAll);

    // App starten
    initDatabase();
});
