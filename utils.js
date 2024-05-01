export const replaceUrl = (url, year, semester, row, idResource) =>
  url
    .replace("{YEAR}", year)
    .replace("{SEMESTER}", semester)
    .replace("{ROW}", row)
    .replace("{ID}", idResource);
