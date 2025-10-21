import api from "../services/api";

interface TransportConfig {
  baseInterval: number;
  maxInterval: number;
  backoffMultiplier: number;
}

interface FetchResult {
  notModified: boolean;
  data: any;
}

export class SmartPollingTransport {
  private interval: number;
  private lastETag: string | null = null;
  private lastModified: string | null = null;
  private consecutiveNoChanges = 0;
  private config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
    this.interval = config.baseInterval;
  }

  async fetchOrders(since?: string): Promise<FetchResult> {
    const headers: Record<string, string> = {};

    // Add conditional request headers
    if (this.lastETag) {
      headers["If-None-Match"] = this.lastETag;
    }
    if (this.lastModified) {
      headers["If-Modified-Since"] = this.lastModified;
    }

    // Build URL with optional since parameter
    const url = since
      ? `/orders/?since=${encodeURIComponent(since)}`
      : "/orders/";

    try {
      const response = await api.get(url, {
        headers,
        validateStatus: (status) => status === 200 || status === 304,
      });

      // Handle 304 Not Modified
      if (response.status === 304) {
        this.onNoChange();
        return { notModified: true, data: null };
      }

      // Handle successful response
      if (response.status === 200) {
        this.onDataChanged();

        // Update cached headers
        const newETag = response.headers["etag"] || response.headers["ETag"];
        const newLastModified =
          response.headers["last-modified"] ||
          response.headers["Last-Modified"];

        if (newETag) this.lastETag = newETag;
        if (newLastModified) this.lastModified = newLastModified;

        const data = response.data;
        return { notModified: false, data };
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error.message);
      throw error;
    }
  }

  private onNoChange(): void {
    this.consecutiveNoChanges++;

    // Increase interval with backoff
    const newInterval = Math.min(
      this.interval * this.config.backoffMultiplier,
      this.config.maxInterval
    );

    if (newInterval !== this.interval) {
      this.interval = newInterval;
    }
  }

  private onDataChanged(): void {
    this.consecutiveNoChanges = 0;
    this.interval = this.config.baseInterval;
  }

  getNextInterval(): number {
    return this.interval;
  }

  getStats() {
    return {
      currentInterval: this.interval,
      consecutiveNoChanges: this.consecutiveNoChanges,
      hasETag: !!this.lastETag,
      hasLastModified: !!this.lastModified,
    };
  }
}
