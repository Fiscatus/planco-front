const years = (): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear; year >= 1900; year--) {
    years.push(String(year));
  }
  return years;
};

export { years };
