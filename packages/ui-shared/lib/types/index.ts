export interface PasteEvent<T extends EventTarget> extends ClipboardEvent {
  target: T
}

export interface KeydownEvent<T extends EventTarget> extends KeyboardEvent {
  target: T
}

export interface BaseDropdownOption {
  display: string
  value: string
  amount?: number | string
}

export * from './notification'
