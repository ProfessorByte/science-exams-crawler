/**
 * Download Logger Utility
 * Provides logging specific to download operations
 */

export class DownloadLogger {
  static formatDate(date = new Date()) {
    return date.toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  static logStart(totalResources) {
    const timestamp = this.formatDate();
    console.log("\n" + "=".repeat(60));
    console.log("📥 DOWNLOAD STARTED");
    console.log(`⏰ Start Time: ${timestamp}`);
    console.log(`📦 Total Resources to Download: ${totalResources}`);
    console.log("=".repeat(60) + "\n");
  }

  static logEnd(stats) {
    const timestamp = this.formatDate();
    const totalFiles =
      stats.newFiles +
      stats.existingFiles +
      stats.skippedFiles +
      stats.failedFiles;

    console.log("\n" + "=".repeat(60));
    console.log("✅ DOWNLOAD COMPLETED");
    console.log(`⏰ End Time: ${timestamp}`);
    console.log(`📊 Statistics:`);
    console.log(`   📦 Resources Processed: ${stats.totalResources}`);
    console.log(`   ⬇️  New Files Downloaded: ${stats.newFiles}`);
    console.log(`   ✓ Files Already Existing: ${stats.existingFiles}`);
    console.log(`   ⏭️  Files Skipped (404/410): ${stats.skippedFiles}`);
    console.log(`   ❌ Files Failed: ${stats.failedFiles}`);
    console.log(`   📁 Total Files Processed: ${totalFiles}`);
    console.log("=".repeat(60) + "\n");
  }

  static logDownloading(slug, fileType) {
    console.log(`⬇️  Downloading ${fileType}: ${slug}`);
  }

  static logSuccess(slug, fileType, filePath) {
    console.log(`✓ Saved ${fileType}: ${filePath}`);
  }

  static logSkipped(slug, reason = "already exists") {
    console.log(`⏭️  Skipped ${slug}: ${reason}`);
  }

  static logError(slug, fileType, error) {
    console.error(`❌ Failed ${fileType} for ${slug}: ${error.message}`);
  }

  static logProgress(current, total, percentage) {
    const bar = this.createProgressBar(percentage);
    console.log(
      `📈 Progress: ${bar} ${percentage.toFixed(1)}% (${current}/${total})`
    );
  }

  static createProgressBar(percentage, length = 30) {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    return "[" + "█".repeat(filled) + "░".repeat(empty) + "]";
  }

  static logInfo(message) {
    console.log(`ℹ️  ${message}`);
  }
}
