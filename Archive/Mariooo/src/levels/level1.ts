export class Level {
    private blocks: { x: number; y: number; width: number; height: number }[] = [
        { x: 0, y: 550, width: 800, height: 50 }, // Podłoga
        { x: 200, y: 450, width: 100, height: 20 }, // Platforma
    ];

    update() {
        // Aktualizacja przeciwników, monet itp.
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = 'brown';
        this.blocks.forEach(block => {
            context.fillRect(block.x, block.y, block.width, block.height);
        });
    }

    getCollisions(entity: any) {
        return this.blocks.filter(block => this.checkCollision(entity, block));
    }

    private checkCollision(a: any, b: any): boolean {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }
}