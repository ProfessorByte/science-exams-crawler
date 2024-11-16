import fs from "node:fs";
import { getValidUrls } from "../utils/pseudocrawler.js";
import { getCurrentTime } from "../utils/functions.js";

try {
  const validUrls = (
    await import("../validUrls.json", { with: { type: "json" } })
  ).default;

  console.log(`Current valid URLs loaded (${getCurrentTime()})`);
  getValidUrls().then((validUrlsCollected) => {
    const onlyNewValidUrls = validUrlsCollected.filter(
      (urlData) =>
        !validUrls.some((urlDataSaved) => urlData.slug === urlDataSaved.slug)
    );

    const newValidUrls = [...validUrls, ...onlyNewValidUrls];

    fs.writeFileSync("validUrls.json", JSON.stringify(newValidUrls, null, 2));
    console.log(`Valid URLs saved (${getCurrentTime()})`);
  });
} catch (error) {
  // console.error("Error loading JSON file:", error);
  console.log(`Creating new JSON file... (${getCurrentTime()})`);
  getValidUrls().then((validUrls) => {
    fs.writeFileSync("validUrls.json", JSON.stringify(validUrls, null, 2));
    console.log(`Valid URLs saved (${getCurrentTime()})`);
  });
}
