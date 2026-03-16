// ========== GAME VARIABLES ==========
let score = 0;
let currentQuestion = 1;
let totalQuestions = 10;
let correctAnswers = 0;
let wrongAnswers = 0;
let timeLeft = 30;
let timer;
let gameActive = false;
let currentOperation = '';
let currentStreak = 0;
let bestStreak = 0;
let timeBonusEnabled = true;
let streakBonusEnabled = true;
let currentUsername = 'Spider-Hero'; // Default username
let isLoggedIn = false; // Track if user is actually logged in

// Endless Mode Variables
let isEndlessMode = false;
let endlessLives = 3;
let maxLives = 3;

// Speed Run Mode Variables
let isSpeedRunMode = false;
let speedRunLives = 3;

// Track last game mode for Play Again button
let lastGameMode = ''; // 'regular', 'endless', or 'speedrun'

// Check login status on page load
window.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('currentUser');
    
    // Only set username if user actually logged in (not via back button)
    if (storedUser && storedUser !== '') {
        currentUsername = storedUser;
        isLoggedIn = true;
        updateWelcomeMessage(storedUser);
    } else {
        // No active session - redirect to login
        redirectToLogin();
    }
});

// Update welcome message with actual username
function updateWelcomeMessage(username) {
    const userTextElement = document.getElementById('gameUsername');
    if (userTextElement) {
        userTextElement.textContent = username;
    }
}

// Redirect to login if not logged in
function redirectToLogin() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html#login';
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
        window.location.href = 'index.html';
    }
}

// ========== OPERATION SETTINGS ==========
const operations = {
    'addition': { 
        symbol: '+', 
        time: 10,
        name: 'WEB OF ADDITION',
        maxNum: 20,
        color: '#4CAF50'
    },
    'subtraction': { 
        symbol: '-', 
        time: 12,
        name: 'SUBTRACTION STRIKE',
        maxNum: 10,
        color: '#FF9800'
    },
    'multiplication': { 
        symbol: '×', 
        time: 10,
        name: 'MULTIPLICATION WEB',
        maxNum: 12,
        color: '#FF5722'
    },
    'division': { 
        symbol: '÷', 
        time: 10,
        name: 'DIVISION DASH',
        maxNum: 12,
        color: '#9C27B0'
    }
};

// ========== DOM ELEMENTS ==========
const loadingSpinner = document.getElementById('loadingSpinner');
const streakIndicator = document.getElementById('streakIndicator');
const confettiContainer = document.getElementById('confettiContainer');
const selectionPage = document.getElementById('selectionPage');
const gamePage = document.getElementById('gamePage');
const gameOverScreen = document.getElementById('gameOver');
const gameFooter = document.getElementById('gameFooter');

// ========== AUDIO ELEMENTS & CONTROLS ==========
const gameMusic = document.getElementById('gameMusic');
const musicVolumeSlider = document.getElementById('musicVolumeSlider');

// Initialize music volume control
if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener('change', (e) => {
        setMusicVolume(e.target.value);
    });
    musicVolumeSlider.addEventListener('input', (e) => {
        setMusicVolume(e.target.value);
    });
}

// Set music volume
function setMusicVolume(level) {
    if (gameMusic) {
        gameMusic.volume = level / 100;
    }
}

// Play background music
function playBackgroundMusic() {
    if (gameMusic) {
        gameMusic.currentTime = 0;
        gameMusic.play().catch(err => {
            console.log('Background music autoplay blocked or unavailable:', err);
        });
    }
}

// Stop background music
function stopBackgroundMusic() {
    if (gameMusic) {
        gameMusic.pause();
        gameMusic.currentTime = 0;
    }
}

// Pause background music
function pauseBackgroundMusic() {
    if (gameMusic) {
        gameMusic.pause();
    }
}

// Resume background music
function resumeBackgroundMusic() {
    if (gameMusic) {
        gameMusic.play().catch(err => {
            console.log('Background music resume failed:', err);
        });
    }
}

// ========== AUDIO CONTEXT FOR SOUND EFFECTS ==========
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play correct answer sound (ascending beep)
function playCorrectSound() {
    try {
        initAudio();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        // Ascending frequencies for "correct" effect
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    } catch (e) {
        console.log('Audio not available');
    }
}

// Play wrong answer sound (descending beep)
function playWrongSound() {
    try {
        initAudio();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        // Descending frequencies for "wrong" effect
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.setValueAtTime(261.63, now + 0.1); // C4
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    } catch (e) {
        console.log('Audio not available');
    }
}

// Play time up sound (buzzer)
function playTimeUpSound() {
    try {
        initAudio();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        // Buzzer effect - low frequency
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {
        console.log('Audio not available');
    }
}

// Play countdown beep
function playCountdownBeep() {
    try {
        initAudio();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
    } catch (e) {
        console.log('Audio not available');
    }
}

// Play STREAK!! sound (dramatic rising effect)
function playStreakSound() {
    try {
        initAudio();
        const now = audioContext.currentTime;
        
        // Create multiple oscillators for the "STREAK!!" effect
        for (let i = 0; i < 3; i++) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            // Staggered rising frequencies for dramatic effect
            const startFreq = 400 + (i * 150);
            const endFreq = 1200 + (i * 200);
            
            osc.frequency.setValueAtTime(startFreq, now + (i * 0.05));
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.6 + (i * 0.05));
            
            gain.gain.setValueAtTime(0.3, now + (i * 0.05));
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7 + (i * 0.05));
            
            osc.start(now + (i * 0.05));
            osc.stop(now + 0.7 + (i * 0.05));
        }
    } catch (e) {
        console.log('Audio not available');
    }
}

// Play human voice saying "STREAK!!"
function playStreakVoice() {
    try {
        const synth = window.speechSynthesis;
        
        // Cancel any previous speech
        synth.cancel();
        
        // Create utterance for "STREAK!!"
        const utterance = new SpeechSynthesisUtterance('STREAK!!!!!');
        
        // Configure voice settings for dramatic effect
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.5; // Higher pitch for excitement
        utterance.volume = 1.0; // Maximum volume
        
        // Try to use a male voice if available
        const voices = synth.getVoices();
        if (voices.length > 0) {
            // Prefer male voice if available
            const maleVoice = voices.find(v => v.name.includes('Male') || v.name.includes('man'));
            if (maleVoice) {
                utterance.voice = maleVoice;
            } else {
                utterance.voice = voices[0];
            }
        }
        
        // Speak the utterance
        synth.speak(utterance);
    } catch (e) {
        console.log('Voice synthesis not available');
    }
}

// Play double kill sound effect (when player makes 2nd mistake)
function playDoubleKillSound() {
    try {
        const audio = document.getElementById('doubleKillSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play double kill sound:', err));
        }
    } catch (e) {
        console.log('Double kill sound not available');
    }
}

// Play first blood sound effect (when player gets first correct answer)
function playFirstBloodSound() {
    try {
        const audio = document.getElementById('firstBloodSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play first blood sound:', err));
        }
    } catch (e) {
        console.log('First blood sound not available');
    }
}

// Play triple kill sound effect (when player gets third correct answer)
function playTripleKillSound() {
    try {
        const audio = document.getElementById('tripleKillSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play triple kill sound:', err));
        }
    } catch (e) {
        console.log('Triple kill sound not available');
    }
}

// Play mega kill sound effect (when player gets fourth correct answer)
function playMegaKillSound() {
    try {
        const audio = document.getElementById('megaKillSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play mega kill sound:', err));
        }
    } catch (e) {
        console.log('Mega kill sound not available');
    }
}

// Play unstoppable sound effect (when player gets fifth correct answer)
function playUnstoppableSound() {
    try {
        const audio = document.getElementById('unstoppableSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play unstoppable sound:', err));
        }
    } catch (e) {
        console.log('Unstoppable sound not available');
    }
}

// Play monster kill sound effect (when player gets sixth correct answer)
function playMonsterKillSound() {
    try {
        const audio = document.getElementById('monsterKillSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play monster kill sound:', err));
        }
    } catch (e) {
        console.log('Monster kill sound not available');
    }
}

function playGodlikeSound() {
    try {
        const audio = document.getElementById('godlikeSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play godlike sound:', err));
        }
    } catch (e) {
        console.log('Godlike sound not available');
    }
}

// Play rumble sound
function playRumbleSound() {
    try {
        const audio = document.getElementById('rumbleSound');
        if (audio) {
            audio.currentTime = 0; // Reset to start
            audio.play().catch(err => console.log('Could not play rumble sound:', err));
        }
    } catch (e) {
        console.log('Rumble sound not available');
    }
}

// ========== INITIALIZE WEB PARTICLES ===========
function initWebParticles() {
    const particlesContainer = document.getElementById('webParticles');
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'web-particle';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.width = `${Math.random() * 3 + 1}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        particle.style.backgroundColor = getRandomColor();
        particlesContainer.appendChild(particle);
    }
}

function getRandomColor() {
    const colors = ['#d10000', '#ff3333', '#ff6666', '#ff9999'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ========== SHOW LOADING ==========
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

// ========== HIDE LOADING ==========
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// ========== SHOW STREAK INDICATOR ==========
function showStreakIndicator(streak) {
    const streakText = document.getElementById('streakText');
    
    if (streak >= 3) {
        streakText.textContent = `SPIDER-STREAK: ${streak}x`;
        streakIndicator.style.display = 'flex';
        
        // Change color based on streak
        if (streak >= 5) {
            streakIndicator.style.borderColor = '#FF9800';
            streakIndicator.querySelector('.streak-icon').style.color = '#FF5722';
        }
        if (streak >= 7) {
            streakIndicator.style.borderColor = '#FF5722';
            streakIndicator.querySelector('.streak-icon').style.color = '#f44336';
        }
        
        setTimeout(() => {
            streakIndicator.style.display = 'none';
        }, 2000);
    }
}

// ========== CREATE CONFETTI ==========
function createConfetti() {
    confettiContainer.innerHTML = '';
    confettiContainer.style.display = 'block';
    
    const colors = ['#d10000', '#ff3333', '#FFD700', '#4CAF50', '#FF9800', '#9C27B0'];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = confetti.style.width;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 1}s`;
        confettiContainer.appendChild(confetti);
    }
    
    setTimeout(() => {
        confettiContainer.style.display = 'none';
    }, 5000);
}

// ========== START ENDLESS MODE ==========
function startEndlessMode() {
    showLoading();
    
    setTimeout(() => {
        // Set endless mode flag
        isEndlessMode = true;
        isSpeedRunMode = false;
        endlessLives = maxLives;
        lastGameMode = 'endless';
        
        // For endless mode, operations will be randomly selected for each question
        currentOperation = 'addition'; // Default (will be overridden in generateQuestion)
        
        // Endless mode: 10 seconds per question
        timeLeft = 10;
        
        // Hide selection page, show game page
        selectionPage.style.display = 'none';
        gamePage.style.display = 'block';
        gameOverScreen.style.display = 'none';
        gameFooter.style.display = 'block';
        
        // Show lives indicator
        const livesCard = document.getElementById('livesCard');
        if (livesCard) livesCard.style.display = 'block';
        
        // Reset game variables
        score = 0;
        currentQuestion = 1;
        correctAnswers = 0;
        wrongAnswers = 0;
        currentStreak = 0;
        bestStreak = 0;
        totalQuestions = 999; // Set to high number for endless
        
        // Update UI and start first question
        updateStats();
        updateLivesDisplay();
        updateTimerDisplay();
        generateQuestion();
        hideLoading();
        
        // Update mission progress label
        const progressLabel = document.querySelector('.progress-label span');
        if (progressLabel) {
            progressLabel.innerHTML = '<i class="fas fa-infinity"></i> Endless Survival Mode';
        }
        
        // Start countdown before showing timer
        startCountdown();
        
        // Play background music after a slight delay
        setTimeout(() => {
            playBackgroundMusic();
        }, 1500);
    }, 500);
}

// ========== START SPEED RUN MODE ==========
function startSpeedRunMode() {
    showLoading();
    
    setTimeout(() => {
        // Set speed run mode flag
        isSpeedRunMode = true;
        isEndlessMode = false;
        speedRunLives = 3;
        lastGameMode = 'speedrun';
        
        // No specific operation - will mix them
        currentOperation = 'addition'; // Default (will be overridden in generateQuestion)
        
        // Speed run: 5 seconds per question
        timeLeft = 5;
        
        // Hide selection page, show game page
        selectionPage.style.display = 'none';
        gamePage.style.display = 'block';
        gameOverScreen.style.display = 'none';
        gameFooter.style.display = 'block';
        
        // Show lives indicator
        const livesCard = document.getElementById('livesCard');
        if (livesCard) livesCard.style.display = 'block';
        
        // Reset game variables
        score = 0;
        currentQuestion = 1;
        correctAnswers = 0;
        wrongAnswers = 0;
        currentStreak = 0;
        bestStreak = 0;
        totalQuestions = 999; // Set to high number for speed run
        
        // Update UI and start first question
        updateStats();
        updateLivesDisplay();
        updateTimerDisplay();
        generateQuestion();
        hideLoading();
        
        // Update mission progress label
        const progressLabel2 = document.querySelector('.progress-label span');
        if (progressLabel2) {
            progressLabel2.innerHTML = '⚡ Speed Run Mode (5 sec per q)';
        }
        
        // Start countdown before showing timer
        startCountdown();
        
        // Play background music after a slight delay
        setTimeout(() => {
            playBackgroundMusic();
        }, 1500);
    }, 500);
}

// ========== START GAME ==========
function startGame(operation) {
    showLoading();
    
    setTimeout(() => {
        // Not endless mode for regular game
        isEndlessMode = false;
        isSpeedRunMode = false;
        lastGameMode = 'regular';
        
        // Hide lives indicator for regular game
        const livesCard = document.getElementById('livesCard');
        if (livesCard) livesCard.style.display = 'none';
        
        currentOperation = operation;
        timeLeft = operations[operation].time;
        
        // Hide selection page, show game page
        selectionPage.style.display = 'none';
        gamePage.style.display = 'block';
        gameOverScreen.style.display = 'none';
        gameFooter.style.display = 'block';
        
        // Reset game variables
        score = 0;
        currentQuestion = 1;
        correctAnswers = 0;
        wrongAnswers = 0;
        currentStreak = 0;
        bestStreak = 0;
        
        // Update UI and start first question
        updateStats();
        updateTimerDisplay();
        generateQuestion();
        hideLoading();
        
        // Update operation name in UI
        document.getElementById('operationName').textContent = operations[operation].name;
        
        // Update mission progress label
        const progressLabel = document.querySelector('.progress-label span');
        if (progressLabel) {
            progressLabel.innerHTML = '<i class="fas fa-flag"></i> Mission Progress: <strong id="currentMission">1</strong>/10';
        }
        
        // Start countdown before showing timer
        startCountdown();
        
        // Play background music after a slight delay
        setTimeout(() => {
            playBackgroundMusic();
        }, 1500);
    }, 500);
}

// ========== COUNTDOWN BEFORE GAME STARTS ==========
function startCountdown() {
    let countdown = 3;
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.style.display = 'block';
    feedbackEl.className = 'feedback-message countdown';
    
    // Play rumble sound at the start (at 3)
    playRumbleSound();
    
    // Disable buttons during countdown
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.style.pointerEvents = 'none');
    
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            feedbackEl.textContent = countdown;
            playCountdownBeep();
            countdown--;
        } else {
            clearInterval(countdownInterval);
            feedbackEl.textContent = 'GO!';
            feedbackEl.style.fontSize = '4rem';
            feedbackEl.style.fontWeight = 'bold';
            feedbackEl.style.color = '#00FF00';
            
            // Hide GO! display and enable buttons after 500ms
            setTimeout(() => {
                feedbackEl.style.display = 'none';
                feedbackEl.textContent = '';
                feedbackEl.style.fontSize = '';
                feedbackEl.style.color = '';
                
                // Enable buttons and start the actual game timer
                buttons.forEach(btn => btn.style.pointerEvents = 'auto');
                gameActive = true;
                startTimer();
            }, 500);
        }
    }, 1000);
}


// ========== GENERATE RANDOM QUESTION ==========
function generateQuestion() {
    // In endless or speed run mode, pick a random operation for each question
    let operationToUse = currentOperation;
    
    if (isEndlessMode || isSpeedRunMode) {
        const operationKeys = Object.keys(operations);
        operationToUse = operationKeys[Math.floor(Math.random() * operationKeys.length)];
    }
    
    const op = operations[operationToUse];
    if (!op) {
        console.error('Invalid operation:', operationToUse);
        return;
    }
    
    // Generate numbers based on operation
    let num1, num2, correctAnswer;
    
    switch(operationToUse) {
        case 'addition':
            num1 = Math.floor(Math.random() * op.maxNum) + 1;
            num2 = Math.floor(Math.random() * op.maxNum) + 1;
            correctAnswer = num1 + num2;
            break;
            
        case 'subtraction':
            num1 = Math.floor(Math.random() * op.maxNum) + 10;
            num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
            correctAnswer = num1 - num2;
            break;
            
        case 'multiplication':
            num1 = Math.floor(Math.random() * op.maxNum) + 1;
            num2 = Math.floor(Math.random() * op.maxNum) + 1;
            correctAnswer = num1 * num2;
            break;
            
        case 'division':
            // Ensure whole number division
            num2 = Math.floor(Math.random() * 10) + 2;
            correctAnswer = Math.floor(Math.random() * 10) + 1;
            num1 = num2 * correctAnswer;
            break;
        default:
            return;
    }
    
    // Update question display
    const num1El = document.getElementById('num1');
    const operatorEl = document.getElementById('operator');
    const num2El = document.getElementById('num2');
    const operationEl = document.getElementById('operation');
    const currentQEl = document.getElementById('currentQuestion');
    const currentMissionEl = document.getElementById('currentMission');
    
    if (num1El) num1El.textContent = num1;
    if (operatorEl) operatorEl.textContent = op.symbol;
    if (num2El) num2El.textContent = num2;
    if (operationEl) operationEl.textContent = op.name;
    if (currentQEl) currentQEl.textContent = currentQuestion;
    if (currentMissionEl) currentMissionEl.textContent = currentQuestion;
    
    // Update progress bar
    const progress = ((currentQuestion - 1) / totalQuestions) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    // Generate 4 choices (1 correct + 3 wrong)
    const choices = [correctAnswer];
    
    // Add 3 wrong answers
    while(choices.length < 4) {
        let wrongAnswer;
        
        // Generate wrong answer
        if(currentOperation === 'division') {
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) - 2;
            if(wrongAnswer < 1) wrongAnswer = 1;
        } else {
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5;
        }
        
        // Ensure it's different, positive, and not already in choices
        if(wrongAnswer !== correctAnswer && wrongAnswer > 0 && !choices.includes(wrongAnswer)) {
            choices.push(wrongAnswer);
        }
    }
    
    // Shuffle choices
    shuffleArray(choices);
    
    // Display choices - clear old buttons completely
    const choicesGrid = document.getElementById('choicesGrid');
    if (!choicesGrid) {
        console.error('choicesGrid element not found');
        return;
    }
    
    // Clear all existing buttons
    while (choicesGrid.firstChild) {
        choicesGrid.removeChild(choicesGrid.firstChild);
    }
    
    // Create new buttons with proper event handlers
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.type = 'button';
        button.style.pointerEvents = 'auto'; // Ensure clickable
        
        // Use a function wrapper to preserve correctAnswer in closure
        const handleClick = function() {
            if (gameActive) {
                checkAnswer(choice, correctAnswer);
            }
        };
        
        // Add event listener instead of onclick
        button.addEventListener('click', handleClick, false);
        
        // Animation
        button.style.animationDelay = `${index * 0.1}s`;
        button.style.animation = 'none';
        
        choicesGrid.appendChild(button);
        
        // Add animation after adding to DOM
        setTimeout(() => {
            button.style.animation = 'fadeIn 0.3s ease-out';
        }, 10);
    });
    
    // Set timer
    timeLeft = operations[currentOperation].time;
    updateTimerDisplay();
    
    // Reset game state
    gameActive = true;
    const feedback = document.getElementById('feedback');
    if (feedback) feedback.style.display = 'none';
}

// ========== SHUFFLE ARRAY ==========
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ========== CHECK ANSWER ==========
function checkAnswer(selected, correct) {
    if (!gameActive) return;
    
    clearInterval(timer);
    gameActive = false;
    
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.choice-btn');
    
    // Calculate time bonus
    const timeBonus = timeBonusEnabled ? Math.floor(timeLeft / 3) : 0;
    
    // Disable all buttons
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        
        // Highlight correct answer
        if(parseInt(btn.textContent) === correct) {
            btn.style.background = 'linear-gradient(45deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1))';
            btn.style.borderColor = '#4CAF50';
            btn.style.color = '#4CAF50';
            btn.style.transform = 'scale(1.05)';
        }
        
        // Highlight wrong selected answer
        if(parseInt(btn.textContent) === selected && selected !== correct) {
            btn.style.background = 'linear-gradient(45deg, rgba(244, 67, 54, 0.3), rgba(244, 67, 54, 0.1))';
            btn.style.borderColor = '#f44336';
            btn.style.color = '#f44336';
        }
    });
    
    if(selected === correct) {
        // Correct answer
        playCorrectSound(); // Play correct sound
        let points = 10 + timeBonus;
        let streakBonus = 0;
        
        // Streak bonus
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        
        // Play first blood sound on first correct answer
        if (currentStreak === 1) {
            playFirstBloodSound(); // Play "First Blood" sound on 1st correct answer
        }
        
        if (streakBonusEnabled && currentStreak >= 3) {
            streakBonus = Math.floor(currentStreak / 3) * 5;
            points += streakBonus;
            showStreakIndicator(currentStreak);
        }
        
        // Play double kill sound if this is the 2nd correct answer in a row
        if (currentStreak === 2) {
            playDoubleKillSound(); // Play "Double Kill" sound on 2nd correct answer
        }
        
        // Play triple kill sound if this is the 3rd correct answer in a row
        if (currentStreak === 3) {
            playTripleKillSound(); // Play "Triple Kill" sound on 3rd correct answer
        }
        
        // Play mega kill sound if this is the 4th correct answer in a row
        if (currentStreak === 4) {
            playMegaKillSound(); // Play "Mega Kill" sound on 4th correct answer
        }
        
        // Play unstoppable sound if this is the 5th correct answer in a row
        if (currentStreak === 5) {
            playUnstoppableSound(); // Play "Unstoppable" sound on 5th correct answer
        }
        
        // Play monster kill sound if this is the 6th correct answer in a row
        if (currentStreak === 6) {
            playMonsterKillSound(); // Play "Monster Kill" sound on 6th correct answer
        }
        
        // Play godlike sound if this is the 7th correct answer in a row
        if (currentStreak === 7) {
            playGodlikeSound(); // Play "Godlike" sound on 7th correct answer
        }
        
        score += points;
        correctAnswers++;
        
        // Show feedback with bonuses
        let feedbackText = `✓ Spider-Sense Tingling! +10 points`;
        if (timeBonus > 0) feedbackText += ` +${timeBonus} time bonus`;
        if (streakBonus > 0) feedbackText += ` +${streakBonus} streak bonus`;
        feedbackText += ` (Total: +${points})`;
        
        feedback.textContent = feedbackText;
        feedback.className = 'feedback-message correct';
        
        // Special effect for high streak
        if (currentStreak >= 5) {
            buttons.forEach(btn => {
                if(parseInt(btn.textContent) === correct) {
                    btn.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
                }
            });
        }
    } else {
        // Wrong answer
        playWrongSound(); // Play wrong sound
        wrongAnswers++;
        currentStreak = 0;
        
        feedback.textContent = `✗ Web Snapped! Correct answer: ${correct}`;
        feedback.className = 'feedback-message wrong';
        
        // Endless or Speed Run mode: lose a life
        if (isEndlessMode || isSpeedRunMode) {
            const currentLives = isEndlessMode ? endlessLives : speedRunLives;
            const newLives = currentLives - 1;
            
            if (isEndlessMode) {
                endlessLives = newLives;
            } else {
                speedRunLives = newLives;
            }
            
            updateLivesDisplay();
            
            if (newLives <= 0) {
                // Game over - no more lives
                setTimeout(() => {
                    if (isEndlessMode) {
                        endEndlessGame();
                    } else {
                        endSpeedRunGame();
                    }
                }, 1500);
                return;
            }
        }
    }
    
    feedback.style.display = 'block';
    updateStats();
}

// ========== NEXT QUESTION ==========
function nextQuestion() {
    // Clear any existing timers
    clearInterval(timer);
    
    // For endless or speed run mode, always generate next question
    if (isEndlessMode || isSpeedRunMode) {
        // Check if user clicked Next without answering (gameActive is still true)
        if (gameActive) {
            // No answer was given - lose a life
            if (isEndlessMode) {
                endlessLives--;
            } else {
                speedRunLives--;
            }
            
            updateLivesDisplay();
            wrongAnswers++;
            currentStreak = 0;
            updateStats();
            
            const currentLives = isEndlessMode ? endlessLives : speedRunLives;
            if (currentLives <= 0) {
                // Game over - no more lives
                setTimeout(() => {
                    if (isEndlessMode) {
                        endEndlessGame();
                    } else {
                        endSpeedRunGame();
                    }
                }, 1000);
                return;
            }
        }
        
        currentQuestion++;
        
        // Hide feedback and reset game state
        const feedback = document.getElementById('feedback');
        if (feedback) feedback.style.display = 'none';
        
        // Generate new question
        generateQuestion();
        
        // Reset time for each new question
        if (isSpeedRunMode) {
            timeLeft = 5; // Speed run: 5 seconds per question
        } else if (isEndlessMode) {
            timeLeft = 10; // Endless mode: 10 seconds per question
        }
        updateTimerDisplay();
        
        // Make sure gameActive is true and start timer
        gameActive = true;
        setTimeout(() => {
            startTimer();
        }, 50);
        return;
    }
    
    // For regular mode, check if game is over
    if(currentQuestion >= totalQuestions) {
        endGame();
        return;
    }
    
    currentQuestion++;
    
    // Hide feedback and reset game state
    const feedback = document.getElementById('feedback');
    if (feedback) feedback.style.display = 'none';
    
    // Generate new question
    generateQuestion();
    
    // Make sure gameActive is true and start timer
    gameActive = true;
    setTimeout(() => {
        startTimer();
    }, 50);
}

// ========== TIMER FUNCTIONS ==========
function startTimer() {
    clearInterval(timer);
    
    timer = setInterval(() => {
        if(!gameActive) return;
        
        timeLeft--;
        updateTimerDisplay();
        
        if(timeLeft <= 0) {
            clearInterval(timer);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = timeLeft;
    document.getElementById('timeLeft').textContent = timeLeft;
    
    // Change color when time is running out
    const timerElement = document.getElementById('questionTimer');
    if (timeLeft <= 10) {
        timerElement.style.background = 'linear-gradient(45deg, #ff4757, #ff3838)';
        timerElement.style.animation = 'timerPulse 0.5s infinite';
    } else if (timeLeft <= 20) {
        timerElement.style.background = 'linear-gradient(45deg, #ff9800, #ff5722)';
    }
}

function timeUp() {
    if (!gameActive) return;
    
    playTimeUpSound(); // Play time up sound
    gameActive = false;
    wrongAnswers++;
    currentStreak = 0;
    
    const feedback = document.getElementById('feedback');
    feedback.textContent = "🕸️ Time's up! The web broke!";
    feedback.className = 'feedback-message wrong';
    feedback.style.display = 'block';
    
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.style.pointerEvents = 'none');
    
    updateStats();
    
    // Endless or Speed Run mode: lose a life when time runs out
    if (isEndlessMode || isSpeedRunMode) {
        if (isEndlessMode) {
            endlessLives--;
        } else {
            speedRunLives--;
        }
        
        updateLivesDisplay();
        
        const currentLives = isEndlessMode ? endlessLives : speedRunLives;
        if (currentLives <= 0) {
            // Game over - no more lives
            setTimeout(() => {
                if (isEndlessMode) {
                    endEndlessGame();
                } else {
                    endSpeedRunGame();
                }
            }, 1500);
            return;
        }
    }
}

// ========== UPDATE STATS DISPLAY ==========
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('correctCount').textContent = correctAnswers;
    document.getElementById('wrongCount').textContent = wrongAnswers;
    document.getElementById('timeLeft').textContent = timeLeft;
}

// ========== UPDATE LIVES DISPLAY ==========
function updateLivesDisplay() {
    const livesDisplay = document.getElementById('livesDisplay');
    if (livesDisplay) {
        const currentLives = isEndlessMode ? endlessLives : speedRunLives;
        livesDisplay.textContent = currentLives;
        
        // Add pulse effect when lives decrease
        livesDisplay.style.animation = 'none';
        setTimeout(() => {
            livesDisplay.style.animation = 'livePulse 0.6s ease-out';
        }, 10);
    }
}

// ========== END ENDLESS MODE GAME ==========
function endEndlessGame() {
    cleanupGamePage();
    gameActive = false;
    clearInterval(timer);
    
    // Stop background music
    stopBackgroundMusic();
    
    // Hide game page, show game over
    gamePage.style.display = 'none';
    gameOverScreen.style.display = 'block';
    gameFooter.style.display = 'none';
    
    // Update results for endless mode
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = currentQuestion - 1;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('wrongAnswers').textContent = wrongAnswers;
    document.getElementById('bestStreak').textContent = bestStreak + 'x';
    
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (currentQuestion - 1)) * 100) : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    // Update progress bar to 100%
    document.getElementById('progressBar').style.width = '100%';
    
    // Special effects for high scores
    if (score >= 500) {
        createConfetti();
        document.getElementById('finalScore').style.color = '#FFD700';
        document.getElementById('finalScore').style.textShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    } else if (score >= 300) {
        document.getElementById('finalScore').style.color = '#4CAF50';
    }
    
    // Change game over title for endless mode
    const gameOverTitle = document.querySelector('.game-over-content h2');
    if (gameOverTitle) {
        gameOverTitle.textContent = '💀 ENDLESS SURVIVAL OVER!';
    }
    
    // Save to leaderboard and profile
    const username = localStorage.getItem('currentUser') || 'Spider-Hero';
    const endlessScoreName = `${username} (Endless)`;
    saveScoreToLeaderboard(endlessScoreName, score, `Endless-${currentOperation}`);
    saveGameToProfile(score, `Endless-${currentOperation}`);
    
    // Save high score to localStorage
    saveHighScore(score, `Endless-${currentOperation}`);
}

// ========== END SPEED RUN MODE GAME ==========
function endSpeedRunGame() {
    cleanupGamePage();
    gameActive = false;
    clearInterval(timer);
    
    // Stop background music
    stopBackgroundMusic();
    
    // Hide game page, show game over
    gamePage.style.display = 'none';
    gameOverScreen.style.display = 'block';
    gameFooter.style.display = 'none';
    
    // Update results for speed run mode
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = currentQuestion - 1;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('wrongAnswers').textContent = wrongAnswers;
    document.getElementById('bestStreak').textContent = bestStreak + 'x';
    
    const accuracy = correctAnswers > 0 ? Math.round((correctAnswers / (currentQuestion - 1)) * 100) : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    // Update progress bar to 100%
    document.getElementById('progressBar').style.width = '100%';
    
    // Special effects for high scores
    if (score >= 400) {
        createConfetti();
        document.getElementById('finalScore').style.color = '#FFD700';
        document.getElementById('finalScore').style.textShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    } else if (score >= 200) {
        document.getElementById('finalScore').style.color = '#FF9800';
    }
    
    // Change game over title for speed run mode
    const gameOverTitle = document.querySelector('.game-over-content h2');
    if (gameOverTitle) {
        gameOverTitle.textContent = '⚡ SPEED RUN COMPLETE!';
    }
    
    // Save to leaderboard and profile
    const username = localStorage.getItem('currentUser') || 'Spider-Hero';
    const speedRunScoreName = `${username} (Speed Run)`;
    saveScoreToLeaderboard(speedRunScoreName, score, `SpeedRun-Mixed`);
    saveGameToProfile(score, `SpeedRun-Mixed`);
    
    // Save high score to localStorage
    saveHighScore(score, `SpeedRun-Mixed`);
}

// ========== SAVE GAME RESULTS ==========

// Save score to leaderboard
function saveScoreToLeaderboard(playerName, score, operation) {
    let gameScores = localStorage.getItem('gameScores');
    let scores = gameScores ? JSON.parse(gameScores) : [];
    
    const newScore = {
        player: playerName,
        score: score,
        operation: operation,
        date: new Date().toISOString()
    };
    
    scores.push(newScore);
    localStorage.setItem('gameScores', JSON.stringify(scores));
}

// Save game to player profile
function saveGameToProfile(score, operation) {
    const username = localStorage.getItem('currentUser') || 'Guest';
    const profileKey = `profile_${username}`;
    
    // Get or create profile
    let profile = {
        username: username,
        totalGames: 0,
        bestScore: 0,
        totalScore: 0,
        games: []
    };
    
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
        profile = JSON.parse(savedProfile);
    }
    
    // Add game to history
    const newGame = {
        score: score,
        operation: operation,
        date: new Date().toISOString()
    };
    
    profile.games = profile.games || [];
    profile.games.push(newGame);
    profile.totalGames = (profile.totalGames || 0) + 1;
    profile.totalScore = (profile.totalScore || 0) + score;
    profile.bestScore = Math.max(profile.bestScore || 0, score);
    profile.username = username;
    
    // Save to localStorage
    localStorage.setItem(profileKey, JSON.stringify(profile));
}

// ========== END GAME ==========
function endGame() {
    cleanupGamePage();
    gameActive = false;
    clearInterval(timer);
    
    // Stop background music
    stopBackgroundMusic();
    
    // Hide game page, show game over
    gamePage.style.display = 'none';
    gameOverScreen.style.display = 'block';
    gameFooter.style.display = 'none';
    
    // Update results
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('wrongAnswers').textContent = wrongAnswers;
    document.getElementById('bestStreak').textContent = bestStreak + 'x';
    
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    
    // Update progress bar to 100%
    document.getElementById('progressBar').style.width = '100%';
    
    // Special effects for high scores
    if (score === 100) {
        createConfetti();
        document.getElementById('finalScore').style.color = '#FFD700';
        document.getElementById('finalScore').style.textShadow = '0 0 20px rgba(255, 215, 0, 0.5)';
    } else if (score >= 80) {
        document.getElementById('finalScore').style.color = '#4CAF50';
    }
    
    // Save to leaderboard and profile
    const username = localStorage.getItem('currentUser') || 'Spider-Hero';
    saveScoreToLeaderboard(username, score, currentOperation);
    saveGameToProfile(score, currentOperation);
    
    // Save high score to localStorage
    saveHighScore(score, currentOperation);
}

// ========== SAVE HIGH SCORE ==========
function saveHighScore(score, operation) {
    const highScores = JSON.parse(localStorage.getItem('spiderMathHighScores')) || {};
    
    if (!highScores[operation] || score > highScores[operation]) {
        highScores[operation] = score;
        localStorage.setItem('spiderMathHighScores', JSON.stringify(highScores));
        
        // Show notification for new high score
        if (score > 0) {
            setTimeout(() => {
                alert(`🎉 New High Score for ${operations[operation].name}: ${score} points!`);
            }, 500);
        }
    }
}

// ========== PLAY AGAIN ==========
function playAgain() {
    // Restart the same mode that was last played
    if (lastGameMode === 'endless') {
        startEndlessMode();
    } else if (lastGameMode === 'speedrun') {
        startSpeedRunMode();
    } else {
        // Default to regular game with current operation
        startGame(currentOperation);
    }
}

// ========== CLEANUP GAME PAGE LISTENERS ==========
function cleanupGamePage() {
    // Clear all timers
    clearInterval(timer);
    
    // Remove all event listeners from choice buttons
    const choicesGrid = document.getElementById('choicesGrid');
    if (choicesGrid) {
        // Clone and replace to remove all listeners
        const newGrid = choicesGrid.cloneNode(false);
        choicesGrid.parentNode.replaceChild(newGrid, choicesGrid);
    }
    
    // Cancel any pending animations or speech
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    // Reset game state
    gameActive = false;
}

// ========== GO BACK TO SELECTION ==========
function goBackToSelection() {
    if(confirm("Abort mission? Your progress will be lost.")) {
        cleanupGamePage(); // Cleanup listeners before switching
        gamePage.style.display = 'none';
        selectionPage.style.display = 'block';
        gameFooter.style.display = 'none';
        clearInterval(timer);
    }
}

// ========== GO TO SELECTION FROM GAME OVER ==========
function goToSelection() {
    cleanupGamePage(); // Cleanup listeners before switching
    gameOverScreen.style.display = 'none';
    selectionPage.style.display = 'block';
    gameFooter.style.display = 'none';
}

// ========== MOBILE MENU TOGGLE ==========
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navContainer = document.querySelector('.nav-container');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navContainer.classList.toggle('mobile-active');
            menuToggle.innerHTML = navContainer.classList.contains('mobile-active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
}

// ========== INITIALIZE GAME ==========
window.onload = function() {
    initWebParticles();
    setupMobileMenu();
    
    console.log("🕷️ Spider-Math Challenge loaded successfully!");
    console.log("✨ Features: Animated web particles, progress bar, streak system, time bonuses, confetti effects!");
    
    // Check for saved high scores
    const highScores = JSON.parse(localStorage.getItem('spiderMathHighScores')) || {};
    console.log("🏆 High Scores:", highScores);
};