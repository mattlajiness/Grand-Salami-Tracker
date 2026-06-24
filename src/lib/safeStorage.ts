// Memory fallback for environments where localStorage/sessionStorage is blocked or full
const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    // 1. Try LocalStorage
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // ignore
    }

    // 2. Try SessionStorage
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        const val = window.sessionStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // ignore
    }

    // 3. Try MemoryStorage
    return memoryStorage[key] !== undefined ? memoryStorage[key] : null;
  },

  setItem(key: string, value: string): void {
    const stringVal = String(value);

    // 1. Try LocalStorage
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, stringVal);
        return;
      }
    } catch (e) {
      // ignore, proceed to fallback
    }

    // 2. Try SessionStorage
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.setItem(key, stringVal);
        return;
      }
    } catch (e) {
      // ignore, proceed to fallback
    }

    // 3. Try MemoryStorage
    memoryStorage[key] = stringVal;
  },

  removeItem(key: string): void {
    // 1. Try LocalStorage
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // ignore
    }

    // 2. Try SessionStorage
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {
      // ignore
    }

    // 3. Try MemoryStorage
    delete memoryStorage[key];
  }
};
