import { getValidUrls } from "./pseudocrawler.js";
import fs from "node:fs";

const getCurrentTime = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, "0");
  let day = String(currentDate.getDate()).padStart(2, "0");
  let hour = String(currentDate.getHours()).padStart(2, "0");
  let minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const currentTime = `Date: ${year}-${month}-${day} Time: ${hour}:${minutes}`;
  return currentTime;
};

getValidUrls().then((validUrls) => {
  fs.writeFileSync("validUrls.json", JSON.stringify(validUrls));
  console.log(`Valid URLs saved (${getCurrentTime()})`);
});
