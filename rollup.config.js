import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import hashbang from 'rollup-plugin-hashbang'
import copy from 'rollup-plugin-copy';
import json from "@rollup/plugin-json";

const packageJson = require('./package.json');

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
            },
            // {
            //     file: packageJson.module,
            //     format: 'esm',
            //     sourcemap: true
            // }
        ],
        plugins: [
            copy({
                targets: [
                    { src: "src/templates", dest: 'dist/cjs/' },
                    // { src: "src/templates", dest: 'dist/esm/' }
                ]
            }),
            hashbang(),
            resolve(),
            commonjs({
                dynamicRequireTargets: [
                    "node_modules/@typescript-eslint/*"
                ]
            }),
            typescript({tsconfig: './tsconfig.json'}),
            json()
        ]
    },
    {
        input: "dist/cjs/index.d.ts",
        output: [{file: "dist/index.d.ts", format: "cjs"}],
        plugins: [dts()],
    }
]