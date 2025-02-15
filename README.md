# Science Exams Crawler

Welcome to the Science Exams Crawler! This little tool is designed to help you find and catalog past admission exams from the Faculty of Science and Technology (FCyT) at the Universidad Mayor de San Simón (UMSS). It's perfect for researchers, students, or anyone curious about past exams.

## Overview

This Node.js project is built to crawl through possible URLs where past admission exams might be stored. It then compiles them into a JSON file with their respective search parameters. Finally, it download all the files to a `downloads` folder for easy access.

## Installation

To get started, make sure you have Node.js installed, preferably version 20.6 or higher, to utilize native environment variable configuration files like `.env` (needed if you are going to use the migration feature).

```bash
pnpm install
```

This command installs all the necessary dependencies.

## Usage

### Starting the crawler

To initiate the search for URLs containing past exams, run:

```bash
pnpm main
```

Please note that this process might take a few minutes as it scans through potential URLs.

### Migrating Data to Firebase (Optional)

Once the crawler has finished its job, you can upload all the collected information to your Firebase database. First, make sure you have your Firebase project credentials set up in a `.env` file following the provided `.env.template`.

Then, run the migration command:

```bash
pnpm migrate
```

This command uploads all the collected data from the JSON file to your Firestore database.

### Downloading PDF files

This feature allows you to download all available exams along with their solutions directly into a structured folder. Each exam-solution pair is saved in a subfolder named according to the `slug` specified in the JSON file generated by the crawler.

To start the download process, simply run:

```bash
pnpm download
```

The script will:

1. Create a `downloads` folder (if it doesn't already exist).
2. Read the JSON file containing exam metadata to get the required URLs and `slug` identifiers.
3. For each exam, it will:
   - Download the exam PDF.
   - Download the corresponding solution PDF.
   - Save both files into a subfolder named with the corresponding document's `slug`.

For example, if the JSON file specifies an entry with the following structure:

```json
{
  "slug": "2024-2-655-1",
  "examUrl": "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/examenes/2024-2-655/1/6-1.pdf",
  "solutionUrl": "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/solucionario/2024-2-655/1/6-1/0.pdf",
  "year": 2024,
  "semester": 2,
  "formVersion": 1,
  "idResource": 655
}
```

The downloaded files will be organized as:

```
downloads/
└── 2024-2-655-1/
    ├── Preguntas_2024-2-655-1.pdf
    └── Respuestas_2024-2-655-1.pdf
```

This structure ensures that all materials are neatly categorized for easy navigation and use.

## Exam URL Formats

- Exam URL: `http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/examenes/{YEAR}-{SEMESTER}-{ID}/1/6-{FORM_VERSION}.pdf`

- Solution URL: `http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/solucionario/{YEAR}-{SEMESTER}-{ID}/1/6-{FORM_VERSION}/0.pdf`

In these URLs:

- `{YEAR}` represents the year of the exam.
- `{SEMESTER}` represents the semester in which the exam was taken (1 for the first semester, 2 for the second).
- `{ID}` is a numeric identifier for each exam.
- `{FORM_VERSION}` represents the formVersion of the exam (1 or 2).

## User Interface

If you prefer a user-friendly interface to search for exams, check out my another project on GitHub: [examendeingresoinador](https://github.com/ProfessorByte/examendeingresoinador).

This current project was used as a basis to design the User Interface specified in these links.

**Live Deployment:** Accessible at <https://examendeingresoinador.pages.dev>

Happy crawling! 🕷️📚
