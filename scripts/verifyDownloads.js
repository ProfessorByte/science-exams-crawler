import fs from "fs/promises";
import path from "path";

const DOWNLOADS_DIR = "downloads";
const MIN_FILE_SIZE = 1024; // 1KB
const ORIGINAL_SOLUTION_PREFIX = "Respuestas";
const AI_SOLUTION_PREFIX = "Solucionario_IA";

async function findSolutionFile(slug) {
  const originalPath = path.join(
    DOWNLOADS_DIR,
    slug,
    `${ORIGINAL_SOLUTION_PREFIX}_${slug}.pdf`,
  );
  const aiPath = path.join(
    DOWNLOADS_DIR,
    slug,
    `${AI_SOLUTION_PREFIX}_${slug}.pdf`,
  );

  if (await fileExists(originalPath)) {
    return { exists: true, path: originalPath, type: "original" };
  }

  if (await fileExists(aiPath)) {
    return { exists: true, path: aiPath, type: "ai-generated" };
  }

  return { exists: false, path: null, type: null };
}

async function verifyDownloads() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🔍 DOWNLOAD VERIFICATION");
    console.log("=".repeat(60) + "\n");

    const validUrlsData = await fs.readFile("validUrls.json", "utf-8");
    const validUrls = JSON.parse(validUrlsData);

    console.log(`📋 Total resources in validUrls.json: ${validUrls.length}\n`);

    const results = {
      complete: 0,
      completeWithAI: 0,
      incomplete: 0,
      missing: 0,
      corrupted: 0,
    };

    const issues = [];

    for (const resource of validUrls) {
      const { slug } = resource;
      const examPath = path.join(DOWNLOADS_DIR, slug, `Preguntas_${slug}.pdf`);
      const solution = await findSolutionFile(slug);

      const examExists = await fileExists(examPath);
      const solutionExists = solution.exists;

      if (!examExists && !solutionExists) {
        results.missing++;
        issues.push({ slug, issue: "Both files missing" });
      } else if (!examExists) {
        results.incomplete++;
        issues.push({ slug, issue: "Exam file missing" });
      } else if (!solutionExists) {
        results.incomplete++;
        issues.push({ slug, issue: "Solution file missing" });
      } else {
        const examSize = await getFileSize(examPath);
        const solutionSize = await getFileSize(solution.path);

        if (examSize < MIN_FILE_SIZE || solutionSize < MIN_FILE_SIZE) {
          results.corrupted++;
          issues.push({
            slug,
            issue: `File too small (exam: ${examSize}B, solution: ${solutionSize}B)`,
          });
        } else {
          if (solution.type === "ai-generated") {
            results.completeWithAI++;
          }
          results.complete++;
        }
      }
    }

    console.log("📊 Results:");
    console.log(`   ✅ Complete: ${results.complete}`);
    if (results.completeWithAI > 0) {
      console.log(
        `      (${results.completeWithAI} with AI-generated solutions)`,
      );
    }
    console.log(`   ⚠️  Incomplete: ${results.incomplete}`);
    console.log(`   ❌ Missing: ${results.missing}`);
    console.log(`   🔴 Corrupted: ${results.corrupted}`);

    const totalIssues =
      results.incomplete + results.missing + results.corrupted;
    const percentage = ((results.complete / validUrls.length) * 100).toFixed(1);

    console.log(`\n📈 Completion: ${percentage}%`);

    if (totalIssues > 0) {
      console.log(`\n⚠️  Found ${totalIssues} issue(s):\n`);
      issues.forEach(({ slug, issue }) => {
        console.log(`   • ${slug}: ${issue}`);
      });
      console.log(`\n💡 Run 'pnpm download' to download missing files.`);
    } else {
      console.log(`\n🎉 All downloads are complete and verified!`);
    }

    console.log("\n" + "=".repeat(60) + "\n");
  } catch (error) {
    if (error.code === "ENOENT" && error.path === "validUrls.json") {
      console.log("❌ validUrls.json not found. Run the crawler first!");
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

verifyDownloads();
