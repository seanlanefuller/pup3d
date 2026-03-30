// Asset Manager - Handles texture generation and sprite management
class AssetManager {
    constructor() {
        this.textures = {};
        this.sprites = {};
        this.loaded = false;
        this.TEXTURE_SIZE = 256;
    }

    async load() {
        // Generate wall textures procedurally
        this.textures.wall1 = this.generateTexture('brick_wall.png');
        this.textures.wall2 = this.generateTexture('stone_wall.png');
        this.textures.wall3 = this.generateTexture('metal_wall.png');
        this.textures.doorRed = this.generateTexture('red_door.png');
        this.textures.doorBlue = this.generateTexture('blue_door.png');
        this.textures.doorYellow = this.generateTexture('yellow_door.png');

        // Generate sprites
        this.sprites.enemy = this.generateSprite('living_enemy.png');
        this.sprites.enemyDead = this.generateSprite('dead_enemy.png');
        this.sprites.keyRed = this.generateSprite('red_key.png');
        this.sprites.keyBlue = this.generateSprite('blue_key.png');
        this.sprites.keyYellow = this.generateSprite('yellow_key.png');
        this.sprites.health = this.generateSprite('health.png');
        this.sprites.ammo = this.generateSprite('ammo.png');
        this.sprites.exit = this.generateSprite('exit.png');

        this.loaded = true;
    }

    generateTexture(src = 'red_door.png') {
        const canvas = document.createElement('canvas');
        canvas.width = this.TEXTURE_SIZE;
        canvas.height = this.TEXTURE_SIZE;

        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        img.src = src;

        return canvas;
    }

    generateSprite(src = 'living_enemy.png') {
        const canvas = document.createElement('canvas');
        canvas.width = this.TEXTURE_SIZE;
        canvas.height = this.TEXTURE_SIZE;

        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        img.src = src;

        return canvas;
    }

    getTexture(name) {
        return this.textures[name] || this.textures.wall1;
    }

    getSprite(name) {
        return this.sprites[name];
    }
}

// Create global instance
const assets = new AssetManager();
