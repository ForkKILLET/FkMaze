require("esbuild").buildSync({
	entryPoints: [ "src/test.js" ],
	bundle: true,
	minify: true,
	sourcemap: true,
	format: "iife",
	outfile: "docs/bundle.js",
})
