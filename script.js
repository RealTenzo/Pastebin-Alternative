document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const pasteForm = document.getElementById('pasteForm');
    const clearBtn = document.getElementById('clearBtn');
    const createSection = document.getElementById('createSection');
    const resultSection = document.getElementById('resultSection');
    const viewSection = document.getElementById('viewSection');
    const pasteUrl = document.getElementById('pasteUrl');
    const rawUrl = document.getElementById('rawUrl');
    const copyBtn = document.getElementById('copyBtn');
    const copyRawBtn = document.getElementById('copyRawBtn');
    const viewPaste = document.getElementById('viewPaste');
    const newPaste = document.getElementById('newPaste');
    const pasteContent = document.getElementById('pasteContent');
    const pasteName = document.getElementById('pasteName');
    const pasteDisplay = document.getElementById('pasteDisplay');
    const pasteTitle = document.getElementById('pasteTitle');
    const pasteDate = document.getElementById('pasteDate');
    const rawLink = document.getElementById('rawLink');
    const editBtn = document.getElementById('editBtn');
    const editForm = document.getElementById('editForm');
    const updateForm = document.getElementById('updateForm');
    const updatedContent = document.getElementById('updatedContent');
    const updatedName = document.getElementById('updatedName');
    const cancelEdit = document.getElementById('cancelEdit');

    // Current state
    let currentPasteId = null;

    // Check URL to determine what to show
    const path = window.location.pathname;
    const isRaw = path.endsWith('.raw');
    const hashContent = window.location.hash.substring(1);
    currentPasteId = extractPasteId(path);

    if (isRaw) {
        if (hashContent) {
            // Display raw content from URL
            displayRawContent(hashContent);
            return;
        } else {
            // Try to get from localStorage
            const paste = getPaste(currentPasteId);
            if (paste) {
                displayRawContent(encodeURIComponent(paste.content));
                return;
            }
        }
        // If no content found, redirect to home
        window.location.href = '/';
        return;
    }

    if (currentPasteId) {
        showPaste(currentPasteId);
    } else if (path !== '/' && !path.endsWith('index.html')) {
        window.location.href = '/';
    } else {
        createSection.classList.remove('hidden');
    }

    // Event Listeners
    pasteForm.addEventListener('submit', handleCreatePaste);
    clearBtn.addEventListener('click', () => pasteForm.reset());
    copyBtn.addEventListener('click', () => copyToClipboard(pasteUrl));
    copyRawBtn.addEventListener('click', () => copyToClipboard(rawUrl));
    viewPaste.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = pasteUrl.value;
    });
    newPaste.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/';
    });
    editBtn.addEventListener('click', handleEdit);
    cancelEdit.addEventListener('click', cancelEditing);
    updateForm.addEventListener('submit', handleUpdate);
    if (rawLink) rawLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `${window.location.pathname}.raw${window.location.hash}`;
    });

    // Functions
    function handleCreatePaste(e) {
        e.preventDefault();
        
        const content = pasteContent.value.trim();
        if (!content) return;
        
        const name = (pasteName.value || 'unnamed')
            .replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '');
        
        const id = generateId();
        const timestamp = new Date();
        const encodedContent = encodeURIComponent(content);
        
        // Generate URLs
        const baseUrl = getBaseUrl();
        const viewUrl = `${baseUrl}${id}#${encodedContent}`;
        const rawUrl = `${baseUrl}${id}.raw#${encodedContent}`;
        
        pasteUrl.value = viewUrl;
        rawUrl.value = rawUrl;
        
        // Save to localStorage for editing
        const paste = {
            id,
            content,
            name,
            timestamp: timestamp.toISOString(),
            created: timestamp.getTime(),
            history: []
        };
        savePaste(paste);
        currentPasteId = id;
        
        // Show result
        pasteForm.reset();
        createSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleEdit() {
        const paste = getPaste(currentPasteId);
        if (!paste) return;
        
        updatedContent.value = paste.content;
        updatedName.value = paste.name;
        
        viewSection.classList.add('edit-mode');
        editForm.classList.remove('hidden');
    }

    function cancelEditing() {
        viewSection.classList.remove('edit-mode');
        editForm.classList.add('hidden');
    }

    function handleUpdate(e) {
        e.preventDefault();
        
        const newContent = updatedContent.value.trim();
        if (!newContent) return;
        
        const newName = (updatedName.value || 'unnamed')
            .replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '');
        
        const paste = getPaste(currentPasteId);
        if (!paste) return;
        
        // Save to history
        paste.history.push({
            content: paste.content,
            name: paste.name,
            timestamp: paste.timestamp
        });
        
        // Update paste
        paste.content = newContent;
        paste.name = newName;
        paste.timestamp = new Date().toISOString();
        savePaste(paste);
        
        // Update display
        pasteDisplay.textContent = newContent;
        pasteTitle.textContent = newName;
        
        // Update URL
        const encodedContent = encodeURIComponent(newContent);
        window.history.replaceState(null, '', `${window.location.pathname}#${encodedContent}`);
        
        // Exit edit mode
        cancelEditing();
    }

    function showPaste(id) {
        // Try to get from URL hash first
        const hashContent = window.location.hash.substring(1);
        if (hashContent) {
            try {
                const content = decodeURIComponent(hashContent);
                pasteDisplay.textContent = content;
                
                // Try to get metadata from localStorage
                const paste = getPaste(id);
                if (paste) {
                    pasteTitle.textContent = paste.name;
                    const date = new Date(paste.timestamp);
                    pasteDate.textContent = date.toLocaleString();
                    document.title = `${paste.name} - SharePaste`;
                    return;
                }
            } catch (e) {
                console.error('Error decoding hash content:', e);
            }
        }
        
        // Fall back to localStorage
        const paste = getPaste(id);
        if (!paste) {
            window.location.href = '/';
            return;
        }
        
        // Update display
        pasteDisplay.textContent = paste.content;
        pasteTitle.textContent = paste.name;
        const date = new Date(paste.timestamp);
        pasteDate.textContent = date.toLocaleString();
        document.title = `${paste.name} - SharePaste`;
        
        // Update URL with content
        const encodedContent = encodeURIComponent(paste.content);
        window.history.replaceState(null, '', `${window.location.pathname}#${encodedContent}`);
        
        // Show view
        createSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        viewSection.classList.remove('hidden');
    }

    function displayRawContent(encodedContent) {
        try {
            const content = decodeURIComponent(encodedContent);
            document.body.innerHTML = `<pre>${content}</pre>`;
            document.title = `Raw Paste - SharePaste`;
            document.body.classList.add('raw-view');
        } catch (e) {
            window.location.href = '/';
        }
    }

    // Helper functions
    function generateId() {
        return Math.random().toString(36).substring(2, 10) + 
               Math.random().toString(36).substring(2, 10);
    }

    function savePaste(paste) {
        let pastes = JSON.parse(localStorage.getItem('sharePastes') || '{}');
        pastes[paste.id] = paste;
        localStorage.setItem('sharePastes', JSON.stringify(pastes));
    }

    function getPaste(id) {
        const pastes = JSON.parse(localStorage.getItem('sharePastes') || '{}');
        return pastes[id] || null;
    }

    function copyToClipboard(input) {
        input.select();
        document.execCommand('copy');
        const button = input.id === 'pasteUrl' ? copyBtn : copyRawBtn;
        const original = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => button.innerHTML = original, 2000);
    }

    function extractPasteId(path) {
        const match = path.match(/\/([a-z0-9]+)(?:\.raw)?$/i);
        return match ? match[1] : null;
    }

    function getBaseUrl() {
        let base = window.location.href.split('#')[0].split('?')[0];
        if (!base.endsWith('/')) {
            base = base.substring(0, base.lastIndexOf('/') + 1);
        }
        return base;
    }
});
