/**
 * File System Service
 * Handles file system operations for downloads
 */

import fs from "fs/promises";
import path from "path";
import { DOWNLOADS_DIR } from "../config/download.config.js";

export class FileSystemService {
  /**
   * Create directory for a specific resource
   */
  static async createResourceDirectory(slug) {
    const dirPath = path.join(DOWNLOADS_DIR, slug);
    await fs.mkdir(dirPath, { recursive: true });
    return dirPath;
  }

  /**
   * Check if a file exists
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file size
   */
  static async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  /**
   * Generate file path for exam or solution
   */
  static generateFilePath(slug, filePrefix) {
    return path.join(DOWNLOADS_DIR, slug, `${filePrefix}_${slug}.pdf`);
  }

  /**
   * Check if resource is completely downloaded (both files exist and valid)
   */
  static async isResourceComplete(slug, examPath, solutionPath, minSize) {
    const examExists = await this.fileExists(examPath);
    const solutionExists = await this.fileExists(solutionPath);

    if (!examExists || !solutionExists) {
      return false;
    }

    const examSize = await this.getFileSize(examPath);
    const solutionSize = await this.getFileSize(solutionPath);

    return examSize >= minSize && solutionSize >= minSize;
  }

  /**
   * Create downloads directory if it doesn't exist
   */
  static async ensureDownloadsDirectory() {
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
  }

  /**
   * Delete file (used for cleanup of corrupted downloads)
   */
  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore errors if file doesn't exist
    }
  }
}
