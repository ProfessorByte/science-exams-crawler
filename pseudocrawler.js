import axios from "axios";
import { replaceUrl } from "./utils";
import {
  urlExamTemplate,
  urlSolutionTemplate,
  lowerIdsLimit,
  upperIdsLimit,
} from "./constants";

let validUrls = [];

export const findValidUrls = async (year, semester, row) => {
  for (
    let idResource = lowerIdsLimit;
    idResource <= upperIdsLimit;
    idResource++
  ) {
    let url = replaceUrl(urlExamTemplate, year, semester, row, idResource);

    const response = await axios.head(url);
    if (response.status === 200) {
      console.log(`Recurso encontrado: ${url}`);
      validUrls.push({
        examUrl: url,
        solutionUrl: replaceUrl(
          urlSolutionTemplate,
          year,
          semester,
          row,
          idResource
        ),
        year,
        semester,
        row,
        idResource,
      });
    }
  }
};

export const getValidUrls = async () => {
  const promises = [];

  for (let year = 2010; year <= new Date().getFullYear(); year++) {
    for (let semester = 1; semester <= 2; semester++) {
      for (let row = 1; row <= 2; row++) {
        promises.push(findValidUrls(year, semester, row));
      }
    }
  }

  await Promise.all(promises);

  return validUrls.sort((a, b) => {
    if (a.examUrl < b.examUrl) return -1;
    if (a.examUrl > b.examUrl) return 1;
    return 0;
  });
};
