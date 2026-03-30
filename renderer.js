// Ray-casting Renderer
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.fov = Math.PI / 3;  // 60 degrees
        this.renderDistance = 20;
        this.spriteBuffer = [];  // For depth sorting sprites
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    render(player, level) {
        // Draw ceiling
        this.ctx.fillStyle = '#1b1bc4ff';
        this.ctx.fillRect(0, 0, this.width, this.height / 2);

        // Draw floor
        this.ctx.fillStyle = '#9595acff';
        this.ctx.fillRect(0, this.height / 2, this.width, this.height / 2);

        // Prepare depth buffer for sprites
        const depthBuffer = new Array(this.width);

        // Ray-casting: one ray per screen column
        for (let x = 0; x < this.width; x++) {
            // Calculate ray angle
            const cameraX = 2 * x / this.width - 1;
            const rayAngle = player.angle + Math.atan(cameraX * Math.tan(this.fov / 2));

            // Cast ray
            const hit = level.castRay(player.x, player.y, rayAngle);

            if (hit.hit) {
                depthBuffer[x] = hit.distance;

                // Calculate wall height based on distance
                const perpDist = hit.distance * Math.cos(rayAngle - player.angle);
                const wallHeight = (this.height / perpDist) * 0.5;

                // Calculate wall boundaries
                const wallTop = (this.height / 2) - wallHeight;
                const wallBottom = (this.height / 2) + wallHeight;

                // Get texture
                const texture = assets.getTexture(hit.texture);

                if (texture) {
                    // Calculate texture X coordinate based on which wall side was hit
                    let textureX;

                    if (hit.side === 0) {
                        // Vertical wall (hit on east/west side)
                        textureX = hit.y - Math.floor(hit.y);
                    } else {
                        // Horizontal wall (hit on north/south side)
                        textureX = hit.x - Math.floor(hit.x);
                    }

                    textureX = Math.floor(textureX * texture.width);

                    // Apply distance-based shading
                    const brightness = Math.max(0.2, 1 - perpDist / this.renderDistance);

                    // Draw textured wall slice
                    this.ctx.save();
                    this.ctx.globalAlpha = brightness;
                    this.ctx.drawImage(
                        texture,
                        textureX, 0, 1, texture.height,
                        x, wallTop, 1, wallBottom - wallTop
                    );
                    this.ctx.restore();
                } else {
                    // Fallback solid color
                    const brightness = Math.max(50, 255 - hit.distance * 20);
                    //this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                    this.ctx.fillStyle = `rgb(0, 200, 0)`;
                    this.ctx.fillRect(x, wallTop, 1, wallBottom - wallTop);
                }
            }
        }

        // Render sprites (enemies, items)
        this.renderSprites(player, level, depthBuffer);
    }

    renderSprites(player, level, depthBuffer) {
        const sprites = level.getSprites();

        // Calculate sprite data and sort by distance
        const spriteData = sprites.map(sprite => {
            const dx = sprite.x - player.x;
            const dy = sprite.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            return {
                ...sprite,
                distance: distance,
                angle: angle
            };
        });

        // Sort by distance (far to near) for proper rendering order
        spriteData.sort((a, b) => b.distance - a.distance);

        // Render each sprite
        spriteData.forEach(spriteInfo => {
            const dx = spriteInfo.x - player.x;
            const dy = spriteInfo.y - player.y;

            // Transform sprite position to camera space
            const angleDiff = spriteInfo.angle - player.angle;
            const spriteScreenX = Math.tan(angleDiff);

            // Check if sprite is in front of player and within FOV
            if (Math.cos(angleDiff) > 0 && Math.abs(spriteScreenX) < 2) {
                const spriteX = (this.width / 2) * (1 + spriteScreenX / Math.tan(this.fov / 2));

                // Calculate sprite size
                const perpDist = spriteInfo.distance * Math.cos(angleDiff);
                const spriteHeight = (this.height / perpDist) * spriteInfo.scale;
                const spriteWidth = spriteHeight;

                // Sprite position on screen
                const spriteTop = (this.height / 2) - spriteHeight / 2;
                //if (spriteInfo.onGround) {
                //    // Dead enemies lie on the ground
                //    const spriteCenterY = (this.height / 2) + spriteHeight / 2;
                //} else {
                const spriteCenterY = this.height / 2;
                //}

                // Get sprite image
                const spriteImg = assets.getSprite(spriteInfo.sprite);

                if (spriteImg) {
                    // Depth testing: only draw sprite pixels that are in front of walls
                    const startX = Math.max(0, Math.floor(spriteX - spriteWidth / 2));
                    const endX = Math.min(this.width, Math.ceil(spriteX + spriteWidth / 2));

                    // Apply distance-based brightness
                    const brightness = Math.max(0.3, 1 - perpDist / this.renderDistance);

                    this.ctx.save();
                    this.ctx.globalAlpha = brightness;

                    // Simple depth test: check center column
                    const centerX = Math.floor(spriteX);
                    if (centerX >= 0 && centerX < this.width) {
                        if (!depthBuffer[centerX] || perpDist < depthBuffer[centerX]) {
                            this.ctx.drawImage(
                                spriteImg,
                                spriteX - spriteWidth / 2,
                                spriteTop,
                                spriteWidth,
                                spriteHeight
                            );
                        }
                    }

                    this.ctx.restore();
                }
            }
        });
    }

    drawMinimap(player, level) {
        const mapSize = 150;
        const cellSize = mapSize / Math.max(level.width, level.height);
        const mapX = this.width - mapSize - 20;
        const mapY = 20;

        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(mapX - 5, mapY - 5, mapSize + 10, mapSize + 10);

        // Draw map
        for (let y = 0; y < level.height; y++) {
            for (let x = 0; x < level.width; x++) {
                if (level.isWall(x + 0.5, y + 0.5)) {
                    this.ctx.fillStyle = '#444466';
                } else {
                    this.ctx.fillStyle = '#222233';
                }

                this.ctx.fillRect(
                    mapX + x * cellSize,
                    mapY + y * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }

        // Draw enemies
        level.enemies.forEach(enemy => {
            if (!enemy.dead) {
                this.ctx.fillStyle = '#ff3366';
                this.ctx.fillRect(
                    mapX + enemy.x * cellSize - 2,
                    mapY + enemy.y * cellSize - 2,
                    4, 4
                );
            }
        });

        // Draw player
        this.ctx.fillStyle = '#00ffcc';
        this.ctx.beginPath();
        this.ctx.arc(
            mapX + player.x * cellSize,
            mapY + player.y * cellSize,
            3, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Draw player direction
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(mapX + player.x * cellSize, mapY + player.y * cellSize);
        this.ctx.lineTo(
            mapX + (player.x + Math.cos(player.angle) * 0.5) * cellSize,
            mapY + (player.y + Math.sin(player.angle) * 0.5) * cellSize
        );
        this.ctx.stroke();
    }
}
