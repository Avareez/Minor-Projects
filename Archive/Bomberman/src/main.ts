const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (ctx) {
  const block = 30;
  const rows = canvas.height / block;
  const cols = canvas.width / block;

  // Tablica przechowująca wszystkie obiekty na planszy
  const mapObjects: {
    x: number;
    y: number;
    type: string; // "wall", "brick", "balloon"
    dx?: number;
    dy?: number;
    frame?: number;
    frameNumber?: number;
    img: HTMLImageElement;
  }[] = [];

  // Funkcja do rysowania kratki
  function drawGrid() {
    ctx.fillStyle = "#317c05";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.1;
    for (let i = 0; i <= cols; i++) {
      const x = i * block;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      const y = j * block;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  // Funkcja generująca losowy kierunek
  function getRandomDirection() {
    const directions = [
      { dx: 1, dy: 0 }, // Prawo
      { dx: -1, dy: 0 }, // Lewo
      { dx: 0, dy: 1 }, // Dół
      { dx: 0, dy: -1 }, // Góra
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  // Funkcja do aktualizacji balonów
  const balloonSpeed = 1;
  function updateBalloons() {
    for (const obj of mapObjects) {
      if (obj.type === "balloon") {
        // Czyści poprzednią klatkę
        ctx.clearRect(obj.x, obj.y, block, block);

        // Rysuje bieżącą klatkę animacji
        ctx.drawImage(obj.img, obj.frame! * 16, 240, 16, 16, obj.x, obj.y, block, block);

        // Aktualizuje klatkę animacji
        let initialFrame = 0;
        if (obj.dx === 1 || obj.dy === 1) {
          initialFrame = 0;
        } else {
          initialFrame = 3;
        }

        // Aktualizuje klatkę animacji
        switch (obj.frameNumber) {
          case 1:
            obj.frame = initialFrame;
            obj.frameNumber! += 1;
            break;
          case 2:
            obj.frame! += 1;
            obj.frameNumber! += 1;
            break;
          case 3:
            obj.frame! += 1;
            obj.frameNumber! += 1;
            break;
          case 4:
            obj.frame! -= 1;
            obj.frameNumber! += 1;
            break;
          case 5:
            obj.frame! -= 1;
            obj.frameNumber = 1;
            break;
        }

        // Oblicza następną pozycję w pikselach
        const nextX = obj.x + obj.dx! * balloonSpeed;
        const nextY = obj.y + obj.dy! * balloonSpeed;

        // Sprawdza kolizję z elementami mapy
        const collision = mapObjects.some(
          (other) =>
            (other.type === "wall" || other.type === "brick") &&
            other.x < nextX + block &&
            other.x + block > nextX &&
            other.y < nextY + block &&
            other.y + block > nextY
        );

        // Jeśli brak kolizji, aktualizuje pozycję
        if (!collision) {
          obj.x = nextX;
          obj.y = nextY;
        } else {
          // W przypadku kolizji zmienia kierunek
          const newDirection = getRandomDirection();
          obj.dx = newDirection.dx;
          obj.dy = newDirection.dy;
        }

        // Sprawdza kolizję z krawędziami planszy
        if (
          obj.x < 0 ||
          obj.x + block > canvas.width ||
          obj.y < 0 ||
          obj.y + block > canvas.height
        ) {
          const newDirection = getRandomDirection();
          obj.dx = newDirection.dx;
          obj.dy = newDirection.dy;
        }

        // Zmiana kierunku na środku kratki
        if (obj.x % block === 0 && obj.y % block === 0) {
          const randomDirection = getRandomDirection();
          obj.dx = randomDirection.dx;
          obj.dy = randomDirection.dy;
        }
      }
    }
  }

  // Funkcja generująca mapę
  function generateMap() {
    let balloonCount = 0;
    const maxBalloons = Math.floor(Math.random() * 5) + 8;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * block;
        const y = row * block;

        if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
          // Ściana zewnętrzna
          const wallImg = new Image();
          const wall = { x, y, type: "wall", img: wallImg };
          mapObjects.push(wall);
          wallImg.src = "../public/spritesheet.png";
        } else if (row % 2 === 0 && col % 2 === 0) {
          // Ściana wewnętrzna
          const wallImg = new Image();
          const wall = { x, y, type: "wall", img: wallImg };
          mapObjects.push(wall);
          wallImg.src = "../public/spritesheet.png";
        } else {
          // Losowe elementy
          const rand = Math.random();
          if (rand < 0.2) {
            const brickImg = new Image();
            const brick = { x, y, type: "brick", img: brickImg };
            mapObjects.push(brick);
            brickImg.src = "../public/spritesheet.png";
          } else if (rand > 0.9 && balloonCount < maxBalloons) {
            const balloonImg = new Image();
            const direction = getRandomDirection();
            const balloon = {
              x,
              y,
              type: "balloon",
              dx: direction.dx,
              dy: direction.dy,
              frame: 0,
              frameNumber: 1,
              img: balloonImg,
            };
            mapObjects.push(balloon);
            balloonImg.src = "../public/spritesheet.png";
            balloonCount++;
          }
        }
      }
    }
  }

  // Funkcja do rysowania obiektów z mapy
  function drawMapObjects() {
    for (const obj of mapObjects) {
      if (obj.type === "wall") {
        ctx.drawImage(obj.img, 48, 48, 16, 16, obj.x, obj.y, block, block);
      }
      if (obj.type === "brick") {
        ctx.drawImage(obj.img, 64, 48, 16, 16, obj.x, obj.y, block, block);

      }
    }
  }

  // Rysowanie planszy
  drawGrid();
  generateMap();

  // Uruchomienie głównej pętli gry
  setInterval(() => {
    drawGrid();
    drawMapObjects();
    updateBalloons();
  }, 75);
}