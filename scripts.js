// Theme functions
function setTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('theme', themeName);
}

// DateTime functions
function updateDateTime() {
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
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'theme-skyblue';
    setTheme(savedTheme);
    updateDateTime();
    setInterval(updateDateTime, 1000);
});
