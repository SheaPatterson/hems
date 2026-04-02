/**
 * Azure SignalR Realtime Manager
 *
 * Replaces Supabase Realtime (postgres_changes / channels) with Azure SignalR
 * Service for live radio feeds, telemetry, and pilot position updates.
 *
 * Supported groups:
 *   - mission-radio:{missionId}  — per-mission radio feed
 *   - global-dispatch            — global dispatch feed
 *   - telemetry:{missionId}      — live telemetry stream
 *   - pilot-positions            — global pilot map updates
 *
 * Requirements: 6.1, 6.3, 6.5, 6.6
 */

import * as signalR from '@microsoft/signalr';
import { azureConfig } from './config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

type StatusListener = (status: ConnectionStatus) => void;
type EventCallback = (data: unknown) => void;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const BACKOFF_MULTIPLIER = 2;

// ---------------------------------------------------------------------------
// SignalRManager
// ---------------------------------------------------------------------------

export class SignalRManager {
  private connection: signalR.HubConnection | null = null;
  private activeGroups = new Set<string>();
  private eventCallbacks = new Map<string, EventCallback>();
  private statusListeners = new Set<StatusListener>();
  private _connectionStatus: ConnectionStatus = 'disconnected';
  private accessToken: string | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private catchUpFetcher: ((group: string) => Promise<void>) | null = null;

  // -----------------------------------------------------------------------
  // Connection status
  // -----------------------------------------------------------------------

  get connectionStatus(): ConnectionStatus {
    return this._connectionStatus;
  }

  /**
   * Register a listener for connection status changes.
   * Returns an unsubscribe function.
   */
  onConnectionStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Fire immediately with current status
    listener(this._connectionStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /**
   * Optionally set a catch-up fetcher that is called per-group on reconnect
   * so the UI can fetch messages missed while disconnected.
   */
  setCatchUpFetcher(fetcher: (group: string) => Promise<void>): void {
    this.catchUpFetcher = fetcher;
  }

  // -----------------------------------------------------------------------
  // Connect
  // -----------------------------------------------------------------------

  async connect(accessToken: string): Promise<void> {
    // If already connected, skip
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return;
    }

    this.accessToken = accessToken;

    const negotiateResult = await this.negotiate(accessToken);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(negotiateResult.url, {
        accessTokenFactory: () => negotiateResult.accessToken,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: () => null, // we handle reconnect ourselves
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Wire up lifecycle events
    this.connection.onclose(() => this.handleDisconnect());
    this.connection.onreconnecting(() => this.setStatus('reconnecting'));
    this.connection.onreconnected(() => this.handleReconnected());

    await this.connection.start();
    this.reconnectAttempt = 0;
    this.setStatus('connected');
  }

  // -----------------------------------------------------------------------
  // Group management
  // -----------------------------------------------------------------------

  async joinGroup(group: string): Promise<void> {
    this.activeGroups.add(group);
    if (this.isConnected()) {
      await this.connection!.invoke('JoinGroup', group);
    }
  }

  async leaveGroup(group: string): Promise<void> {
    this.activeGroups.delete(group);
    this.eventCallbacks.delete(group);
    if (this.isConnected()) {
      await this.connection!.invoke('LeaveGroup', group);
    }
  }

  // -----------------------------------------------------------------------
  // Event callbacks
  // -----------------------------------------------------------------------

  on<T>(event: string, callback: (data: T) => void): void {
    this.eventCallbacks.set(event, callback as EventCallback);
    if (this.connection) {
      this.connection.on(event, callback as (...args: any[]) => void);
    }
  }

  off(event: string): void {
    this.eventCallbacks.delete(event);
    if (this.connection) {
      this.connection.off(event);
    }
  }

  // -----------------------------------------------------------------------
  // Disconnect
  // -----------------------------------------------------------------------

  async disconnect(): Promise<void> {
    this.clearReconnectTimer();
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // Swallow — connection may already be stopped
      }
    }
    this.connection = null;
    this.activeGroups.clear();
    this.eventCallbacks.clear();
    this.accessToken = null;
    this.reconnectAttempt = 0;
    this.setStatus('disconnected');
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private isConnected(): boolean {
    return (
      this.connection !== null &&
      this.connection.state === signalR.HubConnectionState.Connected
    );
  }

  private setStatus(status: ConnectionStatus): void {
    this._connectionStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * Call the negotiate endpoint to get the SignalR connection URL and token.
   */
  private async negotiate(
    accessToken: string,
  ): Promise<{ url: string; accessToken: string }> {
    const apiBase = azureConfig.apiBaseUrl.replace(/\/+$/, '');
    const response = await fetch(`${apiBase}/api/negotiate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `SignalR negotiate failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Handle a full disconnect — start manual reconnect with exponential backoff.
   */
  private handleDisconnect(): void {
    this.setStatus('disconnected');
    this.scheduleReconnect();
  }

  /**
   * After a successful reconnect, re-join all active groups and re-register
   * event callbacks, then trigger catch-up fetches.
   */
  private async handleReconnected(): Promise<void> {
    this.reconnectAttempt = 0;
    this.setStatus('connected');

    // Re-register all event callbacks on the new connection
    for (const [event, callback] of this.eventCallbacks) {
      this.connection!.on(event, callback as (...args: any[]) => void);
    }

    // Re-join all active groups
    for (const group of this.activeGroups) {
      try {
        await this.connection!.invoke('JoinGroup', group);
      } catch (err) {
        console.warn(`[SignalR] Failed to re-join group "${group}":`, err);
      }
    }

    // Trigger catch-up fetch for each active group
    if (this.catchUpFetcher) {
      for (const group of this.activeGroups) {
        try {
          await this.catchUpFetcher(group);
        } catch (err) {
          console.warn(`[SignalR] Catch-up fetch failed for "${group}":`, err);
        }
      }
    }
  }

  /**
   * Schedule a reconnect attempt with exponential backoff:
   * 1s → 2s → 4s → 8s → 16s → 30s (capped)
   */
  private scheduleReconnect(): void {
    if (!this.accessToken) return;

    this.setStatus('reconnecting');

    const delay = Math.min(
      INITIAL_BACKOFF_MS * Math.pow(BACKOFF_MULTIPLIER, this.reconnectAttempt),
      MAX_BACKOFF_MS,
    );
    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(this.accessToken!);
        // connect() sets status to 'connected' and resets reconnectAttempt
        await this.handleReconnected();
      } catch {
        // Failed — schedule another attempt
        this.scheduleReconnect();
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const signalrManager = new SignalRManager();
