import {app, BrowserWindow, screen} from 'electron';
import {isDev,mainPagePath, preloadPath} from './utils/path';
import { getOsType } from './utils/system';

const os = getOsType();

let mainWindow: BrowserWindow | undefined;
const gotTheLock = app.requestSingleInstanceLock();


//创建窗口
async function init() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: width - 100,
    height: height - 20,
    center: true,
    frame: os === 'win',
    show: false,
    transparent: true,
    resizable: true,
    titleBarStyle: os === 'win' ? (isDev ? 'default' : 'hidden') : 'hidden',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      plugins: true
    }
  });

  mainWindow?.on('ready-to-show', async () => {
    mainWindow?.show();
  });

  await mainWindow?.loadURL(mainPagePath);

  mainWindow?.on('closed', () => {
    mainWindow = undefined;
  });
}

//避免多实例
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on('ready', async () => {
  await init();
});

app.on('window-all-closed', function () {
  app.quit();
});

app.on('before-quit', async (e: Electron.Event) => {
  try {
    app.quit();
  } catch (e: any) {
    app.exit();
    console.error('发生错误' + e);
  }
});
