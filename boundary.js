const { _findLine } = require("yt-search");

class Boundary {

    constructor(x1, y1, x2, y2) {
        this.a = createVector(x1, y1);
        this.b = createVector(x2, y2);
    }

    // draw the 'line' formed by the points that acts as a boundary
    show() {
        stroke(255);
        line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
}