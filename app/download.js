import { createWriteStream, promises as fs } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { getCurrentTime } from "../utils/functions.js";
import { downloadMaxAttempts } from "../utils/constants.js";
import validUrls from "../validUrls.json" with { type: "json" };

const downloadFile = async (url, dest, attempt = 1) => {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

    const fileStream = createWriteStream(dest);
    await pipeline(response.body, fileStream);
    console.log(`File downloaded successfully to ${dest}`);
  } catch (error) {
    if (attempt < downloadMaxAttempts) {
      console.log(`Retrying download for ${url} (Attempt ${attempt + 1})`);
      await downloadFile(url, dest, attempt + 1);
    } else {
      console.log(`Failed to download ${url}`);
      throw error;
    }
  }
};

const ensureDirectoryExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

const downloadDocuments = async () => {
  const downloadPromises = validUrls.map(
    async ({ slug, examUrl, solutionUrl }) => {
      const dirPath = path.join("./downloads", slug);
      await ensureDirectoryExists(dirPath);

      const examPath = path.join(dirPath, `Preguntas_${slug}.pdf`);
      const solutionPath = path.join(dirPath, `Respuestas_${slug}.pdf`);

      try {
        await fs.access(examPath);
        console.log(`File ${examPath} already exists, skipping download.`);
      } catch {
        await downloadFile(examUrl, examPath);
      }

      try {
        await fs.access(solutionPath);
        console.log(`File ${solutionPath} already exists, skipping download.`);
      } catch {
        await downloadFile(solutionUrl, solutionPath);
      }
    }
  );

  console.log(`Downloading documents... (${getCurrentTime()})`);
  await Promise.all(downloadPromises);
  console.log(`Documents downloaded successfully (${getCurrentTime()})`);
};

downloadDocuments().catch((err) => {
  console.error("Error processing documents:", err);
});
