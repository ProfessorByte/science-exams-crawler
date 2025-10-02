/**
 * Statistics Script
 * Shows statistics about validUrls.json
 * Usage: node scripts/stats.js
 */

import fs from "fs/promises";
import path from "path";

async function showStats() {
  try {
    const filePath = path.join(process.cwd(), "validUrls.json");
    const data = await fs.readFile(filePath, "utf-8");
    const validUrls = JSON.parse(data);

    console.log("\n" + "=".repeat(60));
    console.log("📊 VALID URLS STATISTICS");
    console.log("=".repeat(60) + "\n");

    console.log(`Total valid resources: ${validUrls.length}\n`);

    if (validUrls.length === 0) {
      console.log("No data yet. Run the crawler first!");
      return;
    }

    // Group by year
    const byYear = validUrls.reduce((acc, url) => {
      acc[url.year] = (acc[url.year] || 0) + 1;
      return acc;
    }, {});

    console.log("Distribution by year:");
    Object.entries(byYear)
      .sort(([a], [b]) => a - b)
      .forEach(([year, count]) => {
        console.log(`  ${year}: ${count}`);
      });

    // Group by semester
    const bySemester = validUrls.reduce((acc, url) => {
      acc[url.semester] = (acc[url.semester] || 0) + 1;
      return acc;
    }, {});

    console.log("\nDistribution by semester:");
    Object.entries(bySemester)
      .sort(([a], [b]) => a - b)
      .forEach(([semester, count]) => {
        console.log(`  Semester ${semester}: ${count}`);
      });

    // ID Resource range
    const idResources = validUrls.map((url) => url.idResource);
    const minId = Math.min(...idResources);
    const maxId = Math.max(...idResources);

    console.log("\nID Resource range:");
    console.log(`  Min: ${minId}`);
    console.log(`  Max: ${maxId}`);

    // Most common pathways
    const byPathway = validUrls.reduce((acc, url) => {
      acc[url.pathway] = (acc[url.pathway] || 0) + 1;
      return acc;
    }, {});

    console.log("\nTop 5 pathways:");
    Object.entries(byPathway)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([pathway, count]) => {
        console.log(`  Pathway ${pathway}: ${count}`);
      });

    // HTTP Status Codes Statistics
    const examStatusCodes = validUrls.reduce((acc, url) => {
      const code = url.examStatusCode || "unknown";
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});

    const solutionStatusCodes = validUrls.reduce((acc, url) => {
      const code = url.solutionStatusCode || "unknown";
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});

    console.log("\nExam HTTP Status Codes:");
    Object.entries(examStatusCodes)
      .sort(([a], [b]) => {
        // Sort: numbers first (ascending), then "unknown"
        if (a === "unknown") return 1;
        if (b === "unknown") return -1;
        return Number(a) - Number(b);
      })
      .forEach(([code, count]) => {
        const percentage = ((count / validUrls.length) * 100).toFixed(1);
        console.log(`  ${code}: ${count} (${percentage}%)`);
      });

    console.log("\nSolution HTTP Status Codes:");
    Object.entries(solutionStatusCodes)
      .sort(([a], [b]) => {
        if (a === "unknown") return 1;
        if (b === "unknown") return -1;
        return Number(a) - Number(b);
      })
      .forEach(([code, count]) => {
        const percentage = ((count / validUrls.length) * 100).toFixed(1);
        console.log(`  ${code}: ${count} (${percentage}%)`);
      });

    // Resources with issues
    const withIssues = validUrls.filter(
      (url) =>
        (url.examStatusCode && url.examStatusCode !== 200) ||
        (url.solutionStatusCode && url.solutionStatusCode !== 200)
    );

    if (withIssues.length > 0) {
      console.log(`\nResources with HTTP issues: ${withIssues.length}`);
      console.log("  (Exam or solution returned status code other than 200)");

      const notFound = withIssues.filter(
        (url) =>
          url.examStatusCode === 404 ||
          url.solutionStatusCode === 404 ||
          url.examStatusCode === 410 ||
          url.solutionStatusCode === 410
      );

      if (notFound.length > 0) {
        console.log(`  - Not found (404/410): ${notFound.length}`);
      }
    }

    console.log("\n" + "=".repeat(60) + "\n");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("❌ validUrls.json not found. Run the crawler first!");
    } else {
      console.error("❌ Error reading file:", error.message);
    }
  }
}

showStats();
