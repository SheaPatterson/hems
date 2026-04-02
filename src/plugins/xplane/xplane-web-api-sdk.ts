"use client";

/**
 * X-Plane Web API SDK
 * Handles low-level communication with the X-Plane Web Server (typically port 8086).
 */
export class XPlaneWebAPI {
  private baseUrl: string;
  private isConnected: boolean = false;

  constructor(host: string = 'localhost', port: number = 8086) {
    this.baseUrl = `http://${host}:${port}/api`;
  }

  /**
   * Attempts to handshake with the local X-Plane instance
   */
  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/status`, { 
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error("[X-Plane SDK] Connection failed:", error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Fetches a specific DataRef from X-Plane
   */
  async getDataRef(dataref: string): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/dataref?name=${dataref}`);
      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error(`[X-Plane SDK] Error reading ${dataref}:`, error);
      return null;
    }
  }

  /**
   * Executes a command in X-Plane
   */
  async executeCommand(command: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      return response.ok;
    } catch (error) {
      console.error(`[X-Plane SDK] Error executing command ${command}:`, error);
      return false;
    }
  }

  get connectionStatus(): boolean {
    return this.isConnected;
  }
}

export default XPlaneWebAPI;