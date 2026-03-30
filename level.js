// Level Manager - Handles level loading and game objects
class Level {
    constructor(data) {
        this.map = data.map;
        this.width = this.map[0].length;
        this.height = this.map.length;
        this.playerStart = data.playerStart;
        this.enemies = data.enemies.map(e => ({ ...e }));
        this.items = data.items.map(i => ({ ...i }));
        this.doors = data.doors.map(d => ({ ...d, open: false }));
        this.exit = data.exit;
        this.name = data.name;

        // Wall type mapping
        this.wallTextures = {
            1: 'wall1',
            2: 'wall2',
            3: 'wall3'
        };
    }

    // Check if a position is solid (wall or closed door)
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true;
        }

        const cell = this.map[Math.floor(y)][Math.floor(x)];

        // Check for walls
        if (cell >= 1 && cell <= 3) {
            return true;
        }

        // Check for closed doors
        const door = this.getDoorAt(x, y);
        if (door && !door.open) {
            return true;
        }

        return false;
    }

    // Get wall texture for a cell
    getWallTexture(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 'wall1';
        }

        const cell = this.map[Math.floor(y)][Math.floor(x)];

        // Check for door
        const door = this.getDoorAt(x, y);
        if (door) {
            if (door.color === 'red') return 'doorRed';
            if (door.color === 'blue') return 'doorBlue';
            if (door.color === 'yellow') return 'doorYellow';
        }

        return this.wallTextures[cell] || 'wall1';
    }

    // Get door at position
    getDoorAt(x, y) {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);

        return this.doors.find(d =>
            Math.floor(d.x) === gridX && Math.floor(d.y) === gridY
        );
    }

    // Try to open a door
    openDoor(x, y, keys) {
        const door = this.getDoorAt(x, y);

        if (!door || door.open) {
            return { success: false };
        }

        // Check if player has the required key
        if (door.locked) {
            if (!keys[door.color]) {
                return {
                    success: false,
                    message: `You need a ${door.color} key!`
                };
            }
        }

        door.open = true;
        return {
            success: true,
            message: door.locked ? `${door.color} door unlocked!` : 'Door opened!'
        };
    }

    // Get item at position
    getItemAt(x, y, radius = 0.3) {
        return this.items.find(item => {
            if (item.collected) return false;
            const dx = item.x - x;
            const dy = item.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        });
    }

    // Check if player reached exit
    isAtExit(x, y, radius = 0.5) {
        const dx = this.exit.x - x;
        const dy = this.exit.y - y;
        return Math.sqrt(dx * dx + dy * dy) < radius;
    }

    // Get all renderable sprites (enemies, items, exit)
    getSprites() {
        const sprites = [];

        // Add enemies
        this.enemies.forEach(enemy => {
            if (!enemy.dead) {
                sprites.push({
                    x: enemy.x,
                    y: enemy.y,
                    sprite: 'enemy',
                    scale: 1.0
                });
            } else {
                sprites.push({
                    x: enemy.x,
                    y: enemy.y,
                    sprite: 'enemyDead',
                    scale: 0.5,
                    onGround: true
                });
            }
        });

        // Add items
        this.items.forEach(item => {
            if (!item.collected) {
                let spriteName = item.type;
                if (item.type === 'key') {
                    spriteName = `key${item.color.charAt(0).toUpperCase()}${item.color.slice(1)}`;
                }
                sprites.push({
                    x: item.x,
                    y: item.y,
                    sprite: spriteName,
                    scale: 0.6
                });
            }
        });

        // Add exit
        sprites.push({
            x: this.exit.x,
            y: this.exit.y,
            sprite: 'exit',
            scale: 1.2
        });

        return sprites;
    }

    // Cast a ray using DDA (Digital Differential Analysis) algorithm
    castRay(x, y, angle) {
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        // Current map position
        let mapX = Math.floor(x);
        let mapY = Math.floor(y);

        // Length of ray from one x or y-side to next x or y-side
        const deltaDistX = Math.abs(1 / dirX);
        const deltaDistY = Math.abs(1 / dirY);

        // Direction to step in x and y (-1 or +1)
        const stepX = dirX < 0 ? -1 : 1;
        const stepY = dirY < 0 ? -1 : 1;

        // Length of ray from current position to next x or y-side
        let sideDistX = dirX < 0
            ? (x - mapX) * deltaDistX
            : (mapX + 1.0 - x) * deltaDistX;
        let sideDistY = dirY < 0
            ? (y - mapY) * deltaDistY
            : (mapY + 1.0 - y) * deltaDistY;

        // Was the wall hit on a N/S side or E/W side?
        let side = 0; // 0 = vertical (x-side), 1 = horizontal (y-side)

        const maxDistance = 20;
        let distance = 0;

        // DDA algorithm - step through grid
        while (distance < maxDistance) {
            // Jump to next map square, either in x-direction or y-direction
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }

            // Check if ray has hit a wall
            if (this.isWall(mapX + 0.5, mapY + 0.5)) {
                // Calculate distance
                if (side === 0) {
                    distance = (mapX - x + (1 - stepX) / 2) / dirX;
                } else {
                    distance = (mapY - y + (1 - stepY) / 2) / dirY;
                }

                // Calculate exact hit position
                const hitX = x + dirX * distance;
                const hitY = y + dirY * distance;

                return {
                    hit: true,
                    distance: distance,
                    x: hitX,
                    y: hitY,
                    side: side, // 0 = vertical wall, 1 = horizontal wall
                    texture: this.getWallTexture(mapX + 0.5, mapY + 0.5)
                };
            }

            // Safety check
            distance = side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;
        }

        return {
            hit: false,
            distance: maxDistance
        };
    }
}
