import Maze from "./maze.js"

env.exports = async () => {
	const { term, chalk } = env
	const maze = new Maze(25, 25)
	const print = () => {
		term.clear()
		term.write(maze.map.map(col => col.map(({ type, visited }) => {
			let ch = Maze.print_chars[type].repeat(2)
			if (visited) ch = chalk.bgRed(ch)
			return ch
		}).join("")).join("\r\n"))
	}
	await maze.randomize(1, 1, { show_progress: draw, fps: 40 })
	print()
}
