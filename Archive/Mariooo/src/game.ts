import { Mario } from './entities/mario';
import { Level } from './levels/level1';

export class Game {
    private context: CanvasRenderingContext2D;
    private mario: Mario;
    private level: Level;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
        this.level = new Level();
        this.mario = new Mario(50, 500); // Startowa pozycja Mario
    }

    start() {
        this.gameLoop();
    }

    private gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    private update() {
        this.mario.update(this.level);
        this.level.update();
    }

    private render() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.level.render(this.context);
        this.mario.render(this.context);
    }
}