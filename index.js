const map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const TICK = 30;
const CELL_SIZE = 64;
const PLAYER_SIZE = 10;
const FOV = toRadians(69);

const COLOURS = {
    rays: "#ffa600"
}

const player = {
    x: CELL_SIZE * 1.5,
    y: CELL_SIZE * 1.5,
    angle: 0,
    speed: 0
}

const canvas = document.createElement("canvas");
canvas.setAttribute("width", SCREEN_WIDTH)
canvas.setAttribute("height", SCREEN_HEIGHT)
document.body.append(canvas);

const context = canvas.getContext("2d");


function clearScreen() {

    context.fillStyle = "red";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

}

function movePlayer() {
    
    player.x += player.speed*Math.cos(player.angle);
    player.y += player.speed*Math.sin(player.angle);
}

function outOfMapBounds(x, y) {
    return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function getVCollision(angle) {

    // know which side we're facing (check left or right)
    const right = Math.abs(Math.floor((angle - MATH.PI/2)/Math.PI) % 2);

    // nearest vertical
    const firstX = Math.floor(player.x / CELL_SIZE) * CELL_SIZE;
    if (right) {
        firstX += CELL_SIZE;
    }

    const firstY = player.y + (firstX-player.x) * Math.tan(angle);

    const xA = right ? CELL_SIZE : -CELL_SIZE;
    const yA = xA * Math.tan(angle);

    // check if any intersection points have wall
    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = Math.floor(nextX / CELL_SIZE);
        const cellY = Math.floor(nextY / CELL_SIZE);
        if (!right) {
            cellX--;
        }

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }

        wall = map[cellY][cellX];
        if (!wall) {
            nextX += xA;
            nextY += yA;
        }
    }

    return {
        angle, 
        distance: distance(player.x, player.y, nextX, nextY), 
        vertical: true
    };
}

function getHCollision(angle) {

    const up = Math.abs(Math.floor(angle / MATH.PI) % 2);
    const firstY = Math.floor(player.y / CELL_SIZE) * CELL_SIZE;
    if (!up) {
        firstY += CELL_SIZE;
    }

    const firstX = player.x + (firstY-player.y) / Math.tan(angle);

    const yA = up ? -CELL_SIZE : CELL_SIZE;
    const xA = yA / Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = Math.floor(nextX / CELL_SIZE);
        const cellY = Math.floor(nextY / CELL_SIZE);
        if (up) {
            cellY--;
        }

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }

        wall = map[cellY][cellX];
        if (!wall) {
            nextX += xA;
            nextY += yA;
        }
    }

    return {
        angle, 
        distance: distance(player.x, player.y, nextX, nextY),
        vertical: false
    };
}

// cast eacch ray, check vert and hori intersections
function castRay(angle) {
    const vCollision = getVCollision(angle);
    const hCollision = getHCollision(angle);

    return vCollision.distance >= hCollision.distance ? hCollision.distance : vCollision.distance;
}

function getRays() {
    // const initialAngle = player.angle - FOV/2;
    // const numRays = SCREEN_WIDTH;
    // const dAngle = FOV/numRays;

    // return Array.from({length: numRays}, (_, i) => {
    //     const angle = initialAngle + i*dAngle;
    //     const ray = castRay(angle);
    //     return ray;
    // });
    return []
}

function renderScene(rays) {
    
}

// function renderMinimap(posX = 0, posY = 0, scale, rays) {
//     const cellSize = scale * CELL_SIZE;
//     map.forEach((row, y) => {
//       row.forEach((cell, x) => {
//         if (cell) {
//           context.fillStyle = "grey";
//           context.fillRect(
//             posX + x * cellSize,
//             posY + y * cellSize,
//             cellSize,
//             cellSize
//           );
//         }
//       });
//     });
//     context.fillStyle = "blue";
//     context.fillRect(
//       posX + player.x * scale - 10 / 2,
//       posY + player.y * scale - 10 / 2,
//       10,
//       10
//     );
  
//     context.strokeStyle = "blue";
//     context.beginPath();
//     context.moveTo(player.x * scale, player.y * scale);
//     context.lineTo(
//       (player.x + Math.cos(player.angle) * 20) * scale,
//       (player.y + Math.sin(player.angle) * 20) * scale
//     );
//     context.closePath();
//     context.stroke();
  
//     context.strokeStyle = COLORS.rays;
//     rays.forEach((ray) => {
//       context.beginPath();
//       context.moveTo(player.x * scale, player.y * scale);
//       context.lineTo(
//         (player.x + Math.cos(ray.angle) * ray.distance) * scale,
//         (player.y + Math.sin(ray.angle) * ray.distance) * scale
//       );
//       context.closePath();
//       context.stroke();
//     });
//   }
  

// x, y is position of minimap on screen
function renderMinimap(x, y, scale, rays) {

    let x_pos = x + player.x*scale;
    let y_pos = y + player.y*scale;
    
    const cellSize = scale * CELL_SIZE;

    // don't return anything, use forEach
    map.forEach((row, j) => {
        row.forEach((cell, i) => {
            if (cell) {
                context.fillStyle = "grey";
                context.fillRect(x + i*cellSize, y + j*cellSize, cellSize, cellSize);
            }
        });
    });

    // render rays
    context.strokeStyle = COLOURS.rays;
    rays.forEach(ray => {
        context.beginPath();
        context.moveTo(x_pos, y_pos);

        context.lineTo(
            (player.x + ray.distance*Math.cos(ray.angle))*scale, 
            (player.y + ray.distance*Math.sin(ray.angle))*scale,
        );
        context.closePath();
        context.stroke();
    });

    // render player
    context.fillStyle = "blue";
    context.fillRect(
        x_pos - PLAYER_SIZE/2,
        y_pos - PLAYER_SIZE/2,
        PLAYER_SIZE, PLAYER_SIZE
    );

    // render direction of player
    const rayLength = PLAYER_SIZE * 2;
    context.strokeStyle = "blue";
    context.beginPath();
    context.moveTo(x_pos, y_pos);
    context.lineTo(
        (player.x + rayLength*Math.cos(player.angle))*scale, 
        (player.y + rayLength*Math.sin(player.angle))*scale,
    );

    context.closePath();
    context.stroke();
}

function gameLoop() {
    
    // clear screen and redraw every tick
    clearScreen();
    movePlayer();

    const rays = getRays();
    renderScene(rays);
    renderMinimap(0, 0, 0.75, rays);
}

setInterval(gameLoop, TICK);



// player movement
document.addEventListener("keydown", (e) => {
    if (e.key === "w") {
        player.speed = 2;
    }

    if (e.key === "d") {
        player.speed = -2;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "d") {
        player.speed = 0;
    }
});

// mouse movement
document.addEventListener("mousemove", (e) => {

    // convert to radians
    player.angle += toRadians(e.movementX);
});
