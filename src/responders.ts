interface Response {
  type: string;
  message?: string;
}

export function log(message?: string): Response {
  return {
    type: "log",
    message: message
  };
}

export function error(message?: string): Response {
  return {
    type: "error",
    message: message,
  };
}
