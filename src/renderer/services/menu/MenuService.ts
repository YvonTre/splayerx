import { ipcRenderer, remote, MenuItem } from 'electron';
import { recentPlayService } from '../media/RecentPlayService';
import { browsingHistory } from '../browsing/BrowsingHistoryService';

export default class MenuService {
  private menu?: Electron.Menu;

  public on(channel: string, callback: Function) {
    ipcRenderer.on(channel, callback);
  }

  public popupWinMenu() {
    ipcRenderer.send('popup-menu');
  }

  public updateLocale() {
    ipcRenderer.send('update-locale');
  }

  public updateRouteName(routeName: string) {
    ipcRenderer.send('update-route-name', routeName);
  }

  public updateMenuItemLabel(id: string, label: string) {
    ipcRenderer.send('update-label', id, label);
  }

  public updateMenuItemChecked(id: string, checked: boolean) {
    ipcRenderer.send('update-checked', id, checked);
  }

  public updateMenuItemEnabled(id: string, enabled: boolean) {
    ipcRenderer.send('update-enabled', id, enabled);
  }

  public updateFocusedWindow(isFocusedOnMain: boolean, isNewWindow: boolean) {
    ipcRenderer.send('update-focused-window', isFocusedOnMain, isNewWindow);
  }

  public resolveMute(state: boolean) {
    this.updateMenuItemChecked('audio.mute', state);
  }

  public async addRecentPlayItems() {
    const items = await recentPlayService.getMenuDisplayInfo();
    ipcRenderer.send('update-recent-play', items);
  }

  public async addBrowsingHistoryItems() {
    const items = await browsingHistory.getMenuDisplayInfo();
    ipcRenderer.send('update-browisng-history', items);
  }

  public addPrimarySub(menuItem: Electron.MenuItem) {
    ipcRenderer.send('update-primary-sub', menuItem);
  }

  public addSecondarySub(menuItem: Electron.MenuItem) {
    ipcRenderer.send('update-secondary-sub', menuItem);
  }

  public addAudioTrack(menuItem: Electron.MenuItem) {
    ipcRenderer.send('update-audio-track', menuItem);
  }

  public isMenuItemChecked(id: string): boolean {
    if (this.getMenuItemById(id)) return this.getMenuItemById(id).checked;
    return false;
  }

  private getMenuItemById(id: string): Electron.MenuItem {
    if (!this.menu) this.menu = remote.Menu.getApplicationMenu() as Electron.Menu;
    return this.menu.getMenuItemById(id);
  }
}

export const menuService = new MenuService();
