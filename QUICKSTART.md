# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. (Optional) Test with Small Range

Before running the full crawler (which can take hours), test with a small range:

Edit `src/config/constants.js` temporarily:

```javascript
// Change this line:
export const YEARS = (() => {
  const currentYear = new Date().getFullYear();
  const startYear = 2012;
  const endYear = currentYear + 1;
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
})();

// To this (just one year for testing):
export const YEARS = [2012];

// And change:
export const MODES = Array.from({ length: 10 }, (_, i) => i + 1);
// To:
export const MODES = [1, 2];

// And change:
export const PATHWAYS = Array.from({ length: 20 }, (_, i) => i + 1);
// To:
export const PATHWAYS = [1, 2, 3];
```

Run the test:

```bash
pnpm start
```

This will test with ~48 combinations and complete in under 1 minute.

**Remember to revert these changes before the full run!**

### 3. Run Full Crawler

```bash
# Make sure constants.js is back to defaults
pnpm start
```

## 📊 Monitor Progress

The crawler will show:

- Start time
- Progress percentage with visual bar
- Found resources in real-time
- End time and total found

Example output:

```
============================================================
🚀 CRAWLER STARTED
⏰ Start Time: 01/10/2025, 14:30:00
============================================================

ℹ️  Loaded 0 existing valid URLs
ℹ️  No existing data. Using default upper limit: 700
ℹ️  Setting upper ID resource limit to: 700
ℹ️  Total possible combinations: 224000
ℹ️  Already processed (skipped): 0
ℹ️  New combinations to process: 224000
ℹ️  Processing 18667 batches of up to 12 requests each

✨ FOUND: 2012-1-558-1-6-1
   📄 Exam: http://sagaa.fcyt.umss.edu.bo/...
   📝 Solution: http://sagaa.fcyt.umss.edu.bo/...

📈 Progress: [████░░░░░░░░░░░░░░░░░░░░░░░░░░] 13.45% (30132/224000)

...

============================================================
✅ CRAWLER COMPLETED
⏰ End Time: 01/10/2025, 16:45:00
📊 Total Valid Resources Found: 127
============================================================
```

## � Download PDFs

After finding valid URLs, download all PDFs:

```bash
pnpm download
```

Output example:

```
============================================================
📥 DOWNLOAD STARTED
⏰ Start Time: 01/10/2025, 16:50:00
📦 Total Resources to Download: 127
============================================================

⬇️  Downloading exam & solution: 2012-1-558-1-6-1
✓ Saved exam: downloads/2012-1-558-1-6-1/Preguntas_2012-1-558-1-6-1.pdf
✓ Saved solution: downloads/2012-1-558-1-6-1/Respuestas_2012-1-558-1-6-1.pdf

📈 Progress: [█████░░░░░░░░░░░░░░░░░░░░░░░░░] 16.5% (21/127)

...

============================================================
✅ DOWNLOAD COMPLETED
⏰ End Time: 01/10/2025, 17:15:00
📊 Statistics:
   ✓ Successfully Downloaded: 125
   ⏭️  Skipped (Already Exists): 2
   ❌ Failed: 0
   📁 Total Files: 254
============================================================
```

Downloaded files are organized in the `downloads/` folder:

```
downloads/
├── 2012-1-558-1-6-1/
│   ├── Preguntas_2012-1-558-1-6-1.pdf
│   └── Respuestas_2012-1-558-1-6-1.pdf
└── ...
```

## �📈 View Statistics

After the crawler has found some resources:

```bash
pnpm stats
```

Output example:

```
============================================================
📊 VALID URLS STATISTICS
============================================================

Total valid resources: 127

Distribution by year:
  2012: 45
  2013: 38
  2014: 44

Distribution by semester:
  Semester 1: 64
  Semester 2: 63

ID Resource range:
  Min: 558
  Max: 652

Top 5 pathways:
  Pathway 6: 32
  Pathway 8: 28
  Pathway 1: 19
  Pathway 15: 17
  Pathway 3: 15
```

## 🛠️ Troubleshooting

### Crawler is too slow

Edit `src/config/constants.js`:

```javascript
export const BATCH_SIZE = 20; // Increase from 12
```

### Getting many timeouts

Edit `src/config/constants.js`:

```javascript
export const BATCH_SIZE = 8; // Decrease from 12
export const REQUEST_TIMEOUT = 15000; // Increase from 10000
export const MAX_RETRIES = 5; // Increase from 3
```

### Want to start fresh

```bash
# Backup current data
mv validUrls.json validUrls.backup.json

# Or just delete it
rm validUrls.json

# Run again
pnpm start
```

### Need to stop the crawler

- Press `Ctrl+C`
- Data is saved after each batch
- Simply run `pnpm start` again to resume

## 📂 Output File

All valid resources are saved to `validUrls.json` in the project root.

Format:

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

## 🎯 What Happens Next?

1. **First Run**: Checks all possible combinations
2. **Second Run**: Only checks new combinations (new year, extended ID range)
3. **Ongoing**: Run periodically to discover new resources

The crawler automatically:

- Skips already validated URLs
- Extends the ID range when new high IDs are found
- Updates for the new year automatically

## 📚 Further Reading

- **README.md**: Overview and features
- **ARCHITECTURE.md**: Technical architecture details
- **CONFIG.md**: Complete configuration reference
- **BEST_PRACTICES.md**: Tips and optimization strategies
- **PROJECT_STRUCTURE.md**: File organization

## 💡 Pro Tips

1. **Run during off-peak hours** for better performance
2. **Check validUrls.json periodically** to see progress
3. **Use `pnpm stats`** to analyze collected data
4. **Commit validUrls.json to git** to track changes over time
5. **Schedule with cron** for automatic daily runs

## 🆘 Need Help?

Check the documentation files:

- Configuration issues → `CONFIG.md`
- Performance issues → `BEST_PRACTICES.md`
- Architecture questions → `ARCHITECTURE.md`
- General usage → `README.md`
