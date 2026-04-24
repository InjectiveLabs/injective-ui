import { StreamEvent } from '@injectivelabs/sdk-ts/types'
import { SharedStreamKey } from '../types'
import type { StreamManagerV2 } from '@injectivelabs/sdk-ts/client/indexer'
import type { StreamHandlers } from '../types'

interface StreamEntry {
  createdAt: number
  pendingReplacement: boolean
  manager: StreamManagerV2<any>
}

/**
 * Manages gRPC stream lifecycle with race condition protection.
 *
 * Prevents cancelling streams before initialization completes by:
 * - Deferring cleanup for young streams (< MIN_STREAM_LIFETIME_MS)
 * - Allowing replacement of streams marked for cancellation
 */
export class BaseStreamRegistry {
  private cleanupTimers = new Map<string, NodeJS.Timeout>()
  private streams = new Map<string, StreamEntry>()
  private readonly MIN_STREAM_LIFETIME_MS = 500

  unsubscribeAll(): void {
    this.streams.forEach((_, streamId) => this.unsubscribe(streamId))
  }

  hasStream(streamId: string): boolean {
    return this.streams.has(streamId)
  }

  getActiveStreams(): string[] {
    return [...this.streams.keys()]
  }

  protected setupEventHandlers<T>(
    manager: StreamManagerV2<T>,
    handlers: StreamHandlers<T>
  ): void {
    const streamId = manager.getId()

    if (handlers.onConnect) {
      manager.on(StreamEvent.Connect, handlers.onConnect)
    }

    manager.on(StreamEvent.Disconnect, (payload: any) => {
      console.warn(
        `[SharedStream:${streamId}] Disconnected - Reason: ${payload.reason}`
      )
      handlers.onDisconnect?.(payload)
    })

    manager.on(StreamEvent.Error, (payload: any) => {
      console.error(
        `[SharedStream:${streamId}] Error: ${payload.message} ${payload.details || ''}`
      )
      handlers.onError?.(payload)
    })

    manager.on(StreamEvent.Retry, (payload: any) => {
      console.warn(
        `[SharedStream:${streamId}] Retry attempt #${payload.attempt} (delay: ${payload.delayMs}ms)`
      )
      handlers.onRetry?.(payload)
    })

    manager.on(StreamEvent.Warn, ({ message }: { message: string }) => {
      console.warn(`[SharedStream:${streamId}] ${message}`)
    })
  }

  protected registerStream<T>(
    streamId: string,
    manager: StreamManagerV2<T>,
    handlers?: StreamHandlers<T>
  ): boolean {
    this.cancelCleanup(streamId)

    const existing = this.streams.get(streamId)

    if (existing) {
      if (!this.canReplace(existing)) {
        return false
      }

      this.stop(streamId)
    }

    // Register stream in Map BEFORE starting to prevent race condition
    // where onConnect fires before stream is registered
    this.streams.set(streamId, {
      createdAt: Date.now(),
      manager,
      pendingReplacement: false
    })

    if (handlers) {
      this.setupEventHandlers(manager, handlers)
    }

    manager.start()

    return true
  }

  protected unsubscribe(streamId: string): void {
    const entry = this.streams.get(streamId)

    if (!entry) {
      return
    }

    if (this.isOldEnough(entry)) {
      return this.stop(streamId)
    }

    entry.pendingReplacement = true
    this.scheduleCleanup(streamId, this.remainingLifetime(entry))
  }

  protected forceUnsubscribe(streamId: string): void {
    this.cancelCleanup(streamId)
    this.stop(streamId)
  }

  private scheduleCleanup(streamId: string, delayMs: number): void {
    this.cancelCleanup(streamId)

    const timeoutId = setTimeout(() => {
      this.cleanupTimers.delete(streamId)
      const entry = this.streams.get(streamId)

      if (entry?.pendingReplacement) {
        this.stop(streamId)
      }
    }, delayMs)

    this.cleanupTimers.set(streamId, timeoutId)
  }

  private cancelCleanup(streamId: string): void {
    const timeoutId = this.cleanupTimers.get(streamId)

    if (timeoutId) {
      clearTimeout(timeoutId)
      this.cleanupTimers.delete(streamId)
    }
  }

  private stop(streamId: string): void {
    this.streams.get(streamId)?.manager.stop()
    this.streams.delete(streamId)
    this.cancelCleanup(streamId)
  }

  private remainingLifetime(entry: StreamEntry): number {
    return this.MIN_STREAM_LIFETIME_MS - this.getAge(entry)
  }

  private canReplace(entry: StreamEntry): boolean {
    return this.isOldEnough(entry) || entry.pendingReplacement
  }

  private isOldEnough(entry: StreamEntry): boolean {
    return this.getAge(entry) >= this.MIN_STREAM_LIFETIME_MS
  }

  private getAge(entry: StreamEntry): number {
    return Date.now() - entry.createdAt
  }
}
