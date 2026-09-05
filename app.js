// ==========================================
// VIEW MANAGER INTERFACE
// ==========================================
function switchView(viewId, title) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    document.getElementById('mainTitle').innerText = title;
    document.getElementById('backBtn').style.display = 'block';

    if (viewId === 'starView') {
        startStarGame();
    }
}

function showHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('homeView').classList.add('active');
    document.getElementById('mainTitle').innerText = 'Cozy Arcade';
    document.getElementById('backBtn').style.display = 'none';
    stopStarGame();
}

// ==========================================
// 1. SHIBA DOG CAFE SIMULATION
// ==========================================
let cafeMoney = 0;
let cafeCustomers = 0;
const items = ['☕', '🍩', '🍵'];
let currentOrder = '☕';

function serveOrder(item) {
    if (item === currentOrder) {
        cafeMoney += 5;
        cafeCustomers += 1;
        document.getElementById('cafeMoney').innerText = cafeMoney;
        document.getElementById('cafeCustomers').innerText = cafeCustomers;
        document.getElementById('shibaPet').innerText = '🐶✨';
        
        currentOrder = items[Math.floor(Math.random() * items.length)];
        document.getElementById('cafeText').innerText = `Yum! Next customer wants an item: ${currentOrder}`;
        
        setTimeout(() => { document.getElementById('shibaPet').innerText = '🐕'; }, 600);
    } else {
        document.getElementById('cafeText').innerText = `Oops! They wanted ${currentOrder}. Try again!`;
    }
}

// ==========================================
// 2. SCRAPBOOK DESIGN INTERACTION
// ==========================================
function addSticker(emoji) {
    const canvas = document.getElementById('scrapbookCanvas');
    const sticker = document.createElement('div');
    sticker.className = 'sticker';
    sticker.innerText = emoji;
    sticker.style.left = '50px';
    sticker.style.top = '50px';
    
    let isDragging = false;
    
    // Mouse Event Listeners
    sticker.addEventListener('mousedown', () => { isDragging = true; });
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = canvas.getBoundingClientRect();
            let x = e.clientX - rect.left - 20;
            let y = e.clientY - rect.top - 20;
            x = Math.max(0, Math.min(x, rect.width - 40));
            y = Math.max(0, Math.min(y, rect.height - 40));
            sticker.style.left = x + 'px';
            sticker.style.top = y + 'px';
        }
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch Event Listeners (Mobile compatibility)
    sticker.addEventListener('touchstart', () => { isDragging = true; });
    window.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches && e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left - 20;
            let y = e.touches[0].clientY - rect.top - 20;
            x = Math.max(0, Math.min(x, rect.width - 40));
            y = Math.max(0, Math.min(y, rect.height - 40));
            sticker.style.left = x + 'px';
            sticker.style.top = y + 'px';
        }
    });
    window.addEventListener('touchend', () => { isDragging = false; });

    canvas.appendChild(sticker);
}

function clearScrapbook() {
    document.getElementById('scrapbookCanvas').innerHTML = '';
}

// ==========================================
// 3. COZY GARDENING ENGINE
// ==========================================
const plotStates = { 1: 0, 2: 0, 3: 0 };
const stages = ['🟤', '🌱', '🌿', '🌸'];

function tendPlot(id) {
    plotStates[id] = (plotStates[id] + 1) % stages.length;
    document.getElementById(`plot${id}`).innerText = stages[plotStates[id]];
    
    if (stages[plotStates[id]] === '🌸') {
        document.getElementById('gardenStatus').innerText = "Beautiful! A flower bloomed!";
    } else if (stages[plotStates[id]] === '🟤') {
        document.getElementById('gardenStatus').innerText = "Harvested! Ready to plant again.";
    } else {
        document.getElementById('gardenStatus').innerText = "Watered! It's growing.";
    }
}

// ==========================================
// 4. TAMAGOTCHI PET CONTROLLER
// ==========================================
let hunger = 80;
let happiness = 70;

function updatePetUI() {
    const hungerBar = document.getElementById('hungerBar');
    const happyBar = document.getElementById('happyBar');
    const petEmoji = document.getElementById('petEmoji');
    
    if(hungerBar) hungerBar.style.width = hunger + '%';
    if(happyBar) happyBar.style.width = happiness + '%';
    
    if (petEmoji) {
        if (hunger < 30 || happiness < 30) {
            petEmoji.innerText = '🥺';
        } else {
            petEmoji.innerText = '🐰';
        }
    }
}

function feedPet() {
    hunger = Math.min(100, hunger + 15);
    updatePetUI();
}

function playPet() {
    happiness = Math.min(100, happiness + 15);
    updatePetUI();
}

// Decay pet stats every 3 seconds while viewing game
setInterval(() => {
    const petView = document.getElementById('petView');
    if (petView && petView.classList.contains('active')) {
        hunger = Math.max(0, hunger - 4);
        happiness = Math.max(0, happiness - 3);
        updatePetUI();
    }
}, 3000);

// Set default rendering states on initialization
updatePetUI();

// ==========================================
// 5. STAR CATCHER SYSTEM ARCHITECTURE
// ==========================================
const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let gameInterval;
let score = 0;
let playerX = 200;
let starX = Math.random() * 380 + 10;
let starY = 0;
let starSpeed = 3;

function startStarGame() {
    if (!canvas) return;
    score = 0;
    starY = 0;
    starSpeed = 3;
    document.getElementById('starScore').innerText = score;
    clearInterval(gameInterval);
    gameInterval = setInterval(updateStarGame, 20);
}

function stopStarGame() {
    clearInterval(gameInterval);
}

if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        playerX = e.clientX - rect.left;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            playerX = e.touches[0].clientX - rect.left;
        }
    });
}

function updateStarGame() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Basket
    ctx.fillStyle = '#ffb6c1';
    ctx.beginPath();
    if(ctx.roundRect) {
        ctx.roundRect(playerX - 25, 230, 50, 15, 5);
    } else {
        ctx.rect(playerX - 25, 230, 50, 15);
    }
    ctx.fill();
    
    // Falling Star setup
    starY += starSpeed;
    ctx.fillStyle = '#fef1d2';
    ctx.font = '24px sans-serif';
    ctx.fillText('⭐', starX - 12, starY);

    // Score Collisions
    if (starY >= 220 && starY <= 245 && Math.abs(starX - playerX) < 35) {
        score++;
        document.getElementById('starScore').innerText = score;
        starY = 0;
        starX = Math.random() * 370 + 15;
        starSpeed += 0.3;
    }

    // Canvas Limits check
    if (starY > canvas.height) {
        starY = 0;
        starX = Math.random() * 370 + 15;
    }
}
