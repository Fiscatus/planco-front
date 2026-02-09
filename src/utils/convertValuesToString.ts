type Params = number | string | boolean | string[];

const convertValuesToString = <T extends Record<string, Params>>(obj: T): Record<keyof T, string> => {
  const result: Partial<Record<keyof T, string>> = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== '' && obj[key] !== null) {
      const value = obj[key];
      if (Array.isArray(value)) {
        result[key] = value.join(',');
      } else {
        result[key] = String(value);
      }
    }
  }
  return result as Record<keyof T, string>;
};

export { convertValuesToString };
