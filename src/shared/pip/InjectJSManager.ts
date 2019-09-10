import youtube from './youtube';
import {
  bilibili, bilibiliBarrageAdapt, bilibiliFindType, bilibiliVideoPause,
} from './bilibili';
import iqiyi, { iqiyiBarrageAdapt } from './iqiyi';
import globalPip from './others';

class InjectJSManager implements IInjectJSManager {
  private readonly calcVideoNumCode: string;

  private readonly getVideoStyleCode: string;

  private readonly pauseNormalVideo: string;

  public constructor() {
    this.calcVideoNumCode = 'var iframe = document.querySelector("iframe");'
      + 'if (iframe && iframe.contentDocument) {'
      + 'document.getElementsByTagName("video").length + iframe.contentDocument.getElementsByTagName("video").length'
      + '} else {'
      + 'document.getElementsByTagName("video").length'
      + '}';
    this.getVideoStyleCode = 'getComputedStyle(document.querySelector("video") || document.querySelector("iframe").contentDocument.querySelector("video"))';
    this.pauseNormalVideo = 'setTimeout(() => { document.querySelector("video").pause(); }, 100)';
  }

  public getPipByChannel(channel: string, type?: string,
    barrageState?: boolean, winSize?: number[]) {
    switch (channel) {
      case 'youtube':
        return youtube;
      case 'bilibili':
        return bilibili(type, barrageState, winSize);
      case 'iqiyi':
        return iqiyi(barrageState, winSize);
      case 'others':
        return globalPip(winSize);
      default:
        return globalPip(winSize);
    }
  }

  public getPipBarrage(channel: string, barrageState: boolean, type?: string) {
    switch (channel) {
      case 'bilibili':
        return bilibiliBarrageAdapt(type, barrageState);
      case 'iqiyi':
        return iqiyiBarrageAdapt(barrageState);
      default:
        return '';
    }
  }

  public initBarrageIcon(barrageState: boolean) {
    return `document.querySelector(".danmu").src = ${barrageState} ? "assets/danmu-default-icon.svg" : "assets/noDanmu-default-icon.svg"`;
  }

  public bilibiliFindType(): string {
    return bilibiliFindType;
  }

  public pauseVideo(channel: string, type?: string): string {
    switch (channel) {
      case 'bilibili':
        return bilibiliVideoPause(type);
      case 'normal':
        return this.pauseNormalVideo;
      default:
        return this.pauseNormalVideo;
    }
  }

  public updatePipControlState(shouldShow: boolean): string {
    return `document.querySelector(".pip-buttons").style.display = ${shouldShow} ? "flex" : "none";`;
  }

  public updateTitlebarState(className: string, state: boolean): string {
    return `document.querySelector(${className}).style.display = ${state} ? "block" : "none";`;
  }

  public updateFullScreenIcon(isFullScreen: boolean): string {
    if (process.platform === 'darwin') {
      return `document.querySelector(".titlebarMin").style.pointerEvents = ${isFullScreen} ? "none" : "";
        document.querySelector(".titlebarMin").style.opacity = ${isFullScreen} ? "0.25" : "1";
        document.querySelector(".titlebarFull").style.display = ${isFullScreen} ? "none" : "";
        document.querySelector(".titlebarRecover").style.display = ${isFullScreen} ? "block" : "none";`;
    }
    return `document.querySelector(".titlebarMax").style.display = ${isFullScreen} ? "none" : "block";
      document.querySelector(".titlebarUnMax").style.display = ${isFullScreen} ? "none" : "block";
      document.querySelector(".titlebarRecover").style.display = ${isFullScreen} ? "block" : "none";`;
  }

  public updateWinMaxIcon(isMaximize: boolean): string {
    return `document.querySelector(".titlebarMax").style.display = ${isMaximize} ? "none" : "block";
      document.querySelector(".titlebarUnMax").style.display = ${isMaximize} ? "block" : "none";
      document.querySelector(".titlebarRecover").style.display = ${isMaximize} ? "none" : "block";`;
  }

  public updateBarrageState(barrageState: boolean, opacity: number): string {
    return `const danmu = document.querySelector(".danmu");
      danmu.src = ${barrageState} ? "assets/danmu-default-icon.svg" : "assets/noDanmu-default-icon.svg";
      danmu.style.opacity = ${opacity};
      danmu.style.cursor = ${opacity} === 1 ? "cursor" : "default"`;
  }

  public emitKeydownEvent(keyCode: number) {
    return `var event = new KeyboardEvent("keydown", { keyCode: ${keyCode} });window.dispatchEvent(event)`;
  }

  public calcVideoNum() {
    return this.calcVideoNumCode;
  }

  public getVideoStyle() {
    return this.getVideoStyleCode;
  }
}

export interface IInjectJSManager {
  calcVideoNum(): string
  getVideoStyle(): string
  getPipByChannel(channel: string, type?: string, barrageState?: boolean, winSize?: number[]):
  { adapter: string, watcher?: string, recover: string }
  getPipBarrage(channel: string, barrageState: boolean, type?: string): string
  bilibiliFindType(): string
  pauseVideo(channel: string, type?: string): string
  initBarrageIcon(barrageState: boolean): string
  updatePipControlState(shouldShow: boolean): string
  updateTitlebarState(className: string, state: boolean): string
  updateFullScreenIcon(isFullScreen: boolean): string
  updateWinMaxIcon(isMaximize: boolean): string
  updateBarrageState(barrageState: boolean, opacity: number): string
  emitKeydownEvent(keyCode: number): string
}

export default new InjectJSManager();