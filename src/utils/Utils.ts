export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isNumeric = (str: string | number | undefined): boolean => {
  if (typeof str !== 'string') {
    return false;
  }

  return !Number.isNaN(str) && !Number.isNaN(parseFloat(str));
};

export const colour = (name: string): string => {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    // eslint-disable-next-line
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  let Colour = '#';

  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line
    const value = (hash >> (i * 8)) & 0xff;
    Colour += `${value.toString(16)}`.substr(-2);
  }

  return Colour;
};
