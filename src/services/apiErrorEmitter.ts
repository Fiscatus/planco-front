type ErrorListener = (message: string) => void;

let listener: ErrorListener | null = null;
let unauthorizedListener: (() => Promise<void>) | null = null;

export const apiErrorEmitter = {
  subscribe: (fn: ErrorListener) => { listener = fn; },
  unsubscribe: () => { listener = null; },
  emit: (message: string) => {
    if (message === '__unauthorized__') {
      unauthorizedListener?.();
    } else {
      listener?.(message);
    }
  },
  onUnauthorized: (fn: () => Promise<void>) => { unauthorizedListener = fn; },
  offUnauthorized: () => { unauthorizedListener = null; },
};
