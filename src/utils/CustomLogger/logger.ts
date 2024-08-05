import path from "path";
import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf, errors } = format;

const filename = `${__dirname}/../../log/robo_game.log`;

const projectName = process.argv[2] ? `[${process.argv[2]}]` : "[Robo]";

/**
 * Inicia logger winston
 * @param {String} scriptName myScript.js
 * @param {boolean} basename mostra apenas o nome do arquivo
 */
const logger = function (scriptName: string = "", basename: boolean = true) {
  const myFormat = printf((info) => {
    let meta = "";
    if (info[Symbol.for("splat")] && info[Symbol.for("splat")].length > 0) {
      meta = "\t " + JSON.stringify(info[Symbol.for("splat")]);
    }
    const stack = info.stack ? info.stack : "";
    return `${info.timestamp} ${projectName} [${info.label}] ${info.level}: ${info.message}${meta}\n${stack}`;
  });

  const formatCombine = combine(
    errors({ stack: true }),
    label({ label: basename ? path.basename(scriptName) : scriptName }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    myFormat
  );

  const log = createLogger({
    level: "info",
    format: formatCombine,
    transports: [
      new transports.File({
        filename: filename,
        maxsize: 100000000, // 100mb
        maxFiles: 10, // ele se perde quando tem outros robôs usando mesmo arquivo de log
        tailable: true,
      }),
      new transports.Console({
        format: formatCombine,
      }),
    ],
  });

  return log;
};

export default logger;
