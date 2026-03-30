// Main Game Loop and State Management
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.hud = new HUD();

        this.state = 'title';  // title, playing, gameover
        this.currentLevelIndex = 0;
        this.level = null;
        this.player = null;
        this.enemyController = null;
        this.weapon = null;

        this.lastTime = 0;
        this.mouseMovement = { x: 0, y: 0 };
        this.pointerLocked = false;

        this.setupEventListeners();
        this.showScreen('titleScreen');
    }

    async init() {
        // Load assets
        await assets.load();
        console.log('Assets loaded');
    }

    setupEventListeners() {
        // Title screen buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('instructionsButton').addEventListener('click', () => {
            this.showScreen('instructionsScreen');
        });

        document.getElementById('backButton').addEventListener('click', () => {
            this.showScreen('titleScreen');
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('menuButton').addEventListener('click', () => {
            this.showScreen('titleScreen');
            this.state = 'title';
            audio.stopMusic();
        });

        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (!this.player || this.state !== 'playing') return;

            switch (e.key.toLowerCase()) {
                case 'w': this.player.input.forward = true; break;
                case 's': this.player.input.backward = true; break;
                case 'a': this.player.input.left = true; break;
                case 'd': this.player.input.right = true; break;
                case 'e':
                    const result = this.player.interact(this.level);
                    if (result.message) {
                        this.hud.showMessage(result.message);
                    }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (!this.player || this.state !== 'playing') return;

            switch (e.key.toLowerCase()) {
                case 'w': this.player.input.forward = false; break;
                case 's': this.player.input.backward = false; break;
                case 'a': this.player.input.left = false; break;
                case 'd': this.player.input.right = false; break;
            }
        });

        // Mouse controls
        this.canvas.addEventListener('click', () => {
            if (this.state === 'playing' && !this.pointerLocked) {
                this.canvas.requestPointerLock();
            } else if (this.state === 'playing' && this.pointerLocked) {
                this.weapon.fire(this.player, this.enemyController);
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;

            if (this.pointerLocked && this.state === 'playing') {
                // Initialize audio context on first interaction
                audio.init();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.pointerLocked && this.player) {
                this.player.input.mouseX += e.movementX;
                this.player.input.mouseY += e.movementY;
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.renderer.resize();
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startGame() {
        this.currentLevelIndex = 0;
        this.loadLevel(0);
        this.showScreen('gameScreen');
        this.state = 'playing';
        this.renderer.resize();

        // Start audio
        audio.init();
        audio.startMusic();

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    loadLevel(index) {
        const levelData = LEVELS[index];
        this.level = new Level(levelData);
        this.player = new Player(
            levelData.playerStart.x,
            levelData.playerStart.y,
            levelData.playerStart.angle
        );
        this.enemyController = new EnemyController(this.level);
        this.weapon = new Weapon();

        this.hud.showMessage(`${levelData.name} - START!`, 3000);
    }

    nextLevel() {
        this.currentLevelIndex++;

        if (this.currentLevelIndex >= LEVELS.length) {
            this.gameOver(true);
        } else {
            this.loadLevel(this.currentLevelIndex);
        }
    }

    gameOver(win = false) {
        this.state = 'gameover';
        this.showScreen('gameOverScreen');
        audio.stopMusic();

        if (win) {
            document.getElementById('gameOverTitle').textContent = 'VICTORY!';
            document.getElementById('gameOverMessage').textContent =
                'You have completed all levels!';
        } else {
            document.getElementById('gameOverTitle').textContent = 'GAME OVER';
            document.getElementById('gameOverMessage').textContent =
                'You were defeated. Try again?';
        }

        // Release pointer lock
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    gameLoop(currentTime) {
        if (this.state !== 'playing') return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update game state
        this.update(deltaTime);

        // Render
        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update player
        const isMoving = this.player.input.forward || this.player.input.backward ||
            this.player.input.left || this.player.input.right;
        this.player.update(this.level, deltaTime);

        // Check for item pickup
        const pickup = this.level.getItemAt(this.player.x, this.player.y);
        if (pickup && !pickup.collected) {
            const message = this.player.pickupItem(pickup);
            if (message) {
                this.hud.showMessage(message);
            }
        }

        // Update weapon
        this.weapon.update(isMoving, deltaTime);

        // Update enemies
        const attack = this.enemyController.update(this.player, deltaTime);
        if (attack) {
            const dead = this.player.takeDamage(attack.damage);
            this.hud.showDamage();

            if (dead) {
                this.gameOver(false);
                return;
            }
        }

        // Check if reached exit
        if (this.level.isAtExit(this.player.x, this.player.y)) {
            // Check if all enemies are dead
            if (this.enemyController.getAliveCount() === 0) {
                this.nextLevel();
            } else {
                this.hud.showMessage('Eliminate all enemies first!');
            }
        }

        // Update HUD
        this.hud.update(this.player, this.level.name);
    }

    render() {
        // Render 3D view
        this.renderer.render(this.player, this.level);

        // Render minimap
        this.renderer.drawMinimap(this.player, this.level);

        // Render weapon
        this.weapon.render(this.renderer.ctx, this.canvas);
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', async () => {
    game = new Game();
    await game.init();
});
