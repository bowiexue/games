// ==========================================
// CORE HUB CONTROLLER
// ==========================================
function switchView(viewId, title) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    document.getElementById('mainTitle').innerText = title;
    document.getElementById('backBtn').style.display = 'block';

    // Launch or reset engines
    if (viewId === 'cafeView') initCafeGame();
    if (viewId === 'starView') startStarGame();
    if (viewId === 'scrapbookView') initScrapbookDraw();
}

function showHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('homeView').classList.add('active');
    document.getElementById('mainTitle').innerText = 'PIXEL ARCADE';
    document.getElementById('backBtn').style.display = 'none';
    
    stopStarGame();
    stopCafeGame();
}

// ==========================================
// 1. OPEN-WORLD SHIBA RESTAURANT ENGINE
// ==========================================
let cafeCanvas, cafeCtx, cafeLoop;
let shiba = { x: 80, y: 160, size: 24, targetSeat: null, itemCarried: null };
let orders = [
    { x: 300, y: 100, status: 'WAITING', item: '☕', timer: 300 },
    { x: 300, y: 240, status: 'WAITING', item: '🍩', timer: 400 }
];
let cafeCash = 0;

function initCafeGame() {
    cafeCanvas = document.getElementById('cafeCanvas');
    if (!cafeCanvas) return;
    cafeCtx = cafeCanvas.getContext('2d');
    shiba.x = 80; shiba.y = 160; shiba.itemCarried = null;
    clearInterval(cafeLoop);
    cafeLoop = setInterval(updateCafe, 100);
}
function stopCafeGame() { clearInterval(cafeLoop); }

window.addEventListener('keydown', (e) => {
    const view = document.getElementById('cafeView');
    if (!view || !view.classList.contains('active')) return;
    if (e.key.toLowerCase() === 'w') moveShiba(0, -20);
    if (e.key.toLowerCase() === 's') moveShiba(0, 20);
    if (e.key.toLowerCase() === 'a') moveShiba(-20, 0);
    if (e.key.toLowerCase() === 'd') moveShiba(20, 0);
});

function moveShiba(dx, dy) {
    if (!cafeCanvas) return;
    shiba.x = Math.max(20, Math.min(cafeCanvas.width - 40, shiba.x + dx));
    shiba.y = Math.max(40, Math.min(cafeCanvas.height - 40, shiba.y + dy));

    // Kitchen Interaction Zone (Left side counter)
    if (shiba.x < 120 && shiba.y < 120) shiba.itemCarried = '☕';
    if (shiba.x < 120 && shiba.y > 200) shiba.itemCarried = '🍩';

    // Table delivery checker
    orders.forEach(order => {
        let dist = Math.hypot((shiba.x - order.x), (shiba.y - order.y));
        if (dist < 40 && order.status === 'WAITING' && shiba.itemCarried === order.item) {
            order.status = 'SERVED';
            cafeCash += 15;
            document.getElementById('cafeCash').innerText = cafeCash;
            shiba.itemCarried = null;
            setTimeout(() => { resetTable(order); }, 3000);
        }
    });
}

function resetTable(order) {
    order.status = 'WAITING';
    order.item = Math.random() > 0.5 ? '☕' : '🍩';
}

function updateCafe() {
    if (!cafeCtx || !cafeCanvas) return;
    cafeCtx.clearRect(0, 0, cafeCanvas.width, cafeCanvas.height);
    
    // Draw Kitchen counters
    cafeCtx.fillStyle = '#4e4e63';
    cafeCtx.fillRect(0, 0, 100, 100);
    cafeCtx.fillRect(0, 220, 100, 100);
    
    cafeCtx.fillStyle = '#fff';
    cafeCtx.font = '12px Courier';
    cafeCtx.fillText('☕ COUNTER', 5, 50);
    cafeCtx.fillText('🍩 COUNTER', 5, 270);

    // Draw Dining Tables
    orders.forEach(order => {
        cafeCtx.fillStyle = '#8b5a2b';
        cafeCtx.fillRect(order.x, order.y, 60, 40);
        
        // Draw Customers
        cafeCtx.font = '20px sans-serif';
        if (order.status === 'WAITING') {
            cafeCtx.fillText('🐱', order.x + 15, order.y - 10);
            cafeCtx.font = '10px "Press Start 2P"';
            cafeCtx.fillStyle = '#ffadad';
            cafeCtx.fillText(`WANT:${order.item}`, order.x - 10, order.y - 30);
        } else {
            cafeCtx.fillText('😋✨', order.x + 10, order.y - 10);
        }
    });

    // Draw Shiba Character
    cafeCtx.font = '28px sans-serif';
    cafeCtx.fillText('🐕', shiba.x, shiba.y);
    if(shiba.itemCarried) {
        cafeCtx.font = '14px sans-serif';
        cafeCtx.fillText(shiba.itemCarried, shiba.x + 10, shiba.y - 20);
    }
}

// ==========================================
// 2. SCRAPBOOK DESIGN INTERACTIVITY LAYER
// ==========================================
let currentScrapTool = 'sticker';
let scrapCanvas, drawCtx, isPainting = false;

function initScrapbookDraw() {
    scrapCanvas = document.getElementById('drawingLayer');
    if (!scrapCanvas) return;
    drawCtx = scrapCanvas.getContext('2d');
    
    scrapCanvas.onmousedown = (e) => {
        if(currentScrapTool !== 'draw') return;
        isPainting = true;
        drawCtx.beginPath();
        drawCtx.moveTo(e.offsetX, e.offsetY);
    };
    scrapCanvas.onmousemove = (e) => {
        if(isPainting && currentScrapTool === 'draw') {
            drawCtx.lineTo(e.offsetX, e.offsetY);
            drawCtx.strokeStyle = '#a29bfe';
            drawCtx.lineWidth = 4;
            drawCtx.stroke();
        }
    };
    window.addEventListener('mouseup', () => isPainting = false);

    // Dynamic Element placement via clicks
    const cBox = document.getElementById('scrapbookCanvas');
    if (cBox) {
        cBox.onclick = function(e) {
            if (e.target.id !== 'drawingLayer') return;
            if (currentScrapTool === 'sticker') createScrapItem('🌸', e.offsetX, e.offsetY, 'text');
            if (currentScrapTool === 'tape') createScrapItem('', e.offsetX, e.offsetY, 'tape');
        };
    }
}

function setScrapTool(tool) { currentScrapTool = tool; }

function addCustomText() {
    const txt = document.getElementById('scrapbookTextInput').value;
    if(txt) createScrapItem(txt, 100, 100, 'text');
}

function createScrapItem(content, x, y, type) {
    const container = document.getElementById('scrapbookCanvas');
    const el = document.createElement('div');
    el.className = 'scrapbook-element ' + (type === 'tape' ? 'scrapbook-tape' : '');
    if(type === 'text') el.innerText = content;
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    let holds = false;
    el.onmousedown = () => holds = true;
    window.addEventListener('mousemove', (ev) => {
        if(holds) {
            const bound = container.getBoundingClientRect();
            el.style.left = (ev.clientX - bound.left - 15) + 'px';
            el.style.top = (ev.clientY - bound.top - 15) + 'px';
        }
    });
    window.addEventListener('mouseup', () => holds = false);
    container.appendChild(el);
}

function clearScrapbook() {
    if (drawCtx && scrapCanvas) drawCtx.clearRect(0, 0, scrapCanvas.width, scrapCanvas.height);
    document.querySelectorAll('.scrapbook-element').forEach(el => el.remove());
}
// ==========================================
// 3. REAL TICK-BASED AUTOMATIC GARDENING
// ==========================================
let plots = {
    1: { stage: 0, watered: false, timer: 0 },
    2: { stage: 0, watered: false, timer: 0 },
    3: { stage: 0, watered: false, timer: 0 }
};
let berries = 0;
let autoSprinkler = false;

// Idle Tick System loops every 1 second
setInterval(() => {
    for (let id in plots) {
        let p = plots[id];
        if (autoSprinkler) p.watered = true;

        if (p.stage > 0 && p.stage < 3 && p.watered) {
            p.timer++;
            if (p.timer >= 5) { // Evolves stage every 5 seconds
                p.stage++;
                p.timer = 0;
                p.watered = autoSprinkler; 
                renderPlots();
            }
        }
    }
}, 1000);

function renderPlots() {
    const assets = ['🟤', '🌱', '🌿', '🍓'];
    for (let id in plots) {
        let p = plots[id];
        let txt = assets[p.stage];
        if (p.watered && p.stage < 3 && p.stage > 0) txt += '💧';
        const plotEl = document.getElementById(`gPlot${id}`);
        if (plotEl) plotEl.innerHTML = `<div class="dirt">${txt}</div>`;
    }
}

function interactPlot(id) {
    let p = plots[id];
    if (p.stage === 0) { // Plant seed
        p.stage = 1;
    } else if (p.stage < 3 && !p.watered) { // Water plant
        p.watered = true;
    } else if (p.stage === 3) { // Harvest fully grown berry
        berries += 5;
        document.getElementById('berryCount').innerText = berries;
        p.stage = 0;
        p.watered = false;
    }
    renderPlots();
}

function buyGardenUpgrade() {
    if (berries >= 15 && !autoSprinkler) {
        berries -= 15;
        autoSprinkler = true;
        document.getElementById('berryCount').innerText = berries;
        renderPlots();
    }
}

// ==========================================
// 4. INTERACTIVE TAMAGOTCHI PET CONTROLLER
// ==========================================
let petStats = { hunger: 100, love: 100, energy: 100, status: 'HAPPY' };

function petAction(act) {
    const msg = document.getElementById('petSpeech');
    const emo = document.getElementById('pixelPet');
    if (!msg || !emo) return;

    if (act === 'feed') {
        petStats.hunger = Math.min(100, petStats.hunger + 25);
        msg.innerText = '"Chomp chomp! Tasty!"';
        emo.innerText = '😋';
    } else if (act === 'play') {
        if(petStats.energy < 20) {
            msg.innerText = '"Too tired to play..."';
            return;
        }
        petStats.love = Math.min(100, petStats.love + 20);
        petStats.energy = Math.max(0, petStats.energy - 15);
        msg.innerText = '"Yay! More games!"';
        emo.innerText = '🥳';
    } else if (act === 'sleep') {
        petStats.energy = 100;
        msg.innerText = '"Zzz... sleeping..."';
        emo.innerText = '😴';
    } else if (act === 'clean') {
        msg.innerText = '"Sparkling clean!"';
        emo.innerText = '✨🐰✨';
    }
    refreshPetUI();
}

setInterval(() => {
    const petView = document.getElementById('petView');
    if (!petView || !petView.classList.contains('active')) return;
    petStats.hunger = Math.max(0, petStats.hunger - 3);
    petStats.love = Math.max(0, petStats.love - 2);
    petStats.energy = Math.max(0, petStats.energy - 1);
    
    if(petStats.hunger < 40 || petStats.love < 40) {
        document.getElementById('petSpeech').innerText = '"I need attention..."';
        document.getElementById('pixelPet').innerText = '🥺';
    }
    refreshPetUI();
}, 4000);

function refreshPetUI() {
    const h = document.getElementById('p_hunger');
    const l = document.getElementById('p_love');
    const e = document.getElementById('p_energy');
    if (h) h.innerText = petStats.hunger;
    if (l) l.innerText = petStats.love;
    if (e) e.innerText = petStats.energy;
}

// Set default layout setup on load
setTimeout(refreshPetUI, 200);

// ==========================================
// 5. ADVANCED STAR JAR PLATFORM ENGINE
// ==========================================
let starCanvas, sCtx, starLoop;
let starsCollected = 0;
let jarLevelSetting = 1, basketWidth = 60;
let starBox = { x: 300, y: 270 };
let activeStars = [];

function startStarGame() {
    starCanvas = document.getElementById('starCanvas');
    if (!starCanvas) return;
    sCtx = starCanvas.getContext('2d');
    activeStars = [];
    clearInterval(starLoop);
    starLoop = setInterval(runStarCycle, 30);
    
    // Attach listener once canvas object initializes
    starCanvas.onmousemove = (e) => {
        const r = starCanvas.getBoundingClientRect();
        starBox.x = e.clientX - r.left;
    };
}

function stopStarGame() { clearInterval(starLoop); }

function runStarCycle() {
    if (!sCtx || !starCanvas) return;
    sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    
    // Periodically spawn stars
    if(Math.random() < 0.06) {
        activeStars.push({ x: Math.random() * (starCanvas.width - 20) + 10, y: 0, speed: Math.random() * 3 + 2 });
    }

    // Draw Jar Basket
    sCtx.fillStyle = '#74b9ff';
    sCtx.fillRect(starBox.x - (basketWidth/2), starBox.y, basketWidth, 25);
    sCtx.fillStyle = '#fff';
    sCtx.font = '10px Courier';
    sCtx.fillText('JAR', starBox.x - 10, starBox.y + 15);

    // Fall logic
    for(let i = activeStars.length - 1; i >= 0; i--) {
        let s = activeStars[i];
        s.y += s.speed;
        
        sCtx.font = '20px sans-serif';
        sCtx.fillText('⭐', s.x - 10, s.y);

        // Capture check
        if (s.y >= starBox.y && s.y <= starBox.y + 25 && Math.abs(s.x - starBox.x) < (basketWidth/2 + 5)) {
            starsCollected += (1 * jarLevelSetting);
            document.getElementById('starBank').innerText = starsCollected;
            activeStars.splice(i, 1);
            continue;
        }
        if (s.y > starCanvas.height) activeStars.splice(i, 1);
    }
}

function buyStarUpgrade(type) {
    if(type === 'net' && starsCollected >= 10) {
        starsCollected -= 10;
        basketWidth += 25; 
        document.getElementById('buyNetBtn').innerText = "Max Net Reached";
    }
    if(type === 'jar' && starsCollected >= 20) {
        starsCollected -= 20;
        jarLevelSetting += 1;
        document.getElementById('jarLevel').innerText = jarLevelSetting;
        document.getElementById('buyJarBtn').innerText = `Jar Multiplier Lvl ${jarLevelSetting}`;
    }
    document.getElementById('starBank').innerText = starsCollected;
}
