/* constants */
const DPOSITIONS = [[-1,0], [0,1], [1,0], [0,-1]]

/* functions */
function idx(grid, pos) {
    // Check if position is out of bounds
    if (pos[0] < 0 || pos[0] >= grid.n_rows) return undefined;
    if (pos[1] < 0 || pos[1] >= grid.n_cols) return undefined;
    return pos[0]*grid.n_cols + pos[1];
}

function next(grid, pos) {
    const neighbors = [];
    for (const dp of DPOSITIONS) {
        const pos_ = [pos[0] + dp[0], pos[1] + dp[1]];
        const i = idx(grid, pos_);
        if (i !== undefined && !grid.cells[i].visited) {
            neighbors.push(pos_);
        }
    }
    if (neighbors.length <= 0) {
        return undefined;
    }
    const i_selected = Math.floor(Math.random() * neighbors.length);
    return neighbors[i_selected];
}

function remove_wall(grid, p1, p2) {
    const c1 = grid.cells[idx(grid, p1)];
    const c2 = grid.cells[idx(grid, p2)];
    const di = p2[0] - p1[0];
    const dj = p2[1] - p1[1];

    if (di === -1) {
        c1.walls[0] = false;
        c2.walls[2] = false;
    }
    if (di === 1) {
        c1.walls[2] = false;
        c2.walls[0] = false;
    }
    if (dj === -1) {
        c1.walls[3] = false;
        c2.walls[1] = false;
    }
    if (dj === 1) {
        c1.walls[1] = false;
        c2.walls[3] = false;
    }
}

function generate(n_rows, n_cols) {
    const cells = [];
    for (let i = 0; i < (n_rows * n_cols); ++i) {
        cells.push({walls: [true, true, true, true], visited: false});
    }
    const grid = {cells, n_rows, n_cols};

    const stack = [];
    let pos = [0, 0];
    grid.cells[idx(grid, pos)].visited = true;
    stack.push(pos);

    while (stack.length > 0) {
        pos = stack[stack.length - 1];
        const next_pos = next(grid, pos);

        if (next_pos) {
            grid.cells[idx(grid, next_pos)].visited = true;
            remove_wall(grid, pos, next_pos);
            stack.push(next_pos);
	} else if (stack.length > 0){
            stack.pop();
        }
    }

    return grid;
}

function draw_line(canvas, x1, y1, x2, y2, w, color) {
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = w;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function draw_square(canvas, x, y, w, h, color) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function render(grid) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	console.log(canvas.width)
    const w = Math.floor(canvas.width / grid.n_cols);
    const h = Math.floor(canvas.height / grid.n_rows);

    for (let i_row = 0; i_row < grid.n_rows; ++i_row) {
        for (let i_col = 0; i_col < grid.n_cols; ++i_col) {
            const {walls, visited} = grid.cells[i_row*grid.n_cols + i_col];
            const x = i_col * w;
            const y = i_row * h;

            // if (visited) draw_square(canvas, x, y, w, h, 'rgba(224, 49, 49, 0.2)');

            // Draw walls: North, East, South, West
            if (walls[0]) draw_line(canvas, x, y, x+w, y, 1, '#000');     // North
            if (walls[1]) draw_line(canvas, x+w, y, x+w, y+h, 1, '#000'); // East
            if (walls[2]) draw_line(canvas, x, y+h, x+w, y+h, 1, '#000'); // South
            if (walls[3]) draw_line(canvas, x, y, x, y+h, 1, '#000');     // West
        }
    }
}

/* program */
window.onload = () => {
    const grid = generate(50,50);
    render(grid);
};
window.onload = () => {
    const grid = generate(50,50);
    render(grid);
};

const reloadButton = document.getElementById('reload-button');
reloadButton.onclick = () => {
    const grid = generate(50,50);
    render(grid);
};




