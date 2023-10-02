export const generateMessage = (message: string, replacements: { [key: string]: string | number } = {}): string => {
  let resultMessage: string = message;

  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`%${key}%`, 'g');

    resultMessage = resultMessage.replace(regex, value.toString());
  });

  return resultMessage;
};
