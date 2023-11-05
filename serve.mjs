/*
Serve and bundle the source code using esbuild.

Refer to the API docs https://esbuild.github.io/api/
*/

import * as esbuild from 'esbuild'

const ctx = await esbuild.context({
    entryPoints: [
        {"in": 'src/app.tsx', "out": 'bundle'},
        {"in": 'src/style.css', "out": 'bundle'}
    ],
    platform: 'browser',
    outdir: 'www',
    bundle: true,
    sourcemap: "linked"
});

const {host, port} = await ctx.serve({
    servedir: 'www',
    host: '::1',
    port: 8080
});

console.log("Serving on http://[%s]:%d", host, port)
