import { ipcRenderer, clipboard } from 'electron';
import * as os from 'os';
import type {NodeApiProps} from "../../type/global";


const exposeThings: Omit<NodeApiProps, 'MessagePort'> = {
  NODE_ENV: process.env.NODE_ENV,
  OS:os.platform()==='darwin'?'mac':'win',
  ipc: ipcRenderer,
  Clipboard: clipboard,
};
Object.entries(exposeThings).forEach(([key, value]) => {
  window[key] = value;
});


