// Enemy AI System
class EnemyController {
    constructor(level) {
        this.level = level;
        this.enemies = level.enemies;
        this.attackCooldown = 1000; // ms between attacks
    }

    update(player, deltaTime) {
        this.enemies.forEach(enemy => {
            if (enemy.dead) return;

            // Calculate distance to player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // State machine
            switch (enemy.state) {
                case 'idle':
                    if (distance < enemy.alertRadius) {
                        if (this.hasLineOfSight(enemy, player)) {
                            enemy.state = 'chase';
                            enemy.lastAlertTime = Date.now();
                            audio.playEnemyAlert();
                        }
                    }
                    break;

                case 'chase':
                    if (distance < 1.5) {
                        // Close enough to attack
                        enemy.state = 'attack';
                        enemy.lastAttackTime = Date.now();
                    } else if (this.hasLineOfSight(enemy, player)) {
                        // Move toward player
                        this.moveToward(enemy, player, deltaTime);
                    } else {
                        // Lost sight, return to idle after a moment
                        if (Date.now() - enemy.lastAlertTime > 3000) {
                            enemy.state = 'idle';
                        }
                    }
                    break;

                case 'attack':
                    const now = Date.now();
                    if (!enemy.lastAttackTime || now - enemy.lastAttackTime > this.attackCooldown) {
                        enemy.lastAttackTime = now;
                        return { enemy: enemy, damage: 10 };  // Return attack info
                    }

                    if (distance > 2.0) {
                        enemy.state = 'chase';
                    }
                    break;
            }
        });

        return null;
    }

    hasLineOfSight(enemy, player) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Cast ray from enemy to player
        const steps = Math.floor(distance / 0.1);
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const checkX = enemy.x + dx * t;
            const checkY = enemy.y + dy * t;

            if (this.level.isWall(checkX, checkY)) {
                return false;
            }
        }

        return true;
    }

    moveToward(enemy, player, deltaTime) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const moveSpeed = 0.02;  // Slower than player
        const moveX = (dx / distance) * moveSpeed;
        const moveY = (dy / distance) * moveSpeed;

        // Check collision before moving
        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;

        if (!this.level.isWall(newX, enemy.y)) {
            enemy.x = newX;
        }
        if (!this.level.isWall(enemy.x, newY)) {
            enemy.y = newY;
        }
    }

    hitEnemy(player, weapon) {
        // Cast ray from player in look direction
        const hit = this.level.castRay(player.x, player.y, player.angle);

        if (!hit.hit) return null;

        // Check if ray hit any enemy
        const hitDistance = hit.distance;

        for (let enemy of this.enemies) {
            if (enemy.dead) continue;

            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const enemyAngle = Math.atan2(dy, dx);
            const enemyDistance = Math.sqrt(dx * dx + dy * dy);

            // Check if enemy is in the direction we're shooting
            let angleDiff = Math.abs(enemyAngle - player.angle);
            if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

            if (angleDiff < 0.1 && enemyDistance < hitDistance && enemyDistance < 15) {
                enemy.health -= 50;  // Hitscan damage

                if (enemy.health <= 0) {
                    enemy.dead = true;
                    enemy.state = 'dead';
                }

                audio.playEnemyHit();
                return enemy;
            }
        }

        return null;
    }

    getAliveCount() {
        return this.enemies.filter(e => !e.dead).length;
    }
}
