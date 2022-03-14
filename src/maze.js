import extend from "fkutil-beta/extend.js"

extend.Array()

export default class Maze {
	static WALL = 0
	static BARRIER = 1
	static PATH = 2

	static print_chars = "#X "
	static draw_colors = [ "black", "blue", "transparent" ]

	static dx = [ [ 0, -1 ], [ 0, 1 ] ]
	static dy = [ [ -1, 0 ], [ 1, 0 ] ]
	static dxy = [ ...Maze.dx, ...Maze.dy ]

	constructor(r_max, c_max) {
		this.r_max = r_max
		this.c_max = c_max
		this.map = Array(r_max + 2).fill().map((_, r) => Array(c_max + 2).fill().map((_, c) => ({
			type: c === 0 || r === 0 || c === c_max + 1 || r === r_max + 1 ? Maze.WALL : r % 2 + c % 2, r, c
		})))
	}

	neighbor(r, c, dir = "xy") {
		return Maze[`d${dir}`].map(([ dr, dc ]) => [ r + dr, c + dc ]).filter(([ r, c ]) =>
			r >= 1 && r <= this.r_max && c >= 1 && c <= this.c_max
		).map(([ r, c ]) => this.map[r][c])
	}

	cells() {
		return this.map.flat()
	}
	[Symbol.iterator]() {
		return this.cells().values()
	}

	async randomize(r_in, c_in, { show_progress, fps } = {}) {
		const Bs_marked = []
		const visit = ({ r, c }) => {
			this.map[r][c].visited = true
			this.neighbor(r, c).filter(({ type }) => type === Maze.BARRIER).forEach(cell => {
				cell.sides = this.neighbor(cell.r, cell.c, cell.r % 2 ? "x" : "y")
				cell.visited = true
				Bs_marked.push(cell)
			})
		}
		visit({ r: r_in, c: c_in })
		while (Bs_marked.length) {
			if (show_progress) {
				show_progress(this)
				await new Promise(res => setTimeout(res, 1000 / fps))
			}
			const [ i, B_random ] = Bs_marked.randomEntry()
			const P_unvisited = B_random.sides.find(({ visited }) => ! visited)
			if (P_unvisited) {
				B_random.type = Maze.PATH
				visit(P_unvisited)
			}
			else B_random.visited = false
			Bs_marked.splice(i, 1)
		}
		for (const cell of this) {
			if (cell.type === Maze.BARRIER) cell.type = Maze.WALL
			delete cell.visited
		}
	}

	draw({ canvas, zoom }) {
		canvas.width = (this.c_max + 2) * zoom
		canvas.height = (this.r_max + 2) * zoom
		const ctx = canvas.getContext("2d")
		for (const { r, c, type, visited } of this) {
			ctx.fillStyle = Maze.draw_colors[type]
			ctx.fillRect(r * zoom, c * zoom, zoom, zoom)
			if (visited) {
				ctx.fillStyle = "red"
				ctx.fillRect((r + .25) * zoom, (c + .25) * zoom, .5 * zoom, .5 * zoom)
			}
		}
	}
}
