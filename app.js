// ==========================================
// PIXEL RENDER CORE MATRICES (NO EMOJIS)
// ==========================================
const SPRITES = {
    shiba: [
        "  0000  ",
        " 011110 ",
        "01211210",
        "01111110",
        " 013310 ",
        "  0000  "
    ],
    drink: [
        " 1111 ",
        " 2222 ",
        " 2222 ",
        " 1111 "
    ],
    sprout: [
        "  11  ",
        "111111",
        "  22  ",
        "  22  "
    ],
    berry: [
        "  11  ",
        " 3333 ",
        "333333",
        " 3333 "
    ],
    pet: [
        " 11  11 ",
        " 11  11 ",
        "11111111",
        "11211211",
        "11111111",
        " 111111 "
    ],
    star: [
        "  1  ",
        " 111 ",
        "11111",
        " 111 ",
        "  1  "
    ]
};

const COLOR_MAPS = {
    shiba: { '0': '#4a3b3d', '1': '#e1b12c', '2': '#ffffff', '3': '#f5cd79' },
    drink: { '1': '#4a3b3d', '2': '#74b9ff' },
    sprout: { '1': '#4cd137', '2': '#4a3b3d' },
    berry: { '1': '#4cd137', '3': '#ff4757' },
    pet: { '1': '#ffffff', '2': '#000000' },
    star: { '1': '#ffda79' }
};

function drawPixelSprite(ctx, spriteKey, x, y, size = 4) {
    const sprite = SPRITES[spriteKey];
    const colors = COLOR_MAPS[spriteKey];
    if(!sprite || !ctx) return;

    sprite.forEach((row, rowIndex) => {
        for(let colIndex = 0; colIndex < row.length; colIndex++) {
            const char = row[colIndex];
            if(char !== ' ') {
                ctx.fillStyle = colors[char] || '#000000';
                ctx.fillRect(x + (colIndex * size), y + (rowIndex * size), size, size);
            }
        }
    });
}

// ==========================================
// CORE HUB FRAME CONTROL
// ==========================================
let activeLoops = {};

function loadGame(gameKey) {
    document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    killAllLoops();

    if(gameKey === 'cafe') {
        document.getElementById('view-cafe').classList.add('active');
        document.getElementById('screen-title').innerText = 'SHIBA CAFE';
        startCafe();
    } else if(gameKey === 'scrap') {
        document.getElementById('view-scrap').classList.add('active');
        document.getElementById('screen-title').innerText = 'SCRAPBOOK';
        startScrap();
    } else if(gameKey === 'tycoon') {
        document.getElementById('view-tycoon').classList.add('active');
        document.getElementById('screen-title').innerText = 'GARDEN TYCOON';
        startTycoon();
    } else if(gameKey === 'pet') {
        document.getElementById('view-pet').classList.add('active');
        document.getElementById('screen-title').innerText = 'PET ADORN';
        startPet();
    } else if(gameKey === 'catcher') {
        document.getElementById('view-catcher').classList.add('active');
        document.getElementById('screen-title').innerText = 'STAR JAR';
        startCatcher();
    }
}

function goToHome() {
    document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-hub').classList.add('active');
    document.getElementById('screen-title').innerText = 'PIXEL SYSTEM';
    killAllLoops();
}

function killAllLoops() {
    clearInterval(activeLoops.cafe);
    clearInterval(activeLoops.tycoon);
    clearInterval(activeLoops.pet);
    clearInterval(activeLoops.catcher);
}

// ==========================================
// 1. GAME: SHIBA CAFE (PATHFINDING RUN)
// ==========================================
let cafeCash = 0;
let dogX = 80, dogY = 150, dogTX = 80, dogTY = 150;
let hasDrink = false;

function startCafe() {
    const canvas = document.getElementById('cafeCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.onclick = function(e) {
        const r = canvas.getBoundingClientRect();
        dogTX = e.clientX - r.left;
        dogTY = e.clientY - r.top;
    };

    activeLoops.cafe = setInterval(() => {
        let dx = dogTX - dogX;
        let dy = dogTY - dogY;
        let dist = Math.hypot(dx, dy);
        if(dist > 5) {
            dogX += (dx / dist) * 5;
            dogY += (dy / dist) * 5;
        }

        if(dogX < 80 && dogY < 100) {
            hasDrink = true;
            document.getElementById('cafe-task').innerText = 'Deliver to Table';
        }
        if(dogX > 480 && hasDrink) {
            hasDrink = false;
            cafeCash += 15;
            document.getElementById('cafe-cash').innerText = cafeCash;
            document.getElementById('cafe-task').innerText = 'Fetch Drink';
        }

        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffb6c1';
        ctx.fillRect(0, 0, 80, 100);
        ctx.fillStyle = '#4a3b3d';
        ctx.font = '8px monospace';
        ctx.fillText("DRINKS", 10, 50);

        ctx.fillStyle = '#ffd3b6';
        ctx.fillRect(500, 120, 80, 100);

        drawPixelSprite(ctx, 'shiba', dogX, dogY, 4);
        if(hasDrink) {
            drawPixelSprite(ctx, 'drink', dogX + 12, dogY - 20, 3);
        }
    }, 40);
}
// ==========================================
// 2. GAME: SCRAPBOOK (BOARD SUITE)
// ==========================================
let scrapTool = 'draw';
let scrapElements = [];

function startScrap() {
    const canvas = document.getElementById('scrapCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    canvas.onmousedown = function(e) {
        const r = canvas.getBoundingClientRect();
        const mx = e.clientX - r.left;
        const my = e.clientY - r.top;

        if(scrapTool === 'draw') {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(mx, my);
        } else if(scrapTool === 'sticker1') {
            scrapElements.push({ type: 'heart', x: mx, y: my, color: document.getElementById('scrap-color').value });
            renderScrapbook(ctx, canvas);
        } else if(scrapTool === 'sticker2') {
            scrapElements.push({ type: 'star', x: mx, y: my });
            renderScrapbook(ctx, canvas);
        }
    };

    canvas.onmousemove = function(e) {
        if(!isDrawing || scrapTool !== 'draw') return;
        const r = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
        ctx.strokeStyle = document.getElementById('scrap-color').value;
        ctx.lineWidth = 4;
        ctx.stroke();
    };

    window.addEventListener('mouseup', () => isDrawing = false);
    renderScrapbook(ctx, canvas);
}

function setScrapTool(tool) { scrapTool = tool; }

function renderScrapbook(ctx, canvas) {
    scrapElements.forEach(el => {
        if(el.type === 'heart') {
            ctx.fillStyle = el.color;
            ctx.fillRect(el.x, el.y, 16, 16);
        } else if(el.type === 'star') {
            drawPixelSprite(ctx, 'star', el.x, el.y, 3);
        }
    });
}

function clearScrapbook() {
    const canvas = document.getElementById('scrapCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height);
    scrapElements = [];
}

// ==========================================
// 3. GAME: GARDEN TYCOON (GROW FIELD)
// ==========================================
let tycoonGems = 10, plotsOwned = 1, autoSprinkler = false;
let gardenPlot = { stage: 0, timer: 0 };

function startTycoon() {
    const canvas = document.getElementById('tycoonCanvas');
    const ctx = canvas.getContext('2d');

    canvas.onclick = function() {
        if(gardenPlot.stage === 3) {
            tycoonGems += 10;
            gardenPlot.stage = 0;
            gardenPlot.timer = 0;
            document.getElementById('tycoon-gems').innerText = tycoonGems;
        } else if(gardenPlot.stage === 0) {
            gardenPlot.stage = 1;
        }
    };

    activeLoops.tycoon = setInterval(() => {
        if(gardenPlot.stage > 0 && gardenPlot.stage < 3) {
            gardenPlot.timer += autoSprinkler ? 2 : 1;
            if(gardenPlot.timer > 60) {
                gardenPlot.stage++;
                gardenPlot.timer = 0;
            }
        }

        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#573b25';
        ctx.fillRect(100, 100, 160, 160);

        if(gardenPlot.stage === 1 || gardenPlot.stage === 2) {
            drawPixelSprite(ctx, 'sprout', 160, 150, 6);
        } else if(gardenPlot.stage === 3) {
            drawPixelSprite(ctx, 'berry', 160, 140, 6);
        }
    }, 100);
}

function buyTycoonUpgrade(item) {
    if(item === 'plot' && tycoonGems >= 20) {
        tycoonGems -= 20;
        plotsOwned++;
    } else if(item === 'water' && tycoonGems >= 40) {
        tycoonGems -= 40;
        autoSprinkler = true;
    }
    document.getElementById('tycoon-gems').innerText = tycoonGems;
}

// ==========================================
// 4. GAME: VIRTUAL PET DEVICE
// ==========================================
let petTokens = 0, petHunger = 100, activeHat = false, activeBow = false;

function startPet() {
    const canvas = document.getElementById('petCanvas');
    const ctx = canvas.getContext('2d');

    activeLoops.pet = setInterval(() => {
        petHunger = Math.max(0, petHunger - 1);
        document.getElementById('pet-hunger').innerText = petHunger;

        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#c7ecee';
        ctx.fillRect(0,0, canvas.width, canvas.height);

        drawPixelSprite(ctx, 'pet', 150, 100, 6);

        if(activeHat) {
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(162, 80, 50, 16);
        }
        if(activeBow) {
            ctx.fillStyle = '#e1b12c';
            ctx.fillRect(140, 140, 20, 20);
        }
    }, 1000);
}

function handlePetAction(act) {
    if(act === 'feed') petHunger = Math.min(100, petHunger + 20);
    if(act === 'pet') {
        petTokens += 2;
        document.getElementById('pet-tokens').innerText = petTokens;
    }
}

function buyPetCosmetic(type) {
    if(type === 'hat' && petTokens >= 5) { petTokens -= 5; activeHat = true; }
    if(type === 'bow' && petTokens >= 3) { petTokens -= 3; activeBow = true; }
    document.getElementById('pet-tokens').innerText = petTokens;
}

// ==========================================
// 5. GAME: STAR JAR NET SIMULATOR
// ==========================================
let starScore = 0, basketX = 160, netColor = '#ff8da1';
let stars = [];

function startCatcher() {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');
    stars = [];

    canvas.onmousemove = function(e) {
        const r = canvas.getBoundingClientRect();
        basketX = e.clientX - r.left;
    };

    activeLoops.catcher = setInterval(() => {
        if(Math.random() < 0.06) {
            stars.push({ x: Math.random() * 320 + 20, y: 0 });
        }

        ctx.clearRect(0,0, canvas.width, canvas.height);

        ctx.strokeStyle = '#74b9ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(360, 40, 60, 100);

        ctx.fillStyle = netColor;
        ctx.fillRect(basketX - 30, 320, 60, 12);

        for(let i = stars.length - 1; i >= 0; i--) {
            let s = stars[i];
            s.y += 4;

            drawPixelSprite(ctx, 'star', s.x, s.y, 3);

            if(s.y >= 315 && s.y <= 335 && Math.abs(s.x - basketX) < 35) {
                starScore++;
                document.getElementById('star-score').innerText = starScore;
                stars.splice(i, 1);
                continue;
            }
            if(s.y > canvas.height) stars.splice(i, 1);
        }
    }, 30);
}

function upgradeNet(colorHex) {
    if(starScore >= 10) {
        netColor = colorHex;
    }
}
