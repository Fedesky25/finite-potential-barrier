import svelte from 'rollup-plugin-svelte'
import css from 'rollup-plugin-css-only'
import resolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias';

export default {
    input: './components/App.js',
    output: {
        format: 'iife',
        name: 'app',
        file: 'public/script.js'
    },
    plugins: [
        svelte(),
        css({output: 'style.css'}),
        resolve({browser: true}),
        alias({entries: [{find: /^@utils\/(.*)$/, replacement: "./utils/$1"}]})
    ]
};