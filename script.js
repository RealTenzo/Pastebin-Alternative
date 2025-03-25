document.addEventListener('DOMContentLoaded', function() {
    const pasteForm = document.getElementById('pasteForm');
    const clearBtn = document.getElementById('clearBtn');
    const resultSection = document.getElementById('resultSection');
    const pasteUrl = document.getElementById('pasteUrl');
    const copyBtn = document.getElementById('copyBtn');
    const viewRaw = document.getElementById('viewRaw');
    const newPaste = document.getElementById('newPaste');
    const pasteContent = document.getElementById('pasteContent');
    const pasteName = document.getElementById('pasteName');

    // Handle form submission
    pasteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real application, you would send the data to a server here
        // For this demo, we'll simulate a response
        const content = pasteContent.value;
        const name = pasteName.value || 'unnamed';
        
        // Generate a "fake" URL for demonstration
        const randomId = Math.random().toString(36).substring(2, 10);
        const demoUrl = `${window.location.origin}/p/${randomId}/${name}`;
        const rawUrl = `${window.location.origin}/p/${randomId}/${name}/raw`;
        
        pasteUrl.value = demoUrl;
        viewRaw.href = rawUrl;
        
        // Show the result section
        pasteForm.reset();
        resultSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Clear the form
    clearBtn.addEventListener('click', function() {
        pasteForm.reset();
    });

    // Copy URL to clipboard
    copyBtn.addEventListener('click', function() {
        pasteUrl.select();
        document.execCommand('copy');
        
        // Change button text temporarily
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });

    // Create a new paste
    newPaste.addEventListener('click', function(e) {
        e.preventDefault();
        resultSection.classList.add('hidden');
        pasteContent.focus();
    });
});