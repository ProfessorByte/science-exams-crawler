/**
 * Progress Utility
 * Calculates and tracks progress of the crawling operation
 */

export class ProgressTracker {
  constructor(totalCombinations) {
    this.total = totalCombinations;
    this.processed = 0;
    this.lastLoggedPercentage = 0;
    this.logInterval = 1; // Log every 1% progress
  }

  increment() {
    this.processed++;
  }

  getPercentage() {
    return this.total > 0 ? (this.processed / this.total) * 100 : 0;
  }

  shouldLog() {
    const currentPercentage = this.getPercentage();
    if (currentPercentage - this.lastLoggedPercentage >= this.logInterval) {
      this.lastLoggedPercentage = Math.floor(currentPercentage);
      return true;
    }
    return false;
  }

  getCurrent() {
    return this.processed;
  }

  getTotal() {
    return this.total;
  }
}
