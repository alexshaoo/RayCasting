const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const canvas = document.createElement("canvas");
canvas.setAttribute("width", SCREEN_WIDTH)
canvas.setAttribute("height", SCREEN_HEIGHT)

document.body.append(canvas);

const TICK = 30;
const CELL_SIZE = 64;
const PLAYER_SIZE = 10;
const COLOURS = {
    rays: "#ffa600"
}

const context = canvas.getContext("2d");

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

const player = {
    x: CELL_SIZE * 1.5,
    y: CELL_SIZE * 1.5,
    angle: 0,
    speed: 0
}

function clearScreen() {

    context.fillStyle = "red";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

}

function movePlayer() {
    
    player.x += player.speed*Math.cos(player.angle);
    player.y += player.speed*Math.sin(player.angle);
}

function getRays() {
    return []
}

function renderScene(rays) {
    
}

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

function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

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
})
