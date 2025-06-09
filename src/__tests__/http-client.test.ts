import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../http-client.js';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('デフォルトの設定で初期化される', () => {
      const client = new HttpClient();
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('カスタムヘッダーとタイムアウトで初期化される', () => {
      const customHeaders = { 'Authorization': 'Bearer token' };
      const client = new HttpClient({ 
        headers: customHeaders, 
        timeout: 5000 
      });
      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe('request', () => {
    it('正常なレスポンスを返す', async () => {
      const responseData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(responseData),
      });

      const result = await httpClient.request('https://api.example.com/test');
      
      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('HTTPエラーの場合例外を投げる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        httpClient.request('https://api.example.com/not-found')
      ).rejects.toThrow('HTTP 404: Not Found');
    });

    it('カスタムヘッダーが設定される', async () => {
      const responseData = { message: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(responseData),
      });

      await httpClient.request('https://api.example.com/test', {
        headers: { 'X-Custom-Header': 'custom-value' }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('POSTリクエストでボディが送信される', async () => {
      const responseData = { id: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(responseData),
      });

      await httpClient.request('https://api.example.com/test', {
        method: 'POST',
        body: '{"name":"test"}',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: '{"name":"test"}',
        })
      );
    });
  });

  describe('get', () => {
    it('GETリクエストを実行する', async () => {
      const responseData = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(responseData),
      });

      const result = await httpClient.get('https://api.example.com/data');

      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('post', () => {
    it('POSTリクエストを実行する', async () => {
      const requestData = { name: 'test' };
      const responseData = { id: 1, name: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(responseData),
      });

      const result = await httpClient.post('https://api.example.com/create', requestData);

      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        })
      );
    });
  });
});