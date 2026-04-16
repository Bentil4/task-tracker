import { HttpError } from "../errors/HttpError";

export const parsePositiveId = (value: string): number => {
  const parsedValue = Number.parseInt(value, 10);

  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "Invalid task ID. It must be a positive integer.");
  }
  return Number(value);
};

export const getSingleRouteParam = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value;
