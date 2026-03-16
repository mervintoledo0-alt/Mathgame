// ========== LEADERBOARD FUNCTIONALITY ==========

let currentFilter = 'all';
let leaderboardData = [];
let isUserLoggedIn = false;

// Load leaderboard on page load
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    loadLeaderboard();
    setupFilterButtons();
});

// Check if user is logged in
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    isUserLoggedIn = currentUser && currentUser !== '' && !currentUser.includes('Guest_Spider_');
    
    // Update nav links based on login status
    document.getElementById('gameLink').style.display = isUserLoggedIn ? 'block' : 'none';
    document.getElementById('profileLink').style.display = isUserLoggedIn ? 'block' : 'none';
    document.getElementById('logoutLink').style.display = isUserLoggedIn ? 'block' : 'none';
    
    // Show "Back to Game" button only if logged in
    if (document.getElementById('backToGameBtn')) {
        document.getElementById('backToGameBtn').style.display = isUserLoggedIn ? 'block' : 'none';
    }
}

// Handle logout from leaderboard
function handleLeaderboardLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
        window.location.href = 'index.html';
    }
}

// Setup filter button listeners
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            displayLeaderboard();
        });
    });
}

// Load game scores from localStorage
function loadLeaderboard() {
    const scores = localStorage.getItem('gameScores');
    
    if (scores) {
        leaderboardData = JSON.parse(scores);
        // Sort by score descending
        leaderboardData.sort((a, b) => b.score - a.score);
    }
    
    displayLeaderboard();
}

// Display leaderboard with filter
function displayLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    const noData = document.getElementById('noData');
    tbody.innerHTML = '';
    
    // Filter data based on current filter
    let filteredData = leaderboardData;
    if (currentFilter !== 'all') {
        filteredData = leaderboardData.filter(score => score.operation === currentFilter);
    }
    
    // Get top 10
    const topScores = filteredData.slice(0, 10);
    
    if (topScores.length === 0) {
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    topScores.forEach((score, index) => {
        const rank = index + 1;
        const row = document.createElement('tr');
        
        // Add class based on rank
        if (rank === 1) row.classList.add('top-1');
        else if (rank === 2) row.classList.add('top-2');
        else if (rank === 3) row.classList.add('top-3');
        
        const badgeClass = `rank-${rank <= 3 ? rank : ''}`;
        const badge = rank <= 3 ? `<div class="rank-badge ${badgeClass}">${getMedalEmoji(rank)}</div>` : '';
        
        const dateObj = new Date(score.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>
                <span class="rank">${badge}${rank}</span>
            </td>
            <td>
                <span class="player-name">👤 ${score.player}</span>
            </td>
            <td>
                <span class="score">⭐ ${score.score.toLocaleString()}</span>
            </td>
            <td>
                <span class="operation-badge">${getOperationSymbol(score.operation)} ${score.operation}</span>
            </td>
            <td>${formattedDate}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get medal emoji for top 3
function getMedalEmoji(rank) {
    switch(rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '';
    }
}

// Get operation symbol
function getOperationSymbol(operation) {
    const symbols = {
        'addition': '+',
        'subtraction': '−',
        'multiplication': '×',
        'division': '÷'
    };
    return symbols[operation] || operation;
}

// Save score to leaderboard (called from game page)
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
    
    console.log('Score saved to leaderboard:', newScore);
}
