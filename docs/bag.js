(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/maze.js
  Array.prototype.randomEntry = function() {
    const i = ~~(Math.random() * 1e6) % this.length;
    return [i, this[i]];
  };
  var _Maze = class {
    constructor(r_max, c_max) {
      this.r_max = r_max;
      this.c_max = c_max;
      this.map = Array(r_max + 2).fill().map((_, r) => Array(c_max + 2).fill().map((_2, c) => ({
        type: c === 0 || r === 0 || c === c_max + 1 || r === r_max + 1 ? _Maze.WALL : r % 2 + c % 2,
        r,
        c
      })));
    }
    neighbor(r, c, dir = "xy") {
      return _Maze[`d${dir}`].map(([dr, dc]) => [r + dr, c + dc]).filter(([r2, c2]) => r2 >= 1 && r2 <= this.r_max && c2 >= 1 && c2 <= this.c_max).map(([r2, c2]) => this.map[r2][c2]);
    }
    cells() {
      return this.map.flat();
    }
    [Symbol.iterator]() {
      return this.cells().values();
    }
    async randomize(r_in, c_in, { show_progress, fps } = {}) {
      const Bs_marked = [];
      const visit = ({ r, c }) => {
        this.map[r][c].visited = true;
        this.neighbor(r, c).filter(({ type }) => type === _Maze.BARRIER).forEach((cell) => {
          cell.sides = this.neighbor(cell.r, cell.c, cell.r % 2 ? "x" : "y");
          cell.visited = true;
          Bs_marked.push(cell);
        });
      };
      visit({ r: r_in, c: c_in });
      while (Bs_marked.length) {
        if (show_progress) {
          show_progress(this);
          await new Promise((res) => setTimeout(res, 1e3 / fps));
        }
        const [i, B_random] = Bs_marked.randomEntry();
        const P_unvisited = B_random.sides.find(({ visited }) => !visited);
        if (P_unvisited) {
          B_random.type = _Maze.PATH;
          visit(P_unvisited);
        } else
          B_random.visited = false;
        Bs_marked.splice(i, 1);
      }
      for (const cell of this) {
        if (cell.type === _Maze.BARRIER)
          cell.type = _Maze.WALL;
        delete cell.visited;
      }
    }
    draw({ canvas, zoom }) {
      canvas.width = (this.c_max + 2) * zoom;
      canvas.height = (this.r_max + 2) * zoom;
      const ctx = canvas.getContext("2d");
      for (const { r, c, type, visited } of this) {
        ctx.fillStyle = _Maze.draw_colors[type];
        ctx.fillRect(r * zoom, c * zoom, zoom, zoom);
        if (visited) {
          ctx.fillStyle = "red";
          ctx.fillRect((r + 0.25) * zoom, (c + 0.25) * zoom, 0.5 * zoom, 0.5 * zoom);
        }
      }
    }
  };
  var Maze = _Maze;
  __publicField(Maze, "WALL", 0);
  __publicField(Maze, "BARRIER", 1);
  __publicField(Maze, "PATH", 2);
  __publicField(Maze, "print_chars", "#X ");
  __publicField(Maze, "draw_colors", ["black", "blue", "transparent"]);
  __publicField(Maze, "dx", [[0, -1], [0, 1]]);
  __publicField(Maze, "dy", [[-1, 0], [1, 0]]);
  __publicField(Maze, "dxy", [..._Maze.dx, ..._Maze.dy]);

  // src/bag.js
  env.exports = async () => {
    const { term, chalk } = env;
    const maze = new Maze(25, 25);
    const print = () => {
      term.clear();
      term.write("\r");
      term.write(maze.map.map((col) => col.map(({ type, visited }) => {
        let ch = Maze.print_chars[type].repeat(2);
        if (visited)
          ch = chalk.bgRed(ch);
        return ch;
      }).join("")).join("\r\n"));
    };
    await maze.randomize(1, 1, { show_progress: print, fps: 40 });
    print();
  };
})();
