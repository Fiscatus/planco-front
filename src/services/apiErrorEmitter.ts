type ErrorListener = (message: string) => void;

let listener: ErrorListener | null = null;

export const apiErrorEmitter = {
  subscribe: (fn: ErrorListener) => { listener = fn; },
  unsubscribe: () => { listener = null; },
  emit: (message: string) => { listener?.(message); },
};
