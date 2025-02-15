import { setUpperIdsLimit } from "./functions.js";

export const urlExamTemplate =
  "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/examenes/{YEAR}-{SEMESTER}-{ID}/1/6-{FORM_VERSION}.pdf";
export const urlSolutionTemplate =
  "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/solucionario/{YEAR}-{SEMESTER}-{ID}/1/6-{FORM_VERSION}/0.pdf";

export const lowerIdsLimit = 500;
export const upperIdsLimit = await setUpperIdsLimit(lowerIdsLimit);

export const downloadMaxAttempts = 6;
