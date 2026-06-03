import DOMPurify from "isomorphic-dompurify";

export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const sanitizeUserInput = <T>(data: T): T => {
  if (typeof data === "string") {
    return sanitizeString(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeUserInput(item)) as T;
  }

  if (data !== null && typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      sanitized[key] = sanitizeUserInput(value);
    }
    return sanitized as T;
  }

  return data;
};
