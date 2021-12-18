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
const WALL_HEIGHT = CELL_SIZE * 5;
const FOV = toRadians(69);

const COLOURS = {
    rays: "#ffa600",
    floor: "#d52b1e",
    ceiling: "#ffffff",
    wall: "#013aa6",
    wallDark: "#012975"
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

    player.x += player.speed * Math.cos(player.angle);
    player.y += player.speed * Math.sin(player.angle);
}

function outOfMapBounds(x, y) {
    return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}




function getVCollision(angle) {

    // know which side we're facing (check left or right)
    const right = Math.abs(Math.floor((angle - Math.PI/2)/Math.PI) % 2);

    // nearest vertical
    const firstX = right
        ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
        : Math.floor(player.x / CELL_SIZE) * CELL_SIZE;

    const firstY = player.y + (firstX-player.x) * Math.tan(angle);

    const dx = right ? CELL_SIZE : -CELL_SIZE;
    const dy = dx * Math.tan(angle);

    // check if any intersection points have wall
    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = right
            ? Math.floor(nextX / CELL_SIZE)
            : Math.floor(nextX / CELL_SIZE) - 1;
        const cellY = Math.floor(nextY / CELL_SIZE);

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }

        wall = map[cellY][cellX];
        if (!wall) {
            nextX += dx;
            nextY += dy;
        }
    }

    return {
        angle, 
        distance: distance(player.x, player.y, nextX, nextY), 
        vertical: true
    };
}

function getHCollision(angle) {

    const up = Math.abs(Math.floor(angle / Math.PI) % 2);
    const firstY = up
        ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
        : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;

    const firstX = player.x + (firstY-player.y) / Math.tan(angle);

    const dy = up ? -CELL_SIZE : CELL_SIZE;
    const dx = dy / Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = Math.floor(nextX / CELL_SIZE);
        const cellY = up
            ? Math.floor(nextY / CELL_SIZE) - 1
            : Math.floor(nextY / CELL_SIZE);

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }

        wall = map[cellY][cellX];
        if (!wall) {
            nextX += dx;
            nextY += dy;
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

    return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
}

function getRays() {
    const initialAngle = player.angle - FOV / 2;
    const numRays = SCREEN_WIDTH;
    const dAngle = FOV / numRays;

    return Array.from({ length: numRays }, (_, i) => {
        const angle = initialAngle + i * dAngle;
        const ray = castRay(angle);
        return ray;
    });
}

function renderScene(rays) {

    rays.forEach((ray, i) => {
        const dist = ray.distance;
        const wallHeight = 277 * (WALL_HEIGHT / dist);

        // draw vertical line for walls
        context.fillStyle = ray.vertical ? COLOURS.wallDark : COLOURS.wall;
        context.fillRect(i, SCREEN_HEIGHT/2 - wallHeight/2, 1, wallHeight);
        context.fillStyle = COLOURS.floor;
        context.fillRect(i, SCREEN_HEIGHT/2 + wallHeight/2, 1, SCREEN_HEIGHT/2 - wallHeight/2);
        context.fillStyle = COLOURS.ceiling;
        context.fillRect(i, 0, 1, SCREEN_HEIGHT/2 - wallHeight/2)
    });
}


// x, y is position of minimap on screen
function renderMinimap(x, y, scale, rays) {

    let x_pos = x + player.x * scale;
    let y_pos = y + player.y * scale;

    const cellSize = scale * CELL_SIZE;

    // don't return anything, use forEach
    map.forEach((row, j) => {
        row.forEach((cell, i) => {
            if (cell) {
                context.fillStyle = "grey";
                context.fillRect(x + i * cellSize, y + j * cellSize, cellSize, cellSize);
            }
        });
    });

    // render rays
    context.strokeStyle = COLOURS.rays;
    rays.forEach(ray => {
        context.beginPath();
        context.moveTo(x_pos, y_pos);

        context.lineTo(
            (player.x + ray.distance * Math.cos(ray.angle)) * scale,
            (player.y + ray.distance * Math.sin(ray.angle)) * scale,
        );
        context.closePath();
        context.stroke();
    });

    // render player
    context.fillStyle = "blue";
    context.fillRect(
        x_pos - PLAYER_SIZE / 2,
        y_pos - PLAYER_SIZE / 2,
        PLAYER_SIZE, PLAYER_SIZE
    );

    // render direction of player
    const rayLength = PLAYER_SIZE * 2;
    context.strokeStyle = "blue";
    context.beginPath();
    context.moveTo(x_pos, y_pos);
    context.lineTo(
        (player.x + rayLength * Math.cos(player.angle)) * scale,
        (player.y + rayLength * Math.sin(player.angle)) * scale,
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

    if (e.key === "s") {
        player.speed = -2;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s") {
        player.speed = 0;
    }
});

// mouse movement
document.addEventListener("mousemove", (e) => {

    // convert to radians
    player.angle += toRadians(e.movementX);
});
