/**
 * Native bridge contracts.
 *
 * The browser cannot read OS-level state, launch applications or touch the
 * file system. These interfaces describe what a companion helper app would
 * expose; the shipped implementations report honestly that no bridge is
 * connected instead of inventing values.
 */

export interface BridgeResult<T = unknown> {
  ok: boolean;
  data?: T;
  reason?: string;
}

const UNAVAILABLE = (name: string): BridgeResult => ({
  ok: false,
  reason: `${name} متصل نیست. این قابلیت به یک برنامهٔ کمکی روی دستگاه نیاز دارد.`,
});

export interface WindowsBridge {
  readonly id: "windows";
  isAvailable(): boolean;
  getSystemStatus(): Promise<BridgeResult>;
  openApplication(name: string): Promise<BridgeResult>;
  readDirectory(path: string): Promise<BridgeResult>;
  createFile(path: string, content: string): Promise<BridgeResult>;
  runShortcut(name: string): Promise<BridgeResult>;
}

export interface AndroidBridge {
  readonly id: "android";
  isAvailable(): boolean;
  getDeviceStatus(): Promise<BridgeResult>;
  sendNotification(text: string): Promise<BridgeResult>;
  openApp(pkg: string): Promise<BridgeResult>;
  readClipboard(): Promise<BridgeResult>;
}

export const windowsBridge: WindowsBridge = {
  id: "windows",
  isAvailable: () => false,
  getSystemStatus: async () => UNAVAILABLE("پل ویندوز"),
  openApplication: async () => UNAVAILABLE("پل ویندوز"),
  readDirectory: async () => UNAVAILABLE("پل ویندوز"),
  createFile: async () => UNAVAILABLE("پل ویندوز"),
  runShortcut: async () => UNAVAILABLE("پل ویندوز"),
};

export const androidBridge: AndroidBridge = {
  id: "android",
  isAvailable: () => false,
  getDeviceStatus: async () => UNAVAILABLE("پل اندروید"),
  sendNotification: async () => UNAVAILABLE("پل اندروید"),
  openApp: async () => UNAVAILABLE("پل اندروید"),
  readClipboard: async () => UNAVAILABLE("پل اندروید"),
};
