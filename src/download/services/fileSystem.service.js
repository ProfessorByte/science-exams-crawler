import fs from "fs/promises";
import path from "path";
import { DOWNLOADS_DIR } from "../config/download.config.js";

export class FileSystemService {
  static async createResourceDirectory(slug) {
    const dirPath = path.join(DOWNLOADS_DIR, slug);
    await fs.mkdir(dirPath, { recursive: true });
    return dirPath;
  }

  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  static generateFilePath(slug, filePrefix) {
    return path.join(DOWNLOADS_DIR, slug, `${filePrefix}_${slug}.pdf`);
  }

  static async isFileDownloaded(filePath, minSize) {
    const exists = await this.fileExists(filePath);
    if (!exists) {
      return false;
    }

    const fileSize = await this.getFileSize(filePath);
    return fileSize >= minSize;
  }

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

  static async ensureDownloadsDirectory() {
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
  }

  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch {
      console.warn(`Warning: Could not delete file at ${filePath}`);
    }
  }
}
