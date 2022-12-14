import { exec } from 'child_process';
import { createServer, build } from 'vite';
import { join, resolve } from 'path';
import * as DotEnv from 'dotenv';
import { getDevPath } from './util.js';
import ora from 'ora';

DotEnv.config({ path: resolve(process.cwd(), './dev.env'), debug: true });
const parsed = new URL(import.meta.url);
const isDebug = parsed.searchParams.get('debug'); // vscode
const RootPath = resolve(process.cwd(), 'packages');
const filterLog = /CoreText|Font/gi;

/**
 *
 * @param viteDevServer {import('vite').ViteDevServer}
 * @returns {Promise<import('vite').RollupOutput | RollupOutput[] | RollupWatcher>}
 */
function watchMain(viteDevServer) {
  const url = getDevPath(viteDevServer);
  const main_path = process.env.MAIN_PATH;
  const execStr = `electron ${main_path}`;
  let env = Object.assign(process.env, {
    VITE_DEV_SERVER_URL: url
  });

  return build({
    configFile: join(RootPath, 'electron/vite.config.ts'),
    mode: 'development',
    plugins: [
      isDebug
        ? null
        : {
            name: 'electron-main-watcher',
            writeBundle() {
              if (process.electronApp) {
                process.electronApp.removeAllListeners();
                process.electronApp.kill();
                env = Object.assign(env, {
                  RELOAD_MAIN: 'true'
                });
              }
              startElectron(execStr, env).then((res) => {
                process.electronApp = res;
                process.electronApp.once('exit', process.exit);
              });
            }
          }
    ].filter(Boolean),
    build: {
      watch: {}
    }
  });
}

/**
 *
 * @param server {import('vite').ViteDevServer}
 * @returns {Promise<import('vite').RollupOutput | RollupOutput[] | RollupWatcher>}
 */
function watchPreload(server) {
  return build({
    configFile: join(RootPath, 'preload/vite.config.ts'),
    mode: 'development',
    plugins: [
      {
        name: 'electron-preload-watcher',
        writeBundle() {
          server.ws.send({ type: 'full-reload' });
        }
      }
    ],
    build: {
      watch: {}
    }
  });
}

/**
 *
 * @param {string} execPath
 * @param {NodeJS.ProcessEnv?} env
 * return {Promise<unknown>}
 */
const startElectron = async (execPath, env) => {
  const childProcess = await exec(execPath, {
    env: {
      ...env
    }
  });
  Log(childProcess);
  return childProcess;
};

/**
 *
 * @param {ChildProcess} childProcess
 * @constructor
 */
const Log = (childProcess) => {
  childProcess.stdout.on('data', (d) => {
    if (!filterLog.test(d)){
      d.toString().trim() && console.info(d.toString())
    }
  });
  childProcess.stderr.on('data', (d) => {
    if (!filterLog.test(d)) {
      console.error(d.toString());
    }
  });
};

// ??????
console.time('??????????????????')
const spinner = ora('?????????????????????').start();

const server = await createServer({ configFile: join(RootPath, 'renderer/vite.config.ts') });
await server.listen();

spinner.succeed('???????????????????????????\n');
spinner.start('??????????????????preload??????\n');

//????????????????????????preload??????
await watchPreload(server);
await watchMain(server);

spinner.succeed('????????????preload??????????????????\n');
console.timeEnd('??????????????????');
console.log('\n');
