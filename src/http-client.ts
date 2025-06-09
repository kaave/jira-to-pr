/**
 * HTTPクライアントの初期化オプション
 */
interface HttpClientOptions {
  /** リクエストヘッダー */
  headers?: Record<string, string>;
  /** タイムアウト時間（ミリ秒） */
  timeout?: number;
}

/**
 * HTTPリクエストのオプション
 */
interface RequestOptions extends HttpClientOptions {
  /** HTTPメソッド */
  method?: string;
  /** リクエストボディ */
  body?: string;
}

/**
 * fetchベースのHTTPクライアントクラス
 * タイムアウト機能とエラーハンドリングを提供
 */
export class HttpClient {
  private readonly baseHeaders: Record<string, string>;
  private readonly timeout: number;

  /**
   * HTTPクライアントを初期化する
   * @param options - 初期化オプション
   */
  constructor(options: HttpClientOptions = {}) {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * HTTPリクエストを実行する
   * @param url - リクエスト先URL
   * @param options - リクエストオプション
   * @returns レスポンスデータ
   */
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchOptions: RequestInit = {
        method: options.method ?? 'GET',
        headers: {
          ...this.baseHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      };

      if (options.body !== undefined) {
        fetchOptions.body = options.body;
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GETリクエストを実行する
   * @param url - リクエスト先URL
   * @param options - リクエストオプション
   * @returns レスポンスデータ
   */
  async get<T>(url: string, options: HttpClientOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POSTリクエストを実行する
   * @param url - リクエスト先URL
   * @param data - 送信するデータ
   * @param options - リクエストオプション
   * @returns レスポンスデータ
   */
  async post<T>(url: string, data: unknown, options: HttpClientOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}