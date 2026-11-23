import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  api,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/services/axios';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const storage = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
};

const TOKEN_KEY = 'rem_access_token';

describe('axios token helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAccessToken reads the stored token', async () => {
    storage.getItem.mockResolvedValueOnce('stored-token');

    await expect(getAccessToken()).resolves.toBe('stored-token');
    expect(storage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
  });

  it('getAccessToken returns null when nothing is stored', async () => {
    storage.getItem.mockResolvedValueOnce(null);

    await expect(getAccessToken()).resolves.toBeNull();
    expect(storage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
  });

  it('setAccessToken persists the token under the expected key', async () => {
    await setAccessToken('new-token');

    expect(storage.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'new-token');
  });

  it('clearAccessToken removes the stored token', async () => {
    await clearAccessToken();

    expect(storage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
  });
});

describe('shared axios client', () => {
  it('is an axios instance with request methods and registered interceptors', () => {
    expect(typeof api.get).toBe('function');
    expect(typeof api.post).toBe('function');
    expect(typeof api.request).toBe('function');

    expect(
      (api.interceptors.request as unknown as { handlers: unknown[] }).handlers,
    ).toHaveLength(1);
    expect(
      (api.interceptors.response as unknown as { handlers: unknown[] }).handlers,
    ).toHaveLength(1);
  });
});
