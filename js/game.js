// Louis's Reptile Survival Game
// Core game engine - game loop, entities, collision, combat

console.log('game.js loaded');

const API_BASE = 'http://62.238.7.80/inbox';
const GAME_NAME = 'louis-reptile';

// ─── Game State ───────────────────────────────────────────────────────────
const gameState = {
    currentScreen: 'characterSelect', // characterSelect, game
    selectedType: null,
    selectedSpecies: null,
    player: null,
    enemies: [],
    projectiles: [],
    obstacles: [], // trees, rocks
    waterHoles: [], // water for drinking
    foodItems: [], // dropped by killed enemies
    day: 1,
    hp: 30,
    maxHp: 30,
    energy: 15,
    maxEnergy: 15,
    kills: 0,
    score: 0,
    startedAt: null,
    lastSavedAt: null,
    dayStartTime: null,
    nightCycle: 45 * 1000, // 45 seconds = 1 day
    lastEnemySpawn: 0,
    isNight: false,
    gameRunning: false,
    lastEnemySpawnTime: 0,
};

// Species database
const SPECIES_DATA = {
    snakes: [
        { name: 'Green Snake', moves: [
            { key: 'P', name: 'Strike', damage: 4, range: 30, cooldown: 0.5 },
            { key: 'E', name: 'Coil', damage: 2, range: 20, cooldown: 0.8 },
            { key: 'X', name: 'Tongue Flick', damage: 1, range: 60, cooldown: 1 },
            { key: 'Q', name: 'Slither Dash', damage: 3, range: 25, cooldown: 1.2 },
            { key: 'M', name: 'Constrict', damage: 3, range: 15, cooldown: 2 }
        ]},
        { name: 'Cobra', moves: [
            { key: 'P', name: 'Strike', damage: 5, range: 35, cooldown: 0.5 },
            { key: 'E', name: 'Hood Spread', damage: 3, range: 40, cooldown: 1.2 },
            { key: 'X', name: 'Venom Spit', damage: 4, range: 50, cooldown: 1.5 },
            { key: 'Q', name: 'Lightning Strike', damage: 6, range: 30, cooldown: 2 },
            { key: 'M', name: 'Hypnotic Dance', damage: 0, range: 60, cooldown: 3, stun: true }
        ]},
        { name: 'Python', moves: [
            { key: 'P', name: 'Squeeze', damage: 6, range: 25, cooldown: 0.6 },
            { key: 'E', name: 'Coil', damage: 2, range: 20, cooldown: 0.8 },
            { key: 'X', name: 'Body Slam', damage: 5, range: 20, cooldown: 1.5 },
            { key: 'Q', name: 'Tail Whip', damage: 4, range: 35, cooldown: 1 },
            { key: 'M', name: 'Crushing Embrace', damage: 7, range: 18, cooldown: 3 }
        ]},
        { name: 'Viper', moves: [
            { key: 'P', name: 'Spit', damage: 4, range: 50, cooldown: 1.5 },
            { key: 'E', name: 'Strike', damage: 5, range: 30, cooldown: 0.5 },
            { key: 'X', name: 'Fanged Bite', damage: 6, range: 20, cooldown: 0.8 },
            { key: 'Q', name: 'Sidewinder Dash', damage: 3, range: 25, cooldown: 1.2 },
            { key: 'M', name: 'Venom Spray', damage: 5, range: 45, cooldown: 2.5 }
        ]},
        { name: 'Titanoboa', maxHp: 50, moves: [
            { key: 'P', name: 'Crush', damage: 8, range: 40, cooldown: 0.7 },
            { key: 'E', name: 'Coil', damage: 4, range: 25, cooldown: 1 },
            { key: 'X', name: 'Massive Strike', damage: 9, range: 35, cooldown: 1 },
            { key: 'Q', name: 'Tail Slam', damage: 7, range: 40, cooldown: 1.3 },
            { key: 'M', name: 'Full Body Wrap', damage: 6, range: 20, cooldown: 3 }
        ], unlock: 'survive_5_days'}
    ],
    lizards: [
        { name: 'Gecko', moves: [
            { key: 'P', name: 'Bite', damage: 3, range: 25, cooldown: 0.5 },
            { key: 'E', name: 'Scratch', damage: 2, range: 20, cooldown: 0.8 },
            { key: 'X', name: 'Wall Climb', damage: 0, range: 10, cooldown: 1, dodge: true },
            { key: 'Q', name: 'Tail Whip', damage: 3, range: 30, cooldown: 1.2 },
            { key: 'M', name: 'Adhesive Grip', damage: 1, range: 15, cooldown: 2 }
        ]},
        { name: 'Iguana', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 28, cooldown: 0.6 },
            { key: 'E', name: 'Tail Whip', damage: 3, range: 35, cooldown: 1 },
            { key: 'X', name: 'Spiky Quill', damage: 4, range: 40, cooldown: 1.5 },
            { key: 'Q', name: 'Head Butt', damage: 5, range: 20, cooldown: 1.3 },
            { key: 'M', name: 'Powerful Tail Slam', damage: 6, range: 30, cooldown: 2.5 }
        ]},
        { name: 'Bearded Dragon', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 25, cooldown: 0.5 },
            { key: 'E', name: 'Flare', damage: 2, range: 40, cooldown: 1.5 },
            { key: 'X', name: 'Throat Expand', damage: 3, range: 50, cooldown: 2 },
            { key: 'Q', name: 'Front Leg Slash', damage: 4, range: 25, cooldown: 1 },
            { key: 'M', name: 'Full Intimidation', damage: 2, range: 60, cooldown: 3, stun: true }
        ]},
        { name: 'Blue-Tongued Skink', moves: [
            { key: 'P', name: 'Bite', damage: 5, range: 25, cooldown: 0.6 },
            { key: 'E', name: 'Hiss', damage: 0, range: 60, cooldown: 2, stun: true },
            { key: 'X', name: 'Tongue Strike', damage: 4, range: 40, cooldown: 1.2 },
            { key: 'Q', name: 'Body Shield', damage: 2, range: 15, cooldown: 1.5 },
            { key: 'M', name: 'Hypnotic Tongue', damage: 3, range: 45, cooldown: 2.5 }
        ]},
        { name: 'Komodo Dragon', maxHp: 50, moves: [
            { key: 'P', name: 'Bite', damage: 8, range: 30, cooldown: 0.7 },
            { key: 'E', name: 'Claw', damage: 6, range: 25, cooldown: 0.8 },
            { key: 'X', name: 'Venomous Strike', damage: 7, range: 35, cooldown: 1.2 },
            { key: 'Q', name: 'Crushing Tail', damage: 8, range: 40, cooldown: 1.5 },
            { key: 'M', name: 'Predator\'s Fury', damage: 9, range: 30, cooldown: 3 }
        ], unlock: 'survive_10_days'}
    ],
    monitors: [
        { name: 'Asian Water Monitor', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 28, cooldown: 0.5 },
            { key: 'E', name: 'Tail', damage: 3, range: 35, cooldown: 1 },
            { key: 'X', name: 'Water Dash', damage: 3, range: 30, cooldown: 1.2 },
            { key: 'Q', name: 'Swimming Strike', damage: 4, range: 25, cooldown: 1 },
            { key: 'M', name: 'Death Roll', damage: 6, range: 20, cooldown: 2.5 }
        ]},
        { name: 'African Monitor', moves: [
            { key: 'P', name: 'Bite', damage: 5, range: 30, cooldown: 0.6 },
            { key: 'E', name: 'Claw', damage: 4, range: 25, cooldown: 0.8 },
            { key: 'X', name: 'Desert Sprint', damage: 4, range: 35, cooldown: 1.3 },
            { key: 'Q', name: 'Charging Headbutt', damage: 6, range: 28, cooldown: 1.5 },
            { key: 'M', name: 'Scorching Breath', damage: 5, range: 45, cooldown: 2.5 }
        ]},
        { name: 'Lace Monitor', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 28, cooldown: 0.5 },
            { key: 'E', name: 'Slash', damage: 3, range: 30, cooldown: 0.9 },
            { key: 'X', name: 'Tree Climb', damage: 0, range: 10, cooldown: 1, dodge: true },
            { key: 'Q', name: 'Leaping Strike', damage: 5, range: 35, cooldown: 1.5 },
            { key: 'M', name: 'Cyclone Tail', damage: 6, range: 40, cooldown: 2.5 }
        ]},
        { name: 'Perentie', moves: [
            { key: 'P', name: 'Bite', damage: 6, range: 32, cooldown: 0.6 },
            { key: 'E', name: 'Claw', damage: 5, range: 28, cooldown: 0.8 },
            { key: 'X', name: 'Powerful Swipe', damage: 6, range: 30, cooldown: 1 },
            { key: 'Q', name: 'Hunter\'s Pounce', damage: 7, range: 25, cooldown: 1.5 },
            { key: 'M', name: 'Predator\'s Roar', damage: 5, range: 50, cooldown: 2 }
        ]},
        { name: 'Saltwater Monitor', maxHp: 50, moves: [
            { key: 'P', name: 'Bite', damage: 9, range: 35, cooldown: 0.7 },
            { key: 'E', name: 'Tail Slam', damage: 7, range: 40, cooldown: 1 },
            { key: 'X', name: 'Croc Spin', damage: 8, range: 25, cooldown: 1.2 },
            { key: 'Q', name: 'Water Lunge', damage: 9, range: 38, cooldown: 1.5 },
            { key: 'M', name: 'Apex Predator', damage: 10, range: 35, cooldown: 3 }
        ], unlock: 'survive_8_days'}
    ],
    turtles: [
        { name: 'Red-Eared Slider', maxHp: 45, moves: [
            { key: 'P', name: 'Bite', damage: 2, range: 15, cooldown: 0.6 },
            { key: 'E', name: 'Snap', damage: 3, range: 20, cooldown: 0.8 },
            { key: 'X', name: 'Shell Retract', damage: 0, range: 10, cooldown: 2, shield: true },
            { key: 'Q', name: 'Aquatic Glide', damage: 2, range: 25, cooldown: 1.2 },
            { key: 'M', name: 'Ancient Wisdom', damage: 1, range: 40, cooldown: 3, buff: true }
        ]},
        { name: 'Map Turtle', maxHp: 45, moves: [
            { key: 'P', name: 'Bite', damage: 3, range: 18, cooldown: 0.6 },
            { key: 'E', name: 'Snap', damage: 3, range: 22, cooldown: 0.8 },
            { key: 'X', name: 'Pattern Shift', damage: 1, range: 30, cooldown: 1.5, dodge: true },
            { key: 'Q', name: 'Water Sprint', damage: 3, range: 28, cooldown: 1 },
            { key: 'M', name: 'Navigation Sense', damage: 0, range: 50, cooldown: 2.5, sense: true }
        ]},
        { name: 'Snapping Turtle', maxHp: 45, moves: [
            { key: 'P', name: 'Snap', damage: 5, range: 22, cooldown: 0.5 },
            { key: 'E', name: 'Thrash', damage: 3, range: 25, cooldown: 1 },
            { key: 'X', name: 'Powerful Bite', damage: 6, range: 20, cooldown: 0.8 },
            { key: 'Q', name: 'Tail Whip', damage: 4, range: 30, cooldown: 1.3 },
            { key: 'M', name: 'Snapping Frenzy', damage: 7, range: 18, cooldown: 2.5 }
        ]},
        { name: 'Soft Shell', maxHp: 45, moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 20, cooldown: 0.6 },
            { key: 'E', name: 'Lunge', damage: 3, range: 28, cooldown: 0.9 },
            { key: 'X', name: 'Quick Strike', damage: 5, range: 22, cooldown: 0.7 },
            { key: 'Q', name: 'Flexible Dash', damage: 3, range: 32, cooldown: 1.2 },
            { key: 'M', name: 'Rapid Fury', damage: 6, range: 20, cooldown: 2 }
        ]},
        { name: 'Giant Tortoise', maxHp: 65, moves: [
            { key: 'P', name: 'Bite', damage: 3, range: 18, cooldown: 0.8 },
            { key: 'E', name: 'Ram', damage: 6, range: 25, cooldown: 1.2 },
            { key: 'X', name: 'Heavy Shell Defense', damage: 1, range: 15, cooldown: 2, shield: true },
            { key: 'Q', name: 'Slow Crushing', damage: 5, range: 20, cooldown: 1.5 },
            { key: 'M', name: 'Unstoppable Force', damage: 8, range: 25, cooldown: 3 }
        ], unlock: 'survive_12_days'}
    ],
    crocodiles: [
        { name: 'Gharial', moves: [
            { key: 'P', name: 'Bite', damage: 5, range: 32, cooldown: 0.6 },
            { key: 'E', name: 'Tail', damage: 4, range: 38, cooldown: 1 },
            { key: 'X', name: 'Jaw Clamp', damage: 6, range: 28, cooldown: 0.8 },
            { key: 'Q', name: 'Tail Sweep', damage: 5, range: 40, cooldown: 1.3 },
            { key: 'M', name: 'River Hunter', damage: 7, range: 35, cooldown: 2.5 }
        ]},
        { name: 'Saltwater Croc', maxHp: 50, moves: [
            { key: 'P', name: 'Bite', damage: 7, range: 35, cooldown: 0.6 },
            { key: 'E', name: 'Death Roll', damage: 6, range: 40, cooldown: 1.5 },
            { key: 'X', name: 'Apex Bite', damage: 8, range: 32, cooldown: 0.8 },
            { key: 'Q', name: 'Spinning Fury', damage: 7, range: 35, cooldown: 1.3 },
            { key: 'M', name: 'Prehistoric Wrath', damage: 9, range: 38, cooldown: 3 }
        ], unlock: 'survive_12_days'},
        { name: 'Nile Croc', maxHp: 48, moves: [
            { key: 'P', name: 'Bite', damage: 6, range: 33, cooldown: 0.6 },
            { key: 'E', name: 'Tail Whip', damage: 5, range: 36, cooldown: 1 },
            { key: 'X', name: 'Water Ambush', damage: 5, range: 40, cooldown: 1.2 },
            { key: 'Q', name: 'Crushing Jaw', damage: 7, range: 30, cooldown: 1.3 },
            { key: 'M', name: 'Apex Predator', damage: 8, range: 35, cooldown: 2.5 }
        ]},
        { name: 'American Croc', maxHp: 46, moves: [
            { key: 'P', name: 'Bite', damage: 6, range: 34, cooldown: 0.6 },
            { key: 'E', name: 'Tail Slam', damage: 5, range: 37, cooldown: 1 },
            { key: 'X', name: 'Powerful Lunge', damage: 6, range: 32, cooldown: 1.1 },
            { key: 'Q', name: 'Swamp Hunter', damage: 6, range: 38, cooldown: 1.4 },
            { key: 'M', name: 'Ancient Power', damage: 8, range: 34, cooldown: 2.5 }
        ]}
    ]
};

// Random enemy species
const ENEMY_SPECIES = [
    { name: 'Monitor', hp: 20, moves: ['Bite', 'Tail'] },
    { name: 'Komodo', hp: 25, moves: ['Bite', 'Claw'] },
    { name: 'Bear', hp: 30, moves: ['Swipe', 'Growl'] },
    { name: 'Lion', hp: 28, moves: ['Roar', 'Pounce'] },
    { name: 'Eagle', hp: 15, moves: ['Talons', 'Dive'] },
    { name: 'Python', hp: 18, moves: ['Squeeze', 'Strike'] },
    { name: 'Hyena', hp: 22, moves: ['Bite', 'Laugh'] },
    { name: 'Alligator', hp: 28, moves: ['Bite', 'Tail'] }
];

// Canvas setup
const canvas = document.getElementById('screen');
const ctx = canvas ? canvas.getContext('2d') : null;

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = 800;
    canvas.height = 600;
}

if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// ─── UI: Character Select ───────────────────────────────────────────────────
function initCharacterSelect() {
    console.log('initCharacterSelect called');
    const typeBtn = document.getElementById('typeButtons');
    if (!typeBtn) {
        console.error('typeButtons element not found');
        return;
    }

    typeBtn.innerHTML = Object.keys(SPECIES_DATA).map(type =>
        `<button class="animal-btn" onclick="selectType('${type}')">${type[0].toUpperCase() + type.slice(1)}</button>`
    ).join('');

    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.onclick = startGame;
        console.log('startBtn click handler attached');
    } else {
        console.error('startBtn element not found');
    }
}

function selectType(type) {
    gameState.selectedType = type;
    gameState.selectedSpecies = null;

    document.querySelectorAll('.animal-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Show species
    const speciesContainer = document.getElementById('speciesSelect');
    speciesContainer.innerHTML = SPECIES_DATA[type].map((sp, idx) => {
        const unlocked = !sp.unlock || (sp.unlock === 'survive_5_days' && gameState.day >= 5) || (sp.unlock === 'survive_10_days' && gameState.day >= 10) || (sp.unlock === 'survive_12_days' && gameState.day >= 12);
        return `<button class="species-btn" ${!unlocked ? 'disabled' : ''} onclick="selectSpecies('${type}', ${idx})">${sp.name}</button>`;
    }).join('');
    speciesContainer.classList.add('active');
    document.getElementById('startBtn').disabled = true;
}

function selectSpecies(type, idx) {
    gameState.selectedType = type;
    gameState.selectedSpecies = idx;

    document.querySelectorAll('.species-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('startBtn').disabled = false;
}

function startGame() {
    console.log('startGame called');
    console.log('selectedType:', gameState.selectedType, 'selectedSpecies:', gameState.selectedSpecies);

    if (!gameState.selectedType || gameState.selectedSpecies === null) {
        console.warn('No species selected');
        return;
    }

    const species = SPECIES_DATA[gameState.selectedType][gameState.selectedSpecies];
    console.log('Starting with species:', species.name);

    gameState.maxHp = species.maxHp || 30;
    gameState.hp = gameState.maxHp;
    gameState.energy = 15;
    gameState.kills = 0;
    gameState.score = 0;
    gameState.startedAt = Date.now();
    gameState.dayStartTime = Date.now();
    gameState.day = 1;
    gameState.lastEnemySpawn = Date.now();
    gameState.lastEnemySpawnTime = Date.now();
    gameState.gameRunning = true;
    gameState.currentScreen = 'game';

    document.getElementById('characterSelect').classList.remove('active');
    if (canvas) {
        canvas.classList.add('active');
    } else {
        console.error('Canvas element not found');
    }

    gameState.player = { x: 400, y: 300, radius: 3, species, type: gameState.selectedType };

    // Generate the world
    generateWorld();
    spawnEnemy();
    console.log('Starting game loop');
    gameLoop();
}

// ─── Game Loop ────────────────────────────────────────────────────────────
const input = {};
window.addEventListener('keydown', (e) => { input[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { input[e.key.toLowerCase()] = false; });

function gameLoop() {
    if (!gameState.gameRunning) return;

    // Update
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    updateEnergy();
    checkDayChange();
    checkCollisions();
    checkDeath();

    // Render
    render();

    // Auto-save every 30 seconds
    if (Date.now() - (gameState.lastSavedAt || 0) > 30000) {
        saveGame();
    }

    requestAnimationFrame(gameLoop);
}

function updatePlayer() {
    const speed = 2;
    let newX = gameState.player.x;
    let newY = gameState.player.y;

    if (input['arrowup'] || input['w']) newY -= speed;
    if (input['arrowdown'] || input['s']) newY += speed;
    if (input['arrowleft'] || input['a']) newX -= speed;
    if (input['arrowright'] || input['d']) newX += speed;

    // Check collision with obstacles
    let canMove = true;
    for (let obs of gameState.obstacles) {
        const dist = Math.hypot(newX - obs.x, newY - obs.y);
        if (dist < obs.radius + gameState.player.radius + 2) {
            canMove = false;
            break;
        }
    }

    if (canMove) {
        gameState.player.x = newX;
        gameState.player.y = newY;
    }

    gameState.player.x = Math.max(10, Math.min(790, gameState.player.x));
    gameState.player.y = Math.max(10, Math.min(590, gameState.player.y));

    // Attack input
    const species = gameState.player.species;
    if (input['p'] && !input['p_pressed']) { attack(0, species); input['p_pressed'] = true; }
    if (!input['p']) input['p_pressed'] = false;

    if (input['e'] && !input['e_pressed']) { attack(1, species); input['e_pressed'] = true; }
    if (!input['e']) input['e_pressed'] = false;

    if (input['x'] && !input['x_pressed']) { attack(2, species); input['x_pressed'] = true; }
    if (!input['x']) input['x_pressed'] = false;

    if (input['q'] && !input['q_pressed']) { attack(3, species); input['q_pressed'] = true; }
    if (!input['q']) input['q_pressed'] = false;

    if (input['m'] && !input['m_pressed']) { attack(4, species); input['m_pressed'] = true; }
    if (!input['m']) input['m_pressed'] = false;

    // Jump feedback
    if (input[' '] && !input['space_pressed']) {
        gameState.player.jumpTime = 200;
        input['space_pressed'] = true;
    }
    if (!input[' ']) input['space_pressed'] = false;

    if (gameState.player.jumpTime) {
        gameState.player.jumpTime -= 16;
    }
}

function attack(moveIndex, species) {
    const move = species.moves[moveIndex];
    if (!move) return;

    // Find nearest enemy to aim at
    let nearestEnemy = null;
    let nearestDist = Infinity;
    gameState.enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - gameState.player.x, enemy.y - gameState.player.y);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = enemy;
        }
    });

    // If no enemy, don't attack
    if (!nearestEnemy) return;

    // Aim at nearest enemy
    const angle = Math.atan2(nearestEnemy.y - gameState.player.y, nearestEnemy.x - gameState.player.x);
    gameState.projectiles.push({
        x: gameState.player.x,
        y: gameState.player.y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        damage: move.damage,
        range: move.range,
        owner: 'player',
        distTraveled: 0
    });
}

function updateEnemies() {
    gameState.enemies.forEach(enemy => {
        // Simple AI: move towards player
        const dx = gameState.player.x - enemy.x;
        const dy = gameState.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            enemy.x += (dx / dist) * 1;
            enemy.y += (dy / dist) * 1;
        }

        // Attack if close
        if (dist < 60) {
            if (!enemy.lastAttack || Date.now() - enemy.lastAttack > 1000) {
                gameState.projectiles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: (dx / dist) * 3,
                    vy: (dy / dist) * 3,
                    damage: 3 + enemy.difficulty,
                    owner: 'enemy'
                });
                enemy.lastAttack = Date.now();
            }
        }
    });
}

function updateProjectiles() {
    gameState.projectiles = gameState.projectiles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.distTraveled = (p.distTraveled || 0) + Math.hypot(p.vx, p.vy);

        // Check if projectile hit obstacle
        for (let obs of gameState.obstacles) {
            const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
            if (dist < obs.radius + 2) {
                return false; // Remove projectile, blocked by obstacle
            }
        }

        return p.x > 0 && p.x < 800 && p.y > 0 && p.y < 600 && (!p.range || p.distTraveled < p.range);
    });
}

function updateEnergy() {
    gameState.energy = Math.max(0, gameState.energy - 0.033 / 60); // drain 2 per minute

    // Regen HP at full energy
    if (gameState.energy >= gameState.maxEnergy && gameState.hp < gameState.maxHp) {
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + 0.067); // 2 per 5 sec
    }
}

function checkDayChange() {
    const elapsed = Date.now() - gameState.dayStartTime;
    if (elapsed > gameState.nightCycle) {
        gameState.day++;
        gameState.dayStartTime = Date.now();
        spawnEnemy();
    }

    // Also spawn enemies at regular intervals (every 20 seconds)
    if (Date.now() - gameState.lastEnemySpawnTime > 20000) {
        const spec = ENEMY_SPECIES[Math.floor(Math.random() * ENEMY_SPECIES.length)];
        const baseDiff = Math.floor(gameState.day / 5);

        let x, y, validSpawn = false;
        while (!validSpawn) {
            x = Math.random() * 800;
            y = Math.random() * 600;
            const dist = Math.hypot(x - gameState.player.x, y - gameState.player.y);
            validSpawn = dist > 150;
        }

        gameState.enemies.push({
            ...spec,
            x,
            y,
            hp: spec.hp + baseDiff * 5,
            maxHp: spec.hp + baseDiff * 5,
            difficulty: Math.max(1, baseDiff)
        });

        gameState.lastEnemySpawnTime = Date.now();
    }
}

function generateWorld() {
    // Generate obstacles (trees/rocks)
    gameState.obstacles = [];
    for (let i = 0; i < 12; i++) {
        gameState.obstacles.push({
            x: Math.random() * 800,
            y: Math.random() * 600,
            radius: 12,
            type: Math.random() > 0.5 ? 'tree' : 'rock'
        });
    }

    // Generate water holes
    gameState.waterHoles = [];
    for (let i = 0; i < 4; i++) {
        gameState.waterHoles.push({
            x: Math.random() * 800,
            y: Math.random() * 600,
            radius: 10
        });
    }
}

function spawnEnemy() {
    // Spawn 1-2 enemies per day change
    const count = Math.random() > 0.4 ? 1 : 2;
    for (let i = 0; i < count; i++) {
        const spec = ENEMY_SPECIES[Math.floor(Math.random() * ENEMY_SPECIES.length)];
        const baseDiff = Math.floor(gameState.day / 5);
        let x, y, validSpawn = false;

        // Try to spawn away from player
        while (!validSpawn) {
            x = Math.random() * 800;
            y = Math.random() * 600;
            const dist = Math.hypot(x - gameState.player.x, y - gameState.player.y);
            validSpawn = dist > 150;
        }

        gameState.enemies.push({
            ...spec,
            x,
            y,
            hp: spec.hp + baseDiff * 5,
            maxHp: spec.hp + baseDiff * 5,
            difficulty: Math.max(1, baseDiff)
        });
    }
}

function checkCollisions() {
    gameState.projectiles.forEach((proj, pidx) => {
        if (proj.owner === 'player') {
            gameState.enemies.forEach((enemy, eidx) => {
                const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
                if (dist < 10) {
                    enemy.hp -= proj.damage;
                    gameState.projectiles.splice(pidx, 1);
                    if (enemy.hp <= 0) {
                        // Drop food when enemy dies
                        gameState.foodItems.push({ x: enemy.x, y: enemy.y, energy: 5 });
                        gameState.enemies.splice(eidx, 1);
                        gameState.kills++;
                        gameState.score += 100;
                    }
                }
            });
        } else {
            const dist = Math.hypot(proj.x - gameState.player.x, proj.y - gameState.player.y);
            if (dist < 5) {
                gameState.hp -= proj.damage;
                gameState.projectiles.splice(pidx, 1);
            }
        }
    });

    // Check if player collides with food
    gameState.foodItems = gameState.foodItems.filter(food => {
        const dist = Math.hypot(food.x - gameState.player.x, food.y - gameState.player.y);
        if (dist < 8) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + food.energy);
            return false; // remove food
        }
        return true;
    });

    // Check if player collides with water (drinking)
    gameState.waterHoles.forEach(water => {
        const dist = Math.hypot(water.x - gameState.player.x, water.y - gameState.player.y);
        if (dist < water.radius + 5) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 0.5); // slow drip of water
        }
    });
}

function checkDeath() {
    if (gameState.hp <= 0 || gameState.energy <= 0) {
        gameState.gameRunning = false;
        gameState.currentScreen = 'characterSelect';
        document.getElementById('characterSelect').classList.add('active');
        canvas.classList.remove('active');
        initCharacterSelect();
    }
}

// ─── Rendering ────────────────────────────────────────────────────────────
function render() {
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 800, 600);

    // Draw obstacles (trees/rocks)
    gameState.obstacles.forEach(obs => {
        ctx.fillStyle = obs.type === 'tree' ? '#228B22' : '#8B8680';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw water holes
    ctx.fillStyle = '#4A90E2';
    gameState.waterHoles.forEach(water => {
        ctx.beginPath();
        ctx.arc(water.x, water.y, water.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2E5C8A';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw player
    ctx.fillStyle = '#22c55e';
    if (gameState.player.jumpTime) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(gameState.player.x, gameState.player.y - 10, gameState.player.radius + 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, gameState.player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw enemies
    ctx.fillStyle = '#ef4444';
    gameState.enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 4, 0, Math.PI * 2);
        ctx.fill();
        // HP bar
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - 8, enemy.y - 12, 16, 2);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(enemy.x - 8, enemy.y - 12, 16 * (enemy.hp / enemy.maxHp), 2);
    });

    // Draw projectiles
    ctx.fillStyle = '#fbbf24';
    gameState.projectiles.forEach(proj => {
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw food items
    ctx.fillStyle = '#84cc16';
    gameState.foodItems.forEach(food => {
        ctx.beginPath();
        ctx.arc(food.x, food.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw current moves on canvas with details
    if (gameState.player && gameState.player.species) {
        const moves = gameState.player.species.moves;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 530, 790, 65);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('MOVES:', 10, 545);

        moves.forEach((move, idx) => {
            const x = 70 + (idx * 150);
            const y = 545;
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`${move.key.toUpperCase()}`, x, y);
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.fillText(`${move.name}`, x, y + 12);
            ctx.fillText(`DMG:${move.damage} RNG:${move.range}`, x, y + 24);
        });
    }

    // Update UI
    document.getElementById('dayIndicator').textContent = `Day ${gameState.day} ${gameState.isNight ? '🌙' : '☀️'}`;
    document.getElementById('killCount').textContent = `Kills: ${gameState.kills}`;
    document.getElementById('hpBar').style.width = (gameState.hp / gameState.maxHp * 100) + '%';
    document.getElementById('energyBar').style.width = (gameState.energy / gameState.maxEnergy * 100) + '%';
}

// ─── Save/Load ────────────────────────────────────────────────────────────
async function saveGame() {
    const state = {
        day: gameState.day,
        hp: gameState.hp,
        maxHp: gameState.maxHp,
        energy: gameState.energy,
        kills: gameState.kills,
        score: gameState.score,
        selectedType: gameState.selectedType,
        selectedSpecies: gameState.selectedSpecies,
        playerX: gameState.player?.x,
        playerY: gameState.player?.y
    };

    try {
        const res = await fetch(`${API_BASE}/api/game-save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: GAME_NAME, state })
        });
        const data = await res.json();
        if (data.ok) {
            gameState.lastSavedAt = Date.now();
            document.getElementById('saveStatus').textContent = '✓ Saved';
        }
    } catch (e) {
        console.error('Save failed:', e);
        document.getElementById('saveStatus').textContent = '✗ Save failed';
    }
}

async function loadGame() {
    try {
        const res = await fetch(`${API_BASE}/api/game-load?game=${GAME_NAME}`);
        const data = await res.json();
        if (data.ok) {
            const state = data.state;
            gameState.day = state.day;
            gameState.hp = state.hp;
            gameState.maxHp = state.maxHp;
            gameState.energy = state.energy;
            gameState.kills = state.kills;
            gameState.score = state.score;
            gameState.selectedType = state.selectedType;
            gameState.selectedSpecies = state.selectedSpecies;
            return true;
        }
    } catch (e) {
        console.error('Load failed:', e);
    }
    return false;
}

// ─── Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCharacterSelect();
});
