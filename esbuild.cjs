const esbuild = require("esbuild")

esbuild.buildSync({
	entryPoints: [ "src/test.js" ],
	bundle: true,
	minify: true,
	sourcemap: true,
	format: "iife",
	outdir: "docs/",
})

esbuild.buildSync({
	entryPoints: [ "src/bag.js" ],
	bundle: true,
	minify: true,
	format: "iife",
	outdir: "docs/",
})
