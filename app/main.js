import fs from "node:fs";
import { getValidUrls } from "../utils/pseudocrawler.js";
import { getCurrentTime } from "../utils/functions.js";

async function loadValidUrls() {
  try {
    const validUrls = (
      await import("../validUrls.json", { with: { type: "json" } })
    ).default;
    console.log(`Current valid URLs loaded (${getCurrentTime()})`);
    return validUrls;
  } catch (error) {
    console.log(`Creating new JSON file... (${getCurrentTime()})`);
    return [];
  }
}

async function saveValidUrls(validUrls) {
  fs.writeFileSync("validUrls.json", JSON.stringify(validUrls, null, 2));
  console.log(`Valid URLs saved (${getCurrentTime()})`);
}

async function updateValidUrls() {
  const validUrls = await loadValidUrls();
  const validUrlsCollected = await getValidUrls();

  const onlyNewValidUrls = validUrlsCollected.filter(
    (urlData) =>
      !validUrls.some((urlDataSaved) => urlData.slug === urlDataSaved.slug)
  );

  const newValidUrls = [...validUrls, ...onlyNewValidUrls];
  await saveValidUrls(newValidUrls);
}

updateValidUrls();
