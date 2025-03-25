document.addEventListener('DOMContentLoaded', function() {
    // JSONBin.io configuration - REPLACE THESE!
    const BIN_ID = '67e2ce518a456b79667c561d'; // From jsonbin.io URL
    const API_KEY = '$2a$10$L/PvkCurBIcbLcNr.z.Ilej9cBndJodgCPcKvFo7FYKmLqfnc9.1C '; // From account settings
    const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
    
    // DOM Elements
    const pasteForm = document.getElementById('pasteForm');
    const createSection = document.getElementById('createSection');
    const resultSection = document.getElementById('resultSection');
    const viewSection = document.getElementById('viewSection');
    const pasteUrl = document.getElementById('pasteUrl');
    const rawUrl = document.getElementById('rawUrl');
    const pasteDisplay = document.getElementById('pasteDisplay');
    const pasteTitle = document.getElementById('pasteTitle');
    const editForm = document.getElementById('editForm');
    const updatedContent = document.getElementById('updatedContent');
    
    // Current state
    let allPastes = {};
    
    // Initialize
    initializeApplication();

    async function initializeApplication() {
        try {
            // First try to load existing data
            const response = await fetch(API_URL, {
                headers: { 'X-Master-Key': API_KEY }
            });
            
            if (!response.ok) {
                // If bin doesn't exist or is empty, initialize it
                await initializeBin();
            } else {
                const data = await response.json();
                allPastes = data.record.pastes || {};
            }
            
            // Now check URL to show appropriate view
            const path = window.location.pathname;
            const isRaw = path.endsWith('.raw');
            const pasteId = path.split('/').filter(Boolean).pop().replace('.raw', '');
            
            if (pasteId && pasteId !== 'index.html') {
                showPaste(pasteId, isRaw);
            } else {
                createSection.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Initialization error:", error);
            alert("Failed to initialize application. Please try again later.");
        }
    }

    async function initializeBin() {
        // Create bin with proper structure
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ pastes: {} })
        });
        
        if (!response.ok) {
            throw new Error("Failed to initialize bin");
        }
        
        allPastes = {};
    }

    // Event Listeners
    pasteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const content = document.getElementById('pasteContent').value.trim();
        const name = document.getElementById('pasteName').value || 'unnamed';
        
        if (!content) {
            alert("Please enter some content");
            return;
        }
        
        try {
            const id = generateId();
            allPastes[id] = {
                content,
                name,
                createdAt: new Date().toISOString()
            };
            
            await savePastes();
            
            // Generate URLs
            pasteUrl.value = `${window.location.origin}/${id}`;
            rawUrl.value = `${window.location.origin}/${id}.raw`;
            
            // Show result
            createSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
        } catch (error) {
            console.error("Error creating paste:", error);
            alert("Failed to create paste. Please try again.");
        }
    });

    async function savePastes() {
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ pastes: allPastes })
        });
        
        if (!response.ok) {
            throw new Error("Failed to save pastes");
        }
    }

    function showPaste(id, isRaw = false) {
        const paste = allPastes[id];
        
        if (!paste) {
            window.location.href = '/';
            return;
        }
        
        if (isRaw) {
            document.body.innerHTML = `<pre>${paste.content}</pre>`;
            document.body.classList.add('raw-view');
            return;
        }
        
        // Display paste
        pasteDisplay.textContent = paste.content;
        pasteTitle.textContent = paste.name;
        
        createSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        viewSection.classList.remove('hidden');
    }

    // [Keep all other existing functions like handleEdit, cancelEditing, etc.]
    // Helper functions
    function generateId() {
        return Math.random().toString(36).substring(2, 10) + 
               Math.random().toString(36).substring(2, 10);
    }
    
    function copyToClipboard(input) {
        input.select();
        document.execCommand('copy');
        const button = input.id === 'pasteUrl' ? 
            document.getElementById('copyBtn') : 
            document.getElementById('copyRawBtn');
        const original = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => button.innerHTML = original, 2000);
    }
});
