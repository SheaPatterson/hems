import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data: any) => {
    // whitelist channels
    let validChannels = ['window-minimize', 'window-maximize', 'window-close', 'restart_app'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    let validChannels = ['update_available', 'update_downloaded', 'main-process-message'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: any[]) => func(...args));
    }
  }
});