export * from './enum'
export * from './token'
export * from './shared'
export * from './market'
export * from './bridge'

export interface PasteEvent<T extends EventTarget> extends ClipboardEvent {
  target: T
}

export interface KeydownEvent<T extends EventTarget> extends KeyboardEvent {
  target: T
}
