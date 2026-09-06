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
    shiba: { '0': '#3c2f31', '1': '#e1b12c', '2': '#ffffff', '3': '#f5cd79' },
    drink: { '1': '#3c2f31', '2': '#74b9ff' },
    sprout: { '1': '#4cd137', '2': '#3c2f31' },
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
// CENTRALIZED VIEW SWITCH CONTROL
// ==========================================
let activeIntervalLoops = {};

function launchAppView(gameKey) {
    document.querySelectorAll('.app-view').forEach(panel => panel.classList.remove('active'));
    terminateAllActiveIntervals();

    if(gameKey === 'cafe') {
        document.getElementById('panel-cafe').classList.add('active');
        document.getElementById('app-window-title').innerText = 'SYSTEM: SHIBA_CAFE_TOCA';
        bootstrapCafeEngine();
    } else if(gameKey === 'scrap') {
        document.getElementById('panel-scrap').classList.add('active');
        document.getElementById('app-window-title').innerText = 'SYSTEM: SCRAPBOOK_NOTABILITY';
        bootstrapScrapbookEngine();
    } else if(gameKey === 'tycoon') {
        document.getElementById('panel-tycoon').classList.add('active');
        document.getElementById('app-window-title').innerText = 'SYSTEM: TYCOON_GARDEN_ROBLOX';
        bootstrapTycoonEngine();
    } else if(gameKey === 'pet') {
        document.getElementById('panel-pet').classList.add('active');
        document.getElementById('app-window-title').innerText = 'SYSTEM: TAMAGOTCHI_DEVICE';
        bootstrapPetEngine();
    } else if(gameKey === 'star') {
        document.getElementById('panel-star').classList.add('active');
        document.getElementById('app-window-title').innerText = 'SYSTEM: STAR_JAR_VAULT';
        bootstrapCatcherEngine();
    }
}

function returnToMainMenu() {
    document.querySelectorAll('.app-view').forEach(panel => panel.classList.remove('active'));
    document.getElementById('panel-hub').classList.add('active');
    document.getElementById('app-window-title').innerText = 'SYSTEM: CORE_HUB';
    terminateAllActiveIntervals();
}

function terminateAllActiveIntervals() {
    clearInterval(activeIntervalLoops.cafe);
    clearInterval(activeIntervalLoops.tycoon);
    clearInterval(activeIntervalLoops.pet);
    clearInterval(activeIntervalLoops.catcher);
}

// ==========================================
// 1. MODULE: SHIBA CAFE (TOCA MOUSE WALK PATHS)
// ==========================================
let globalCafeCash = 0;
let positionX = 120, positionY = 180, destinationTX = 120, destinationTY = 180;
let isCarryingDrinkAsset = false;

function bootstrapCafeEngine() {
    const canvas = document.getElementById('canvasCafe');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.onclick = function(event) {
        const bounds = canvas.getBoundingClientRect();
        destinationTX = event.clientX - bounds.left;
        destinationTY = event.clientY - bounds.top;
    };

    activeIntervalLoops.cafe = setInterval(() => {
        // Move character dynamically along target vector path
        let deltaX = destinationTX - positionX;
        let deltaY = destinationTY - positionY;
        let distanceRadius = Math.hypot(deltaX, deltaY);
        
        if(distanceRadius > 6) {
            positionX += (deltaX / distanceRadius) * 6;
            positionY += (deltaY / distanceRadius) * 6;
        }

        // Action Station Threshold Collisions
        if(positionX < 90 && positionY < 120) {
            isCarryingDrinkAsset = true;
            document.getElementById('lbl-cafe-prompt').innerText = 'Deliver to Table Desk';
        }
        if(positionX > 500 && isCarryingDrinkAsset) {
            isCarryingDrinkAsset = false;
            globalCafeCash += 20;
            document.getElementById('lbl-cafe-cash').innerText = globalCafeCash;
            document.getElementById('lbl-cafe-prompt').innerText = 'Fetch Drink Station';
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Counter station bar
        ctx.fillStyle = '#ffcad4';
        ctx.fillRect(0, 0, 90, 110);
        ctx.fillStyle = '#3c2f31';
        ctx.font = '8px monospace';
        ctx.fillText("BREW BAR", 12, 55);

        // Guest Table base node
        ctx.fillStyle = '#ffdfca';
        ctx.fillRect(530, 130, 90, 110);

        // Render Frame Output Sprites
        drawPixelSprite(ctx, 'shiba', positionX, positionY, 4);
        if(isCarryingDrinkAsset) {
            drawPixelSprite(ctx, 'drink', positionX + 10, positionY - 24, 3);
        }
    }, 35);
}
// ============================================================================
// 2. MODULE: SCRAPBOOK NOTEBOOK (ADVANCED NOTABILITY INTERACTION SYSTEM)
// ============================================================================
let currentActiveScrapTool = 'draw';
let boardVectorRegistry = []; // Stores stamped shapes & washi tapes
let scrapbookActiveTemplate = 'blank';

function bootstrapScrapbookEngine() {
    const canvas = document.getElementById('canvasScrap');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let userPaintingAllowed = false;

    // Redraw templates immediately on load setup
    drawActiveNotebookTemplate(ctx, canvas);

    canvas.onmousedown = function(event) {
        const bounds = canvas.getBoundingClientRect();
        const mouseX = event.clientX - bounds.left;
        const mouseY = event.clientY - bounds.top;
        const selectedSize = parseInt(document.getElementById('scrap-size-select').value, 10);
        const selectedColor = document.getElementById('input-scrap-hex').value;

        if (currentActiveScrapTool === 'draw' || currentActiveScrapTool === 'erase') {
            userPaintingAllowed = true;
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            
            // Set styles dynamically
            ctx.strokeStyle = currentActiveScrapTool === 'erase' ? '#fafafa' : selectedColor;
            ctx.lineWidth = selectedSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        } else if (currentActiveScrapTool === 'tape') {
            // Draw a standard 16-bit translucent decorative strip tape line
            boardVectorRegistry.push({ type: 'tape', x: mouseX - 25, y: mouseY - 8, color: selectedColor });
            refreshMasterScrapbookLayers(ctx, canvas);
        } else if (currentActiveScrapTool === 'sticker1') {
            boardVectorRegistry.push({ type: 'heart', x: mouseX - 10, y: mouseY - 10, color: selectedColor });
            refreshMasterScrapbookLayers(ctx, canvas);
        } else if (currentActiveScrapTool === 'sticker2') {
            boardVectorRegistry.push({ type: 'star', x: mouseX - 10, y: mouseY - 10 });
            refreshMasterScrapbookLayers(ctx, canvas);
        }
    };

    canvas.onmousemove = function(event) {
        if (!userPaintingAllowed) return;
        if (currentActiveScrapTool !== 'draw' && currentActiveScrapTool !== 'erase') return;

        const bounds = canvas.getBoundingClientRect();
        const currentX = event.clientX - bounds.left;
        const currentY = event.clientY - bounds.top;

        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    };

    window.addEventListener('mouseup', () => { 
        if (userPaintingAllowed) {
            userPaintingAllowed = false;
            // Redraw template grids behind lines to maintain depth clarity
            refreshMasterScrapbookLayers(ctx, canvas);
        }
    });
}

function changeScrapbookTool(targetMode) {
    currentActiveScrapTool = targetMode;
    document.querySelectorAll('.tool-toggle-btn').forEach(btn => btn.classList.remove('active'));
    const matchedBtn = document.getElementById(`tool-${targetMode}`);
    if(matchedBtn) matchedBtn.classList.add('active');
}

function updateScrapbookTemplate() {
    const canvas = document.getElementById('canvasScrap');
    const templateSelect = document.getElementById('scrap-template-select');
    if (!canvas || !templateSelect) return;
    
    scrapbookActiveTemplate = templateSelect.value;
    const ctx = canvas.getContext('2d');
    refreshMasterScrapbookLayers(ctx, canvas);
}

function drawActiveNotebookTemplate(ctx, canvas) {
    // Clear back base
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    ctx.globalAlpha = 1.0;

    if (scrapbookActiveTemplate === 'lined') {
        // Render 16-bit cozy school diary lines
        ctx.strokeStyle = '#d2e2f2';
        for (let y = 30; y < canvas.height; y += 24) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        // Left margin accent line
        ctx.strokeStyle = '#ffccd5';
        ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(60, canvas.height); ctx.stroke();

    } else if (scrapbookActiveTemplate === 'grid') {
        // Engineering blueprint graph grid
        ctx.strokeStyle = '#e6edf2';
        for (let x = 20; x < canvas.width; x += 20) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 20; y < canvas.height; y += 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

    } else if (scrapbookActiveTemplate === 'dots') {
        // Bullet journal dotted organization layout
        ctx.fillStyle = '#cbdde6';
        for (let x = 25; x < canvas.width; x += 25) {
            for (let y = 25; y < canvas.height; y += 25) {
                ctx.fillRect(x, y, 2, 2);
            }
        }
    }
}

function refreshMasterScrapbookLayers(ctx, canvas) {
    // Note: Freehand ink drawings stay baked directly onto the canvas, 
    // but templates and objects re-render over top or handle vector depth here.
    drawActiveNotebookTemplate(ctx, canvas);

    boardVectorRegistry.forEach(node => {
        ctx.globalAlpha = 1.0;
        if (node.type === 'heart') {
            ctx.fillStyle = node.color;
            ctx.fillRect(node.x, node.y, 20, 20); 
        } else if (node.type === 'star') {
            drawPixelSprite(ctx, 'star', node.x, node.y, 4);
        } else if (node.type === 'tape') {
            // Semi-translucent Washi tape look
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = node.color;
            ctx.fillRect(node.x, node.y, 50, 16);
            // Grid jagged edge borders
            ctx.strokeStyle = '#3c2f31';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.strokeRect(node.x, node.y, 50, 16);
        }
    });
    ctx.globalAlpha = 1.0; // Reset state mapping safety
}

function wipeScrapbookCanvas() {
    const canvas = document.getElementById('canvasScrap');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    boardVectorRegistry = [];
    drawActiveNotebookTemplate(ctx, canvas);
}


// ==========================================
// 3. MODULE: GARDEN TYCOON (ROBLOX PROGRESSION)
// ==========================================
let globalTycoonGems = 10, plotsUnlockedCounter = 1, autoSprinklerActive = false;
let singlePlotState = { growthStage: 0, deltaTimer: 0 };

function bootstrapTycoonEngine() {
    const canvas = document.getElementById('canvasTycoon');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.onclick = function() {
        if(singlePlotState.growthStage === 3) {
            globalTycoonGems += 12;
            singlePlotState.growthStage = 0;
            singlePlotState.deltaTimer = 0;
            document.getElementById('lbl-tycoon-gems').innerText = globalTycoonGems;
        } else if(singlePlotState.growthStage === 0) {
            singlePlotState.growthStage = 1;
        }
    };

    activeIntervalLoops.tycoon = setInterval(() => {
        if(singlePlotState.growthStage > 0 && singlePlotState.growthStage < 3) {
            singlePlotState.deltaTimer += autoSprinklerActive ? 3 : 1;
            if(singlePlotState.deltaTimer > 50) {
                singlePlotState.growthStage++;
                singlePlotState.deltaTimer = 0;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Brown Soil Pit Block
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(120, 100, 180, 180);

        if(singlePlotState.growthStage === 1 || singlePlotState.growthStage === 2) {
            drawPixelSprite(ctx, 'sprout', 190, 160, 7);
        } else if(singlePlotState.growthStage === 3) {
            drawPixelSprite(ctx, 'berry', 190, 150, 7);
        }
    }, 100);
}

function triggerTycoonPurchase(upgradeKey) {
    if(upgradeKey === 'plot' && globalTycoonGems >= 20) {
        globalTycoonGems -= 20;
        plotsUnlockedCounter++;
    } else if(upgradeKey === 'sprinkler' && globalTycoonGems >= 40) {
        globalTycoonGems -= 40;
        autoSprinklerActive = true;
    }
    document.getElementById('lbl-tycoon-gems').innerText = globalTycoonGems;
}

// ==========================================
// 4. MODULE: VIRTUAL PET ADORN DEVICE
// ==========================================
let tokenAccountScore = 0, petVitalityHunger = 100, hatBoutiqueAttached = false, bowBoutiqueAttached = false;

function bootstrapPetEngine() {
    const canvas = document.getElementById('canvasPet');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');

    activeIntervalLoops.pet = setInterval(() => {
        petVitalityHunger = Math.max(0, petVitalityHunger - 1);
        document.getElementById('lbl-pet-hunger').innerText = petVitalityHunger;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Pastel device casing block walls
        ctx.fillStyle = '#b5ebd9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Frame target creature vector
        drawPixelSprite(ctx, 'pet', 160, 100, 6);

        // Dynamic clothing overlays
        if(hatBoutiqueAttached) {
            ctx.fillStyle = '#ffd700'; // Gold tier hat
            ctx.fillRect(174, 82, 54, 14);
        }
        if(bowBoutiqueAttached) {
            ctx.fillStyle = '#ff758f';
            ctx.fillRect(152, 142, 22, 22);
        }
    }, 1000);
}

function executePetCommand(actionKey) {
    if(actionKey === 'feed') petVitalityHunger = Math.min(100, petVitalityHunger + 25);
    if(actionKey === 'pet') {
        tokenAccountScore += 3;
        document.getElementById('lbl-pet-tokens').innerText = tokenAccountScore;
    }
}

function executePetBoutiqueBuy(cosmeticKey) {
    if(cosmeticKey === 'hat' && tokenAccountScore >= 5) { tokenAccountScore -= 5; hatBoutiqueAttached = true; }
    if(cosmeticKey === 'bow' && tokenAccountScore >= 3) { tokenAccountScore -= 3; bowBoutiqueAttached = true; }
    document.getElementById('lbl-pet-tokens').innerText = tokenAccountScore;
}

// ==========================================
// 5. MODULE: STAR JAR (FALLING VECTOR COLLIDE)
// ==========================================
let collectedStarScore = 0, sweepNetBasketX = 180, sweepNetColorHex = '#ff758f';
let stellarObjectArray = [];

function bootstrapCatcherEngine() {
    const canvas = document.getElementById('canvasStar');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    stellarObjectArray = [];

    canvas.onmousemove = function(event) {
        const bounds = canvas.getBoundingClientRect();
        sweepNetBasketX = event.clientX - bounds.left;
    };

    activeIntervalLoops.catcher = setInterval(() => {
        if(Math.random() < 0.05) {
            stellarObjectArray.push({ x: Math.random() * 350 + 20, y: 0 });
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw structural storage Jar box layout boundaries
        ctx.strokeStyle = '#a29bfe';
        ctx.lineWidth = 5;
        ctx.strokeRect(370, 30, 60, 110);

        // Sweep collection tool structure
        ctx.fillStyle = sweepNetColorHex;
        ctx.fillRect(sweepNetBasketX - 35, 330, 70, 14);

        for(let i = stellarObjectArray.length - 1; i >= 0; i--) {
            let starNode = stellarObjectArray[i];
            starNode.y += 5;

            drawPixelSprite(ctx, 'star', starNode.x, starNode.y, 4);

            // Precision collision evaluation bounding hits
            if(starNode.y >= 320 && starNode.y <= 345 && Math.abs(starNode.x - sweepNetBasketX) < 40) {
                collectedStarScore++;
                document.getElementById('lbl-star-score').innerText = collectedStarScore;
                stellarObjectArray.splice(i, 1);
                continue;
            }
            if(starNode.y > canvas.height) stellarObjectArray.splice(i, 1);
        }
    }, 25);
}

function buyNetUpgradeHex(colorHexValue) {
    if(collectedStarScore >= 10) {
        sweepNetColorHex = colorHexValue;
    }
}
