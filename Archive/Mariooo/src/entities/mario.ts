import { Level } from '../levels/level1';
// import { checkCollision } from '../utils/collision';

export class Mario {
    private x: number;
    private y: number;
    private width: number = 16;
    private height: number = 16;
    private vx: number = 0; // Prędkość pozioma
    private vy: number = 0; // Prędkość pionowa
    private speed: number = 2;
    private jumpPower: number = -10;
    private gravity: number = 0.5;
    private isJumping: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.setupControls();
    }

    update(level: Level) {
        // Grawitacja
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Kolizje z poziomem
        const collisions = level.getCollisions(this);
        collisions.forEach(block => {
            if (this.vy > 0 && this.y + this.height > block.y) {
                this.y = block.y - this.height;
                this.vy = 0;
                this.isJumping = false;
            }
        });

        // Ograniczenie do ekranu
        if (this.y > 600 - this.height) {
            this.y = 600 - this.height;
            this.vy = 0;
            this.isJumping = false;
        }
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = 'red'; // Placeholder, później spritesheet
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    private setupControls() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowRight': this.vx = this.speed; break;
                case 'ArrowLeft': this.vx = -this.speed; break;
                case ' ': if (!this.isJumping) { this.vy = this.jumpPower; this.isJumping = true; } break;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') this.vx = 0;
        });
    }
}