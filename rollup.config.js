import svelte from 'rollup-plugin-svelte'
import css from 'rollup-plugin-css-only'
import resolve from '@rollup/plugin-node-resolve'

export default {
    input: './svelte/editor/Main.js',
    output: {
        format: 'iife',
        name: 'app',
        file: 'public/script.js'
    },
    plugins: [
        svelte(),
        css({output: 'style.css'}),
        resolve({browser: true})
    ]
};