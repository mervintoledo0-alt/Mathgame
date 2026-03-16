// ========== SETTINGS FUNCTIONALITY ==========

// Default settings
const defaultSettings = {
    soundEnabled: true,
    musicEnabled: true,
    volume: 80,
    difficulty: 'medium',
    timeBonusEnabled: true,
    streakBonusEnabled: true,
    animationsEnabled: true,
    darkThemeEnabled: true,
    tooltipsEnabled: true
};

let currentSettings = { ...defaultSettings };
let isUserLoggedIn = false;

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    loadSettings();
    setupUI();
    setupEventListeners();
});

// Check if user is logged in
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    isUserLoggedIn = currentUser && currentUser !== '' && !currentUser.includes('Guest_Spider_');
    
    // Update nav links based on login status
    document.getElementById('gameLink').style.display = isUserLoggedIn ? 'block' : 'none';
    document.getElementById('leaderLink').style.display = isUserLoggedIn ? 'block' : 'none';
    document.getElementById('profileLink').style.display = isUserLoggedIn ? 'block' : 'none';
    document.getElementById('logoutLink').style.display = isUserLoggedIn ? 'block' : 'none';
}

// Handle logout from settings
function handleSettingsLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
        window.location.href = 'index.html';
    }
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
    } else {
        currentSettings = { ...defaultSettings };
    }
}

// Setup UI with current settings
function setupUI() {
    document.getElementById('soundToggle').classList.toggle('active', currentSettings.soundEnabled);
    document.getElementById('musicToggle').classList.toggle('active', currentSettings.musicEnabled);
    document.getElementById('volumeSlider').value = currentSettings.volume;
    document.getElementById('volumeValue').textContent = currentSettings.volume + '%';
    document.getElementById('difficultySelect').value = currentSettings.difficulty;
    document.getElementById('timeBonusToggle').classList.toggle('active', currentSettings.timeBonusEnabled);
    document.getElementById('streakBonusToggle').classList.toggle('active', currentSettings.streakBonusEnabled);
    document.getElementById('animationsToggle').classList.toggle('active', currentSettings.animationsEnabled);
    document.getElementById('darkThemeToggle').classList.toggle('active', currentSettings.darkThemeEnabled);
    document.getElementById('tooltipsToggle').classList.toggle('active', currentSettings.tooltipsEnabled);
}

// Setup event listeners
function setupEventListeners() {
    // Toggle switches
    document.getElementById('soundToggle').addEventListener('click', () => {
        currentSettings.soundEnabled = !currentSettings.soundEnabled;
        document.getElementById('soundToggle').classList.toggle('active');
    });

    document.getElementById('musicToggle').addEventListener('click', () => {
        currentSettings.musicEnabled = !currentSettings.musicEnabled;
        document.getElementById('musicToggle').classList.toggle('active');
    });

    document.getElementById('timeBonusToggle').addEventListener('click', () => {
        currentSettings.timeBonusEnabled = !currentSettings.timeBonusEnabled;
        document.getElementById('timeBonusToggle').classList.toggle('active');
    });

    document.getElementById('streakBonusToggle').addEventListener('click', () => {
        currentSettings.streakBonusEnabled = !currentSettings.streakBonusEnabled;
        document.getElementById('streakBonusToggle').classList.toggle('active');
    });

    document.getElementById('animationsToggle').addEventListener('click', () => {
        currentSettings.animationsEnabled = !currentSettings.animationsEnabled;
        document.getElementById('animationsToggle').classList.toggle('active');
    });

    document.getElementById('darkThemeToggle').addEventListener('click', () => {
        currentSettings.darkThemeEnabled = !currentSettings.darkThemeEnabled;
        document.getElementById('darkThemeToggle').classList.toggle('active');
    });

    document.getElementById('tooltipsToggle').addEventListener('click', () => {
        currentSettings.tooltipsEnabled = !currentSettings.tooltipsEnabled;
        document.getElementById('tooltipsToggle').classList.toggle('active');
    });

    // Volume slider
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        currentSettings.volume = parseInt(e.target.value);
        document.getElementById('volumeValue').textContent = currentSettings.volume + '%';
    });

    // Difficulty select
    document.getElementById('difficultySelect').addEventListener('change', (e) => {
        currentSettings.difficulty = e.target.value;
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveSettings);

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetSettings);
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(currentSettings));
    
    // Show success message
    const message = document.getElementById('successMessage');
    message.classList.add('show');
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
    
    console.log('Settings saved:', currentSettings);
}

// Reset to default settings
function resetSettings() {
    const confirm = window.confirm('Are you sure you want to reset all settings to default?');
    if (!confirm) return;
    
    currentSettings = { ...defaultSettings };
    setupUI();
    saveSettings();
    alert('Settings reset to default!');
}

// Get specific setting value
function getSetting(key) {
    return currentSettings[key] !== undefined ? currentSettings[key] : defaultSettings[key];
}

// Apply settings to game (called from game page)
function applyGameSettings() {
    // Apply difficulty
    const difficulty = getSetting('difficulty');
    if (window.gameSettings) {
        window.gameSettings.difficulty = difficulty;
    }
    
    // Apply audio
    const soundEnabled = getSetting('soundEnabled');
    const volume = getSetting('volume');
    
    if (window.audioManager) {
        window.audioManager.setVolume(volume / 100);
        window.audioManager.setSoundEnabled(soundEnabled);
    }
    
    console.log('Game settings applied:', currentSettings);
}
