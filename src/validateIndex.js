/**
 * Validation Entry Point
 * Initializes and starts the validator
 */

import { Validator } from "./core/validator.js";
import { Logger } from "./utils/logger.util.js";

async function main() {
  try {
    const validator = new Validator();
    await validator.run();
  } catch (error) {
    Logger.logError("Fatal error", error);
    process.exit(1);
  }
}

main();
