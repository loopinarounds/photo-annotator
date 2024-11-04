export const setLocalData = (data: Record<string, string>) => {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};
