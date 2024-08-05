import { CronJob } from "cron";
import createLogger from "./utils/CustomLogger/logger";
import { consumerFifo } from "./service/robo-service";

const logger = createLogger(__filename);

let isRunning = false;

type AsyncResult<T> = {
  ok: T | null;
  error: any;
};

const retornoAsync = async <T>(
  promise: Promise<T>
): Promise<AsyncResult<T>> => {
  try {
    const ok = await promise;
    return { ok, error: null };
  } catch (error) {
    return { ok: null, error };
  }
};

const runbot = async (): Promise<void> => {
  if (!isRunning) {
    isRunning = true;
    try {
      const result = await retornoAsync(consumerFifo());
      if (!result.ok) {
        logger.error(result.error);
      }
    } catch (error) {
      logger.error(error);
    } finally {
      isRunning = false;
    }
  }
};

/**
 * Fire!
 */
const run = (): void => {
  logger.info("Start do projeto! (⋗_⋖)");

  const job = new CronJob("*/5 * * * * *", runbot);
  job.start();
};

run();
