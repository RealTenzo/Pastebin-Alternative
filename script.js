document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const pasteForm = document.getElementById('pasteForm');
    const createSection = document.getElementById('createSection');
    const resultSection = document.getElementById('resultSection');
    const viewSection = document.getElementById('viewSection');
    const pasteUrl = document.getElementById('pasteUrl');
    const rawUrl = document.getElementById('rawUrl');
    const pasteDisplay = document.getElementById('pasteDisplay');
    const pasteTitle = document.getElementById('pasteTitle');
    const pasteDate = document.getElementById('pasteDate');
    const editForm = document.getElementById('editForm');
    const updatedContent = document.getElementById('updatedContent');

    // API Base URL
    const API_BASE = window.location.origin;

    // Check URL to determine what to show
    const path = window.location.pathname;
    const isRaw = path.endsWith('.raw');
    const pasteId = path.split('/').filter(Boolean).pop().replace('.raw', '');

    if (pasteId && pasteId !== 'index.html') {
        fetchPaste(pasteId, isRaw);
    } else {
        createSection.classList.remove('hidden');
    }

    // Event Listeners
    pasteForm.addEventListener('submit', handleCreatePaste);
    document.getElementById('editBtn').addEventListener('click', handleEdit);
    document.getElementById('cancelEdit').addEventListener('click', cancelEditing);
    document.getElementById('updateForm').addEventListener('submit', handleUpdate);

    // Functions
    async function handleCreatePaste(e) {
        e.preventDefault();
        const content = document.getElementById('pasteContent').value.trim();
        const name = document.getElementById('pasteName').value || 'unnamed';
        
        try {
            const response = await fetch(`${API_BASE}/api/pastes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, name })
            });
            const { id } = await response.json();
            
            // Generate URLs
            pasteUrl.value = `${API_BASE}/${id}`;
            rawUrl.value = `${API_BASE}/${id}.raw`;
            
            // Show result
            createSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
        } catch (err) {
            alert('Failed to create paste');
        }
    }

    async function fetchPaste(id, isRaw) {
        try {
            const response = await fetch(`${API_BASE}/api/pastes/${id}`);
            const paste = await response.json();
            
            if (isRaw) {
                document.body.innerHTML = `<pre>${paste.content}</pre>`;
                document.body.classList.add('raw-view');
                return;
            }
            
            // Display paste
            pasteDisplay.textContent = paste.content;
            pasteTitle.textContent = paste.name;
            pasteDate.textContent = new Date(paste.createdAt).toLocaleString();
            
            createSection.classList.add('hidden');
            resultSection.classList.add('hidden');
            viewSection.classList.remove('hidden');
        } catch (err) {
            window.location.href = '/';
        }
    }

    function handleEdit() {
        updatedContent.value = pasteDisplay.textContent;
        viewSection.classList.add('edit-mode');
    }

    function cancelEditing() {
        viewSection.classList.remove('edit-mode');
    }

    async function handleUpdate(e) {
        e.preventDefault();
        const content = updatedContent.value.trim();
        
        try {
            const pasteId = window.location.pathname.split('/').filter(Boolean).pop();
            await fetch(`${API_BASE}/api/pastes/${pasteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            
            // Refresh the paste
            pasteDisplay.textContent = content;
            cancelEditing();
        } catch (err) {
            alert('Failed to update paste');
        }
    }
});
