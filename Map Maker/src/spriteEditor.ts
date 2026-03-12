export class SpriteEditor {
    private mapCanvas: HTMLCanvasElement;
    private mapContext: CanvasRenderingContext2D;
    private spriteImage: HTMLImageElement;
    private readonly TILE_SIZE = 48;
    private readonly DISPLAY_SIZE = 24;
    private selectedTile: { x: number; y: number } | null = null;
    private selectedMapCells: { x: number; y: number }[] = [];
    private mapData: { x: number, y: number, tileX: number, tileY: number }[] = [];
    private isSelecting: boolean = false;
    private selectionStart: { x: number; y: number } | null = null;
    private selectionEnd: { x: number; y: number } | null = null;
    private clipboardData: { x: number, y: number, tileX: number, tileY: number }[] = [];
    private history: { x: number, y: number, tileX: number, tileY: number }[][] = [];
    private redoStack: { x: number, y: number, tileX: number, tileY: number }[][] = [];
    private isPasting: boolean = false;
    private pasteOffset: { x: number; y: number } | null = null;

    constructor() {
        this.mapCanvas = document.getElementById('map') as HTMLCanvasElement;
        this.mapContext = this.mapCanvas.getContext('2d')!;
        this.spriteImage = new Image();
        this.spriteImage.src = 'assets/sprites.png';
        this.spriteImage.onload = () => {
            this.createSpriteCanvases();
            this.createGrid();
        };
        this.initializeEventListeners();
        this.initializeFileHandling();
    }

    private createSpriteCanvases(): void {
        const spritesContainer = document.getElementById('spritesContainer')!;
        const cols = 32;
        const rows = 20;
        const mid = cols / 2;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < mid; x++) {
                this.createSpriteCanvas(spritesContainer, x, y);
            }
        }

        for (let y = 0; y < rows; y++) {
            for (let x = mid; x < cols; x++) {
                this.createSpriteCanvas(spritesContainer, x, y);
            }
        }
    }

    private createSpriteCanvas(container: HTMLElement, x: number, y: number): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.DISPLAY_SIZE;
        canvas.height = this.DISPLAY_SIZE;
        canvas.classList.add('sprite-canvas');
        container.appendChild(canvas);

        const context = canvas.getContext('2d')!;
        context.drawImage(
            this.spriteImage,
            x * this.TILE_SIZE,
            y * this.TILE_SIZE,
            this.TILE_SIZE,
            this.TILE_SIZE,
            0,
            0,
            this.DISPLAY_SIZE,
            this.DISPLAY_SIZE
        );

        canvas.addEventListener('click', () => this.selectTile(x, y));
    }

    private createGrid(): void {
        const cols = this.mapCanvas.width / this.DISPLAY_SIZE;
        const rows = this.mapCanvas.height / this.DISPLAY_SIZE;

        this.mapContext.strokeStyle = 'white';
        this.mapContext.lineWidth = 1;

        for (let x = 0; x <= cols; x++) {
            this.mapContext.beginPath();
            this.mapContext.moveTo(x * this.DISPLAY_SIZE, 0);
            this.mapContext.lineTo(x * this.DISPLAY_SIZE, this.mapCanvas.height);
            this.mapContext.stroke();
        }

        for (let y = 0; y <= rows; y++) {
            this.mapContext.beginPath();
            this.mapContext.moveTo(0, y * this.DISPLAY_SIZE);
            this.mapContext.lineTo(this.mapCanvas.width, y * this.DISPLAY_SIZE);
            this.mapContext.stroke();
        }
    }

    private drawMap(): void {
        this.mapContext.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);

        for (const tile of this.mapData) {
            this.mapContext.drawImage(
                this.spriteImage,
                tile.tileX * this.TILE_SIZE,
                tile.tileY * this.TILE_SIZE,
                this.TILE_SIZE,
                this.TILE_SIZE,
                tile.x * this.DISPLAY_SIZE,
                tile.y * this.DISPLAY_SIZE,
                this.DISPLAY_SIZE,
                this.DISPLAY_SIZE
            );
        }

        this.createGrid();

        for (const cell of this.selectedMapCells) {
            this.mapContext.strokeStyle = 'red';
            this.mapContext.lineWidth = 2;
            this.mapContext.strokeRect(
                cell.x * this.DISPLAY_SIZE,
                cell.y * this.DISPLAY_SIZE,
                this.DISPLAY_SIZE,
                this.DISPLAY_SIZE
            );
            this.mapContext.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.mapContext.fillRect(
                cell.x * this.DISPLAY_SIZE,
                cell.y * this.DISPLAY_SIZE,
                this.DISPLAY_SIZE,
                this.DISPLAY_SIZE
            );
        }

        if (this.selectionEnd) {
            this.mapContext.strokeStyle = 'green';
            this.mapContext.lineWidth = 2;
            const x = Math.min(this.selectionStart!.x, this.selectionEnd.x);
            const y = Math.min(this.selectionStart!.y, this.selectionEnd.y);
            const width = Math.abs(this.selectionEnd.x - this.selectionStart!.x) + 1;
            const height = Math.abs(this.selectionEnd.y - this.selectionStart!.y) + 1;
            this.mapContext.strokeRect(
                x * this.DISPLAY_SIZE,
                y * this.DISPLAY_SIZE,
                width * this.DISPLAY_SIZE,
                height * this.DISPLAY_SIZE
            );
            this.mapContext.fillStyle = 'rgba(0, 255, 0, 0.3)';
            this.mapContext.fillRect(
                x * this.DISPLAY_SIZE,
                y * this.DISPLAY_SIZE,
                width * this.DISPLAY_SIZE,
                height * this.DISPLAY_SIZE
            );
        }

        if (this.isPasting && this.pasteOffset) {
            this.mapContext.strokeStyle = 'blue';
            this.mapContext.lineWidth = 2;
            const offsetX = Math.min(...this.clipboardData.map(tile => tile.x));
            const offsetY = Math.min(...this.clipboardData.map(tile => tile.y));
            for (const tile of this.clipboardData) {
                const x = this.pasteOffset.x + tile.x - offsetX;
                const y = this.pasteOffset.y + tile.y - offsetY;
                this.mapContext.strokeRect(
                    x * this.DISPLAY_SIZE,
                    y * this.DISPLAY_SIZE,
                    this.DISPLAY_SIZE,
                    this.DISPLAY_SIZE
                );
                this.mapContext.fillStyle = 'rgba(0, 0, 255, 0.3)';
                this.mapContext.fillRect(
                    x * this.DISPLAY_SIZE,
                    y * this.DISPLAY_SIZE,
                    this.DISPLAY_SIZE,
                    this.DISPLAY_SIZE
                );
            }
        }
    }

    private selectTile(x: number, y: number): void {
        this.selectedTile = { x, y };
        console.log(`Selected tile: ${x}, ${y}`);

        if (this.selectedMapCells.length > 0) {
            this.saveState();
            for (const cell of this.selectedMapCells) {
                this.mapData.push({ x: cell.x, y: cell.y, tileX: x, tileY: y });
            }
            this.selectedMapCells = [];
            this.drawMap();
            if ((document.getElementById('auto') as HTMLInputElement).checked) {
                this.selectNextMapCell();
            }
        }
    }

    private selectNextMapCell(): void {
        if (this.mapData.length > 0) {
            const lastCell = this.mapData[this.mapData.length - 1];
            let nextX = lastCell.x + 1;
            let nextY = lastCell.y;
            if (nextX >= this.mapCanvas.width / this.DISPLAY_SIZE) {
                nextX = 0;
                nextY++;
            }
            if (nextY < this.mapCanvas.height / this.DISPLAY_SIZE) {
                this.selectedMapCells = [{ x: nextX, y: nextY }];
            } else {
                this.selectedMapCells = [];
            }
        } else {
            this.selectedMapCells = [{ x: 0, y: 0 }];
        }
        this.drawMap();
    }

    private initializeEventListeners(): void {
        this.mapCanvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.mapCanvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
        this.mapCanvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }

    private initializeFileHandling(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput.addEventListener('change', (event) => this.loadFile(event));
    }

    private saveToFile(): void {
        const data = JSON.stringify(this.mapData);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'map.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    private loadFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) {
                    this.mapData = JSON.parse(result);
                    this.drawMap();
                }
            };
            reader.readAsText(file);
        }
    }

    private triggerFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput.click();
    }

    private onMouseDown(event: MouseEvent): void {
        if (this.isPasting) return;
        this.isSelecting = true;
        const x = Math.floor(event.offsetX / this.DISPLAY_SIZE);
        const y = Math.floor(event.offsetY / this.DISPLAY_SIZE);
        this.selectionStart = { x, y };
        this.selectionEnd = { x, y };
    }

    private onMouseUp(event: MouseEvent): void {
        if (this.isPasting && this.pasteOffset) {
            this.confirmPaste();
            return;
        }
        this.isSelecting = false;
        const x = Math.floor(event.offsetX / this.DISPLAY_SIZE);
        const y = Math.floor(event.offsetY / this.DISPLAY_SIZE);
        const ctrlKeyPressed = event.ctrlKey || event.metaKey;

        this.selectionEnd = { x, y };

        const startX = Math.min(this.selectionStart!.x, this.selectionEnd.x);
        const startY = Math.min(this.selectionStart!.y, this.selectionEnd.y);
        const endX = Math.max(this.selectionStart!.x, this.selectionEnd.x);
        const endY = Math.max(this.selectionStart!.y, this.selectionEnd!.y);

        const newSelection: { x: number; y: number }[] = [];
        let allAlreadySelected = true;

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const cell = { x, y };
                if (!this.selectedMapCells.some(c => c.x === cell.x && c.y === cell.y)) {
                    allAlreadySelected = false;
                }
                newSelection.push(cell);
            }
        }

        if (ctrlKeyPressed) {
            if (allAlreadySelected) {
                this.selectedMapCells = this.selectedMapCells.filter(cell =>
                    !newSelection.some(c => c.x === cell.x && c.y === cell.y)
                );
            } else {
                for (const cell of newSelection) {
                    if (!this.selectedMapCells.some(c => c.x === cell.x && c.y === cell.y)) {
                        this.selectedMapCells.push(cell);
                    }
                }
            }
        } else {
            this.selectedMapCells = newSelection;
        }

        this.selectionStart = null;
        this.selectionEnd = null;
        this.drawMap();
    }

    private onMouseMove(event: MouseEvent): void {
        if (this.isPasting && this.pasteOffset) {
            const x = Math.floor(event.offsetX / this.DISPLAY_SIZE);
            const y = Math.floor(event.offsetY / this.DISPLAY_SIZE);
            this.pasteOffset = { x, y };
            this.drawMap();
        } else if (this.isSelecting && this.selectionStart) {
            const x = Math.floor(event.offsetX / this.DISPLAY_SIZE);
            const y = Math.floor(event.offsetY / this.DISPLAY_SIZE);
            this.selectionEnd = { x, y };
            this.drawMap();
        }
    }

    private confirmPaste(): void {
        const offsetX = Math.min(...this.clipboardData.map(tile => tile.x));
        const offsetY = Math.min(...this.clipboardData.map(tile => tile.y));
        this.saveState();
        for (const tile of this.clipboardData) {
            const newX = tile.x - offsetX + this.pasteOffset!.x;
            const newY = tile.y - offsetY + this.pasteOffset!.y;
            if (newX >= 0 && newY >= 0 && newX < this.mapCanvas.width / this.DISPLAY_SIZE && newY < this.mapCanvas.height / this.DISPLAY_SIZE) {
                if (tile.tileX !== -1 && tile.tileY !== -1) {
                    this.mapData.push({ x: newX, y: newY, tileX: tile.tileX, tileY: tile.tileY });
                }
            }
        }
        this.isPasting = false;
        this.pasteOffset = null;
        this.drawMap();
        this.removePasteEventListeners();
    }

    private onKeyDown(event: KeyboardEvent): void {
        const ctrlKeyPressed = event.ctrlKey || event.metaKey;

        if (ctrlKeyPressed) {
            switch (event.key) {
                case 'c':
                    this.copySelectedCells();
                    break;
                case 'x':
                    this.cutSelectedCells();
                    break;
                case 'v':
                    this.pasteClipboardData();
                    break;
                case 'z':
                    this.undo();
                    break;
                case 'y':
                    this.redo();
                    break;
                case 's':
                    event.preventDefault();
                    this.saveToFile();
                    break;
                case 'l':
                    event.preventDefault();
                    this.triggerFileInput();
                    break;
            }
        }

        if (event.key === 'Delete' || event.key === 'Del') {
            this.deleteSelectedCells();
        }
    }

    private copySelectedCells(): void {
        this.clipboardData = this.selectedMapCells.map(cell => {
            const tile = this.mapData.find(t => t.x === cell.x && t.y === cell.y);
            return tile ? { ...tile } : { x: cell.x, y: cell.y, tileX: -1, tileY: -1 };
        });
    }

    private cutSelectedCells(): void {
        this.saveState();
        this.copySelectedCells();
        this.deleteSelectedCells();
    }

    private pasteClipboardData(): void {
        if (this.clipboardData.length === 0) return;
        this.selectedMapCells = [];
        this.drawMap();
        this.isPasting = true;
        this.pasteOffset = { x: 0, y: 0 };
        this.addPasteEventListeners();
    }

    private undo(): void {
        if (this.history.length > 0) {
            this.redoStack.push(this.mapData.slice());
            this.mapData = this.history.pop()!;
            this.drawMap();
        }
    }

    private redo(): void {
        if (this.redoStack.length > 0) {
            this.history.push(this.mapData.slice());
            this.mapData = this.redoStack.pop()!;
            this.drawMap();
        }
    }

    private deleteSelectedCells(): void {
        if (this.selectedMapCells.length > 0) {
            this.saveState();
            this.mapData = this.mapData.filter(tile =>
                !this.selectedMapCells.some(cell => cell.x === tile.x && cell.y === tile.y)
            );
            this.selectedMapCells = [];
            this.drawMap();
        }
    }

    private saveState(): void {
        this.history.push(this.mapData.slice());
        this.redoStack = [];
    }

    private addPasteEventListeners(): void {
        this.mapCanvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.mapCanvas.addEventListener('mouseup', this.confirmPaste.bind(this));
    }

    private removePasteEventListeners(): void {
        this.mapCanvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
        this.mapCanvas.removeEventListener('mouseup', this.confirmPaste.bind(this));
    }
}
