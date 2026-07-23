class PlatformLogger {
  log(message?: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(message, ...optionalParams);
    }
  }
  error(message?: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.error(message, ...optionalParams);
    }
  }
  warn(message?: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(message, ...optionalParams);
    }
  }
}

export const platform = new PlatformLogger();

if (typeof globalThis !== "undefined") {
  (globalThis as any).platform = platform;
}
if (typeof window !== "undefined") {
  (window as any).platform = platform;
}
