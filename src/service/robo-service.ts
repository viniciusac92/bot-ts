import createLogger from "../utils/CustomLogger/logger";
import { receiveMessage } from "./queue-service";
import puppeteer, { Browser, Page } from "puppeteer";
import path from "path";
import fs from "fs";

interface BotScript {
  sigla: string;
  run: (page: Page, docSite: DocSite, options: any) => Promise<any>;
}

interface DocSite {
  sigla: string;
}

interface SiteScript {
  sigla: string;
  disablePluginStealth?: boolean;
  useRecaptchaPlugin?: boolean;
  useRecaptchaPluginCapmonster?: boolean;
  enablePuppeteerChromeExtensions?: boolean;
  enableDataDir?: boolean;
}

interface Options {
  browser: Browser;
}

interface Message {
  MessageId: string;
  Protocol: string;
  Body: string;
  Attributes?: {
    [key: string]: string;
  };
}

const logger = createLogger(__filename);

const botMap: Map<string, BotScript> = new Map();

const getAllBotFilesInDir = (dir: string, extension: string): string[] => {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllBotFilesInDir(file, extension));
    } else if (file.endsWith(extension)) {
      results.push(file);
    }
  });
  return results;
};

const sitesDir = path.resolve(__dirname, "../site/");
const sitesPath = getAllBotFilesInDir(sitesDir, ".js");

for (const sitePath of sitesPath) {
  try {
    const siteObj: BotScript = require(sitePath);

    if (siteObj.sigla) {
      botMap.set(siteObj.sigla, siteObj);
    }
  } catch (error) {
    console.error(`Falha ao fazer load do path >> ${sitePath}:`, error);
  }
}

/**
 * Busca mensagem na fila
 */
const consumerFifo = async (): Promise<boolean> => {
  const message: Message | null = await receiveMessage();
  if (!message) {
    return true;
  }

  logger.info("Mensagem recebida: " + JSON.stringify(message));

  const docSite: DocSite = JSON.parse(message.Body);

  await processDocSite(docSite);

  return true;
};

const processPage = async (
  docSite: DocSite,
  page: Page,
  options: Options
): Promise<any> => {
  logger.info("Aberto navegador, iniciando: " + JSON.stringify(docSite));

  const siteScript = botMap.get(docSite.sigla);

  if (!siteScript) {
    logger.warn(`${docSite.sigla} não localizado`);
    return;
  }

  return await siteScript.run(page, docSite, options);
};

const processDocSite = async function (docSite: any): Promise<boolean> {
  const resumoSite: any = await processBrowser(docSite);

  if (!resumoSite) {
    logger.warn(
      `Retornou nulo ou vazio para docSite: ${JSON.stringify(
        docSite
      )} - (Tentativa ${docSite.tentativa})`
    );
  }

  docSite.resumoSite = resumoSite;

  logger.info("Retorno de dados para envio >> " + JSON.stringify(docSite));

  return true;
};

const processBrowser = async (docSite: SiteScript): Promise<void> => {
  const args = [
    "--allow-running-insecure-content",
    "--disable-blink-features=AutomationControlled",
    "--disable-web-security",
    "--disable-infobars",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--ignore-certificate-errors",
  ];

  const browser: Browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
    args,
    ignoreDefaultArgs: ["--enable-automation"],
    timeout: 0,
  });

  try {
    const page = await browser.newPage();
    const options = {
      browser,
    };

    return await processPage(docSite, page, options);
  } catch (error) {
    logger.error(error);
  } finally {
    try {
      await browser.close();
    } catch (error) {
      logger.error(error);
    }
  }
};

export { consumerFifo };
