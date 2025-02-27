/* constants */
const NEIGHBOR_DIRECTIONS = [[-1,0], [0,1], [1,0], [0,-1]]

/* functions */
function idx(grid, pos) {
	// Check if position is out of bounds
	if (pos[0] < 0 || pos[0] >= grid.n_rows) return undefined;
	if (pos[1] < 0 || pos[1] >= grid.n_cols) return undefined;
	return pos[0]*grid.n_cols + pos[1];
}

function next(grid, pos) {
	const neighbors = [];
	for (const dp of NEIGHBOR_DIRECTIONS) {
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
		} else {
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

function draw_circle(canvas, x, y, r, color) {
	const ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
}

function render(grid, A, B, path) {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const w = Math.floor(canvas.width / grid.n_cols);
	const h = Math.floor(canvas.height / grid.n_rows);

	const pad = 0;
	path.forEach((C) => draw_square(canvas, w*C[1] + pad/2, h*C[0] + pad/2,
					w - pad, h - pad, '#FAA'))

	draw_square(canvas, w*A[1], h*A[0], w, h, '#f00');
	draw_square(canvas, w*B[1], h*B[0], w, h, '#f00');

	for (let i_row = 0; i_row < grid.n_rows; ++i_row) {
		for (let i_col = 0; i_col < grid.n_cols; ++i_col) {
			const {walls, visited} = grid.cells[i_row*grid.n_cols + i_col];
			const x = i_col * w;
			const y = i_row * h;

			// if (visited) draw_square(canvas, x, y, w, h, 'rgba(224, 49, 49, 0.2)');

			if (walls[0]) draw_line(canvas, x, y, x+w, y, 1, '#000');     // North
			if (walls[1]) draw_line(canvas, x+w, y, x+w, y+h, 1, '#000'); // East
			if (walls[2]) draw_line(canvas, x, y+h, x+w, y+h, 1, '#000'); // South
			if (walls[3]) draw_line(canvas, x, y, x, y+h, 1, '#000');     // West
		}
	}

}

function random_cell(grid) {
	return [Math.floor(Math.random() * grid.n_rows),
		Math.floor(Math.random() * grid.n_cols)]
}

function dist_manhattan(a, b) {
	return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function idx2pos(grid, i) {
	const row = Math.floor(i / grid.n_cols);
	const col = i % grid.n_cols;
	return [row, col]
}


function reconstruct_path(grid, parents, i_node) {
	let path = [idx2pos(grid, i_node)];
	while (i_node in parents) {
		i_node = parents[i_node];
		path.unshift(idx2pos(grid, i_node));
	}
	return path;
}

function pathfind(grid, A, B) {
	const i_A = idx(grid, A)
	const i_B = idx(grid, B)

	const g_score = new Array(grid.n_rows * grid.n_cols).fill(Infinity);
	const f_score = new Array(grid.n_rows * grid.n_cols).fill(Infinity);
	const parents = {}
	const open = [i_A]

	g_score[i_A] = 0;
	f_score[i_A] = dist_manhattan(A, B);

	while (open.length > 0) {
		let i_current = open[0];
		let f = f_score[i_current];
		for (const i_new of open) {
			const f_ = f_score[i_new]
			if (f_ < f) {
				f = f_
				i_current = i_new
			}
		}

		if (i_B === i_current) {
			return reconstruct_path(grid, parents, i_current);
		}

		open.splice(open.indexOf(i_current), 1);
		for (const dir of NEIGHBOR_DIRECTIONS) {
			const pos        = idx2pos(grid, i_current)
			const i_neighbor = idx(grid, [pos[0] + dir[0], pos[1] + dir[1]]);

			if (i_neighbor === undefined) {
				continue;
			}

			let wall_exists = false;
			if      (dir[0] === -1) wall_exists = grid.cells[i_current].walls[0]; // North
			else if (dir[0] ===  1) wall_exists = grid.cells[i_current].walls[2]; // South
			else if (dir[1] === -1) wall_exists = grid.cells[i_current].walls[3]; // West
			else if (dir[1] ===  1) wall_exists = grid.cells[i_current].walls[1]; // East

			if (wall_exists) {
				continue;
			}

			const g  = g_score[i_current] + 1; // Cost to move is 1
			const g_ = g_score[i_neighbor];
			if (g < g_) {
				parents[i_neighbor] = i_current;
				g_score[i_neighbor] = g;
				f_score[i_neighbor] = g + dist_manhattan(idx2pos(grid, i_neighbor), B);

				if (!open.includes(i_neighbor)) {
					open.push(i_neighbor);
				}
			}
		}
	}
	return [];
}

/* program */
function main() {
	const grid = generate(50,50)

	const A = random_cell(grid)
	const B = random_cell(grid)
	const path = pathfind(grid, A, B)

	console.log(path)

	render(grid, A, B, path)
}


window.onload = main;
