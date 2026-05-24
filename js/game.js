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
    obstacles: [],
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
    nightCycle: 5 * 60 * 1000, // 5 minutes = 1 day
    lastEnemySpawn: 0,
    isNight: false,
    gameRunning: false,
};

// Species database
const SPECIES_DATA = {
    snakes: [
        { name: 'Green Snake', moves: [
            { key: 'P', name: 'Strike', damage: 4, range: 30, cooldown: 0.5 },
            { key: 'E', name: 'Coil', damage: 2, range: 20, cooldown: 0.8 }
        ]},
        { name: 'Cobra', moves: [
            { key: 'P', name: 'Strike', damage: 5, range: 35, cooldown: 0.5 },
            { key: 'E', name: 'Hood Spread', damage: 3, range: 40, cooldown: 1.2 }
        ]},
        { name: 'Python', moves: [
            { key: 'P', name: 'Squeeze', damage: 6, range: 25, cooldown: 0.6 },
            { key: 'E', name: 'Coil', damage: 2, range: 20, cooldown: 0.8 }
        ]},
        { name: 'Viper', moves: [
            { key: 'P', name: 'Spit', damage: 4, range: 50, cooldown: 1.5, poison: true },
            { key: 'E', name: 'Strike', damage: 5, range: 30, cooldown: 0.5 }
        ]},
        { name: 'Titanoboa', maxHp: 50, moves: [
            { key: 'P', name: 'Crush', damage: 8, range: 40, cooldown: 0.7 },
            { key: 'E', name: 'Coil', damage: 4, range: 25, cooldown: 1 }
        ], unlock: 'survive_5_days'}
    ],
    lizards: [
        { name: 'Gecko', moves: [
            { key: 'P', name: 'Bite', damage: 3, range: 25, cooldown: 0.5 },
            { key: 'E', name: 'Scratch', damage: 2, range: 20, cooldown: 0.8 }
        ]},
        { name: 'Iguana', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 28, cooldown: 0.6 },
            { key: 'E', name: 'Tail Whip', damage: 3, range: 35, cooldown: 1 }
        ]},
        { name: 'Bearded Dragon', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 25, cooldown: 0.5 },
            { key: 'E', name: 'Flare', damage: 2, range: 40, cooldown: 1.5 }
        ]},
        { name: 'Blue-Tongued Skink', moves: [
            { key: 'P', name: 'Bite', damage: 5, range: 25, cooldown: 0.6 },
            { key: 'E', name: 'Hiss', damage: 0, range: 60, cooldown: 2, stun: true }
        ]},
        { name: 'Komodo Dragon', maxHp: 50, moves: [
            { key: 'P', name: 'Bite', damage: 8, range: 30, cooldown: 0.7 },
            { key: 'E', name: 'Claw', damage: 6, range: 25, cooldown: 0.8 }
        ], unlock: 'survive_10_days'}
    ],
    monitors: [
        { name: 'Asian Water Monitor', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 28, cooldown: 0.5 },
            { key: 'E', name: 'Tail', damage: 3, range: 35, cooldown: 1 }
        ]},
        { name: 'African Monitor', moves: [
            { key: 'P', name: 'Bite', damage: 5, range: 30, cooldown: 0.6 },
            { key: 'E', name: 'Claw', damage: 4, range: 25, cooldown: 0.8 }
        ]},
        { name: 'Lace Monitor', moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 28, cooldown: 0.5 },
            { key: 'E', name: 'Slash', damage: 3, range: 30, cooldown: 0.9 }
        ]},
        { name: 'Perentie', moves: [
            { key: 'P', name: 'Bite', damage: 6, range: 32, cooldown: 0.6 },
            { key: 'E', name: 'Claw', damage: 5, range: 28, cooldown: 0.8 }
        ]},
        { name: 'Saltwater Monitor', maxHp: 50, moves: [
            { key: 'P', name: 'Bite', damage: 9, range: 35, cooldown: 0.7 },
            { key: 'E', name: 'Tail Slam', damage: 7, range: 40, cooldown: 1 }
        ], unlock: 'survive_8_days'}
    ],
    turtles: [
        { name: 'Red-Eared Slider', maxHp: 45, moves: [
            { key: 'P', name: 'Bite', damage: 2, range: 15, cooldown: 0.6 },
            { key: 'E', name: 'Snap', damage: 3, range: 20, cooldown: 0.8 }
        ]},
        { name: 'Map Turtle', maxHp: 45, moves: [
            { key: 'P', name: 'Bite', damage: 3, range: 18, cooldown: 0.6 },
            { key: 'E', name: 'Snap', damage: 3, range: 22, cooldown: 0.8 }
        ]},
        { name: 'Snapping Turtle', maxHp: 45, moves: [
            { key: 'P', name: 'Snap', damage: 5, range: 22, cooldown: 0.5 },
            { key: 'E', name: 'Thrash', damage: 3, range: 25, cooldown: 1 }
        ]},
        { name: 'Soft Shell', maxHp: 45, moves: [
            { key: 'P', name: 'Bite', damage: 4, range: 20, cooldown: 0.6 },
            { key: 'E', name: 'Lunge', damage: 3, range: 28, cooldown: 0.9 }
        ]},
        { name: 'Giant Tortoise', maxHp: 65, moves: [
            { key: 'P', name: 'Bite', damage: 3, range: 18, cooldown: 0.8 },
            { key: 'E', name: 'Ram', damage: 6, range: 25, cooldown: 1.2 }
        ], unlock: 'survive_12_days'}
    ],
    crocodiles: [
        { name: 'Gharial', moves: [
            { key: 'P', name: 'Bite', damage: 5, range: 32, cooldown: 0.6 },
            { key: 'E', name: 'Tail', damage: 4, range: 38, cooldown: 1 }
        ]},
        { name: 'Saltwater Croc', maxHp: 50, moves: [
            { key: 'P', name: 'Bite', damage: 7, range: 35, cooldown: 0.6 },
            { key: 'E', name: 'Death Roll', damage: 6, range: 40, cooldown: 1.5 }
        ], unlock: 'survive_12_days'}
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
    gameState.gameRunning = true;
    gameState.currentScreen = 'game';

    document.getElementById('characterSelect').classList.remove('active');
    if (canvas) {
        canvas.classList.add('active');
    } else {
        console.error('Canvas element not found');
    }

    gameState.player = { x: 400, y: 300, radius: 3, species, type: gameState.selectedType };
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
    if (input['arrowup'] || input['w']) gameState.player.y -= speed;
    if (input['arrowdown'] || input['s']) gameState.player.y += speed;
    if (input['arrowleft'] || input['a']) gameState.player.x -= speed;
    if (input['arrowright'] || input['d']) gameState.player.x += speed;

    gameState.player.x = Math.max(10, Math.min(790, gameState.player.x));
    gameState.player.y = Math.max(10, Math.min(590, gameState.player.y));

    // Attack input
    const species = gameState.player.species;
    if (input['p'] && !input['p_pressed']) { attack(0, species); input['p_pressed'] = true; }
    if (!input['p']) input['p_pressed'] = false;

    if (input['e'] && !input['e_pressed']) { attack(1, species); input['e_pressed'] = true; }
    if (!input['e']) input['e_pressed'] = false;

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

    const angle = Math.atan2(gameState.player.y - 300, gameState.player.x - 400);
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
}

function spawnEnemy() {
    const spec = ENEMY_SPECIES[Math.floor(Math.random() * ENEMY_SPECIES.length)];
    const baseDiff = Math.floor(gameState.day / 5);
    gameState.enemies.push({
        ...spec,
        x: Math.random() * 800,
        y: Math.random() * 600,
        hp: spec.hp + baseDiff * 5,
        maxHp: spec.hp + baseDiff * 5,
        difficulty: Math.max(1, baseDiff)
    });
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
