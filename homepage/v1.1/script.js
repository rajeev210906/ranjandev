document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    // Focus search input when page loads
    searchInput.focus();

    // Handle form submission
    searchForm.addEventListener('submit', (e) => {
        const query = searchInput.value.trim();
        if (!query) {
            e.preventDefault();
        }
    });

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search input when / is pressed
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        // Clear search input when Escape is pressed
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.focus();
        }
        // Submit search on Ctrl/Cmd + Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (searchInput.value.trim()) {
                searchForm.submit();
            }
        }
    });

    // Default shortcuts
    const defaultShortcuts = [
        { name: 'YouTube', url: 'https://www.youtube.com', icon: 'fab fa-youtube' },
        { name: 'Gmail', url: 'https://www.gmail.com', icon: 'far fa-envelope' },
        { name: 'GitHub', url: 'https://www.github.com', icon: 'fab fa-github' },
        { name: 'LinkedIn', url: 'https://www.linkedin.com', icon: 'fab fa-linkedin' }
    ];

    // Load shortcuts from localStorage or use defaults
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || defaultShortcuts;

    // DOM elements
    const quickLinks = document.getElementById('quickLinks');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModal = document.getElementById('closeModal');
    const shortcutsList = document.getElementById('shortcutsList');
    const addShortcutBtn = document.getElementById('addShortcut');

    // Render shortcuts
    function renderShortcuts() {
        quickLinks.innerHTML = '';
        shortcuts.forEach(shortcut => {
            quickLinks.innerHTML += `
                <div class="link-card">
                    <a href="${shortcut.url}"><i class="${shortcut.icon}"></i>${shortcut.name}</a>
                </div>
            `;
        });
    }

    // Render shortcuts in settings modal
    function renderShortcutsSettings() {
        shortcutsList.innerHTML = '';
        shortcuts.forEach((shortcut, index) => {
            shortcutsList.innerHTML += `
                <div class="shortcut-item">
                    <input type="text" value="${shortcut.name}" placeholder="Name" data-index="${index}" data-type="name">
                    <input type="text" value="${shortcut.url}" placeholder="URL" data-index="${index}" data-type="url">
                    <input type="text" value="${shortcut.icon}" placeholder="Icon class" data-index="${index}" data-type="icon">
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;
        });
    }

    // Save shortcuts to localStorage
    function saveShortcuts() {
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
        renderShortcuts();
    }

    // Event Listeners
    closeModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        saveShortcuts();
    });

    addShortcutBtn.addEventListener('click', () => {
        shortcuts.push({ name: 'New Shortcut', url: 'https://', icon: 'fas fa-link' });
        renderShortcutsSettings();
    });

    shortcutsList.addEventListener('input', (e) => {
        if (e.target.matches('input')) {
            const index = parseInt(e.target.dataset.index);
            const type = e.target.dataset.type;
            shortcuts[index][type] = e.target.value;
        }
    });

    shortcutsList.addEventListener('click', (e) => {
        if (e.target.matches('.delete-btn')) {
            const index = parseInt(e.target.dataset.index);
            shortcuts.splice(index, 1);
            renderShortcutsSettings();
        }
    });

    // Settings Menu
    const settingsMenu = document.getElementById('settingsMenu');
    let isSettingsOpen = false;

    // Modals
    const modals = {
        settings: document.getElementById('settingsModal'),
        theme: document.getElementById('themeModal'),
        background: document.getElementById('backgroundModal'),
        about: document.getElementById('aboutModal'),
        fonts: document.getElementById('fontsModal')
    };

    // Single settings button click handler
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isSettingsOpen = !isSettingsOpen;
        settingsMenu.style.display = isSettingsOpen ? 'block' : 'none';
        settingsBtn.style.transform = isSettingsOpen ? 'rotate(45deg)' : 'rotate(0)';
    });

    // Menu items click handlers with fixed behavior
    const menuItems = {
        editShortcuts: () => {
            settingsModal.style.display = 'block';
            renderShortcutsSettings();
            settingsMenu.style.display = 'none';
            isSettingsOpen = false;
        },
        changeTheme: () => {
            themeModal.style.display = 'block';
            settingsMenu.style.display = 'none';
            isSettingsOpen = false;
        },
        changeBackground: () => {
            backgroundModal.style.display = 'block';
            settingsMenu.style.display = 'none';
            isSettingsOpen = false;
        },
        aboutDev: () => {
            aboutModal.style.display = 'block';
            settingsMenu.style.display = 'none';
            isSettingsOpen = false;
        },
        changeFonts: () => {
            fontsModal.style.display = 'block';
            settingsMenu.style.display = 'none';
            isSettingsOpen = false;
        }
    };

    // Attach click handlers to menu items
    Object.keys(menuItems).forEach(id => {
        document.getElementById(id).addEventListener('click', menuItems[id]);
    });

    // Close settings menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            isSettingsOpen = false;
            settingsMenu.style.display = 'none';
            settingsBtn.style.transform = 'rotate(0)';
        }
    });

    // Theme handling
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            document.body.className = theme ? `theme-${theme}` : '';
            localStorage.setItem('theme', theme);
            themeModal.style.display = 'none';
        });
    });

    // Background handling
    const bgOptions = document.querySelectorAll('.background-option');
    const bgInput = document.getElementById('bgInput');
    const bgPreview = document.querySelector('.custom-bg-preview');

    // Create background wrapper if it doesn't exist
    let backgroundWrapper = document.querySelector('.background-wrapper');
    if (!backgroundWrapper) {
        backgroundWrapper = document.createElement('div');
        backgroundWrapper.className = 'background-wrapper';
        document.body.prepend(backgroundWrapper);
    }

    function applyBackground(type, value) {
        // Reset all backgrounds
        document.body.style.background = '';
        document.body.style.backgroundImage = 'none';
        document.body.removeAttribute('data-background');
        
        // Remove any existing background classes
        const neonClasses = Array.from(document.body.classList)
            .filter(cls => cls.startsWith('bg-'));
        neonClasses.forEach(cls => document.body.classList.remove(cls));

        switch(type) {
            case 'none':
                break;
            case 'neon':
                document.body.setAttribute('data-background', value);
                break;
            case 'image':
                document.body.style.backgroundImage = `url('${value}')`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
                break;
        }
    }

    function clearBackground() {
        localStorage.removeItem('background');
        localStorage.removeItem('customBackground');
        applyBackground('none');
    }

    bgOptions.forEach(option => {
        option.addEventListener('click', () => {
            const bg = option.dataset.bg;
            if (bg === 'none') {
                clearBackground();
            } else if (bg.startsWith('neon-')) {
                applyBackground('neon', bg);
                localStorage.setItem('background', bg);
                localStorage.removeItem('customBackground');
            } else {
                applyBackground('image', `backgrounds/${bg}`);
                localStorage.setItem('background', bg);
                localStorage.removeItem('customBackground');
            }
            backgroundModal.style.display = 'none';
        });
    });

    // Enhanced file input handling
    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                // Show preview
                bgPreview.style.backgroundImage = `url('${imageUrl}')`;
                bgPreview.classList.add('active');
                // Apply background
                applyBackground('image', imageUrl);
                localStorage.setItem('customBackground', imageUrl);
                localStorage.removeItem('background');
            };
            reader.readAsDataURL(file);
        }
    });

    // Close buttons for all modals
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    // Load saved settings
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = `theme-${savedTheme}`;
    }

    const savedBackground = localStorage.getItem('background');
    const customBackground = localStorage.getItem('customBackground');
    if (customBackground) {
        document.body.style.backgroundImage = `url('${customBackground}')`;
    } else if (savedBackground && savedBackground !== 'none') {
        document.body.style.backgroundImage = `url('backgrounds/${savedBackground}')`;
    }

    // Initial render
    renderShortcuts();
    updateTime();
    setInterval(updateTime, 1000);
    initializeFonts();
});

// Modal Management
const modals = {
    settings: document.getElementById('settingsModal'),
    theme: document.getElementById('themeModal'),
    background: document.getElementById('backgroundModal'),
    about: document.getElementById('aboutModal')
};

function closeAllModals() {
    Object.values(modals).forEach(modal => modal.style.display = 'none');
    settingsMenu.style.display = 'none';
    isSettingsOpen = false;
    settingsBtn.style.transform = 'rotate(0)';
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
        if (document.activeElement === searchInput) {
            searchInput.value = '';
        }
    }
});

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeAllModals();
    }
});

// Theme Management
const themes = {
    dark: {
        background: '#1a1a1a',
        text: '#ffffff',
        card: '#2d2d2d',
        accent: '#4a90e2',
        neon: 'none'
    },
    light: {
        background: '#ffffff',
        text: '#1a1a1a',
        card: '#f0f0f0',
        accent: '#2176d2',
        neon: 'none'
    },
    navy: {
        background: '#1a237e',
        text: '#ffffff',
        card: '#283593',
        accent: '#5c6bc0',
        neon: 'none'
    },
    'neon-blue': {
        background: '#000000',
        text: '#00ffff',
        card: '#000a12',
        accent: '#00ffff',
        neon: '0 0 10px #00ffff',
        gradient: 'radial-gradient(circle at center, #000a12 0%, #000000 100%)'
    },
    'neon-purple': {
        background: '#000000',
        text: '#ff00ff',
        card: '#0a0010',
        accent: '#ff00ff',
        neon: '0 0 10px #ff00ff',
        gradient: 'radial-gradient(circle at center, #0a0010 0%, #000000 100%)'
    },
    'neon-green': {
        background: '#000000',
        text: '#00ff00',
        card: '#001000',
        accent: '#00ff00',
        neon: '0 0 10px #00ff00',
        gradient: 'radial-gradient(circle at center, #001000 0%, #000000 100%)'
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName] || themes.dark;
    
    // Add transition class
    document.body.classList.add('theme-transitioning');
    
    // Apply theme
    document.documentElement.style.setProperty('--bg-color', theme.background);
    document.documentElement.style.setProperty('--text-color', theme.text);
    document.documentElement.style.setProperty('--card-color', theme.card);
    document.documentElement.style.setProperty('--accent-color', theme.accent);
    document.documentElement.style.setProperty('--neon-glow', theme.neon);
    
    // Apply background for neon themes
    if (themeName.startsWith('neon-')) {
        document.body.style.background = theme.gradient;
        document.body.setAttribute('data-theme-background', 'neon');
    } else {
        document.body.style.background = theme.background;
        document.body.removeAttribute('data-theme-background');
    }
    
    document.body.className = `theme-${themeName} theme-transitioning`;
    
    // Remove transition class after animation
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 300);
    
    localStorage.setItem('theme', themeName);
}

// Add touch event handling
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Improve touch response
    const touchElements = document.querySelectorAll('.menu-item, .theme-option, .background-option');
    touchElements.forEach(elem => {
        elem.addEventListener('touchstart', () => {
            elem.classList.add('touch-active');
        });
        elem.addEventListener('touchend', () => {
            elem.classList.remove('touch-active');
        });
    });
}

// Background Management
function handleBackgroundChange(bgType, value) {
    let bgStyle = 'none';
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (bgType === 'preset' && value !== 'none') {
        bgStyle = `url('backgrounds/${value}')`;
        localStorage.setItem('background', value);
        localStorage.removeItem('customBackground');
        
        // Sync theme if it's a neon background
        if (value.startsWith('neon-')) {
            syncThemeWithBackground(currentTheme, value);
        }
    } else if (bgType === 'custom' && value) {
        bgStyle = `url('${value}')`;
        localStorage.setItem('customBackground', value);
        localStorage.removeItem('background');
    }
    
    document.body.style.backgroundImage = bgStyle;
}

// Settings Menu Items
const menuItems = {
    editShortcuts: {
        modal: 'settings',
        callback: renderShortcutsSettings
    },
    changeTheme: {
        modal: 'theme',
        callback: null
    },
    changeBackground: {
        modal: 'background',
        callback: null
    },
    aboutDev: {
        modal: 'about',
        callback: null
    },
    changeFonts: () => {
        fontsModal.style.display = 'block';
        settingsMenu.style.display = 'none';
        isSettingsOpen = false;
    }
};

Object.entries(menuItems).forEach(([id, { modal, callback }]) => {
    document.getElementById(id).addEventListener('click', () => {
        closeAllModals();
        modals[modal].style.display = 'block';
        if (callback) callback();
    });
});

// Initialize features on load
document.addEventListener('DOMContentLoaded', () => {
    // ...existing initialization code...

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) applyTheme(savedTheme);

    // Load saved background
    const customBg = localStorage.getItem('customBackground');
    const savedBg = localStorage.getItem('background');
    if (customBg) {
        handleBackgroundChange('custom', customBg);
    } else if (savedBg) {
        handleBackgroundChange('preset', savedBg);
    }

    // Add drag-and-drop for background images
    const dropZone = document.getElementById('backgroundModal');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => handleBackgroundChange('custom', e.target.result);
            reader.readAsDataURL(file);
        }
    });
});

// Load saved background on page load
window.addEventListener('load', () => {
    const customBg = localStorage.getItem('customBackground');
    const savedBg = localStorage.getItem('background');

    if (customBg) {
        applyBackground('image', customBg);
        if (bgPreview) {
            bgPreview.style.backgroundImage = `url('${customBg}')`;
            bgPreview.classList.add('active');
        }
    } else if (savedBg) {
        if (savedBg === 'none') {
            applyBackground('none');
        } else if (savedBg.startsWith('neon-')) {
            applyBackground('neon', savedBg);
        } else {
            applyBackground('image', `backgrounds/${savedBg}`);
        }
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
}

// Image Compression Function
async function compressImage(file) {
    return new Promise((resolve) => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.8);
            };
        };
    });
}

// Backup/Restore functionality
function exportSettings() {
    const settings = {
        shortcuts: shortcuts,
        theme: localStorage.getItem('theme'),
        background: localStorage.getItem('background'),
        customBackground: localStorage.getItem('customBackground'),
        timeFormat: '24h', // Add time format preference
        titleFont: localStorage.getItem('titleFont'),
        bodyFont: localStorage.getItem('bodyFont')
    };

    const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homepage-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function importSettings(file) {
    try {
        const text = await file.text();
        const settings = JSON.parse(text);
        
        // Restore settings
        if (settings.shortcuts) {
            shortcuts = settings.shortcuts;
            localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
            renderShortcuts();
        }
        if (settings.theme) {
            applyTheme(settings.theme);
        }
        if (settings.background) {
            handleBackgroundChange('preset', settings.background);
        }
        if (settings.customBackground) {
            handleBackgroundChange('custom', settings.customBackground);
        }
        if (settings.titleFont) {
            document.documentElement.style.setProperty('--title-font', `'${settings.titleFont}', sans-serif`);
            localStorage.setItem('titleFont', settings.titleFont);
            document.getElementById('titleFont').value = settings.titleFont;
        }
        
        if (settings.bodyFont) {
            document.documentElement.style.setProperty('--body-font', `'${settings.bodyFont}', sans-serif`);
            localStorage.setItem('bodyFont', settings.bodyFont);
            document.getElementById('bodyFont').value = settings.bodyFont;
        }
        
        alert('Settings imported successfully!');
    } catch (error) {
        alert('Error importing settings. Please check the file format.');
    }
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch(e.key) {
            case 's': // Alt+S for Settings
                settingsBtn.click();
                break;
            case 't': // Alt+T for Theme
                document.getElementById('changeTheme').click();
                break;
            case 'b': // Alt+B for Background
                document.getElementById('changeBackground').click();
                break;
        }
    }
});

// Theme Preview
const themeOptions = document.querySelectorAll('.theme-option');
themeOptions.forEach(option => {
    option.addEventListener('mouseenter', () => {
        const theme = option.dataset.theme;
        document.body.classList.add(`preview-theme-${theme}`);
    });
    option.addEventListener('mouseleave', () => {
        const theme = option.dataset.theme;
        document.body.classList.remove(`preview-theme-${theme}`);
    });
});

// Enhanced Background Upload
async function handleBackgroundUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
        const compressed = await compressImage(file);
        if (compressed.size > 5 * 1024 * 1024) {
            alert('File size is too large even after compression');
            return;
        }
        file = compressed;
    }
    // Rest of the background handling code
}

// Initialize event listeners for new features
document.getElementById('exportSettings').addEventListener('click', exportSettings);
document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        importSettings(e.target.files[0]);
    }
});
document.getElementById('importSettings').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

// Enhanced Theme and Background Sync
function syncThemeWithBackground(themeName, bgType) {
    const theme = themes[themeName] || themes.dark;
    
    document.body.classList.add('theme-transitioning');
    document.body.classList.add('sync-active');
    
    if (themeName.startsWith('neon-')) {
        document.body.style.background = theme.gradient;
        theme.neon = `0 0 10px ${theme.accent}, 0 0 20px ${theme.accent}`;
        theme.card = adjustColorOpacity(theme.background, 0.8);
    }
    
    applyTheme(themeName);
    
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning', 'sync-active');
    }, 300);
}

// Color utility function
function adjustColorOpacity(color, opacity) {
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
}

// Load saved search engine preference
document.addEventListener('DOMContentLoaded', () => {
    const savedEngine = localStorage.getItem('searchEngine');
    if (savedEngine) {
        searchEngineSelect.value = savedEngine;
        const searchForm = document.getElementById('search-form');
        searchForm.action = searchEngines[savedEngine];
    }
    // ...existing code...
});

// Time Display Functions
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');

    // Update time
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}`;

    // Update date
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString(undefined, options);
}

// Initialize time display
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    // ...existing initialization code...
});

// Font Management
function initializeFonts() {
    const titleFont = document.getElementById('titleFont');
    const bodyFont = document.getElementById('bodyFont');
    const fontsModal = document.getElementById('fontsModal');

    // Load saved fonts
    const savedTitleFont = localStorage.getItem('titleFont') || 'Arial';
    const savedBodyFont = localStorage.getItem('bodyFont') || 'Arial';

    // Set initial fonts
    document.documentElement.style.setProperty('--title-font', `'${savedTitleFont}', sans-serif`);
    document.documentElement.style.setProperty('--body-font', `'${savedBodyFont}', sans-serif`);
    
    titleFont.value = savedTitleFont;
    bodyFont.value = savedBodyFont;

    // Preview handlers
    titleFont.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--title-font', `'${e.target.value}', sans-serif`);
        localStorage.setItem('titleFont', e.target.value);
        e.target.parentElement.querySelector('.font-preview').style.fontFamily = e.target.value;
    });

    bodyFont.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--body-font', `'${e.target.value}', sans-serif`);
        localStorage.setItem('bodyFont', e.target.value);
        e.target.parentElement.querySelector('.font-preview').style.fontFamily = e.target.value;
    });

    // Set initial preview fonts
    document.querySelectorAll('.font-preview').forEach(preview => {
        const select = preview.parentElement.querySelector('select');
        preview.style.fontFamily = select.value;
    });
}

// ...rest of existing code...
