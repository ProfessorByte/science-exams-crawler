import fs from "fs/promises";
import path from "path";

async function generateSlugs() {
  const inputPath = path.join(process.cwd(), "validUrls.json");
  const outputPath = path.join(process.cwd(), "validSlugs.json");

  const data = await fs.readFile(inputPath, "utf-8");
  const validUrls = JSON.parse(data);

  const slugs = validUrls.map((entry) => entry.slug);

  await fs.writeFile(outputPath, JSON.stringify(slugs));

  console.log(`Generated ${slugs.length} slugs → validSlugs.json`);
}

generateSlugs();
