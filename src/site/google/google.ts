import { Page } from "puppeteer";
import createLogger from "../../utils/CustomLogger/logger";

const logger = createLogger(__filename);
const SIGLA = "GOOGLE";
const URL = "https://google.com";

interface DocSite {
  sigla: string;
  [key: string]: any;
}

interface RunResult {
  title: string;
  status: string;
}

export const run = async (
  page: Page,
  docSite?: DocSite
): Promise<RunResult> => {
  logger.info("DocSite recebido para scraping: " + JSON.stringify(docSite));
  await page.goto(URL);
  const title = await page.title();
  logger.info(`Título da página obtido: ${title}`);
  logger.info("Fim do scraping '(◣_◢)'");
  return { title: title, status: "success" };
};

exports.sigla = SIGLA;
