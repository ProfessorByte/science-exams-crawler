import { getValidUrls } from "./pseudocrawler.js";
import { getCurrentTime } from "./utils.js";
import fs from "node:fs";

getValidUrls().then((validUrls) => {
  fs.writeFileSync("validUrls.json", JSON.stringify(validUrls, null, 2));
  console.log(`Valid URLs saved (${getCurrentTime()})`);
});
