export type Id = string;

const idChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const createId = (): Id => {
  const result: string[] = [];

  while (result.length < 10) {
    const randomIndex = Math.floor(Math.random() * idChars.length);
    result.push(idChars.charAt(randomIndex));
  }

  return result.join("");
};

