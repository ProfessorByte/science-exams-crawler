# FCyT UMSS Exams Pseudocrawler

Welcome to the FCyT UMSS Exams Pseudocrawler! This little tool is designed to help you find and catalog past admission exams from the Faculty of Science and Technology (FCyT) at the Universidad Mayor de San Simón (UMSS). It's perfect for researchers, students, or anyone curious about past exams.

## Overview

This Node.js project is built to crawl through possible URLs where past admission exams might be stored. It then compiles them into a JSON file with their respective search parameters. Finally, it uploads all the collected files to a Firebase database for easy access.

## Installation

To get started, make sure you have Node.js installed, preferably version 20.6 or higher, to utilize native environment variable configuration files like `.env`.

```bash
pnpm install
```

This command installs all the necessary dependencies.

## Usage

### Starting the Pseudocrawler

To initiate the search for URLs containing past exams, run:

```bash
pnpm start
```

Please note that this process might take a few minutes as it scans through potential URLs.

### Migrating Data to Firebase

Once the pseudocrawler has finished its job, you can upload all the collected information to your Firebase database. First, make sure you have your Firebase project credentials set up in a `.env` file following the provided `.env.template`.

Then, run the migration command:

```bash
pnpm migrate
```

This command uploads all the collected data from the JSON file to your Firebase database.

## Exam URL Formats

- Exam URL: `http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/examenes/{YEAR}-{SEMESTER}-{ID}/1/6-{ROW}.pdf`

- Solution URL: `http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/solucionario/{YEAR}-{SEMESTER}-{ID}/1/6-{ROW}/0.pdf`

In these URLs:

- `{YEAR}` represents the year of the exam.
- `{SEMESTER}` represents the semester in which the exam was taken (1 for the first semester, 2 for the second).
- `{ID}` is a numeric identifier for each exam.
- `{ROW}` represents the row of the exam (1 or 2).

## User Interface

If you prefer a user-friendly interface to search for exams directly from my Firebase database, check out my another project on GitHub: [examendeingresoinador](https://github.com/ProfessorByte/examendeingresoinador).

- Built with React and Vite.
- **Live Deployment:** Accessible at <https://examendeingresoinador.com>.

Happy crawling! 🕷️📚
