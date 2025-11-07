import { env } from "../config/env";
import fs from "fs";

export function logSystemError(errorStr: string) {

  const logDate = new Date(Date.now()).toLocaleString();
  const log = `${logDate}:${errorStr}\n\n`;

  let data = fs.readFileSync(env.SYSTEM_ERRORS_FILE, "utf8");

  data += log;

  fs.writeFileSync(env.SYSTEM_ERRORS_FILE, data);
}
