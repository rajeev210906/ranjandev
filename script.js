// Theme functions
function setTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('theme', themeName);
}

// DateTime functions
function updateDateTime() {
    try {
        const now = new Date();
        document.getElementById('current-time').textContent = 
            now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        
        document.getElementById('current-day').textContent = 
            now.toLocaleDateString('en-US', { weekday: 'long' });
    } catch (error) {
        console.error('Error updating date/time:', error);
    }
}

// Time toggle function
function toggleTime() {
    const timeSection = document.querySelector('.datetime');
    const toggleButton = document.querySelector('.time-toggle');
    
    timeSection.classList.toggle('show');
    toggleButton.classList.toggle('active');
    
    // Store preference
    localStorage.setItem('timeEnabled', timeSection.classList.contains('show'));
}

// Modal functions
function toggleAboutModal(event) {
    event.preventDefault();
    const modal = document.getElementById('aboutModal');
    modal.classList.add('show');
}

// Modal event listeners
document.addEventListener('click', (event) => {
    const modal = document.getElementById('aboutModal');
    if (event.target.classList.contains('modal') || event.target.classList.contains('close-modal')) {
        modal.classList.remove('show');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const modal = document.getElementById('aboutModal');
        modal.classList.remove('show');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'theme-skyblue';
    const timeEnabled = localStorage.getItem('timeEnabled') === 'true';
    
    setTheme(savedTheme);
    
    // Always initialize updateDateTime interval
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Toggle visibility based on saved preference
    const timeSection = document.querySelector('.datetime');
    const toggleButton = document.querySelector('.time-toggle');
    
    if (timeEnabled) {
        timeSection.classList.add('show');
        toggleButton.classList.add('active');
    } else {
        timeSection.classList.remove('show');
        toggleButton.classList.remove('active');
    }
});

// Removed:
// - Theme change event listener (unused)
// - Any project/blog/tools specific functions
