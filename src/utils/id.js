export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}
