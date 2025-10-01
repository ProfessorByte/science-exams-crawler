# Science Exams Crawler & Downloader

Complete solution for discovering and downloading science exam PDFs from the UMSS repository.

## 🎯 Features

### Crawler

- **Intelligent Crawling**: Only validates URLs not previously checked
- **Batch Processing**: Processes requests in configurable batches to avoid network saturation
- **Retry Logic**: Automatically retries failed requests with exponential backoff
- **Progress Tracking**: Real-time progress percentage and statistics
- **Persistent Storage**: Maintains a sorted JSON file of valid URLs
- **Optimized Validation**: If one URL (exam or solution) is valid, saves both without double-checking
- **Resumable**: Safe to stop and restart

### Downloader

- **Batch Downloads**: Downloads 5 PDFs concurrently (configurable)
- **Smart Skip**: Automatically skips already downloaded files
- **Retry Logic**: Retries failed downloads with exponential backoff
- **File Validation**: Verifies downloaded files are valid
- **Organized Structure**: Creates folders per exam with clear naming
- **Progress Tracking**: Real-time download progress and statistics
- **Resumable**: Continue from where you left off

### Architecture

- **Clean Code**: SOLID principles, modular design, maintainable
- **Small Files**: All files ~100 lines or less
- **Well Documented**: Comprehensive documentation for every aspect

## 📁 Project Structure

```
src/
├── config/
│   └── constants.js          # Centralized configuration
├── models/
│   └── ExamResource.js        # Data model
├── services/
│   ├── urlGenerator.service.js    # URL generation
│   ├── urlValidator.service.js    # HTTP validation
│   └── storage.service.js         # JSON persistence
├── utils/
│   ├── logger.util.js         # Logging utilities
│   ├── progress.util.js       # Progress tracking
│   └── retry.util.js          # Retry logic
├── core/
│   ├── crawler.js             # Main orchestrator
│   └── batch.processor.js     # Batch processing
└── index.js                   # Entry point
```

## 🚀 Installation

```bash
# Install dependencies
pnpm install
```

## ▶️ Usage

```bash
# Start the crawler to find valid URLs
pnpm start

# Download all found PDFs
pnpm download

# View statistics of collected data
pnpm stats
```

## 📊 Quick Start

1. **Find valid URLs**: `pnpm start` - The crawler will scan and save valid exam URLs
2. **Download PDFs**: `pnpm download` - Downloads all exams and solutions to `downloads/` folder
3. **View statistics**: `pnpm stats` - See what you've collected
4. **Resume anytime**: Both crawler and downloader are resumable - safe to stop and restart

## ⚙️ Configuration

Edit `src/config/constants.js` to customize:

- `MAX_RETRIES`: Number of retry attempts per URL (default: 3)
- `BATCH_SIZE`: Number of concurrent requests per batch (default: 12)
- `REQUEST_TIMEOUT`: Timeout for each request in ms (default: 10000)

## 📊 Parameter Ranges

- **Year**: 2012 to current year + 1 (dynamic)
- **Semester**: 1, 2
- **ID Resource**: 500 to (max existing ID + 45)
- **Mode**: 1-10
- **Pathway**: 1-20
- **Form Version**: 1, 2

## 🔄 How It Works

1. Loads existing `validUrls.json` to avoid re-checking
2. Calculates the upper limit for `idResource` based on existing data
3. Generates all possible URL combinations
4. Processes combinations in batches to avoid overwhelming the network
5. For each resource:
   - Tries the exam URL first (with retries)
   - If valid, saves both exam and solution URLs
   - If exam fails, tries solution URL
   - If solution is valid, saves both URLs
6. Saves results after each batch
7. Sorts final results naturally by `examUrl`

## 📝 Output

Valid URLs are saved to `validUrls.json` in the project root, with the following structure:

```json
[
  {
    "slug": "2012-1-558-1-6-1",
    "examUrl": "http://...",
    "solutionUrl": "http://...",
    "year": 2012,
    "semester": 1,
    "idResource": 558,
    "mode": 1,
    "pathway": 6,
    "formVersion": 1
  }
]
```

## 🎯 Optimization Strategies

- **Dynamic Programming**: Maintains a Set of processed slugs to avoid duplicates
- **Smart Validation**: If one URL works, skips checking its pair
- **Batch Processing**: Limits concurrent requests to prevent network saturation
- **Exponential Backoff**: Retry delays increase exponentially
- **HEAD Requests**: Uses HTTP HEAD instead of GET to avoid downloading full PDFs
- **Incremental Saving**: Persists data after each batch to prevent data loss

## 📄 License

This project is licensed under the **Business Source License 1.1 (BSL)**.  
You are free to use, modify, and redistribute the code for **non-production purposes**.  
Certain production uses may be allowed under the "Additional Use Grant" defined in the license.

On **January 1, 2029**, this project will automatically transition to the  
**GNU Affero General Public License v3 (AGPL-3.0-or-later)**.

For full details, see the [LICENSE.md](./LICENSE.md) file.

[![License: BSL 1.1 → AGPLv3 in 2029](https://img.shields.io/badge/License-BSL%201.1%20%E2%86%92%20AGPLv3%20in%202029-blue.svg)](./LICENSE.md)
