document.addEventListener('DOMContentLoaded', () => {
    
    // Globaler Zustand
    let currentItems = []; // Array für {name: 'Volt Prime', price: '150'}
    
    // --- GELÖSCHT ---
    // Die 'PART_KEYWORDS' und 'primeSetDB' Variablen werden nicht mehr gebraucht.

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
            const response = await fetch('./database.json'); // oder '/vk/database.json'
            if (!response.ok) throw new Error('database.json nicht gefunden');
            
            // allItems ist jetzt dein Array: ["Acceltra Prime", "Volt Prime", ...]
            const allItems = await response.json();

            // --- NEUE, VEREINFACHTE LOGIK ---
            // Da die Liste schon sauber ist, müssen wir nicht mehr filtern.
            // Wir füllen die Datalist direkt.
            allItems.forEach(itemName => {
                const option = document.createElement('option');
                option.value = itemName; // 'itemName' ist jetzt der String selbst
                datalist.appendChild(option);
            });
            // --- ENDE DER NEUEN LOGIK ---

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

        currentItems.push({ name: itemName, price: price });

        updateCurrentListDisplay();
        updateFinalPreview();
        smartInput.value = '';
    }

    /**
     * Zeigt die "Pills" der hinzugefügten Items an.
     */
    function updateCurrentListDisplay() {
        listDisplay.innerHTML = ''; 
        
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
            currentItems.splice(indexToRemove, 1);
            
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
    
    smartInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            addItemToList();
        }
    });
    
    listDisplay.addEventListener('click', handleListClick);
    copyBtn.addEventListener('click', copyMessage);
    resetBtn.addEventListener('click', resetAll);

    // App starten
    initDatabase();
});
