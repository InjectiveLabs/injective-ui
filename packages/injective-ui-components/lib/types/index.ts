export interface PasteEvent<T extends EventTarget> extends ClipboardEvent {
  target: T
}

export interface KeydownEvent<T extends EventTarget> extends KeyboardEvent {
  target: T
}
