import { defineConfig } from 'vite';
import path from 'path';
import liveReload from 'vite-plugin-live-reload';
import nunjucks from 'vite-plugin-nunjucks';
import autoprefixer from 'autoprefixer';
import { vitePluginReplace } from '@mb1337/vite-plugin-replace';
import vitePluginHtmlBeautify from './plugins/vite-plugin-html-beautify';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import pkg from './package.json';

export default defineConfig(({ command }) => {
  const isProd = command === 'build';

  return {
    root: path.resolve(__dirname, 'src'),
    publicDir: path.resolve(__dirname, 'src/public'),
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'src/index.html'),
        output: {
          chunkFileNames: 'assets/main.js',
          entryFileNames: 'assets/main.js',
          assetFileNames: (assetInfo) => {
            const assetPath = 'assets';

            switch (path.extname(assetInfo.name).slice(1)) {
              case 'css':
                return `${assetPath}/main[extname]`;
              default:
                return `${assetPath}/[name][extname]`;
            }
          },
          plugins: [
            isProd && getBabelOutputPlugin({
              allowAllFormats: true,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: pkg.browserslist,
                    modules: false
                  }
                ],
                'minify'
              ]
            })
          ]
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '~': path.resolve(__dirname, 'node_modules')
      },
      extensions: ['.js', '.ts', '.json', '.scss', '.html']
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/styles/config.scss";
            @import "@/styles/mixins.scss";
            @import "@/styles/utils.scss";
          `
        }
      },
      postcss: {
        plugins: [
          autoprefixer()
        ]
      }
    },
    plugins: [
      nunjucks.default({
        nunjucksEnvironment: {
          filters: {
            typeof: value => typeof value,
            json: value => value.trim().length ? JSON.parse(value) : null,
            merge: (obj1, obj2) => {
              if (typeof obj1 === 'object' && typeof obj2 === 'object') {
                return { ...obj1, ...obj2 }
              }

              return null;
            },
            attr: value => {
              return value ? Object.entries(value).reduce((acc, [k, v]) => {
                acc += `${k}=${v} `;
                
                return acc;
              }, '') : null;
            }
          }
        }
      }),
      ...isProd ?
      [
        vitePluginReplace({
          replacements: [
            {
              from: /\/\*!/gm,
              to: '/*'
            }
          ]
        }),
        vitePluginHtmlBeautify({
          indent_size: 2,
          preserve_newlines: false,
          extra_liners: []
        })
      ] : [
        liveReload('./components/**/*.{html,scss,json,js,ts}', {
          alwaysReload: true
        })
      ]
    ]
  }
});