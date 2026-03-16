// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            
            // Scroll to target
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
});

// Smooth scroll for navigation links
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Gallery button functionality
const galleryBtn = document.querySelector('.gallery-btn');
if (galleryBtn) {
    galleryBtn.addEventListener('click', () => {
        // You can add functionality to load more images here
        alert('Welcome alen kalbo');
    });
}

// Initialize with some web animation
document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to the Spider-Verse!');
    
    // Add some random web lines to background
    const webBg = document.querySelector('.web-background');
    if (webBg) {
        for (let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'web-line animated';
            line.style.left = `${Math.random() * 100}%`;
            line.style.top = `${Math.random() * 100}%`;
            line.style.transform = `rotate(${Math.random() * 360}deg)`;
            line.style.animationDuration = `${15 + Math.random() * 20}s`;
            webBg.appendChild(line);
        }
    }
});


// ========== MINIMIZABLE MUSIC PLAYER ==========

// Elements
const musicPlayer = document.getElementById('musicPlayer');
const minimizeBtn = document.getElementById('minimizeBtn');
const expandBtn = document.getElementById('expandBtn');
const miniVisualizer = document.getElementById('miniVisualizer');
const miniPlayBtn = document.getElementById('miniPlayBtn');
const miniPlayIcon = document.getElementById('miniPlayIcon');
const miniLoadBtn = document.getElementById('miniLoadBtn');
const miniTitle = document.getElementById('miniTitle');
const playerSpectrum = document.getElementById('playerSpectrum');
const playerLoadBtn = document.getElementById('playerLoadBtn');
const playerFileInput = document.getElementById('playerFileInput');
const playerAudio = document.getElementById('playerAudio');
const playerPlayBtn = document.getElementById('playerPlayBtn');
const playerPlayIcon = document.getElementById('playerPlayIcon');
const playerPrevBtn = document.getElementById('playerPrevBtn');
const playerNextBtn = document.getElementById('playerNextBtn');
const playerSongTitle = document.getElementById('playerSongTitle');
const playerDisc = document.getElementById('playerDisc');
const playerCurrTime = document.getElementById('playerCurrTime');
const playerTotalTime = document.getElementById('playerTotalTime');
const playerProgressFill = document.getElementById('playerProgressFill');
const playerProgressBarBg = document.getElementById('playerProgressBarBg');

// Variables
let playerPlaylist = [];
let playerCurrentIndex = 0;
let playerIsDragging = false;
let miniBars = [];
let spectrumBars = [];

// Create visualizer bars
function createVisualizerBars() {
    // Mini visualizer bars
    miniVisualizer.innerHTML = '';
    miniBars = [];
    for (let i = 0; i < 10; i++) {
        const bar = document.createElement('div');
        bar.className = 'mini-bar';
        bar.style.height = '10px';
        miniVisualizer.appendChild(bar);
        miniBars.push(bar);
    }
    
    // Spectrum bars
    playerSpectrum.innerHTML = '';
    spectrumBars = [];
    for (let i = 0; i < 40; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
        bar.style.height = `${Math.random() * 50 + 20}px`;
        playerSpectrum.appendChild(bar);
        spectrumBars.push(bar);
    }
}

// Toggle minimize/expand
if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
        musicPlayer.classList.add('expanded');
    });
}

if (expandBtn) {
    expandBtn.addEventListener('click', () => {
        musicPlayer.classList.remove('expanded');
    });
}

// Load music files
if (miniLoadBtn) {
    miniLoadBtn.addEventListener('click', () => {
        playerFileInput.click();
    });
}

if (playerLoadBtn) {
    playerLoadBtn.addEventListener('click', () => {
        playerFileInput.click();
    });
}

if (playerFileInput) {
    playerFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            playerPlaylist = files;
            playerCurrentIndex = 0;
            loadPlayerTrack(playerCurrentIndex);
            playPlayerTrack();
        }
    });
}

function loadPlayerTrack(index) {
    if (index < 0 || index >= playerPlaylist.length) return;

    const file = playerPlaylist[index];
    playerAudio.src = URL.createObjectURL(file);
    playerAudio.load();

    // Set title
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    playerSongTitle.innerText = cleanName;
    miniTitle.innerText = cleanName;
    playerSongTitle.classList.remove('paused-text');
}

function playPlayerTrack() {
    if (playerPlaylist.length === 0) return;
    
    playerAudio.play().then(() => {
        updatePlayerUIState(true);
        startMiniVisualizer();
    }).catch(e => {
        console.log("Playback prevented, click play button to start");
    });
}

function pausePlayerTrack() {
    playerAudio.pause();
    updatePlayerUIState(false);
    stopMiniVisualizer();
}

function togglePlayerPlay() {
    if (playerPlaylist.length === 0) {
        playerFileInput.click();
        return;
    }
    
    if (playerAudio.paused) {
        playPlayerTrack();
    } else {
        pausePlayerTrack();
    }
}

function nextPlayerTrack() {
    if (playerPlaylist.length === 0) return;
    playerCurrentIndex = (playerCurrentIndex + 1) % playerPlaylist.length;
    loadPlayerTrack(playerCurrentIndex);
    playPlayerTrack();
}

function prevPlayerTrack() {
    if (playerPlaylist.length === 0) return;
    playerCurrentIndex = (playerCurrentIndex - 1 + playerPlaylist.length) % playerPlaylist.length;
    loadPlayerTrack(playerCurrentIndex);
    playPlayerTrack();
}

function updatePlayerUIState(isPlaying) {
    if (isPlaying) {
        playerPlayIcon.classList.remove('fa-play');
        playerPlayIcon.classList.add('fa-pause');
        miniPlayIcon.classList.remove('fa-play');
        miniPlayIcon.classList.add('fa-pause');
        
        // Animate disc
        playerDisc.classList.remove('paused');
        playerDisc.classList.add('spinning');
        
        // Animate title
        playerSongTitle.classList.remove('paused-text');
        
        // Animate spectrum
        spectrumBars.forEach(bar => bar.style.animationPlayState = 'running');
    } else {
        playerPlayIcon.classList.remove('fa-pause');
        playerPlayIcon.classList.add('fa-play');
        miniPlayIcon.classList.remove('fa-pause');
        miniPlayIcon.classList.add('fa-play');
        
        playerDisc.classList.remove('spinning');
        playerDisc.classList.add('paused');
        playerSongTitle.classList.add('paused-text');
        
        spectrumBars.forEach(bar => bar.style.animationPlayState = 'paused');
    }
}

// Mini visualizer animation
let miniVisualizerInterval;

function startMiniVisualizer() {
    stopMiniVisualizer();
    
    miniVisualizerInterval = setInterval(() => {
        miniBars.forEach((bar, index) => {
            const height = 5 + Math.random() * 25;
            bar.style.height = `${height}px`;
            bar.style.opacity = 0.3 + Math.random() * 0.7;
        });
    }, 100);
}

function stopMiniVisualizer() {
    if (miniVisualizerInterval) {
        clearInterval(miniVisualizerInterval);
    }
    
    miniBars.forEach(bar => {
        bar.style.height = '10px';
        bar.style.opacity = '0.3';
    });
}

// Event listeners
if (miniPlayBtn) {
    miniPlayBtn.addEventListener('click', togglePlayerPlay);
}

if (playerPlayBtn) {
    playerPlayBtn.addEventListener('click', togglePlayerPlay);
}

if (playerNextBtn) {
    playerNextBtn.addEventListener('click', nextPlayerTrack);
}

if (playerPrevBtn) {
    playerPrevBtn.addEventListener('click', prevPlayerTrack);
}

if (playerAudio) {
    playerAudio.addEventListener('ended', nextPlayerTrack);
}

// Timeline updates
playerAudio.addEventListener('timeupdate', () => {
    if (playerIsDragging) return;

    const currentTime = playerAudio.currentTime;
    const duration = playerAudio.duration;

    if (!isNaN(duration)) {
        const percent = (currentTime / duration) * 100;
        playerProgressFill.style.width = `${percent}%`;
        playerCurrTime.innerText = formatPlayerTime(currentTime);
        playerTotalTime.innerText = formatPlayerTime(duration);
    }
});

playerAudio.addEventListener('loadedmetadata', () => {
    playerTotalTime.innerText = formatPlayerTime(playerAudio.duration);
});

function formatPlayerTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
}

// Drag and seek
function getPlayerSeekTime(e) {
    const rect = playerProgressBarBg.getBoundingClientRect();
    let clickX = e.clientX - rect.left;

    if (clickX < 0) clickX = 0;
    if (clickX > rect.width) clickX = rect.width;

    const percentage = clickX / rect.width;
    return percentage * playerAudio.duration;
}

if (playerProgressBarBg) {
    playerProgressBarBg.addEventListener('mousedown', (e) => {
        if (playerPlaylist.length === 0) return;
        playerIsDragging = true;
        const time = getPlayerSeekTime(e);
        const percent = (time / playerAudio.duration) * 100;
        playerProgressFill.style.width = `${percent}%`;
        playerCurrTime.innerText = formatPlayerTime(time);
    });
}

document.addEventListener('mousemove', (e) => {
    if (!playerIsDragging) return;
    const time = getPlayerSeekTime(e);
    const percent = (time / playerAudio.duration) * 100;
    playerProgressFill.style.width = `${percent}%`;
    playerCurrTime.innerText = formatPlayerTime(time);
});

document.addEventListener('mouseup', (e) => {
    if (!playerIsDragging) return;
    playerIsDragging = false;
    if (playerPlaylist.length > 0) {
        const time = getPlayerSeekTime(e);
        playerAudio.currentTime = time;
    }
});

// Initialize
createVisualizerBars();

// ========== DEFAULT/AUTOPLAY MUSIC ==========

// URL ng default music (ilagay mo yung path ng music file mo)
const defaultMusicURL = 'music/spidey2.mp3'; // PALTAN MO TO SA ACTUAL FILE PATH MO

// Pangalan ng default song
const defaultSongName = 'Spider-Man Theme';

// Function para i-load ang default music
function loadDefaultMusic() {
    if (!playerAudio) return;
    
    try {
        // Load the default audio
        playerAudio.src = defaultMusicURL;
        playerAudio.load();
        
        // Set playlist
        playerPlaylist = [{ name: defaultSongName }];
        playerCurrentIndex = 0;
        
        // Set titles
        playerSongTitle.innerText = defaultSongName;
        miniTitle.innerText = defaultSongName;
        
        // Autoplay after metadata loads
        playerAudio.addEventListener('loadedmetadata', function onLoad() {
            playerAudio.removeEventListener('loadedmetadata', onLoad);
            
            // Try autoplay (may browsers na hindi pwede autoplay without user interaction)
            playerAudio.play().then(() => {
                updatePlayerUIState(true);
                startMiniVisualizer();
                console.log('Default music playing automatically');
            }).catch(error => {
                // Kung hindi pwede autoplay, ready na lang ang player
                console.log('Music loaded. Click play to start.');
                updatePlayerUIState(false);
            });
        });
        
        // Handle load errors
        playerAudio.addEventListener('error', function(e) {
            console.error('Error loading default music:', e);
            miniTitle.innerText = 'Load Failed';
            playerSongTitle.innerText = 'Failed to load music';
        });
        
    } catch (error) {
        console.error('Failed to load default music:', error);
    }
}

// Initialize default music on page load
document.addEventListener('DOMContentLoaded', () => {
    // ... existing DOMContentLoaded code ...
    
    // Load default music after a short delay
    setTimeout(() => {
        loadDefaultMusic();
    }, 1000);
});

// ========== END DEFAULT MUSIC ==========

// ========== AUTH FUNCTIONS (Login/Signup) ==========

// Initialize registered users from localStorage
function getRegisteredUsers() {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : {};
}

// Save registered users to localStorage
function saveRegisteredUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Switch between login and signup forms
function switchForm(formType) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Deactivate all toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected form
    if (formType === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelector('[data-form="login"]').classList.add('active');
    } else if (formType === 'signup') {
        document.getElementById('signupForm').classList.add('active');
        document.querySelector('[data-form="signup"]').classList.add('active');
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    
    if (!input) {
        console.error('Input not found:', inputId);
        return;
    }
    
    // Find the show-password button that's a sibling
    const button = input.nextElementSibling;
    
    if (!button || !button.classList.contains('show-password')) {
        console.error('Show-password button not found');
        return;
    }
    
    const icon = button.querySelector('i');
    
    if (!icon) {
        console.error('Icon not found in button');
        return;
    }
    
    console.log('Current input type:', input.type);
    console.log('Icon classes before:', icon.className);
    
    // Toggle the input type
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        console.log('Changed to TEXT');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        console.log('Changed to PASSWORD');
    }
    
    console.log('Icon classes after:', icon.className);
    console.log('Input type after:', input.type);
}

// Continue as Guest
function continueGuest() {
    event.preventDefault();
    // Create a unique guest session
    const guestId = 'Guest_Spider_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('currentUser', guestId);
    localStorage.setItem('sessionType', 'guest');
    alert('Welcome to Spider-Verse as Guest! 🕷️\n(Guest progress is NOT saved)');
    // Redirect to game
    setTimeout(() => {
        window.location.href = 'spidermath-game.html';
    }, 500);
}

// Check if user is logged in and show appropriate content
function checkLoginStatus() {
    const currentUser = localStorage.getItem('currentUser');
    const authFormsContainer = document.getElementById('authFormsContainer');
    const loggedInContainer = document.getElementById('loggedInContainer');
    
    // If user is logged in (not a guest)
    if (currentUser && currentUser !== '' && !currentUser.includes('Guest_Spider_')) {
        // Hide login forms
        if (authFormsContainer) {
            authFormsContainer.style.display = 'none';
        }
        // Show logged in message
        if (loggedInContainer) {
            loggedInContainer.style.display = 'block';
            // Update username in the welcome message
            const usernameEl = loggedInContainer.querySelector('.logged-username');
            if (usernameEl) {
                usernameEl.textContent = currentUser;
            }
        }
    } else {
        // Show login forms for non-logged-in users
        if (authFormsContainer) {
            authFormsContainer.style.display = 'block';
        }
        // Hide logged in message
        if (loggedInContainer) {
            loggedInContainer.style.display = 'none';
        }
    }
}

// Logout function for home page
function handleHomeLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
        localStorage.removeItem('sessionType');
        // Reload the page to show login form again
        window.location.href = 'index.html';
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    checkLoginStatus();
    
    // Toggle button listeners
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const formType = btn.getAttribute('data-form');
            switchForm(formType);
        });
    });
    
    // Login form submission
    const loginForm = document.querySelector('#loginForm form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            if (username && password) {
                // Get registered users and validate
                const registeredUsers = getRegisteredUsers();
                
                // Check if username exists
                if (!registeredUsers[username]) {
                    alert('❌ Username not found! Please sign up first.');
                    return;
                }
                
                // Check if password matches
                if (registeredUsers[username].password !== password) {
                    alert('❌ Incorrect password! Please try again.');
                    return;
                }
                
                // Validation passed
                console.log('Login successful:', { username });
                alert(`Welcome back, ${username}! 🕷️`);
                // Save username to localStorage
                localStorage.setItem('currentUser', username);
                // Clear the form
                loginForm.reset();
                // Redirect to game
                setTimeout(() => {
                    window.location.href = 'spidermath-game.html';
                }, 500);
            }
        });
    }
    
    // Signup form submission
    const signupForm = document.querySelector('#signupForm form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const securityQuestion = document.getElementById('securityQuestion').value;
            const securityAnswer = document.getElementById('securityAnswer').value;
            
            // Form validation
            if (!username || !email || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
                alert('Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email');
                return;
            }
            
            // Check if username already exists
            const registeredUsers = getRegisteredUsers();
            if (registeredUsers[username]) {
                alert('❌ Username already taken! Please choose a different username.');
                return;
            }
            
            // All validations passed - Store user data
            registeredUsers[username] = {
                email: email,
                password: password,
                securityQuestion: securityQuestion,
                securityAnswer: securityAnswer,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            saveRegisteredUsers(registeredUsers);
            
            console.log('Signup successful:', { username, email });
            alert(`Welcome to Spider-Verse, ${username}! Your hero journey begins now! 🕷️⚡`);
            // Save username to localStorage to auto-login
            localStorage.setItem('currentUser', username);
            // Clear the form
            signupForm.reset();
            // Redirect to game
            setTimeout(() => {
                window.location.href = 'spidermath-game.html';
            }, 500);
        });
    }
});

// ========== FORGOT PASSWORD FUNCTIONS ==========

function openForgotPasswordModal(e) {
    e.preventDefault();
    const modal = document.getElementById('forgotPasswordModal');
    modal.classList.add('show');
    
    // Add event listener to get security question when username is entered
    const forgotUsernameInput = document.getElementById('forgotUsername');
    forgotUsernameInput.addEventListener('input', showSecurityQuestion);
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    modal.classList.remove('show');
    
    // Clear form
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('forgotSecurityQuestion').value = '';
}

function showSecurityQuestion() {
    const username = document.getElementById('forgotUsername').value.trim();
    const securityQuestionInput = document.getElementById('forgotSecurityQuestion');
    
    if (!username) {
        securityQuestionInput.value = '';
        return;
    }
    
    const registeredUsers = getRegisteredUsers();
    
    if (registeredUsers[username]) {
        securityQuestionInput.value = registeredUsers[username].securityQuestion || 'Security question not found';
    } else {
        securityQuestionInput.value = 'Username not found';
    }
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    const username = document.getElementById('forgotUsername').value.trim();
    const securityAnswer = document.getElementById('forgotSecurityAnswer').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value;
    const confirmPassword = document.getElementById('forgotConfirmPassword').value;
    
    // Validation
    if (!username || !securityAnswer || !newPassword || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Check if username exists
    const registeredUsers = getRegisteredUsers();
    
    if (!registeredUsers[username]) {
        alert('❌ Username not found!');
        return;
    }
    
    // Verify security answer (case-insensitive)
    if (registeredUsers[username].securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
        alert('❌ Incorrect answer to security question!');
        return;
    }
    
    // Update password
    registeredUsers[username].password = newPassword;
    saveRegisteredUsers(registeredUsers);
    
    alert(`✅ Password reset successfully for ${username}! You can now log in with your new password.`);
    
    // Clear form and close modal
    document.getElementById('forgotPasswordForm').reset();
    closeForgotPasswordModal();
    
    // Switch to login form
    switchForm('login');
}

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    const modal = document.getElementById('forgotPasswordModal');
    if (e.target === modal) {
        closeForgotPasswordModal();
    }
});

// ========== END FORGOT PASSWORD FUNCTIONS ==========

// ========== END AUTH FUNCTIONS ==========

// ========== GALLERY LIGHTBOX FUNCTIONALITY ==========

// Removed - reverted to original gallery styling

// ========== END GALLERY LIGHTBOX ==========