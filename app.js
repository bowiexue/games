// ==========================================
// VIEWS & HUB LAYOUT ROUTER
// ==========================================
function switchView(viewId, title) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const dest = document.getElementById(viewId);
    if(dest) dest.classList.add('active');
    
    document.getElementById('mainTitle').innerText = title;
    document.getElementById('backBtn').style.display = 'block';

    // Wake loops up
    if (viewId === 'cafeView') initTocaCafe();
    if (viewId === 'starView') initStarJarCatcher();
    if (viewId === 'scrapbookView') initNotability();
}

function showHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('homeView').classList.add('active');
    document.getElementById('mainTitle').innerText = 'COZY WORLD';
    document.getElementById('backBtn').style.display = 'none';
    
    // Safety clear interval routines
    clearInterval(tocaLoop);
    clearInterval(starLoop);
}

// ==========================================
// 1. TOCA BOCA WORLD SHIBA RESTAURANT
// ==========================================
let tocaCanvas, tocaCtx, tocaLoop;
let playerShiba = { x: 100, y: 200, tx: 100, ty: 200, speed: 6, carry: null };
let customers = [
    { x: 450, y: 120, state: 'WANT', order: '🍓 Berry Shake', active: true },
    { x: 450, y: 280, state: 'WANT', order: '🥞 Hotcakes', active: true }
];
let tocaCash = 0;

function initTocaCafe() {
    tocaCanvas = document.getElementById('cafeCanvas');
    tocaCtx = tocaCanvas.getContext('2d');
    
    tocaCanvas.onclick = function(e) {
        const r = tocaCanvas.getBoundingClientRect();
        playerShiba.tx = e.clientX - r.left;
        playerShiba.ty = e.clientY - r.top;
    };
    
    clearInterval(tocaLoop);
    tocaLoop = setInterval(updateTocaWorld, 25);
}

function updateTocaWorld() {
    // Basic vector physics interpolation pathfinder
    let dx = playerShiba.tx - playerShiba.x;
    let dy = playerShiba.ty - playerShiba.y;
    let dist = Math.hypot(dx, dy);
    
    if(dist > playerShiba.speed) {
        playerShiba.x += (dx / dist) * playerShiba.speed;
        playerShiba.y += (dy / dist) * playerShiba.speed;
    }

    // Touch item checkout zones
    if (playerShiba.x < 110 && playerShiba.y < 130) playerShiba.carry = '🍓 Berry Shake';
    if (playerShiba.x < 110 && playerShiba.y > 250) playerShiba.carry = '🥞 Hotcakes';

    // Serving Collision mechanics
    customers.forEach(c => {
        if(Math.hypot(playerShiba.x - c.x, playerShiba.y - c.y) < 50 && playerShiba.carry === c.order && c.state === 'WANT') {
            c.state = 'EATING';
            playerShiba.carry = null;
            tocaCash += 20;
            document.getElementById('cafeCash').innerText = tocaCash;
            setTimeout(() => { c.state = 'WANT'; }, 5000);
        }
    });

    // Render Room Scenes
    tocaCtx.fillStyle = '#fff0f2'; // Soft rug tone
    tocaCtx.fillRect(0,0, tocaCanvas.width, tocaCanvas.height);

    // Kitchen Islands
    tocaCtx.fillStyle = '#ffb6c1';
    tocaCtx.fillRect(10, 20, 90, 90);
    tocaCtx.fillRect(10, 260, 90, 90);
    tocaCtx.fillStyle = '#4a3b3d';
    tocaCtx.font = '12px Fredoka';
    tocaCtx.fillText('🍓 Counter', 15, 70);
    tocaCtx.fillText('🥞 Griddle', 15, 310);

    // Tables
    customers.forEach(c => {
        tocaCtx.fillStyle = '#ffd3b6';
        tocaCtx.beginPath(); tocaCtx.arc(c.x, c.y, 35, 0, Math.PI*2); tocaCtx.fill();
        tocaCtx.font = '24px sans-serif';
        tomaEmoji = c.state === 'WANT' ? '🐱' : '🐱✨🥰';
        tocaCtx.fillText(tomaEmoji, c.x - 12, c.y - 45);
        if(c.state === 'WANT') {
            tocaCtx.font = '11px Fredoka';
            tocaCtx.fillText(`Order: ${c.order}`, c.x - 40, c.y - 75);
        }
    });

    // Draw Character Shiba
    tocaCtx.font = '36px sans-serif';
    tocaCtx.fillText('🐕', playerShiba.x - 18, playerShiba.y + 12);
    if(playerShiba.carry) {
        tocaCtx.font = '16px sans-serif';
        tocaCtx.fillText(playerShiba.carry.split(' ')[0], playerShiba.x - 5, playerShiba.y - 25);
    }
}

// ==========================================
// 2. NOTABILITY-STYLE SCRAPBOOK
// ==========================================
let scrapMode = 'pen', activeColor = '#ff8da1', scrapDrawCtx, drawingAllowed = false;

function initNotability() {
    const sC = document.getElementById('scrapDrawLayer');
    scrapDrawCtx = sC.getContext('2d');
    
    sC.onmousedown = (e) => {
        if(scrapMode === 'text') {
            spawnNotabilityText(e.offsetX, e.offsetY);
            return;
        }
        if(scrapMode === 'sticker') {
            spawnStickerElement(e.offsetX, e.offsetY);
            return;
        }
        drawingAllowed = true;
        scrapDrawCtx.beginPath();
        scrapDrawCtx.moveTo(e.offsetX, e.offsetY);
    };

    sC.onmousemove = (e) => {
        if(!drawingAllowed) return;
        scrapDrawCtx.lineTo(e.offsetX, e.offsetY);
        scrapDrawCtx.strokeStyle = document.getElementById('scrapColor').value;
        scrapDrawCtx.lineWidth = scrapMode === 'highlighter' ? 14 : 4;
        scrapDrawCtx.globalAlpha = scrapMode === 'highlighter' ? 0.4 : 1.0;
        scrapDrawCtx.stroke();
    };
    window.addEventListener('mouseup', () => { drawingAllowed = false; if(scrapDrawCtx) scrapDrawCtx.globalAlpha = 1.0; });
}

function setScrapTool(t) { scrapMode = t; }

function spawnNotabilityText(x, y) {
    const box = document.createElement('input');
    box.className = 'notability-text';
    box.placeholder = 'Type...';
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    document.getElementById('notabilityCanvas').appendChild(box);
}

// Mobile and touch compatibility fallback logic helper
function spawnStickerElement(x, y) {
    const stickers = ['🌸', '🧸', '🎀', '🦄', '🍡', '🌟'];
    const pick = stickers[Math.floor(Math.random() * stickers.length)];
    const stk = document.createElement('div');
    stk.className = 'notability-text';
    stk.style.border = 'none';
    stk.innerText = pick;
    stk.style.left = x + 'px';
    stk.style.top = y + 'px';
    document.getElementById('notabilityCanvas').appendChild(stk);
}

function clearScrapbook() {
    const sC = document.getElementById('scrapDrawLayer');
    if(scrapDrawCtx) scrapDrawCtx.clearRect(0,0, sC.width, sC.height);
    document.querySelectorAll('.notability-text').forEach(n => n.remove());
}
// ==========================================
// 3. ROBLOX "GROW A GARDEN" TYCOON FIELD
// ==========================================
let tycoonGems = 10, plotsUnlocked = 1;
let tycoonPlotsData = [
    { purchased: true, yield: 2, level: 1, timer: 0 },
    { purchased: false, yield: 5, level: 1, timer: 0 },
    { purchased: false, yield: 12, level: 1, timer: 0 }
];

setInterval(() => {
    if(!document.getElementById('gardeningView').classList.contains('active')) return;
    tycoonPlotsData.forEach((p, idx) => {
        if(p.purchased) {
            p.timer += 20;
            if(p.timer >= 100) {
                p.timer = 0;
                tycoonGems += p.yield;
                document.getElementById('tycoonGems').innerText = tycoonGems;
            }
            const displayEl = document.getElementById(`tp${idx}`);
            if(displayEl) displayEl.innerHTML = `🌻 Growing: ${p.timer}%<br>+${p.yield} Gems`;
        }
    });
}, 1000);

function clickTycoonPlot(idx) {
    let p = tycoonPlotsData[idx];
    if(p && p.purchased) {
        p.yield += 2; // Incremental tycoon click rewards
    }
}

function buyTycoonItem(type) {
    if(type === 'plot' && tycoonGems >= 15 && plotsUnlocked < 3) {
        tycoonGems -= 15;
        tycoonPlotsData[plotsUnlocked].purchased = true;
        const targetPlot = document.getElementById(`tp${plotsUnlocked}`);
        if(targetPlot) targetPlot.innerHTML = `🌻 Active Plot`;
        plotsUnlocked++;
    }
    if(type === 'dropper' && tycoonGems >= 25) {
        tycoonGems -= 25;
        tycoonPlotsData.forEach(p => p.yield *= 2);
    }
    document.getElementById('tycoonGems').innerText = tycoonGems;
}

// ==========================================
// 4. TAMAGOTCHI ADORN SYSTEM
// ==========================================
let tokens = 0, happyPct = 100;

function interactToma(type) {
    if(type === 'feed') happyPct = Math.min(100, happyPct + 10);
    if(type === 'pet') {
        happyPct = Math.min(100, happyPct + 15);
        tokens += 2; // Earn tokens directly by loving your pet
        document.getElementById('petTokens').innerText = tokens;
    }
    const fillBar = document.getElementById('pHappyFill');
    if(fillBar) fillBar.style.width = happyPct + '%';
}

function buyTomaAdorn(emoji, cost) {
    if(tokens >= cost) {
        tokens -= cost;
        document.getElementById('petTokens').innerText = tokens;
        document.getElementById('petCosmeticLayer').innerText = emoji;
    }
}

function buyTomaUpgrade(type, cost) {
    if(tokens >= cost) {
        tokens -= cost;
        document.getElementById('petTokens').innerText = tokens;
        happyPct = 100;
        const fillBar = document.getElementById('pHappyFill');
        if(fillBar) fillBar.style.width = '100%';
    }
}

// ==========================================
// 5. STAR CATCHER WITH GRAPHICAL JAR & NETS
// ==========================================
let starCanvas, starCtx, starLoop, starScore = 0;
let netColor = '#ff8da1', netLabel = 'Standard Net';
let pointerX = 200, fallingStars = [];

function initStarJarCatcher() {
    starCanvas = document.getElementById('starCanvas');
    starCtx = starCanvas.getContext('2d');
    fallingStars = [];
    
    starCanvas.onmousemove = (e) => {
        const r = starCanvas.getBoundingClientRect();
        pointerX = e.clientX - r.left;
    };
    
    clearInterval(starLoop);
    starLoop = setInterval(starEngineStep, 30);
}

function starEngineStep() {
    if(!starCtx || !starCanvas) return;
    starCtx.clearRect(0,0, starCanvas.width, starCanvas.height);
    
    // Draw Glass Jar in right hand corner
    starCtx.strokeStyle = '#b2dbb2';
    starCtx.lineWidth = 5;
    starCtx.strokeRect(360, 20, 60, 80);
    starCtx.fillStyle = 'rgba(212,240,240,0.5)';
    starCtx.fillRect(360, 20, 60, 80);
    starCtx.fillStyle = '#4a3b3d';
    starCtx.font = '12px Fredoka';
    starCtx.fillText('JAR', 378, 65);

    if(Math.random() < 0.05) {
        fallingStars.push({ x: Math.random()*340 + 20, y: 0, s: Math.random()*3 + 3 });
    }

    // Capture Net
    starCtx.fillStyle = netColor;
    starCtx.fillRect(pointerX - 40, 340, 80, 15);
    starCtx.lineWidth = 2;
    starCtx.strokeStyle = '#000';
    starCtx.strokeRect(pointerX - 40, 340, 80, 15);

    for(let i = fallingStars.length - 1; i >= 0; i--) {
        let st = fallingStars[i];
        st.y += st.s;
        
        starCtx.font = '22px sans-serif';
        starCtx.fillText('⭐', st.x, st.y);

        if(st.y >= 335 && st.y <= 360 && Math.abs(st.x - pointerX) < 45) {
            starScore++;
            document.getElementById('starBank').innerText = starScore;
            fallingStars.splice(i, 1);
            continue;
        }
        if(st.y > starCanvas.height) fallingStars.splice(i, 1);
    }
}

function buyStarNet(name, cost, hex) {
    if(starScore >= cost) {
        starScore -= cost;
        netColor = hex;
        netLabel = name;
        document.getElementById('starBank').innerText = starScore;
    }
}
