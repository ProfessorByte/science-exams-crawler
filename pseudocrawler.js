import axios from "axios";
import { replaceUrl } from "./utils.js";
import {
  urlExamTemplate,
  urlSolutionTemplate,
  lowerIdsLimit,
  upperIdsLimit,
} from "./constants.js";

let validUrls = [];

export const findValidUrls = async (year, semester, formVersion) => {
  for (
    let idResource = lowerIdsLimit;
    idResource <= upperIdsLimit;
    idResource++
  ) {
    const examUrl = replaceUrl(
      urlExamTemplate,
      year,
      semester,
      formVersion,
      idResource
    );
    const solutionUrl = replaceUrl(
      urlSolutionTemplate,
      year,
      semester,
      formVersion,
      idResource
    );

    try {
      const responseExam = await axios.head(examUrl);
      if (responseExam.status === 200) {
        console.log(`Recurso encontrado: ${examUrl}`);
        validUrls.push({
          examUrl,
          solutionUrl,
          year,
          semester,
          formVersion,
          idResource,
        });
      }
    } catch (error) {
      try {
        const responseSolution = await axios.head(solutionUrl);
        if (responseSolution.status === 200) {
          console.log(`Recurso encontrado: ${solutionUrl}`);
          validUrls.push({
            examUrl,
            solutionUrl,
            year,
            semester,
            formVersion,
            idResource,
          });
        }
      } catch (error) {
        // console.error(error);
        // console.log(`Recurso no encontrado: ${url}`);
      }
    }
  }
  return validUrls;
};

export const getValidUrls = async () => {
  const promises = [];

  for (let year = 2010; year <= new Date().getFullYear(); year++) {
    for (let semester = 1; semester <= 2; semester++) {
      for (let formVersion = 1; formVersion <= 2; formVersion++) {
        promises.push(findValidUrls(year, semester, formVersion));
      }
    }
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    // console.error(error);
  }

  return validUrls.sort((a, b) => {
    if (a.examUrl < b.examUrl) return -1;
    if (a.examUrl > b.examUrl) return 1;
    return 0;
  });
};
