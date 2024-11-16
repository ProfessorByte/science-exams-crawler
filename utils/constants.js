// import validUrls from "../validUrls.json" with { type: "json" };

export const urlExamTemplate =
  "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/examenes/{YEAR}-{SEMESTER}-{ID}/1/6-{FORM_VERSION}.pdf";
export const urlSolutionTemplate =
  "http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/solucionario/{YEAR}-{SEMESTER}-{ID}/1/6-{FORM_VERSION}/0.pdf";

export const lowerIdsLimit = 500;
export const upperIdsLimit = 700;
// export const upperIdsLimit = validUrls.reduce((acc, urlData) => {
//   return urlData.idResource > acc ? urlData.idResource : acc;
// }, lowerIdsLimit + 45);
