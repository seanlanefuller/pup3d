// Player Controller
class Player {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.moveSpeed = 0.07;  // Fast movement
        this.rotSpeed = 0.002;   // Mouse sensitivity

        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 50;
        this.keys = {
            red: false,
            blue: false,
            yellow: false
        };

        // Input state
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            mouseX: 0,
            mouseY: 0
        };

        this.radius = 0.25;  // Collision radius
    }

    update(level, deltaTime) {
        // Mouse look
        this.angle += this.input.mouseX * this.rotSpeed;
        this.input.mouseX = 0;  // Reset mouse delta

        // Movement
        let moveX = 0;
        let moveY = 0;

        if (this.input.forward) {
            moveX += Math.cos(this.angle) * this.moveSpeed;
            moveY += Math.sin(this.angle) * this.moveSpeed;
        }
        if (this.input.backward) {
            moveX -= Math.cos(this.angle) * this.moveSpeed;
            moveY -= Math.sin(this.angle) * this.moveSpeed;
        }
        if (this.input.left) {
            moveX += Math.cos(this.angle - Math.PI / 2) * this.moveSpeed;
            moveY += Math.sin(this.angle - Math.PI / 2) * this.moveSpeed;
        }
        if (this.input.right) {
            moveX += Math.cos(this.angle + Math.PI / 2) * this.moveSpeed;
            moveY += Math.sin(this.angle + Math.PI / 2) * this.moveSpeed;
        }

        // Collision detection
        const newX = this.x + moveX;
        const newY = this.y + moveY;

        // Check X collision
        if (!level.isWall(newX + Math.sign(moveX) * this.radius, this.y) &&
            !level.isWall(newX - Math.sign(moveX) * this.radius, this.y)) {
            this.x = newX;
        }

        // Check Y collision
        if (!level.isWall(this.x, newY + Math.sign(moveY) * this.radius) &&
            !level.isWall(this.x, newY - Math.sign(moveY) * this.radius)) {
            this.y = newY;
        }

        // Check for item pickup
        const item = level.getItemAt(this.x, this.y);
        if (item) {
            this.pickupItem(item);
        }
    }

    pickupItem(item) {
        if (item.type === 'health') {
            this.health = Math.min(this.maxHealth, this.health + 25);
            item.collected = true;
            audio.playPickup();
            return 'Health +25';
        } else if (item.type === 'ammo') {
            this.ammo += 20;
            item.collected = true;
            audio.playPickup();
            return 'Ammo +20';
        } else if (item.type === 'key') {
            this.keys[item.color] = true;
            item.collected = true;
            audio.playPickup();
            return `${item.color} key collected!`;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        audio.playPlayerHurt();
        return this.health <= 0;
    }

    shoot() {
        if (this.ammo > 0) {
            this.ammo--;
            audio.playShoot();
            return true;
        }
        return false;
    }

    interact(level) {
        // Try to open door in front of player
        const checkDist = 1.0;
        const checkX = this.x + Math.cos(this.angle) * checkDist;
        const checkY = this.y + Math.sin(this.angle) * checkDist;

        const door = level.getDoorAt(checkX, checkY);
        if (door) {
            const result = level.openDoor(checkX, checkY, this.keys);
            if (result.success) {
                audio.playDoorOpen();
            }
            return result;
        }

        return { success: false };
    }

    reset(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.health = 100;
        this.ammo = 50;
        this.keys = { red: false, blue: false, yellow: false };
    }
}
