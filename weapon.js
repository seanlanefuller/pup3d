// Weapon System
class Weapon {
    constructor() {
        this.firing = false;
        this.bobOffset = 0;
        this.bobSpeed = 0.15;
        this.recoilOffset = 0;
        this.muzzleFlash = false;
        this.muzzleFlashDuration = 100; // ms
    }

    update(isMoving, deltaTime) {
        // Weapon bobbing when moving
        if (isMoving) {
            this.bobOffset += this.bobSpeed;
        }

        // Recoil animation
        if (this.recoilOffset > 0) {
            this.recoilOffset -= 0.5;
        }
    }

    fire(player, enemyController) {
        if (player.shoot()) {
            this.firing = true;
            this.recoilOffset = 10;
            this.muzzleFlash = true;

            setTimeout(() => {
                this.muzzleFlash = false;
            }, this.muzzleFlashDuration);

            // Check if we hit an enemy
            const hit = enemyController.hitEnemy(player, this);

            setTimeout(() => {
                this.firing = false;
            }, 200);

            return hit;
        }

        return null;
    }

    render(ctx, canvas) {
        const centerX = canvas.width / 2;
        const weaponY = canvas.height - 150;

        // Bob animation
        const bob = Math.sin(this.bobOffset) * 5;

        // Weapon (simple gun shape)
        ctx.fillStyle = '#333333';
        ctx.fillRect(
            centerX - 30,
            weaponY + bob - this.recoilOffset,
            60,
            100
        );

        // Gun barrel
        ctx.fillStyle = '#111111';
        ctx.fillRect(
            centerX - 10,
            weaponY + bob - this.recoilOffset - 20,
            20,
            30
        );

        // Muzzle flash
        if (this.muzzleFlash) {
            ctx.fillStyle = '#ffff00';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(
                centerX,
                weaponY + bob - this.recoilOffset - 20,
                20,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}
