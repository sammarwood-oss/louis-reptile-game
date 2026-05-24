# Louis's Reptile Survival Game — Complete Design Overview

## Game Concept

A browser-based real-time survival game where the player picks a reptile species and fights random animals in an endless arena. The goal is to survive as long as possible by managing health and energy resources while defeating enemies and avoiding obstacles.

**Play at:** https://sammarwood.github.io/louis-reptile-game/

---

## Core Gameplay Loop

1. **Pick Species** → Choose from 25 reptile species (5 types × 5 variants)
2. **Survive** → Arena fills with random enemy animals
3. **Fight** → Attack with species-specific abilities (Z, X, C, V, B keys)
4. **Manage Resources** → Balance health and energy
5. **Die** → Pick a new species and try again (endless run)

---

## Game Features

### Character Selection
- **5 Animal Types:** Snakes, Lizards, Monitors, Turtles, Crocodiles
- **5 Species per Type:** Each with unique:
  - Base health (30-65 HP depending on species)
  - 5 attack moves with different damage/range
  - Unlock conditions (e.g., "survive 5 days" to unlock Titanoboa)
- **No progress loss** — Each death returns to character select

### Movement & Arena
- **800×600 fixed viewport** (entire world visible)
- **Arrow keys** to move (4 directions)
- **Obstacles block movement:**
  - Brown trees (12 random per game)
  - Grey rocks (12 random per game)
  - Both block player and enemy movement
- **Space bar** triggers jump animation

### Combat System
- **Instant melee attacks** — No projectiles
- **5 Attack Keys:** Z, X, C, V, B
  - Each move has unique damage, range, name
  - Mouth opens briefly when attacking (visual feedback)
  - Damage all enemies within attack range simultaneously
  - Display shows move name, damage, and range on left side
- **Different Enemy Types:** 8 species with unique colors:
  - Monitor (red), Komodo (dark red), Bear (brown), Lion (orange)
  - Eagle (gold), Python (purple), Hyena (tomato), Alligator (green)

### Resource Management

**Health (Red Bar)**
- Base: 30 HP (varies by species: turtles 45, some 50-65)
- Damaged by enemy attacks (3-5 damage per hit, scales with difficulty)
- **Restoration:** 
  - Stand in blue water pools → +5 HP/sec (continuous)
  - Pick up enemy drops (after killing) → +10 HP (instant)
- Death condition: Health ≤ 0

**Energy (Blue Bar)**
- Max: 15
- Drain: 2 per minute (continuous, real-time)
- **Restoration:**
  - Water pools → Does NOT restore energy (only health)
  - Currently no energy restoration method (design gap)
- Death condition: Energy ≤ 0

**Enemy Drops**
- When enemy dies → Red drop appears at death location
- Pick up drop → Restore +10 health
- Yellow food items no longer in game (replaced by health drops)

### Water Pools
- **4 pools per game** (blue circles, random locations)
- **Dry up after 60 seconds** (visual fade effect)
- **Ripple animation** (expanding circles while active)
- **Restore +5 HP/sec** while standing in them
- Forces players to find health through combat rather than camping

### Progression & Difficulty

**Day/Night Cycle**
- 1 day = 45 seconds of real time
- Day counter in top-left corner (☀️ for day, 🌙 for night indicator)
- Enemies get harder each day

**Enemy Scaling**
- Spawns every 20 seconds (1-2 enemies per spawn)
- Difficulty tier = day ÷ 5
- Enemy HP and damage scale with difficulty
- Base HP ranges: 15-30 HP per species
- Scaled HP: base + (difficulty × 5)

**Scoring**
- Kill count tracker
- +100 points per enemy killed
- Score displayed but not used for gameplay

### Visual Effects
- **Attack Animation:** Orange/red flame particles radiate outward, fade after 300ms
- **Water Ripples:** Expanding circles that fade as pools dry up
- **Enemy Colors:** Each enemy type has distinct color (helps identify threats)
- **HP Bars:** Above each enemy, color-matched to their body

### Save/Load System
- **Auto-save every 30 seconds** → POST to server
- **Load on startup** → GET from server (optional)
- **Persists:** Day, HP, Energy, Kills, Score, Player position, Species
- **Server:** 62.238.7.80/inbox/api/game-save and /api/game-load

---

## Current Implementation Status

### ✅ Fully Working
- Character select UI with 25 species
- Movement with arrow keys and obstacle collision
- Attack system (Z/X/C/V/B) with melee damage
- 8 different enemy types with unique colors
- Enemy AI (move toward player, attack in range)
- Enemy spawning every 20 seconds
- Water pools with healing (+5 HP/sec) and ripple animations
- Water pools dry up after 60 seconds
- Enemy drops restore health (+10 HP)
- Health and energy bars
- Day counter (45 sec per day)
- Kill counter
- Score tracking
- Attack animations (flame ripples)
- Mouth animation on attack
- Move display on left side (name, damage, range)
- Auto-save to server every 30 seconds
- Difficulty scaling based on day

### ⚠️ Design Gaps / Issues
1. **No energy restoration method** — Energy only drains, never restores
   - Need to add food/eating mechanic
   - Or restore energy from water
   - Currently game is unwinnable (will run out of energy)

2. **Mouth animation is very subtle** — Barely visible
   - Could make it larger or more dramatic

3. **Attack effects could be more distinct** — All moves use same orange flame effect
   - Could add different colors per move (Z=blue, X=green, etc.)
   - Or different particle patterns per species

4. **Canvas might be too small** — Hard to see detailed animations
   - Could scale up to 1000×700 or 1200×800

5. **No win condition** — Game is infinite until death
   - Consider adding milestone bonuses or endless progression modes

6. **Enemy pathfinding is naive** — Enemies walk straight through obstacles
   - Fixed but could be improved with better AI

7. **No sound/audio** — Game is silent
   - Could add attack sounds, enemy sounds, music

8. **UI could be clearer** — Move descriptions on left are small text
   - Could add better labeling or tooltips

---

## Technical Stack

- **Frontend:** HTML5 Canvas, Vanilla JavaScript (no frameworks)
- **Backend:** Python Flask (inbox_app.py on 62.238.7.80)
- **Hosting:** GitHub Pages (https://sammarwood.github.io/louis-reptile-game/)
- **Database:** JSON file on server (game_saves.json)
- **Architecture:** Single-file game.js (all logic, rendering, state management)

### Key Code Sections
- `gameState` — Central game state object
- `SPECIES_DATA` — 25 reptile species with moves (5 moves each)
- `ENEMY_SPECIES` — 8 enemy animals with base stats
- `gameLoop()` — 60 FPS main loop
- `updatePlayer()` — Input handling, movement, collision
- `updateEnemies()` — Enemy AI, movement, attacks
- `attack()` — Damage calculation, enemy death, drops
- `render()` — Canvas drawing, animations, UI

---

## Improvement Suggestions for Another LLM

### High Priority
1. **Fix energy system** — Add energy restoration (food, water, or other mechanic)
2. **Improve attack visibility** — Make flame effects bigger, add move-specific colors
3. **Better move feedback** — Show which move hits, damage numbers, hit animations

### Medium Priority
1. **Enhanced enemy AI** — Pathfinding around obstacles, tactical behavior
2. **Game balance tweaking** — Enemy difficulty curve, health/damage scaling
3. **Better UI/UX** — Clearer move descriptions, better health/energy displays
4. **Canvas scaling** — Make game bigger for better visibility

### Nice to Have
1. **Sound effects** — Attack sounds, enemy sounds, background music
2. **Particle effects** — More dramatic explosions, hit effects
3. **Enemy variety** — More enemy types or behaviors
4. **Unlockable content** — Cosmetics, skins, titles for milestones
5. **Leaderboard** — Track high scores across plays
6. **Mobile support** — Touch controls for mobile devices

---

## Files & URLs

- **GitHub Repo:** https://github.com/sammarwood-oss/louis-reptile-game
- **Live Game:** https://sammarwood.github.io/louis-reptile-game/
- **Main Code:** `/tmp/louis-reptile-game/js/game.js` (~750 lines)
- **HTML:** `/tmp/louis-reptile-game/index.html`
- **API Endpoints:**
  - POST `62.238.7.80/inbox/api/game-save` — Save game state
  - GET `62.238.7.80/inbox/api/game-load?game=louis-reptile` — Load game state

---

## Next Review Priorities

1. **Energy Restoration** — Game is currently unwinnable (critical)
2. **Attack Clarity** — Make it obvious when you hit something
3. **Difficulty Balance** — Is it too hard? Too easy? Just right?
4. **Performance** — Any lag or frame drops?
5. **Mobile Playability** — Does it work on phones/tablets?

---

Generated: 2026-05-24 | Game Status: PLAYABLE BUT INCOMPLETE
