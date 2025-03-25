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

    // Check URL to see if we're viewing a paste
    const path = window.location.pathname;
    const isRaw = path.endsWith('.raw');
    const pasteId = extractPasteId(path);

    if (pasteId) {
        // We're viewing a paste
        showPaste(pasteId, isRaw);
    } else if (path !== '/' && !path.endsWith('index.html')) {
        // Redirect to home if invalid path
        window.location.href = '/';
    } else {
        // We're on the main page
        createSection.classList.remove('hidden');
    }

    // Handle form submission
    pasteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const content = pasteContent.value.trim();
        if (!content) return;
        
        const name = (pasteName.value || 'unnamed')
            .replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '');
        
        const id = generateId();
        const timestamp = new Date();
        
        // Save to localStorage
        const paste = {
            id,
            content,
            name,
            timestamp: timestamp.toISOString(),
            created: timestamp.getTime()
        };
        
        savePaste(paste);
        
        // Generate URLs
        const baseUrl = getBaseUrl();
        const viewUrl = `${baseUrl}${id}`;
        const rawUrl = `${baseUrl}${id}.raw`;
        
        pasteUrl.value = viewUrl;
        rawUrl.value = rawUrl;
        
        // Show the result section
        pasteForm.reset();
        createSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Clear the form
    clearBtn.addEventListener('click', function() {
        pasteForm.reset();
    });

    // Copy URL to clipboard
    copyBtn.addEventListener('click', function() {
        copyToClipboard(pasteUrl);
    });

    // Copy Raw URL to clipboard
    copyRawBtn.addEventListener('click', function() {
        copyToClipboard(rawUrl);
    });

    // View the created paste
    viewPaste.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = pasteUrl.value;
    });

    // Create a new paste
    newPaste.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/';
    });

    // View raw paste from view page
    if (rawLink) {
        rawLink.addEventListener('click', function(e) {
            e.preventDefault();
            const currentPath = window.location.pathname;
            window.location.href = `${currentPath}.raw`;
        });
    }

    // Helper functions
    function generateId() {
        return Math.random().toString(36).substring(2, 10) + 
               Math.random().toString(36).substring(2, 10);
    }

    function savePaste(paste) {
        let pastes = JSON.parse(localStorage.getItem('simplePastes') || '{}');
        pastes[paste.id] = paste;
        localStorage.setItem('simplePastes', JSON.stringify(pastes));
    }

    function getPaste(id) {
        const pastes = JSON.parse(localStorage.getItem('simplePastes') || '{}');
        return pastes[id] || null;
    }

    function showPaste(id, isRaw = false) {
        const paste = getPaste(id);
        
        if (!paste) {
            // Paste not found, redirect to home
            window.location.href = '/';
            return;
        }
        
        if (isRaw) {
            // Raw content - just output plain text
            document.body.innerHTML = `<pre>${paste.content}</pre>`;
            document.title = `${paste.name}.raw - SimplePaste`;
            document.body.classList.add('raw-view');
            return;
        }
        
        // Formatted view
        createSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        viewSection.classList.remove('hidden');
        
        // Display paste info
        pasteTitle.textContent = paste.name;
        const date = new Date(paste.timestamp);
        pasteDate.textContent = date.toLocaleString();
        
        // Display content with basic syntax highlighting
        pasteDisplay.textContent = paste.content;
        applyBasicSyntaxHighlighting(pasteDisplay);
        
        document.title = `${paste.name} - SimplePaste`;
    }

    function copyToClipboard(inputElement) {
        inputElement.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        const buttonId = inputElement.id === 'pasteUrl' ? 'copyBtn' : 'copyRawBtn';
        const button = document.getElementById(buttonId);
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }

    function applyBasicSyntaxHighlighting(element) {
        const text = element.textContent;
        if (!text) return;
        
        // Very basic syntax highlighting
        const html = text
            .replace(/(\b(function|return|if|else|for|while|var|let|const|class|import|export|from)\b)/g, '<span class="keyword">$1</span>')
            .replace(/(".*?"|'.*?')/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>')
            .replace(/(\b\d+\b)/g, '<span class="number">$1</span>')
            .replace(/(\b[A-Z][a-zA-Z0-9_]*\b)/g, '<span class="class-name">$1</span>');
        
        element.innerHTML = html;
    }

    function extractPasteId(path) {
        // Handle both /id and /id.raw
        const match = path.match(/\/([a-z0-9]+)(?:\.raw)?$/i);
        return match ? match[1] : null;
    }

    function getBaseUrl() {
        let baseUrl = window.location.href;
        
        // Remove hash and query parameters
        baseUrl = baseUrl.split('#')[0].split('?')[0];
        
        // Ensure it ends with /
        if (!baseUrl.endsWith('/')) {
            const lastSlash = baseUrl.lastIndexOf('/');
            baseUrl = baseUrl.substring(0, lastSlash + 1);
        }
        
        return baseUrl;
    }
});
