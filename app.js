// ============================================================================
// SYSTEM FRAMEWORK VIEW ROUTER
// ============================================================================
function switchView(viewId, title) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    
    document.getElementById('mainTitle').innerText = title;
    document.getElementById('backBtn').style.display = 'block';

    if (viewId === 'cafeView') initTocaCafeSystem();
    if (viewId === 'scrapbookView') initNotabilitySystem();
    if (viewId === 'starView') initStarJarSystem();
}

function showHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('homeView').classList.add('active');
    document.getElementById('mainTitle').innerText = 'COZY WORLD OS';
    document.getElementById('backBtn').style.display = 'none';
    
    clearInterval(tocaLoopInterval);
    clearInterval(starLoopInterval);
}

// ============================================================================
// 1. TOCA BOCA MOUSE-DRIVEN PATHFINDER CAFE ENGINE
// ============================================================================
let cafeCanvas, cafeCtx, tocaLoopInterval;
let shibaCoord = { x: 150, y: 250, tx: 150, ty: 250, velocity: 8, package: null };
let ordersTable = [
    { id: 0, x: 550, y: 150, objective: '🍓 Berry Dango Shake', progress: 'WAITING' },
    { id: 1, x: 550, y: 380, objective: '🥞 Golden Hotcakes', progress: 'WAITING' }
];
let bankCashBalance = 0;

function initTocaCafeSystem() {
    cafeCanvas = document.getElementById('cafeCanvas');
    if(!cafeCanvas) return;
    cafeCtx = cafeCanvas.getContext('2d');
    
    cafeCanvas.onclick = function(e) {
        const bounds = cafeCanvas.getBoundingClientRect();
        shibaCoord.tx = e.clientX - bounds.left;
        shibaCoord.ty = e.clientY - bounds.top;
    };
    
    clearInterval(tocaLoopInterval);
    tocaLoopInterval = setInterval(processTocaEngineFrame, 30);
}

function processTocaEngineFrame() {
    let dx = shibaCoord.tx - shibaCoord.x;
    let dy = shibaCoord.ty - shibaCoord.y;
    let distance = Math.hypot(dx, dy);
    
    if(distance > shibaCoord.velocity) {
        shibaCoord.x += (dx / distance) * shibaCoord.velocity;
        shibaCoord.y += (dy / distance) * shibaCoord.velocity;
    }

    // Kitchen pick up intersection points
    if (shibaCoord.x < 160 && shibaCoord.y < 180) shibaCoord.package = '🍓 Berry Dango Shake';
    if (shibaCoord.x < 160 && shibaCoord.y > 350) shibaCoord.package = '🥞 Golden Hotcakes';

    // Order completion logic
    ordersTable.forEach(tbl => {
        if(Math.hypot(shibaCoord.x - tbl.x, shibaCoord.y - tbl.y) < 65 && shibaCoord.package === tbl.objective && tbl.progress === 'WAITING') {
            tbl.progress = 'CHEWING';
            shibaCoord.package = null;
            bankCashBalance += 35;
            document.getElementById('cafeCash').innerText = bankCashBalance;
            setTimeout(() => { tbl.progress = 'WAITING'; }, 6000);
        }
    });

    // Drawing Canvas World Scene Procedurally
    cafeCtx.fillStyle = '#FFF5F6';
    cafeCtx.fillRect(0, 0, cafeCanvas.width, cafeCanvas.height);

    // Grid matrix
    cafeCtx.strokeStyle = 'rgba(255,182,193,0.25)';
    cafeCtx.lineWidth = 2;
    for(let w=0; w<cafeCanvas.width; w+=50) {
        cafeCtx.beginPath(); cafeCtx.moveTo(w,0); cafeCtx.lineTo(w, cafeCanvas.height); cafeCtx.stroke();
    }

    // Kitchen counter renders
    cafeCtx.fillStyle = '#FFB6C1';
    cafeCtx.fillRect(20, 30, 140, 120);
    cafeCtx.fillRect(20, 380, 140, 120);
    cafeCtx.fillStyle = '#4A3B3D';
    cafeCtx.font = 'bold 14px Fredoka';
    cafeCtx.fillText('🍓 Drink Depot', 35, 95);
    cafeCtx.fillText('🥞 Pastry Oven', 35, 445);

    // Tables
    ordersTable.forEach(tbl => {
        cafeCtx.fillStyle = '#FFE0C2';
        cafeCtx.beginPath(); cafeCtx.arc(tbl.x, tbl.y, 50, 0, Math.PI*2); cafeCtx.fill();
        cafeCtx.font = '36px sans-serif';
        let stateFace = tbl.progress === 'WAITING' ? '🐱' : '🐱✨💖';
        cafeCtx.fillText(stateFace, tbl.x - 18, tbl.y - 60);
        
        if(tbl.progress === 'WAITING') {
            cafeCtx.fillStyle = '#FF8DA1';
            cafeCtx.font = '12px Fredoka';
            cafeCtx.fillText(`WANT: ${tbl.objective.split(' ')}`, tbl.x - 55, tbl.y - 110);
        }
    });

    // Main Sprite Node
    cafeCtx.font = '50px sans-serif';
    cafeCtx.fillText('🐕', shibaCoord.x - 25, shibaCoord.y + 20);
    if(shibaCoord.package) {
        cafeCtx.font = '18px sans-serif';
        cafeCtx.fillText(shibaCoord.package.split(' '), shibaCoord.x + 15, shibaCoord.y - 35);
    }
}

// ============================================================================
// 2. NOTABILITY DESK NOTEBOOK ENVIRONMENT
// ============================================================================
let activeToolMode = 'pen', scrapDrawCtx, pointerDownTrack = false;

function initNotabilitySystem() {
    const layer = document.getElementById('scrapDrawLayer');
    if(!layer) return;
    scrapDrawCtx = layer.getContext('2d');
    
    layer.onmousedown = (e) => {
        if(activeToolMode === 'text') {
            const block = document.createElement('input');
            block.className = 'custom-note-element typed-block';
            block.placeholder = 'Type...';
            block.style.left = e.offsetX + 'px';
            block.style.top = e.offsetY + 'px';
            block.style.color = document.getElementById('scrapColor').value;
            document.getElementById('notabilitySheet').appendChild(block);
            return;
        }
        if(activeToolMode === 'tape') {
            const tape = document.createElement('div');
            tape.className = 'custom-note-element tape-strip';
            tape.style.left = e.offsetX + 'px';
            tape.style.top = e.offsetY + 'px';
            document.getElementById('notabilitySheet').appendChild(tape);
            return;
        }
        if(activeToolMode === 'sticker') {
            const stickers = ['🌸', '🧸', '🎀', '🍡', '⭐'];
            const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
            const node = document.createElement('div');
            node.className = 'custom-note-element';
            node.style.fontSize = '2.5rem';
            node.innerText = randomSticker;
            node.style.left = e.offsetX + 'px';
            node.style.top = e.offsetY + 'px';
            document.getElementById('notabilitySheet').appendChild(node);
            return;
        }
        pointerDownTrack = true;
        scrapDrawCtx.beginPath();
        scrapDrawCtx.moveTo(e.offsetX, e.offsetY);
    };

    layer.onmousemove = (e) => {
        if(!pointerDownTrack) return;
        scrapDrawCtx.lineTo(e.offsetX, e.offsetY);
        scrapDrawCtx.strokeStyle = document.getElementById('scrapColor').value;
        scrapDrawCtx.lineWidth = activeToolMode === 'highlighter' ? 20 : 4;
        scrapDrawCtx.globalAlpha = activeToolMode === 'highlighter' ? 0.35 : 1.0;
        scrapDrawCtx.stroke();
    };
    
    window.addEventListener('mouseup', () => { pointerDownTrack = false; if(scrapDrawCtx) scrapDrawCtx.globalAlpha = 1.0; });
}

function setScrapTool(targetMode) {
    activeToolMode = targetMode;
    document.querySelectorAll('.os-tool-tab').forEach(t => t.classList.remove('active'));
    const targetedTab = document.getElementById(`tool-${targetMode}`);
    if(targetedTab) targetedTab.classList.add('active');
}

function clearScrapbook() {
    const layer = document.getElementById('scrapDrawLayer');
    if(scrapDrawCtx && layer) scrapDrawCtx.clearRect(0,0, layer.width, layer.height);
    document.querySelectorAll('.custom-note-element').forEach(el => el.remove());
}

// ============================================================================
// 3. ROBLOX GARDEN TYCOON AUTO CYCLES
// ============================================================================
let tycoonWalletGems = 10, unlockedTycoonPlotsCount = 1;
let tycoonFieldsArray = [
    { live: true, completion: 0, scaleBonus: 4 },
    { live: false, completion: 0, scaleBonus: 9 },
    { live: false, completion: 0, scaleBonus: 22 }
];
let automaticSprinklerDroneActive = false, bioFertilizerMultiplier = 1;

setInterval(() => {
    if(!document.getElementById('gardeningView').classList.contains('active')) return;
    
    tycoonFieldsArray.forEach((field, index) => {
        if(field.live && field.completion < 100) {
            let incrementSpeed = automaticSprinklerDroneActive ? 15 : 6;
            field.completion = Math.min(100, field.completion + (incrementSpeed * bioFertilizerMultiplier));
            
            const titleNode = document.getElementById(`tpTitle${index}`);
            const subtitleNode = document.getElementById(`tpSub${index}`);
            
            if(titleNode && subtitleNode) {
                if(field.completion >= 100) {
                    titleNode.innerText = `💥 PLOT ${index + 1}: READY TO HARVEST`;
                    subtitleNode.innerText = `Click card container box to redeem +${field.scaleBonus} Gems!`;
                } else {
                    titleNode.innerText = `🌱 PLOT ${index + 1}: INFRASTRUCTURE SPROUTING`;
                    subtitleNode.innerText = `Auto simulation ticker status: ${field.completion}% completed`;
                }
            }
        }
    });
}, 1200);

function interactTycoonPlot(index) {
    let targetField = tycoonFieldsArray[index];
    if(targetField && targetField.live && targetField.completion >= 100) {
        tycoonWalletGems += targetField.scaleBonus;
        targetField.completion = 0;
        document.getElementById('tycoonGems').innerText = tycoonWalletGems;
    }
}

function buyTycoonItem(shopType) {
    if(shopType === 'plot' && tycoonWalletGems >= 20 && unlockedTycoonPlotsCount < 3) {
        tycoonWalletGems -= 20;
        tycoonFieldsArray[unlockedTycoonPlotsCount].live = true;
        const frame = document.getElementById(`tPlotCard${unlockedTycoonPlotsCount}`);
        if(frame) frame.classList.remove('locked');
        unlockedTycoonPlotsCount++;
    } else if(shopType === 'drone' && tycoonWalletGems >= 45) {
        tycoonWalletGems -= 45;
        automaticSprinklerDroneActive = true;
    } else if(shopType === 'growth' && tycoonWalletGems >= 65) {
        tycoonWalletGems -= 65;
        bioFertilizerMultiplier = 2.5;
    }
    document.getElementById('tycoonGems').innerText = tycoonWalletGems;
}

// ============================================================================
// 4. TAMAGOTCHI PET SYSTEM ARCHITECTURE
// ============================================================================
let hardwareTokensCount = 0, tamagotchiHungerLevel = 100;
let petEquippedAccessory = 'none';

function hardwareTomaPress(actionKey) {
    const speech = document.getElementById('tomaSpeech');
    const hatLayer = document.getElementById('tomaHatNode');
    
    if(actionKey === 'feed') {
        tamagotchiHungerLevel = Math.min(100, tamagotchiHungerLevel + 25);
        if(speech) speech.innerText = '"Yum! Treats are delicious!"';
    } else if(actionKey === 'pet') {
        hardwareTokensCount += 1;
        tamagotchiHungerLevel = Math.max(0, tamagotchiHungerLevel - 2);
        if(speech) speech.innerText = '"Bouncing! More tokens spawned!"';
    } else if(actionKey === 'shop1' && hardwareTokensCount >= 5) {
        hardwareTokensCount -= 5;
        petEquippedAccessory = 'crown';
        if(hatLayer) hatLayer.innerText = '👑';
    } else if(actionKey === 'shop2' && hardwareTokensCount >= 3) {
        hardwareTokensCount -= 3;
        petEquippedAccessory = 'bow';
        if(hatLayer) hatLayer.innerText = '🎀';
    }
    
    const hungerLabel = document.getElementById('lblHunger');
    const tokenLabel = document.getElementById('lblTokens');
    if(hungerLabel) hungerLabel.innerText = tamagotchiHungerLevel;
    if(tokenLabel) tokenLabel.innerText = hardwareTokensCount;
}

// ============================================================================
// 5. STAR CATCHER PHYSICS CONTROLLER
// ============================================================================
let starCanvas, starCtx, starLoopInterval, storageStarBankCount = 0;
let sweepMeshColor = '#FF8DA1', mouseHorizontalPositionX = 250, flyingStarsArray = [];

function initStarJarSystem() {
    starCanvas = document.getElementById('starCanvas');
    if(!starCanvas) return;
    starCtx = starCanvas.getContext('2d');
    flyingStarsArray = [];
    
    starCanvas.onmousemove = (e) => {
        const bounds = starCanvas.getBoundingClientRect();
        mouseHorizontalPositionX = e.clientX - bounds.left;
    };
    
    clearInterval(starLoopInterval);
    starLoopInterval = setInterval(renderStarJarTick, 25);
}

function renderStarJarTick() {
    if(!starCtx || !starCanvas) return;
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    
    // Glass Vault outline renders
    starCtx.strokeStyle = 'rgba(212,240,240,0.85)';
    starCtx.lineWidth = 6;
    starCtx.strokeRect(440, 30, 80, 120);
    starCtx.fillStyle = 'rgba(255,255,255,0.15)';
    starCtx.fillRect(440, 30, 80, 120);
    
    starCtx.fillStyle = '#FEF08A';
    starCtx.font = '14px Fredoka';
    starCtx.fillText('JAR VAULT', 450, 95);

    // Periodical generation tickers
    if(Math.random() < 0.08) {
        flyingStarsArray.push({ x: Math.random() * 400 + 20, y: 0, fallingSpeed: Math.random() * 5 + 4 });
    }

    // Interactive Mesh Net lines
    starCtx.fillStyle = sweepMeshColor;
    starCtx.fillRect(mouseHorizontalPositionX - 55, 510, 110, 18);
    starCtx.strokeStyle = '#4A3B3D';
    starCtx.lineWidth = 3;
    starCtx.strokeRect(mouseHorizontalPositionX - 55, 510, 110, 18);

    for(let i = flyingStarsArray.length - 1; i >= 0; i--) {
        let activeStar = flyingStarsArray[i];
        activeStar.y += activeStar.fallingSpeed;
        
        starCtx.font = '26px sans-serif';
        starCtx.fillText('⭐', activeStar.x, activeStar.y);

        // Vector intersection verification formulas
        if(activeStar.y >= 500 && activeStar.y <= 530 && Math.abs(activeStar.x - mouseHorizontalPositionX) < 60) {
            storageStarBankCount++;
            document.getElementById('starBank').innerText = storageStarBankCount;
            flyingStarsArray.splice(i, 1);
            continue;
        }
        if(activeStar.y > starCanvas.height) flyingStarsArray.splice(i, 1);
    }
}

function upgradeStarNet(type, cost) {
    if(storageStarBankCount >= cost) {
        storageStarBankCount -= cost;
        if (type === 'sakura') sweepMeshColor = '#FFB6C1';
        if (type === 'nebula') sweepMeshColor = '#A29BFE';
        if (type === 'gold') sweepMeshColor = '#FEF08A';
        document.getElementById('starBank').innerText = storageStarBankCount;
    }
}
