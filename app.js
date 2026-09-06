// ============================================================================
// PORTAL ROUTER & CYCLE MANAGEMENT
// ============================================================================
function switchView(viewId, title) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    document.getElementById('mainTitle').innerText = title;
    document.getElementById('backBtn').style.display = 'block';

    // Core Canvas Initialization triggers
    if (viewId === 'cafeView') initTocaCafe();
    if (viewId === 'starView') initStarJarSystem();
    if (viewId === 'scrapbookView') initNotabilitySystem();
    if (viewId === 'petView') initTamagotchiSystem();
}

function showHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('homeView').classList.add('active');
    document.getElementById('mainTitle').innerText = 'COZY UNIVERSE';
    document.getElementById('backBtn').style.display = 'none';
    
    // Safety loop destruction triggers to prevent system overhead leaks
    clearInterval(tocaLoop);
    clearInterval(starLoop);
    clearInterval(tomaRenderLoop);
}

// ============================================================================
// 1. TOCA BOCA MOUSE-WALK SHIBA RESTAURANT ENGINE
// ============================================================================
let cafeCanvas, cafeCtx, tocaLoop;
let shibaNode = { x: 120, y: 220, targetX: 120, targetY: 220, speed: 7, carryItem: null };
let diningTables = [
    { x: 480, y: 130, state: 'ORDERING', choice: '🥞 Strawberry Hotcakes' },
    { x: 480, y: 290, state: 'ORDERING', choice: '🍵 Iced Matcha Bubble Tea' }
];
let systemCash = 0;

function initTocaCafe() {
    cafeCanvas = document.getElementById('cafeCanvas');
    if(!cafeCanvas) return;
    cafeCtx = cafeCanvas.getContext('2d');
    
    cafeCanvas.onclick = function(e) {
        const bounds = cafeCanvas.getBoundingClientRect();
        shibaNode.targetX = e.clientX - bounds.left;
        shibaNode.targetY = e.clientY - bounds.top;
    };
    
    clearInterval(tocaLoop);
    tocaLoop = setInterval(renderTocaCycle, 30);
}

function renderTocaCycle() {
    // Math vector interpolation pathfinder mechanics
    let dx = shibaNode.targetX - shibaNode.x;
    let dy = shibaNode.targetY - shibaNode.y;
    let distance = Math.hypot(dx, dy);
    
    if(distance > shibaNode.speed) {
        shibaNode.x += (dx / distance) * shibaNode.speed;
        shibaNode.y += (dy / distance) * shibaNode.speed;
    }

    // Interactive spatial boundary checking (Kitchen preparation stations)
    if (shibaNode.x < 140 && shibaNode.y < 150) shibaNode.carryItem = '🥞 Strawberry Hotcakes';
    if (shibaNode.x < 140 && shibaNode.y > 250) shibaNode.carryItem = '🍵 Iced Matcha Bubble Tea';

    // Customer intersection checks
    diningTables.forEach(table => {
        if(Math.hypot(shibaNode.x - table.x, shibaNode.y - table.y) < 60 && shibaNode.carryItem === table.choice && table.state === 'ORDERING') {
            table.state = 'CHEWING';
            shibaNode.carryItem = null;
            systemCash += 25;
            document.getElementById('cafeCash').innerText = systemCash;
            setTimeout(() => { table.state = 'ORDERING'; }, 6000);
        }
    });

    // Clear Canvas
    cafeCtx.fillStyle = '#fff2f5'; 
    cafeCtx.fillRect(0, 0, cafeCanvas.width, cafeCanvas.height);

    // Render floor grids (Toca Boca map layout vibe)
    cafeCtx.strokeStyle = 'rgba(255,182,193,0.2)';
    cafeCtx.lineWidth = 2;
    for(let i=0; i<cafeCanvas.width; i+=40) {
        cafeCtx.beginPath(); cafeCtx.moveTo(i,0); cafeCtx.lineTo(i, cafeCanvas.height); cafeCtx.stroke();
    }

    // Draw Kitchen Preparation Stations
    cafeCtx.fillStyle = '#ffb6c1';
    cafeCtx.fillRect(15, 30, 110, 95);
    cafeCtx.fillRect(15, 275, 110, 95);
    cafeCtx.fillStyle = '#4a3b3d';
    cafeCtx.font = 'bold 12px Fredoka';
    cafeCtx.fillText('🥞 Hotcakes', 25, 80);
    cafeCtx.fillText('🍵 Matcha Bar', 25, 325);

    // Draw Dining Tables and Customer Nodes
    diningTables.forEach(table => {
        cafeCtx.fillStyle = '#ffccac';
        cafeCtx.beginPath(); cafeCtx.arc(table.x, table.y, 40, 0, Math.PI * 2); cafeCtx.fill();
        
        // Draw Guest Character
        cafeCtx.font = '32px sans-serif';
        let avatarIcon = table.state === 'ORDERING' ? '🐱' : '🐱✨💖';
        cafeCtx.fillText(avatarIcon, table.x - 16, table.y - 50);
        
        if(table.state === 'ORDERING') {
            cafeCtx.fillStyle = '#ff8da1';
            cafeCtx.font = '11px Fredoka';
            cafeCtx.fillText(`WANT: ${table.choice.split(' ')[1]}`, table.x - 45, table.y - 95);
        }
    });

    // Render Shiba Main Sprite Character
    cafeCtx.font = '42px sans-serif';
    cafeCtx.fillText('🐕', shibaNode.x - 20, shibaNode.y + 15);
    if(shibaNode.carryItem) {
        cafeCtx.font = '18px sans-serif';
        cafeCtx.fillText(shibaNode.carryItem.split(' ')[0], shibaNode.x + 10, shibaNode.y - 25);
    }
}

// ============================================================================
// 2. NOTABILITY-STYLE SCRAPBOOK EDITOR ENGINE
// ============================================================================
let activeScrapMode = 'pen', scrapDrawCtx, drawTrack = false;

function initNotabilitySystem() {
    const layer = document.getElementById('scrapDrawLayer');
    if(!layer) return;
    scrapDrawCtx = layer.getContext('2d');
    
    layer.onmousedown = (e) => {
        if(activeScrapMode === 'text') {
            spawnTextEditorNode(e.offsetX, e.offsetY);
            return;
        }
        if(activeScrapMode === 'sticker') {
            spawnDecalNode(e.offsetX, e.offsetY);
            return;
        }
        drawTrack = true;
        scrapDrawCtx.beginPath();
        scrapDrawCtx.moveTo(e.offsetX, e.offsetY);
    };

    layer.onmousemove = (e) => {
        if(!drawTrack) return;
        scrapDrawCtx.lineTo(e.offsetX, e.offsetY);
        scrapDrawCtx.strokeStyle = document.getElementById('scrapColor').value;
        scrapDrawCtx.lineWidth = activeScrapMode === 'highlighter' ? 18 : 4;
        scrapDrawCtx.globalAlpha = activeScrapMode === 'highlighter' ? 0.35 : 1.0;
        scrapDrawCtx.stroke();
    };
    
    window.addEventListener('mouseup', () => { drawTrack = false; if(scrapDrawCtx) scrapDrawCtx.globalAlpha = 1.0; });
}

function setScrapTool(modeType) {
    activeScrapMode = modeType;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const targetedBtn = document.getElementById(`btn-${modeType}`);
    if(targetedBtn) targetedBtn.classList.add('active');
}

function spawnTextEditorNode(x, y) {
    const inputNode = document.createElement('input');
    inputNode.className = 'notability-input-node';
    inputNode.placeholder = '✏️ Type note note...';
    inputNode.style.left = x + 'px';
    inputNode.style.top = y + 'px';
    inputNode.style.color = document.getElementById('scrapColor').value;
    document.getElementById('notabilityWrapper').appendChild(inputNode);
}

function spawnDecalNode(x, y) {
    const pick = document.getElementById('stickerSelect').value;
    const stickerNode = document.createElement('div');
    stickerNode.className = 'notability-input-node';
    stickerNode.style.border = 'none';
    stickerNode.style.fontSize = '2rem';
    stickerNode.innerText = pick;
    stickerNode.style.left = x + 'px';
    stickerNode.style.top = y + 'px';
    document.getElementById('notabilityWrapper').appendChild(stickerNode);
}

function clearScrapbook() {
    const layer = document.getElementById('scrapDrawLayer');
    if(scrapDrawCtx && layer) scrapDrawCtx.clearRect(0, 0, layer.width, layer.height);
    document.querySelectorAll('.notability-input-node').forEach(node => node.remove());
}
// ============================================================================
// 3. ROBLOX "GROW A GARDEN" TYCOON FIELD ENGINE
// ============================================================================
let tycoonGems = 15, currentUnlockedPlots = 1;
let plotRegistry = [
    { active: true, stage: 0, growthPct: 0, prize: 3 },
    { active: false, stage: 0, growthPct: 0, prize: 8 },
    { active: false, stage: 0, growthPct: 0, prize: 18 }
];
let automaticSprinklerDrone = false, megaGrowthMultiplier = 1;

setInterval(() => {
    if(!document.getElementById('gardeningView').classList.contains('active')) return;
    
    plotRegistry.forEach((plot, index) => {
        if(plot.active) {
            // Automatic loop progression increments
            let speedStep = automaticSprinklerDrone ? 15 : 8;
            plot.growthPct = Math.min(100, plot.growthPct + (speedStep * megaGrowthMultiplier));
            
            // Convert growth percentages into visualization tiers
            if (plot.growthPct >= 100) plot.stage = 3; // Harvest ready
            else if (plot.growthPct >= 60) plot.stage = 2; // Flower bloom
            else if (plot.growthPct >= 20) plot.stage = 1; // Sprouts sprout
            else plot.stage = 0; // Empty seeds patch
            
            syncPlotDisplayUI(index);
        }
    });
}, 1200);

function syncPlotDisplayUI(index) {
    const iconStages = ['🌱 Seed Patch', '🌿 Sprouts Growing', '🌸 Flower Bud Bloom', '🍓 HARVEST READY (CLICK)'];
    const labelNode = document.getElementById(`tp${index}`);
    if(labelNode) {
        let currentPlot = plotRegistry[index];
        if(currentPlot.active) {
            labelNode.innerHTML = `PLOT ${index + 1}: ${iconStages[currentPlot.stage]} (${currentPlot.growthPct}%)`;
        }
    }
}

function clickTycoonPlot(index) {
    let targetedPlot = plotRegistry[index];
    if(!targetedPlot || !targetedPlot.active) return;
    
    if(targetedPlot.stage === 3) {
        // Successful harvest payout
        tycoonGems += targetedPlot.prize;
        targetedPlot.growthPct = 0;
        targetedPlot.stage = 0;
        document.getElementById('tycoonGems').innerText = tycoonGems;
        syncPlotDisplayUI(index);
    }
}

function buyTycoonItem(itemKey) {
    if(itemKey === 'plot' && tycoonGems >= 25 && currentUnlockedPlots < 3) {
        tycoonGems -= 25;
        plotRegistry[currentUnlockedPlots].active = true;
        const cardFrame = document.getElementById(`plotCard${currentUnlockedPlots}`);
        if(cardFrame) cardFrame.classList.remove('locked');
        syncPlotDisplayUI(currentUnlockedPlots);
        currentUnlockedPlots++;
    } else if(itemKey === 'dropper' && tycoonGems >= 50) {
        tycoonGems -= 50;
        automaticSprinklerDrone = true;
    } else if(itemKey === 'fertilizer' && tycoonGems >= 75) {
        tycoonGems -= 75;
        megaGrowthMultiplier = 2;
    }
    document.getElementById('tycoonGems').innerText = tycoonGems;
}

// ============================================================================
// 4. TAMAGOTCHI PET ADORNMENT SYSTEM ENGINE
// ============================================================================
let boutiqueTokens = 5, petHungerLevel = 100, petAffectionLevel = 100;
let petActiveAdornment = 'none', tomaRenderLoop, petCtx, petCanvas;

function initTamagotchiSystem() {
    petCanvas = document.getElementById('petCanvas');
    if(!petCanvas) return;
    petCtx = petCanvas.getContext('2d');
    
    clearInterval(tomaRenderLoop);
    tomaRenderLoop = setInterval(drawTamagotchiCanvasFrame, 40);
}

function drawTamagotchiCanvasFrame() {
    petCtx.clearRect(0,0, petCanvas.width, petCanvas.height);
    
    // Living room background layer scenes
    petCtx.fillStyle = '#e2f7f4'; // Mint wallpaper tone
    petCtx.fillRect(0,0, petCanvas.width, petCanvas.height);
    petCtx.fillStyle = '#ffb6c1'; // Cute base rug
    petCtx.fillRect(40, 200, 300, 45);

    // Draw main character bunny entity vector model lines
    petCtx.fillStyle = '#fff';
    petCtx.strokeStyle = '#4a3b3d';
    petCtx.lineWidth = 4;
    
    // Bunny Ears
    petCtx.fillRect(150, 60, 25, 60); petCtx.strokeRect(150, 60, 25, 60);
    petCtx.fillRect(195, 60, 25, 60); petCtx.strokeRect(195, 60, 25, 60);
    // Bunny Head
    petCtx.fillRect(135, 110, 100, 85); petCtx.strokeRect(135, 110, 100, 85);
    
    // Face Eyes
    petCtx.fillStyle = '#4a3b3d';
    let lowHealthToggle = (petHungerLevel < 40 || petAffectionLevel < 40);
    petCtx.font = '22px sans-serif';
    petCtx.fillText(lowHealthToggle ? '🥺' : '👀', 165, 155);

    // Wardrobe Adornments Cosmetics Layer rendering
    if(petActiveAdornment === 'crown') {
        petCtx.font = '36px sans-serif'; petCtx.fillText('👑', 165, 100);
    } else if(petActiveAdornment === 'bow') {
        petCtx.font = '32px sans-serif'; petCtx.fillText('🎀', 140, 115);
    } else if(petActiveAdornment === 'glasses') {
        petCtx.font = '28px sans-serif'; petCtx.fillText('🕶️', 168, 152);
    }
}

function interactToma(actionType) {
    if(actionType === 'feed') {
        petHungerLevel = Math.min(100, petHungerLevel + 20);
    } else if(actionType === 'pet') {
        petAffectionLevel = Math.min(100, petAffectionLevel + 15);
        boutiqueTokens += 1; // Direct award reward for play schedules
        document.getElementById('petTokens').innerText = boutiqueTokens;
    }
    updateTomaDashboardBars();
}

function buyTomaAdorn(adornKey, price) {
    if(boutiqueTokens >= price) {
        boutiqueTokens -= price;
        petActiveAdornment = adornKey;
        document.getElementById('petTokens').innerText = boutiqueTokens;
    }
}

function updateTomaDashboardBars() {
    document.getElementById('barHunger').style.width = petHungerLevel + '%';
    document.getElementById('barLove').style.width = petAffectionLevel + '%';
}

// Passive stat decay timers
setInterval(() => {
    if(!document.getElementById('petView').classList.contains('active')) return;
    petHungerLevel = Math.max(0, petHungerLevel - 5);
    petAffectionLevel = Math.max(0, petAffectionLevel - 4);
    updateTomaDashboardBars();
}, 5000);

// ============================================================================
// 5. ADVANCED STAR JAR & NET SHOP SYSTEM ENGINE
// ============================================================================
let starCanvas, starCtx, starLoop, totalStarsBanked = 0;
let catchNetColor = '#ff8da1', targetCursorX = 200, atmosphericStars = [];

function initStarJarSystem() {
    starCanvas = document.getElementById('starCanvas');
    starCtx = starCanvas.getContext('2d');
    atmosphericStars = [];
    
    starCanvas.onmousemove = (e) => {
        const bounds = starCanvas.getBoundingClientRect();
        targetCursorX = e.clientX - bounds.left;
    };
    
    clearInterval(starLoop);
    starLoop = setInterval(runStarCatcherStep, 25);
}

function runStarCatcherStep() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    
    // Draw Glass Storage Container Jar graphic assets
    starCtx.strokeStyle = 'rgba(173,216,230,0.8)';
    starCtx.lineWidth = 6;
    starCtx.strokeRect(380, 25, 65, 95);
    starCtx.fillStyle = 'rgba(226,247,244,0.4)';
    starCtx.fillRect(380, 25, 65, 95);
    starCtx.fillStyle = '#4a3b3d';
    starCtx.font = '600 12px Fredoka';
    starCtx.fillText('VAULT', 393, 75);

    // Random star generation
    if(Math.random() < 0.07) {
        atmosphericStars.push({ x: Math.random() * 350 + 20, y: 0, speed: Math.random() * 4 + 3 });
    }

    // Draw Player Sweep Net
    starCtx.fillStyle = catchNetColor;
    starCtx.fillRect(targetCursorX - 45, 355, 90, 16);
    starCtx.lineWidth = 3;
    starCtx.strokeStyle = '#4a3b3d';
    starCtx.strokeRect(targetCursorX - 45, 355, 90, 16);

    for(let i = atmosphericStars.length - 1; i >= 0; i--) {
        let targetStar = atmosphericStars[i];
        targetStar.y += targetStar.speed;
        
        starCtx.font = '24px sans-serif';
        starCtx.fillText('⭐', targetStar.x, targetStar.y);

        // Grid collection collision thresholds
        if(targetStar.y >= 350 && targetStar.y <= 375 && Math.abs(targetStar.x - targetCursorX) < 50) {
            totalStarsBanked++;
            document.getElementById('starBank').innerText = totalStarsBanked;
            atmosphericStars.splice(i, 1);
            continue;
        }
        if(targetStar.y > starCanvas.height) atmosphericStars.splice(i, 1);
    }
}

function buyStarNet(designKey, cost) {
    if(totalStarsBanked >= cost) {
        totalStarsBanked -= cost;
        if (designKey === 'sakura') catchNetColor = '#ffb6c1';
        if (designKey === 'galaxy') catchNetColor = '#a29bfe';
        if (designKey === 'gold') catchNetColor = '#ffeaa7';
        document.getElementById('starBank').innerText = totalStarsBanked;
    }
}
