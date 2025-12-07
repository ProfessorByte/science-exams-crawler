export class ExamResource {
  constructor({ year, semester, idResource, mode, pathway, formVersion }) {
    this.year = year;
    this.semester = semester;
    this.idResource = idResource;
    this.mode = mode;
    this.pathway = pathway;
    this.formVersion = formVersion;
    this.slug = this.generateSlug();
    this.examUrl = this.generateExamUrl();
    this.solutionUrl = this.generateSolutionUrl();
  }

  generateSlug() {
    return `${this.year}-${this.semester}-${this.idResource}-${this.mode}-${this.pathway}-${this.formVersion}`;
  }

  generateExamUrl() {
    const { year, semester, idResource, mode, pathway, formVersion } = this;
    return `http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/examenes/${year}-${semester}-${idResource}/${mode}/${pathway}-${formVersion}.pdf`;
  }

  generateSolutionUrl() {
    const { year, semester, idResource, mode, pathway, formVersion } = this;
    return `http://sagaa.fcyt.umss.edu.bo/adm_academica/archivos/solucionario/${year}-${semester}-${idResource}/${mode}/${pathway}-${formVersion}/0.pdf`;
  }

  toJSON() {
    const baseData = {
      slug: this.slug,
      examUrl: this.examUrl,
      solutionUrl: this.solutionUrl,
      year: this.year,
      semester: this.semester,
      idResource: this.idResource,
      mode: this.mode,
      pathway: this.pathway,
      formVersion: this.formVersion,
    };

    if (this.examStatusCode !== undefined) {
      baseData.examStatusCode = this.examStatusCode;
    }
    if (this.solutionStatusCode !== undefined) {
      baseData.solutionStatusCode = this.solutionStatusCode;
    }

    return baseData;
  }
}
