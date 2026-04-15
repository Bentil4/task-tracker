import { HttpError } from "../errors/HttpError";

export const parsePositiveId = (value: string): number => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new HttpError(400, "Invalid task ID. It must be a positive integer.");
  }

  return parsedValue;
};

export const getSingleRouteParam = (value: string | string[]): string => (
  Array.isArray(value) ? value[0] : value
);
