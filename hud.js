// HUD Manager
class HUD {
    constructor() {
        this.healthFill = document.getElementById('healthFill');
        this.healthText = document.getElementById('healthText');
        this.ammoText = document.getElementById('ammoText');
        this.keyDisplay = document.getElementById('keyDisplay');
        this.levelText = document.getElementById('levelText');
        this.damageIndicator = document.getElementById('damageIndicator');
        this.messageDisplay = document.getElementById('messageDisplay');
        this.messageTimeout = null;
    }

    update(player, levelName) {
        // Update health
        const healthPercent = (player.health / player.maxHealth) * 100;
        this.healthFill.style.width = healthPercent + '%';
        this.healthText.textContent = Math.max(0, player.health);

        // Update ammo
        this.ammoText.textContent = player.ammo;

        // Update keys
        this.keyDisplay.innerHTML = '';
        if (player.keys.red) {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key-item key-red';
            keyDiv.textContent = 'R';
            this.keyDisplay.appendChild(keyDiv);
        }
        if (player.keys.blue) {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key-item key-blue';
            keyDiv.textContent = 'B';
            this.keyDisplay.appendChild(keyDiv);
        }
        if (player.keys.yellow) {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key-item key-yellow';
            keyDiv.textContent = 'Y';
            this.keyDisplay.appendChild(keyDiv);
        }

        // Update level name
        this.levelText.textContent = levelName.toUpperCase();
    }

    showDamage() {
        this.damageIndicator.classList.add('active');
        setTimeout(() => {
            this.damageIndicator.classList.remove('active');
        }, 200);
    }

    showMessage(text, duration = 2000) {
        this.messageDisplay.textContent = text;
        this.messageDisplay.classList.add('active');

        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        this.messageTimeout = setTimeout(() => {
            this.messageDisplay.classList.remove('active');
        }, duration);
    }
}
