// API endpoints
// const API_BASE_URL = 'http://localhost:5009/api';
const API_BASE_URL = 'https://gr11vz2p-5009.inc1.devtunnels.ms/api';
const endpoints = {
    search: `${API_BASE_URL}/search`,
    trending: `${API_BASE_URL}/trending`,
    getAudio: `${API_BASE_URL}/get-audio`,
    favorites: `${API_BASE_URL}/favorites`,
    playlists: `${API_BASE_URL}/playlist`,
    download: `${API_BASE_URL}/download`
};

// Player state
let currentPlaylist = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'none'; // none, one, all

// Add these state variables at the top with other state
let currentPage = 1;
let currentQuery = '';
let isLoading = false;
let hasMore = true;

// Add these variables at the top with other state variables
let currentSongForPlaylist = null;

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.querySelector('.progress');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadRandomSongs(); // Load random songs on home page instead of trending
    setupNavigationEvents();
    setupPlayerControls();
    setupAudioEvents();
    setupMobileMenu();
    setupTouchEvents();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    setupInfiniteScroll();

    // Setup playlist modal events
    const addToPlaylistModal = document.getElementById('addToPlaylistModal');
    const createNewPlaylistBtn = document.getElementById('createNewPlaylistBtn');
    const newPlaylistNameInput = document.getElementById('newPlaylistName');

    // Close modal when clicking the X
    addToPlaylistModal.querySelector('.close').onclick = () => {
        addToPlaylistModal.style.display = 'none';
    };

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === addToPlaylistModal) {
            addToPlaylistModal.style.display = 'none';
        }
    };

    // Create new playlist from modal
    createNewPlaylistBtn.onclick = async () => {
        const name = newPlaylistNameInput.value.trim();
        if (name) {
            await addSongToPlaylist(name, currentSongForPlaylist);
            newPlaylistNameInput.value = '';
        }
    };

    // Handle enter key in new playlist input
    newPlaylistNameInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            createNewPlaylistBtn.click();
        }
    };
});

function setupNavigationEvents() {
    document.querySelectorAll('.sidebar nav ul li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar nav ul li').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const page = item.getAttribute('data-page');
            showPage(page);
            
            if (page === 'home') loadRandomSongs();
            if (page === 'trending') loadTrendingSongs();
            if (page === 'favorites') loadFavorites();
            if (page === 'playlists') loadPlaylists();
        });
    });
}

function setupPlayerControls() {
    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    volumeSlider.addEventListener('input', updateVolume);
    
    document.querySelector('.progress-bar').addEventListener('click', seekAudio);
    searchButton.addEventListener('click', () => performSearch(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(searchInput.value);
    });

    // Modal controls
    document.getElementById('createPlaylist').addEventListener('click', () => {
        document.getElementById('playlistModal').style.display = 'block';
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('playlistModal').style.display = 'none';
    });

    document.getElementById('savePlaylist').addEventListener('click', createNewPlaylist);
}

function setupAudioEvents() {
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleSongEnd);
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audioPlayer.duration);
    });
}

// Player Control Functions
async function playSong(song) {
    showApiLoader();
    try {
        const response = await fetch(`${endpoints.getAudio}?id=${song.videoId}`);
        const data = await response.json();
        
        // Add this check for mobile devices
        if (window.innerWidth <= 768) {
            document.querySelector('.player-container').style.display = 'flex';
        }
        
        audioPlayer.src = data.url;
        await audioPlayer.play();
        isPlaying = true;
        updatePlayerUI(song);
        showNotification('Now playing: ' + song.title);
    } catch (error) {
        console.error('Error playing song:', error);
        showNotification('Error playing song. Please try again.');
    } finally {
        hideApiLoader();
    }
}

function togglePlay() {
    if (audioPlayer.src) {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audioPlayer.play();
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
}

function playPrevious() {
    if (currentPlaylist.length === 0) return;
    currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[currentIndex]);
}

function playNext() {
    if (currentPlaylist.length === 0) return;
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[currentIndex]);
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active');
}

function toggleRepeat() {
    switch(repeatMode) {
        case 'none':
            repeatMode = 'one';
            repeatBtn.classList.add('active');
            break;
        case 'one':
            repeatMode = 'all';
            repeatBtn.classList.add('active');
            break;
        case 'all':
            repeatMode = 'none';
            repeatBtn.classList.remove('active');
            break;
    }
}

// UI Update Functions
function updatePlayerUI(song) {
    document.getElementById('currentThumbnail').src = song.thumbnail;
    document.getElementById('currentTitle').textContent = song.title;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
}

function updateVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
}

// API Interaction Functions
async function performSearch(query, append = false) {
    if (!append) {
        currentPage = 1;
        hasMore = true;
        currentQuery = query;
        const container = document.getElementById('searchResults');
        createSkeletonCards(container);
    }

    if (!hasMore || isLoading) return;
    
    isLoading = true;
    showApiLoader();
    
    try {
        const response = await fetch(`${endpoints.search}?q=${encodeURIComponent(currentQuery)}&page=${currentPage}`);
        const data = await response.json();
        
        if (!append) {
            currentPlaylist = data.songs;
            displaySearchResults(data.songs);
        } else {
            currentPlaylist = [...currentPlaylist, ...data.songs];
            appendSearchResults(data.songs);
        }
        
        hasMore = data.hasMore;
        if (hasMore) currentPage++;
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed. Please try again.');
    } finally {
        hideApiLoader();
        isLoading = false;
    }
}

// Add new function to append results
function appendSearchResults(songs) {
    const resultsContainer = document.getElementById('searchResults');
    
    songs.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <div class="song-thumbnail" onclick="playSong(currentPlaylist[${currentPlaylist.length - songs.length + index}])">
                <img src="${song.thumbnail}" alt="${song.title}">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <h3 onclick="playSong(currentPlaylist[${currentPlaylist.length - songs.length + index}])">${song.title}</h3>
            <div class="song-actions">
                <button onclick="addToFavorites(currentPlaylist[${currentPlaylist.length - songs.length + index}])">
                    <i class="fas fa-heart"></i>
                </button>
                <button onclick="downloadSong(currentPlaylist[${currentPlaylist.length - songs.length + index}])">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        resultsContainer.appendChild(songCard);
    });
}

// Add infinite scroll handler
function setupInfiniteScroll() {
    const mainContent = document.querySelector('.main-content');
    let scrollTimeout;

    mainContent.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const { scrollTop, scrollHeight, clientHeight } = mainContent;
            
            // If we're near the bottom (within 200px)
            if (scrollHeight - scrollTop - clientHeight < 200) {
                if (currentQuery) {
                    performSearch(currentQuery, true);
                } else if (document.getElementById('homePage').style.display !== 'none') {
                    loadRandomSongs(true);
                }
            }
        }, 100);
    });
}

async function loadTrendingSongs() {
    const container = document.getElementById('trendingResults');
    createSkeletonCards(container);
    showApiLoader();
    
    try {
        const response = await fetch(endpoints.trending);
        const results = await response.json();
        displaySearchResults(results, 'trendingResults');
        currentPlaylist = results;
    } catch (error) {
        console.error('Error loading trending songs:', error);
        showNotification('Failed to load trending songs');
    } finally {
        hideApiLoader();
    }
}

// Helper Functions
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function seekAudio(e) {
    const progressBar = document.querySelector('.progress-bar');
    const clickPosition = (e.offsetX / progressBar.offsetWidth);
    audioPlayer.currentTime = clickPosition * audioPlayer.duration;
}

function handleSongEnd() {
    if (repeatMode === 'one') {
        audioPlayer.play();
    } else if (repeatMode === 'all' || currentIndex < currentPlaylist.length - 1) {
        playNext();
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(`${pageId}Page`).style.display = 'block';
}

// Display Functions
function displaySearchResults(songs, containerId = 'searchResults') {
    const resultsContainer = document.getElementById(containerId);
    resultsContainer.innerHTML = '';
    
    songs.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <div class="song-thumbnail" onclick="playSong(currentPlaylist[${index}])">
                <img src="${song.thumbnail}" alt="${song.title}">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <h3 onclick="playSong(currentPlaylist[${index}])">${song.title}</h3>
            <div class="song-actions">
                <button onclick="addToFavorites(currentPlaylist[${index}])">
                    <i class="fas fa-heart"></i>
                </button>
                <button onclick="showAddToPlaylistModal(currentPlaylist[${index}])">
                    <i class="fas fa-plus"></i>
                </button>
                <button onclick="downloadSong(currentPlaylist[${index}])">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        resultsContainer.appendChild(songCard);
    });
}

// Loading animation control
function showLoading() {
    document.getElementById('loadingAnimation').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingAnimation').style.display = 'none';
}

// Playlist management
async function loadPlaylists() {
    showLoading();
    try {
        const response = await fetch(endpoints.playlists);
        const playlists = await response.json();
        displayPlaylists(playlists);
    } catch (error) {
        console.error('Error loading playlists:', error);
    } finally {
        hideLoading();
    }
}

function displayPlaylists(playlists) {
    const container = document.getElementById('playlistsContainer');
    container.innerHTML = '';

    Object.entries(playlists).forEach(([name, songs]) => {
        const playlistElement = document.createElement('div');
        playlistElement.className = 'playlist-item';
        playlistElement.innerHTML = `
            <div class="playlist-info" onclick="togglePlaylistSongs('${name}')">
                <h3>${name}</h3>
                <p>${songs.length} songs</p>
            </div>
            <div class="playlist-actions">
                <button onclick="event.stopPropagation(); playPlaylist('${name}')">
                    <i class="fas fa-play"></i>
                </button>
                <button onclick="event.stopPropagation(); deletePlaylist('${name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="playlist-songs" id="playlist-${name}" style="display: none;">
                ${songs.map((song, index) => `
                    <div class="playlist-song-item">
                        <img src="${song.thumbnail}" alt="${song.title}">
                        <span>${song.title}</span>
                        <button onclick="playPlaylistSong('${name}', ${index})">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(playlistElement);
    });
}

// Favorites management
async function loadFavorites() {
    const container = document.getElementById('favoritesResults');
    createSkeletonCards(container);
    showApiLoader();
    
    try {
        const response = await fetch(endpoints.favorites);
        const favorites = await response.json();
        displaySearchResults(favorites, 'favoritesResults');
    } catch (error) {
        console.error('Error loading favorites:', error);
        showNotification('Failed to load favorites');
    } finally {
        hideApiLoader();
    }
}

async function addToFavorites(song) {
    try {
        await fetch(endpoints.favorites, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(song)
        });
        showNotification('Added to favorites!');
    } catch (error) {
        console.error('Error adding to favorites:', error);
    }
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Download functionality
async function downloadSong(song) {
    showLoading();
    try {
        const response = await fetch(`${endpoints.download}/${song.videoId}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        showNotification('Download complete!');
    } catch (error) {
        console.error('Error downloading song:', error);
        showNotification('Download failed. Please try again.');
    } finally {
        hideLoading();
    }
}

async function createNewPlaylist() {
    const name = document.getElementById('playlistName').value;
    if (!name) return;

    try {
        await fetch(endpoints.playlists, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, song: null })
        });
        document.getElementById('playlistModal').style.display = 'none';
        loadPlaylists();
        showNotification('Playlist created!');
    } catch (error) {
        console.error('Error creating playlist:', error);
        showNotification('Error creating playlist');
    }
}

// Add these utility functions after your existing code

function showApiLoader() {
    document.getElementById('apiLoader').style.display = 'flex';
}

function hideApiLoader() {
    document.getElementById('apiLoader').style.display = 'none';
}

function createSkeletonCards(container, count = 8) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'song-card-skeleton';
        skeleton.innerHTML = `
            <div class="thumbnail"></div>
            <div class="title"></div>
            <div class="actions"></div>
        `;
        container.appendChild(skeleton);
    }
}

// Add this new function for random Hindi songs
async function loadRandomSongs(append = false) {
    const queries = [
        "new hindi songs 2024",
        "bollywood latest songs",
        "hindi pop songs",
        "indie hindi songs",
        "bollywood romantic songs"
    ];
    
    if (!append) {
        currentQuery = queries[Math.floor(Math.random() * queries.length)];
        currentPage = 1;
        hasMore = true;
    }
    
    await performSearch(currentQuery, append);
}

// Mobile menu handling
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Create overlay if it doesn't exist
    if (!document.querySelector('.menu-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    
    const overlay = document.querySelector('.menu-overlay');

    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    // Clean up old event listeners
    const newMenuBtn = menuBtn.cloneNode(true);
    menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
    
    newMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    overlay.addEventListener('click', toggleMenu);

    document.querySelectorAll('.sidebar nav ul li').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Ensure menu is closed when resizing to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            menuBtn.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Handle orientation changes
function handleOrientationChange() {
    const player = document.querySelector('.player-container');
    if (window.innerWidth <= 768) {
        player.style.bottom = '0';
    }
}

// Add touch event handling
function setupTouchEvents() {
    const progressBar = document.querySelector('.progress-bar');
    let isTracking = false;

    progressBar.addEventListener('touchstart', (e) => {
        isTracking = true;
        updateAudioProgress(e.touches[0]);
    });

    progressBar.addEventListener('touchmove', (e) => {
        if (isTracking) {
            updateAudioProgress(e.touches[0]);
        }
    });

    progressBar.addEventListener('touchend', () => {
        isTracking = false;
    });

    function updateAudioProgress(touch) {
        const rect = progressBar.getBoundingClientRect();
        const position = (touch.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = position * audioPlayer.duration;
    }
}

// Add these functions after the existing playlist functions
function showAddToPlaylistModal(song) {
    currentSongForPlaylist = song;
    const modal = document.getElementById('addToPlaylistModal');
    modal.style.display = 'block';
    loadPlaylistsForModal();
}

async function loadPlaylistsForModal() {
    try {
        const response = await fetch(endpoints.playlists);
        const playlists = await response.json();
        const playlistsList = document.getElementById('playlistsList');
        playlistsList.innerHTML = '';

        Object.entries(playlists).forEach(([name, songs]) => {
            const item = document.createElement('div');
            item.className = 'playlist-item-select';
            item.innerHTML = `
                <span>${name}</span>
                <span>${songs.length} songs</span>
            `;
            item.onclick = () => addSongToPlaylist(name, currentSongForPlaylist);
            playlistsList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading playlists:', error);
        showNotification('Error loading playlists');
    }
}

async function addSongToPlaylist(playlistName, song) {
    try {
        await fetch(endpoints.playlists, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: playlistName,
                song: song
            })
        });
        document.getElementById('addToPlaylistModal').style.display = 'none';
        showNotification(`Added to ${playlistName}`);
    } catch (error) {
        console.error('Error adding to playlist:', error);
        showNotification('Error adding to playlist');
    }
}

// Add these new functions after existing playlist management functions

async function playPlaylist(playlistName) {
    try {
        const response = await fetch(endpoints.playlists);
        const playlists = await response.json();
        const playlist = playlists[playlistName];
        
        if (playlist && playlist.length > 0) {
            currentPlaylist = playlist;
            currentIndex = 0;
            playSong(currentPlaylist[currentIndex]);
            showNotification(`Playing playlist: ${playlistName}`);
        } else {
            showNotification('Playlist is empty');
        }
    } catch (error) {
        console.error('Error playing playlist:', error);
        showNotification('Error playing playlist');
    }
}

async function deletePlaylist(playlistName) {
    if (!confirm(`Are you sure you want to delete the playlist "${playlistName}"?`)) {
        return;
    }

    try {
        await fetch(endpoints.playlists, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: playlistName })
        });
        loadPlaylists();
        showNotification('Playlist deleted');
    } catch (error) {
        console.error('Error deleting playlist:', error);
        showNotification('Error deleting playlist');
    }
}

function togglePlaylistSongs(playlistName) {
    const songsDiv = document.getElementById(`playlist-${playlistName}`);
    if (songsDiv) {
        const isVisible = songsDiv.style.display === 'block';
        songsDiv.style.display = isVisible ? 'none' : 'block';
    }
}

async function playPlaylistSong(playlistName, index) {
    try {
        const response = await fetch(endpoints.playlists);
        const playlists = await response.json();
        const playlist = playlists[playlistName];
        
        if (playlist && playlist.length > index) {
            currentPlaylist = playlist;
            currentIndex = index;
            playSong(currentPlaylist[currentIndex]);
        }
    } catch (error) {
        console.error('Error playing playlist song:', error);
        showNotification('Error playing song');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadRandomSongs();
    showPage('home');
    setupMobileMenu();
});
