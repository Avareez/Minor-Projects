import { Game } from './game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

const spriteSheet1 = new Image();
spriteSheet1.src = 'assets/sprites/blocks.png';

const spriteSheet2 = new Image();
spriteSheet2.src = 'assets/sprites/characters.png';

const spriteSheet3 = new Image();
spriteSheet2.src = 'assets/sprites/items.png';

const game = new Game(context);
game.start();