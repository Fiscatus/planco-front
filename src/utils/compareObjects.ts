// biome-ignore lint/suspicious/noExplicitAny: -
const areObjectsEqual = (obj1: any, obj2: any): boolean => {
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false
    }
    return obj1.every((item, index) => areObjectsEqual(item, obj2[index]))
  }
  if (typeof obj1 === 'object' && typeof obj2 === 'object' && obj1 && obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false
    }
    return keys1.every((key) => areObjectsEqual(obj1[key], obj2[key]))
  }
  return obj1 === obj2
};

export { areObjectsEqual };
