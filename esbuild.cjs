require("esbuild").buildSync({
	entryPoints: [ "src/test.js", "src/bag.js" ],
	bundle: true,
	minify: true,
	sourcemap: true,
	format: "iife",
	outdir: "docs/",
})
