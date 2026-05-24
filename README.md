# Louis's Reptile Survival Game

A browser-based survival game where you pick a reptile and survive as long as possible.

## How to Play

1. **Pick your reptile:** Choose from snakes, lizards, monitors, turtles, or crocodiles
2. **Select a species:** Each type has 5 variants with different abilities
3. **Survive:** 
   - Move with **arrow keys**
   - Attack with **P, E, X, Q, M** (different moves for your species)
   - Jump with **SPACE**
   - Manage your **HP** (health) and **Energy** (stamina)
4. **Fight enemies:** Random animals spawn each day — defeat them to earn points
5. **Progress:** Survive longer to unlock stronger species variants

## Controls

| Key | Action |
|-----|--------|
| ⬅️➡️⬆️⬇️ | Move |
| P / E / X / Q / M | Attack (species abilities) |
| SPACE | Jump |

## Stats

- **HP:** Health. Regenerates 2 per 5 seconds when you have full energy
- **Energy:** Stamina. Drains 2 per minute. Drink (+1) or eat (+2) to restore
- **Day/Night:** Cycles every 5 minutes. Enemies get harder as days progress
- **Kills:** Enemies defeated

## Deployment

Game runs in the browser. Progress automatically saves to the server every 30 seconds.

**Play at:** https://sammarwood.github.io/louis-reptile-game/

## Features

- Character select with 25 species to choose from
- Real-time combat with projectiles
- Enemy AI that hunts you
- Energy/HP management
- Persistent save/load to server
- Day/night cycle progression
- Infinite gameplay until death

## Tech Stack

- HTML5 Canvas for rendering
- Vanilla JavaScript (no frameworks)
- Server-side save/load via REST API
- Hosted on GitHub Pages + Sam's backend server

Enjoy!
