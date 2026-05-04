import DOMPurify from "isomorphic-dompurify";

export const sanitizeString = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
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
      if (key === "email") {
        sanitized[key] = sanitizeEmail(value as string);
      } else if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else {
        sanitized[key] = sanitizeUserInput(value);
      }
    }
    return sanitized;
  }

  return data;
};
