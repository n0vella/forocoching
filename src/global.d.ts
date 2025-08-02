declare const browser: typeof import("webextension-polyfill");

interface Message {
  action: "log" | string;
  content: any;
}

declare function log(...args: any[]): void;
