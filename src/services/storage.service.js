const STORAGE_KEY = 'greenvolt.crm.erp.database.v2';

export function hasLocalDatabase() {
    return Boolean(localStorage.getItem(STORAGE_KEY));
}

export function loadLocalDatabase() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error('Cannot parse local database', error);
        return null;
    }
}

export function saveLocalDatabase(snapshot) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearLocalDatabase() {
    localStorage.removeItem(STORAGE_KEY);
}
