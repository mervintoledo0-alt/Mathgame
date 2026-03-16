// ========== USER PROFILE FUNCTIONALITY ==========

let userProfile = {
    username: 'Guest',
    totalGames: 0,
    bestScore: 0,
    totalScore: 0,
    games: []
};

let isUserLoggedIn = false;

// Load user profile on page load
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    loadUserProfile();
    displayProfile();
});

// Check if user is logged in
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    isUserLoggedIn = currentUser && currentUser !== '' && !currentUser.includes('Guest_Spider_');
    
    if (!isUserLoggedIn) {
        // Show login prompt
        document.getElementById('gameLink').style.display = 'none';
        document.getElementById('leaderLink').style.display = 'none';
        document.getElementById('logoutLink').style.display = 'none';
    } else {
        document.getElementById('gameLink').style.display = 'block';
        document.getElementById('leaderLink').style.display = 'block';
        document.getElementById('logoutLink').style.display = 'block';
    }
}

// Handle logout from profile
function handleProfileLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
        window.location.href = 'index.html';
    }
}

// Load user profile from localStorage
function loadUserProfile() {
    const username = localStorage.getItem('currentUser') || 'Guest';
    const profileKey = `profile_${username}`;
    const savedProfile = localStorage.getItem(profileKey);
    
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    } else {
        userProfile.username = username;
        userProfile.totalGames = 0;
        userProfile.bestScore = 0;
        userProfile.totalScore = 0;
        userProfile.games = [];
    }
}

// Display user profile
function displayProfile() {
    // Update profile header
    const username = userProfile.username;
    const initial = username.charAt(0).toUpperCase();
    
    document.getElementById('profileName').textContent = username;
    document.getElementById('profileStatus').textContent = `${userProfile.totalGames} games played`;
    document.getElementById('profileAvatar').textContent = initial;
    
    // Update stats
    const bestScore = userProfile.bestScore || 0;
    const averageScore = userProfile.totalGames > 0 ? Math.floor(userProfile.totalScore / userProfile.totalGames) : 0;
    const winRate = userProfile.totalGames > 0 ? calculateWinRate() : 0;
    
    document.getElementById('totalGames').textContent = userProfile.totalGames;
    document.getElementById('bestScore').textContent = bestScore.toLocaleString();
    document.getElementById('averageScore').textContent = averageScore.toLocaleString();
    document.getElementById('winRate').textContent = winRate + '%';
    
    // Display game history
    displayGameHistory();
}

// Calculate win rate (games where score > average)
function calculateWinRate() {
    if (userProfile.totalGames === 0) return 0;
    
    const average = userProfile.totalScore / userProfile.totalGames;
    const wins = userProfile.games.filter(game => game.score >= average).length;
    
    return Math.floor((wins / userProfile.totalGames) * 100);
}

// Display game history
function displayGameHistory() {
    const historyList = document.getElementById('historyList');
    
    if (userProfile.games.length === 0) {
        historyList.innerHTML = `
            <div class="no-history">
                <i class="fas fa-inbox" style="font-size: 2rem; color: #d10000; margin-bottom: 10px; display: block;"></i>
                <p>No games played yet. Go play and start building your history!</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = '';
    
    // Show last 10 games
    const recentGames = userProfile.games.slice(-10).reverse();
    
    recentGames.forEach((game, index) => {
        const dateObj = new Date(game.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const isBest = game.score === userProfile.bestScore ? '🏆 ' : '';
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-info">
                <div class="history-game">
                    ${getOperationEmoji(game.operation)} ${game.operation.toUpperCase()}
                </div>
                <div class="history-meta">${formattedDate}</div>
            </div>
            <div class="history-score">${isBest}${game.score.toLocaleString()}</div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// Get emoji for operation
function getOperationEmoji(operation) {
    const emojis = {
        'addition': '➕',
        'subtraction': '➖',
        'multiplication': '✖️',
        'division': '➗'
    };
    return emojis[operation] || '🎮';
}

// Save game to profile (called from game page)
function saveGameToProfile(score, operation) {
    const username = localStorage.getItem('currentUser') || 'Guest';
    const profileKey = `profile_${username}`;
    
    // Get or create profile
    let profile = userProfile;
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
    
    console.log('Game saved to profile:', newGame);
}

// Get user profile (for display on other pages)
function getUserProfile(username) {
    const profileKey = `profile_${username}`;
    const savedProfile = localStorage.getItem(profileKey);
    
    if (savedProfile) {
        return JSON.parse(savedProfile);
    }
    
    return {
        username: username,
        totalGames: 0,
        bestScore: 0,
        games: []
    };
}
