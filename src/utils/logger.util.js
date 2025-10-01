/**
 * Logger Utility
 * Provides consistent logging throughout the application
 */

export class Logger {
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

  static logStart() {
    const timestamp = this.formatDate();
    console.log("\n" + "=".repeat(60));
    console.log("🚀 CRAWLER STARTED");
    console.log(`⏰ Start Time: ${timestamp}`);
    console.log("=".repeat(60) + "\n");
  }

  static logEnd(foundCount) {
    const timestamp = this.formatDate();
    console.log("\n" + "=".repeat(60));
    console.log("✅ CRAWLER COMPLETED");
    console.log(`⏰ End Time: ${timestamp}`);
    console.log(`📊 Total Valid Resources Found: ${foundCount}`);
    console.log("=".repeat(60) + "\n");
  }

  static logFound(resource) {
    console.log(`✨ FOUND: ${resource.slug}`);
    console.log(`   📄 Exam: ${resource.examUrl}`);
    console.log(`   📝 Solution: ${resource.solutionUrl}`);
  }

  static logProgress(current, total, percentage) {
    const bar = this.createProgressBar(percentage);
    console.log(
      `📈 Progress: ${bar} ${percentage.toFixed(2)}% (${current}/${total})`
    );
  }

  static createProgressBar(percentage, length = 30) {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    return "[" + "█".repeat(filled) + "░".repeat(empty) + "]";
  }

  static logError(message, error) {
    console.error(`❌ ERROR: ${message}`, error?.message || "");
  }

  static logInfo(message) {
    console.log(`ℹ️  ${message}`);
  }
}
