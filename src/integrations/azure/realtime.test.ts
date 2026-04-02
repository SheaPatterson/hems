import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SignalRManager, type ConnectionStatus } from './realtime';

// ---------------------------------------------------------------------------
// Mock @microsoft/signalr
// ---------------------------------------------------------------------------

// Shared mock state — accessible from both the vi.mock factory and tests
const mockState = {
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  invoke: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn(),
  connectionState: 'Connected' as string,
  onCloseHandler: null as (() => void) | null,
  onReconnectingHandler: null as (() => void) | null,
  onReconnectedHandler: null as (() => void) | null,
};

vi.mock('@microsoft/signalr', () => {
  const connection = {
    get state() { return mockState.connectionState; },
    start: (...args: any[]) => mockState.start(...args),
    stop: (...args: any[]) => mockState.stop(...args),
    invoke: (...args: any[]) => mockState.invoke(...args),
    on: (...args: any[]) => mockState.on(...args),
    off: (...args: any[]) => mockState.off(...args),
    onclose: (cb: () => void) => { mockState.onCloseHandler = cb; },
    onreconnecting: (cb: () => void) => { mockState.onReconnectingHandler = cb; },
    onreconnected: (cb: () => void) => { mockState.onReconnectedHandler = cb; },
  };

  class MockHubConnectionBuilder {
    withUrl() { return this; }
    withAutomaticReconnect() { return this; }
    configureLogging() { return this; }
    build() { return connection; }
  }

  return {
    HubConnectionBuilder: MockHubConnectionBuilder,
    HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
    LogLevel: { Warning: 3 },
  };
});

// ---------------------------------------------------------------------------
// Mock fetch (for negotiate)
// ---------------------------------------------------------------------------

const negotiateResponse = {
  url: 'https://signalr.example.com/client/?hub=default',
  accessToken: 'signalr-token-123',
};

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(negotiateResponse),
  }),
);

// ---------------------------------------------------------------------------
// Mock config
// ---------------------------------------------------------------------------

vi.mock('./config', () => ({
  azureConfig: {
    apiBaseUrl: 'https://api.example.com',
    signalrEndpoint: 'https://signalr.example.com',
    b2cConfig: {},
    storageBaseUrl: '',
  },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SignalRManager', () => {
  let manager: SignalRManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new SignalRManager();
    // Reset mock state
    mockState.start.mockClear().mockResolvedValue(undefined);
    mockState.stop.mockClear().mockResolvedValue(undefined);
    mockState.invoke.mockClear().mockResolvedValue(undefined);
    mockState.on.mockClear();
    mockState.off.mockClear();
    mockState.connectionState = 'Connected';
    mockState.onCloseHandler = null;
    mockState.onReconnectingHandler = null;
    mockState.onReconnectedHandler = null;
    (globalThis.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -----------------------------------------------------------------------
  // connect
  // -----------------------------------------------------------------------

  describe('connect', () => {
    it('calls negotiate endpoint and starts the connection', async () => {
      await manager.connect('my-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/negotiate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer my-token',
          }),
        }),
      );
      expect(mockState.start).toHaveBeenCalledOnce();
      expect(manager.connectionStatus).toBe('connected');
    });

    it('sets status to connected after successful start', async () => {
      const statuses: ConnectionStatus[] = [];
      manager.onConnectionStatus((s) => statuses.push(s));

      await manager.connect('token');

      expect(statuses).toContain('connected');
    });

    it('skips connect if already connected', async () => {
      await manager.connect('token');
      mockState.start.mockClear();

      await manager.connect('token');
      expect(mockState.start).not.toHaveBeenCalled();
    });

    it('throws when negotiate fails', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(manager.connect('bad-token')).rejects.toThrow(
        'SignalR negotiate failed: 401 Unauthorized',
      );
    });
  });

  // -----------------------------------------------------------------------
  // joinGroup / leaveGroup
  // -----------------------------------------------------------------------

  describe('group management', () => {
    it('invokes JoinGroup on the connection', async () => {
      await manager.connect('token');
      await manager.joinGroup('mission-radio:abc-123');

      expect(mockState.invoke).toHaveBeenCalledWith('JoinGroup', 'mission-radio:abc-123');
    });

    it('invokes LeaveGroup on the connection', async () => {
      await manager.connect('token');
      await manager.joinGroup('global-dispatch');
      await manager.leaveGroup('global-dispatch');

      expect(mockState.invoke).toHaveBeenCalledWith('LeaveGroup', 'global-dispatch');
    });

    it('tracks groups even when not yet connected', async () => {
      // Join before connect — should not throw
      await manager.joinGroup('pilot-positions');

      // Now connect and trigger reconnected to re-join
      await manager.connect('token');
      // The group was added to activeGroups but invoke was not called before connect
      // After connect, joinGroup should work
      mockState.invoke.mockClear();
      await manager.joinGroup('telemetry:mission-1');

      expect(mockState.invoke).toHaveBeenCalledWith('JoinGroup', 'telemetry:mission-1');
    });

    it('supports all documented group patterns', async () => {
      await manager.connect('token');

      const groups = [
        'mission-radio:abc-123',
        'global-dispatch',
        'telemetry:mission-456',
        'pilot-positions',
      ];

      for (const group of groups) {
        await manager.joinGroup(group);
      }

      expect(mockState.invoke).toHaveBeenCalledTimes(groups.length);
      groups.forEach((g) => {
        expect(mockState.invoke).toHaveBeenCalledWith('JoinGroup', g);
      });
    });
  });

  // -----------------------------------------------------------------------
  // on / off
  // -----------------------------------------------------------------------

  describe('event callbacks', () => {
    it('registers callback on the connection', async () => {
      await manager.connect('token');
      const cb = vi.fn();
      manager.on('global-dispatch', cb);

      expect(mockState.on).toHaveBeenCalledWith('global-dispatch', cb);
    });

    it('removes callback from the connection', async () => {
      await manager.connect('token');
      manager.on('global-dispatch', vi.fn());
      manager.off('global-dispatch');

      expect(mockState.off).toHaveBeenCalledWith('global-dispatch');
    });
  });

  // -----------------------------------------------------------------------
  // disconnect
  // -----------------------------------------------------------------------

  describe('disconnect', () => {
    it('stops the connection and clears state', async () => {
      await manager.connect('token');
      await manager.joinGroup('global-dispatch');

      await manager.disconnect();

      expect(mockState.stop).toHaveBeenCalledOnce();
      expect(manager.connectionStatus).toBe('disconnected');
    });
  });

  // -----------------------------------------------------------------------
  // connectionStatus events
  // -----------------------------------------------------------------------

  describe('connectionStatus', () => {
    it('fires listener immediately with current status', () => {
      const statuses: ConnectionStatus[] = [];
      manager.onConnectionStatus((s) => statuses.push(s));

      expect(statuses).toEqual(['disconnected']);
    });

    it('unsubscribe stops further notifications', async () => {
      const statuses: ConnectionStatus[] = [];
      const unsub = manager.onConnectionStatus((s) => statuses.push(s));

      unsub();
      await manager.connect('token');

      // Should only have the initial 'disconnected', not 'connected'
      expect(statuses).toEqual(['disconnected']);
    });
  });

  // -----------------------------------------------------------------------
  // Auto-reconnect with exponential backoff
  // -----------------------------------------------------------------------

  describe('auto-reconnect', () => {
    it('schedules reconnect on connection close with 1s initial delay', async () => {
      await manager.connect('token');
      mockState.connectionState = 'Disconnected';

      // Simulate connection close
      mockState.onCloseHandler?.();

      expect(manager.connectionStatus).toBe('reconnecting');

      // Prepare for reconnect: reset mocks, keep state Disconnected so connect() proceeds
      mockState.start.mockClear().mockResolvedValue(undefined);
      (globalThis.fetch as any).mockClear().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(negotiateResponse),
      });

      await vi.advanceTimersByTimeAsync(1_000);

      expect(globalThis.fetch).toHaveBeenCalled();
      expect(mockState.start).toHaveBeenCalled();
    });

    it('uses exponential backoff: 1s, 2s, 4s, 8s', async () => {
      await manager.connect('token');
      mockState.connectionState = 'Disconnected';

      // Make start always fail so we can observe backoff delays
      // But negotiate (fetch) must still succeed
      mockState.start.mockClear().mockRejectedValue(new Error('fail'));
      (globalThis.fetch as any).mockClear().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(negotiateResponse),
      });

      mockState.onCloseHandler?.();

      // 1s — first attempt
      await vi.advanceTimersByTimeAsync(1_000);
      expect(mockState.start).toHaveBeenCalledTimes(1);

      // 2s — second attempt
      await vi.advanceTimersByTimeAsync(2_000);
      expect(mockState.start).toHaveBeenCalledTimes(2);

      // 4s — third attempt
      await vi.advanceTimersByTimeAsync(4_000);
      expect(mockState.start).toHaveBeenCalledTimes(3);

      // 8s — fourth attempt
      await vi.advanceTimersByTimeAsync(8_000);
      expect(mockState.start).toHaveBeenCalledTimes(4);
    });

    it('caps backoff at 30s', async () => {
      await manager.connect('token');
      mockState.connectionState = 'Disconnected';
      mockState.start.mockClear().mockRejectedValue(new Error('fail'));
      (globalThis.fetch as any).mockClear().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(negotiateResponse),
      });

      mockState.onCloseHandler?.();

      // Burn through 1s + 2s + 4s + 8s + 16s = 5 attempts
      await vi.advanceTimersByTimeAsync(1_000);
      await vi.advanceTimersByTimeAsync(2_000);
      await vi.advanceTimersByTimeAsync(4_000);
      await vi.advanceTimersByTimeAsync(8_000);
      await vi.advanceTimersByTimeAsync(16_000);
      const callsAfter5 = mockState.start.mock.calls.length;

      // Next delay should be capped at 30s (not 32s)
      await vi.advanceTimersByTimeAsync(30_000);
      expect(mockState.start.mock.calls.length).toBe(callsAfter5 + 1);
    });

    it('re-joins active groups on reconnect', async () => {
      await manager.connect('token');
      await manager.joinGroup('global-dispatch');
      await manager.joinGroup('pilot-positions');

      mockState.invoke.mockClear();
      mockState.connectionState = 'Disconnected';

      // Simulate reconnect via onreconnected handler
      mockState.connectionState = 'Connected';
      await mockState.onReconnectedHandler?.();

      expect(mockState.invoke).toHaveBeenCalledWith('JoinGroup', 'global-dispatch');
      expect(mockState.invoke).toHaveBeenCalledWith('JoinGroup', 'pilot-positions');
    });

    it('triggers catch-up fetch on reconnect', async () => {
      const catchUp = vi.fn().mockResolvedValue(undefined);
      manager.setCatchUpFetcher(catchUp);

      await manager.connect('token');
      await manager.joinGroup('mission-radio:m1');

      mockState.connectionState = 'Connected';
      await mockState.onReconnectedHandler?.();

      expect(catchUp).toHaveBeenCalledWith('mission-radio:m1');
    });
  });
});
