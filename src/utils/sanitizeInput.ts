import DOMPurify from "isomorphic-dompurify";

export const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const sanitizeUserInput = (data: any): any => {
  if (typeof data === "string") {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeUserInput(item));
  }

  if (data && typeof data === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeUserInput(value);
    }
    return sanitized;
  }

  return data;
};
