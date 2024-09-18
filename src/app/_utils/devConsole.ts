import { isDevelopmentEnv } from "@/config/app-config";

type LogMethod = (...args: any[]) => void;

interface DevConsole {
  log: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  info: LogMethod;
}

const createDevConsole = (): DevConsole => {
  const createLogMethod =
    (consoleMethod: LogMethod): LogMethod =>
    (...args: any[]) => {
      if (isDevelopmentEnv) {
        consoleMethod(...args);
      }
    };

  return {
    log: createLogMethod(console.log),
    warn: createLogMethod(console.warn),
    error: createLogMethod(console.error),
    info: createLogMethod(console.info),
  };
};

const dev = {
  console: createDevConsole(),
};

export default dev;
