import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { marked } from "marked";

config();

marked.setOptions({
  gfm: true,
  breaks: true,
});

const DOWNLOADS_DIR = "downloads";
const MIN_FILE_SIZE = 1024;
const MODEL_NAME = process.env.MODEL_NAME || "gemini-3-flash-preview";
const GENERATED_SOLUTION_PREFIX = "Solucionario_IA";
const EXAM_FILE_PREFIX = "Preguntas";

const DISCLAIMER_ES = `El presente documento ha sido elaborado mediante el uso de sistemas de inteligencia artificial. Aunque se han implementado medidas para garantizar la precisión y calidad de las soluciones proporcionadas, es posible que existan errores o inexactitudes. Se recomienda a los usuarios revisar críticamente el contenido y utilizarlo como una guía complementaria en su proceso de estudio.`;

function buildSolutionPrompt() {
  return `Eres un experto profesor de ciencias exactas (matemáticas, física, química, biología) con amplia experiencia en la resolución de exámenes de admisión universitaria.

Tu tarea es analizar el examen de admisión proporcionado y generar una solución detallada y completa para cada pregunta.

## Instrucciones específicas:

1. **Formato de salida**: Genera la solución en formato Markdown válido.

2. **Estructura por pregunta**:
   - Incluye el número de la pregunta como encabezado (ejemplo: "Pregunta A1")
   - Transcribe brevemente el enunciado de la pregunta
   - Desarrolla el procedimiento paso a paso de manera clara y didáctica
   - Explica cada paso con detalle, incluyendo las fórmulas y conceptos utilizados
   - Muestra los cálculos intermedios cuando sea necesario
   - Al final de cada pregunta, indica la respuesta correcta con la opción correspondiente en **negrita**. Por ejemplo: "**Respuesta: B) 42**"

3. **Estilo de explicación**:
   - Procede de manera secuencial hacia la respuesta final
   - Utiliza un lenguaje académico pero accesible
   - Si hay múltiples métodos de solución, menciona el más eficiente
   - Incluye justificaciones para descartar las opciones incorrectas cuando sea relevante
   - Utiliza notación matemática apropiada (puedes usar LaTeX inline con $ para ecuaciones)
   - Si la pregunta tiene gráficos o tablas, describe cómo se interpretarían y cómo se usarían para resolver la pregunta
   - Utiliza notación tanto Markdown como LaTeX apropiada, válida y correcta.

4. **Organización del documento**:
   - Comienza con un título principal indicando el examen
   - Agrupa las preguntas por sección si el examen tiene secciones identificables
   - Mantén un formato consistente a lo largo de todo el documento

5. **Idioma**: Toda la solución debe estar en español.

Analiza el examen PDF adjunto y genera las soluciones completas siguiendo estas instrucciones y usa las herramientas que tienes disponibles cuando sea necesario.`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

const ORIGINAL_SOLUTION_PREFIX = "Respuestas";

async function findResourcesNeedingSolutions(validUrls) {
  const resourcesNeedingSolutions = [];

  for (const resource of validUrls) {
    const { slug } = resource;

    const examPath = path.join(
      DOWNLOADS_DIR,
      slug,
      `${EXAM_FILE_PREFIX}_${slug}.pdf`,
    );
    const originalSolutionPath = path.join(
      DOWNLOADS_DIR,
      slug,
      `${ORIGINAL_SOLUTION_PREFIX}_${slug}.pdf`,
    );
    const aiSolutionPath = path.join(
      DOWNLOADS_DIR,
      slug,
      `${GENERATED_SOLUTION_PREFIX}_${slug}.pdf`,
    );

    const examExists = await fileExists(examPath);
    if (!examExists) continue;

    const examSize = await getFileSize(examPath);
    if (examSize < MIN_FILE_SIZE) continue;

    const originalSolutionExists = await fileExists(originalSolutionPath);
    if (originalSolutionExists) continue;

    const aiSolutionExists = await fileExists(aiSolutionPath);
    if (aiSolutionExists) continue;

    resourcesNeedingSolutions.push({
      ...resource,
      examPath,
      aiSolutionPath,
    });
  }

  return resourcesNeedingSolutions;
}

class SolutionGenerator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required. " +
          "Please set it before running this script.",
      );
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.model = MODEL_NAME;

    this.tools = [{ codeExecution: {} }, { googleSearch: {} }];

    this.config = {
      thinkingConfig: {
        thinkingLevel: "HIGH",
      },
      mediaResolution: "MEDIA_RESOLUTION_HIGH",
      tools: this.tools,
    };
  }

  async generateSolution(examPath, slug) {
    const pdfData = await fs.readFile(examPath);
    const base64Pdf = pdfData.toString("base64");

    const prompt = buildSolutionPrompt();

    const contents = [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
        ],
      },
    ];

    const response = await this.ai.models.generateContentStream({
      model: this.model,
      config: this.config,
      contents: contents,
    });

    let fullText = "";
    for await (const chunk of response) {
      if (!chunk.candidates?.[0]?.content?.parts) {
        continue;
      }
      for (const part of chunk.candidates[0].content.parts) {
        if (part.text) {
          fullText += part.text;
        }
      }
    }

    return fullText;
  }
}

function protectMathExpressions(markdown) {
  const mathExpressions = [];
  let placeholderIndex = 0;

  function replacer(match) {
    const placeholder = `%%MATH_EXPR_${placeholderIndex}%%`;
    mathExpressions.push({ placeholder, original: match });
    placeholderIndex++;
    return placeholder;
  }

  const codeBlockMap = [];
  let processed = markdown.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    const codePlaceholder = `%%CODE_BLOCK_${codeBlockMap.length}%%`;
    codeBlockMap.push({ codePlaceholder, code: match });
    return codePlaceholder;
  });

  processed = processed.replace(/\$\$[\s\S]+?\$\$/g, replacer);

  processed = processed.replace(
    /\$(?!\$)((?:[^$\\\n]|\\.)+?)\$(?!\$)/g,
    replacer,
  );

  for (const { codePlaceholder, code } of codeBlockMap) {
    processed = processed.replace(codePlaceholder, code);
  }

  return { processed, mathExpressions };
}

function restoreMathExpressions(html, mathExpressions) {
  let result = html;
  for (const { placeholder, original } of mathExpressions) {
    const isDisplay = original.startsWith("$$");
    const delim = isDisplay ? "$$" : "$";
    const inner = original.slice(delim.length, original.length - delim.length);

    const safeInner = inner
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    result = result.replace(placeholder, `${delim}${safeInner}${delim}`);
  }
  return result;
}

class MarkdownToPdfConverter {
  convertToHtml(markdown, slug) {
    const { processed, mathExpressions } = protectMathExpressions(markdown);
    const html = marked.parse(processed);
    const restoredHtml = restoreMathExpressions(html, mathExpressions);
    return this.wrapInHtmlDocument(restoredHtml, slug);
  }

  wrapInHtmlDocument(content, slug) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solucionario - ${slug}</title>
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      },
      startup: {
        pageReady: () => {
          return MathJax.startup.defaultPageReady().then(() => {
            window.mathJaxReady = true;
          });
        }
      }
    };
  </script>
  <script id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.8;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-size: 14px;
    }
    .disclaimer {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 30px;
      font-size: 0.85em;
      color: #856404;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      font-size: 1.8em;
      margin-top: 20px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-left: 4px solid #3498db;
      padding-left: 10px;
      font-size: 1.4em;
    }
    h3 {
      color: #555;
      font-size: 1.2em;
      margin-top: 20px;
    }
    h4 {
      color: #666;
      font-size: 1.1em;
    }
    p {
      margin: 10px 0;
      text-align: justify;
    }
    strong {
      color: #27ae60;
    }
    em {
      color: #555;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      border: 1px solid #ddd;
    }
    pre code {
      background: none;
      padding: 0;
    }
    /* Table styles */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
      font-size: 0.95em;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 10px 12px;
      text-align: center;
    }
    th {
      background-color: #3498db;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    tr:hover {
      background-color: #e9ecef;
    }
    /* List styles */
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
    /* Blockquote */
    blockquote {
      border-left: 4px solid #3498db;
      margin: 15px 0;
      padding: 10px 20px;
      background-color: #f8f9fa;
      color: #555;
    }
    /* Answer highlight */
    strong:has(+ br), p > strong:last-child {
      background-color: #d4edda;
      padding: 2px 8px;
      border-radius: 3px;
    }
    /* MathJax specific */
    .MathJax {
      font-size: 1.1em !important;
    }
    mjx-container {
      margin: 0 2px;
    }
    /* Horizontal rule */
    hr {
      border: none;
      border-top: 2px solid #eee;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="disclaimer">
    <strong>⚠️ AVISO IMPORTANTE:</strong><br>
    ${DISCLAIMER_ES}
  </div>
  <div class="content">
    ${content}
  </div>
</body>
</html>`;
  }

  async saveHtml(html, outputPath) {
    const htmlPath = outputPath.replace(".pdf", ".html");
    await fs.writeFile(htmlPath, html, "utf-8");
    return htmlPath;
  }

  async saveMarkdown(markdown, outputPath) {
    const mdPath = outputPath.replace(".pdf", ".md");
    const contentWithDisclaimer = `> **⚠️ AVISO IMPORTANTE:**\n> ${DISCLAIMER_ES}\n\n---\n\n${markdown}`;
    await fs.writeFile(mdPath, contentWithDisclaimer, "utf-8");
    return mdPath;
  }
}

class PdfGenerator {
  constructor() {
    this.puppeteerAvailable = false;
    this.puppeteer = null;
  }

  async initialize() {
    try {
      this.puppeteer = await import("puppeteer");
      this.puppeteerAvailable = true;
      console.log("   📦 Puppeteer disponible - se generarán archivos PDF");
    } catch {
      console.log(
        "   ⚠️  Puppeteer no disponible - se generarán archivos HTML y MD",
      );
      console.log("   💡 Para generar PDFs, instala: pnpm add puppeteer");
    }
  }

  async generatePdf(html, outputPath) {
    if (!this.puppeteerAvailable) {
      return false;
    }

    const browser = await this.puppeteer.default.launch({
      headless: "new",
    });

    try {
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      await page
        .waitForFunction(
          () => {
            if (typeof MathJax !== "undefined" && MathJax.startup) {
              return MathJax.startup.promise.then(() => true).catch(() => true);
            }
            return true;
          },
          { timeout: 30000 },
        )
        .catch(() => {
          return page.waitForTimeout(2000);
        });

      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 1500)),
      );

      await page.pdf({
        path: outputPath,
        format: "A4",
        margin: {
          top: "2cm",
          right: "2cm",
          bottom: "2cm",
          left: "2cm",
        },
        printBackground: true,
        preferCSSPageSize: true,
      });

      return true;
    } finally {
      await browser.close();
    }
  }
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🤖 GENERADOR DE SOLUCIONARIOS CON IA");
  console.log("=".repeat(60) + "\n");

  let validUrls;
  try {
    const data = await fs.readFile("validUrls.json", "utf-8");
    validUrls = JSON.parse(data);
    console.log(`📋 Total de recursos en validUrls.json: ${validUrls.length}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        "❌ validUrls.json no encontrado. Ejecuta el crawler primero.",
      );
      process.exit(1);
    }
    throw error;
  }

  console.log("\n🔍 Analizando exámenes sin solucionario...\n");
  const resourcesNeedingSolutions =
    await findResourcesNeedingSolutions(validUrls);

  if (resourcesNeedingSolutions.length === 0) {
    console.log(
      "✅ Todos los exámenes ya tienen solucionario o generación IA previa.",
    );
    console.log("\n" + "=".repeat(60) + "\n");
    return;
  }

  console.log(
    `📝 Exámenes sin solucionario encontrados: ${resourcesNeedingSolutions.length}\n`,
  );

  console.log("   Recursos a procesar:");
  resourcesNeedingSolutions.forEach(({ slug }) => {
    console.log(`   • ${slug}`);
  });
  console.log();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ Error: Variable de entorno GEMINI_API_KEY no configurada.",
    );
    console.log("   Configura la variable antes de ejecutar:");
    console.log("   Windows: set GEMINI_API_KEY=tu_api_key");
    console.log("   Linux/Mac: export GEMINI_API_KEY=tu_api_key");
    process.exit(1);
  }

  const generator = new SolutionGenerator(apiKey);
  const converter = new MarkdownToPdfConverter();
  const pdfGen = new PdfGenerator();
  await pdfGen.initialize();

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < resourcesNeedingSolutions.length; i++) {
    const resource = resourcesNeedingSolutions[i];
    const { slug, examPath, aiSolutionPath } = resource;

    console.log(
      `\n[${i + 1}/${resourcesNeedingSolutions.length}] 📄 Procesando: ${slug}`,
    );

    try {
      console.log("   🧠 Generando solución con Gemini AI...");
      const markdown = await generator.generateSolution(examPath, slug);

      const html = converter.convertToHtml(markdown, slug);

      const mdPath = await converter.saveMarkdown(markdown, aiSolutionPath);
      console.log(`   📝 Markdown guardado: ${path.basename(mdPath)}`);

      const pdfGenerated = await pdfGen.generatePdf(html, aiSolutionPath);

      if (pdfGenerated) {
        console.log(`   ✅ PDF generado: ${path.basename(aiSolutionPath)}`);
        try {
          await fs.unlink(mdPath);
          console.log(`   🗑️  Markdown eliminado (PDF generado exitosamente)`);
        } catch (unlinkError) {
          console.log(
            `   ⚠️  No se pudo eliminar el markdown: ${unlinkError.message}`,
          );
        }
      } else {
        const htmlPath = await converter.saveHtml(html, aiSolutionPath);
        console.log(`   📄 HTML guardado: ${path.basename(htmlPath)}`);
        console.log(`   ℹ️  Markdown conservado (no se generó PDF)`);
      }

      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errorCount++;
    }

    if (i < resourcesNeedingSolutions.length - 1) {
      console.log("   ⏳ Esperando antes del siguiente procesamiento...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMEN DE GENERACIÓN");
  console.log("=".repeat(60));
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`   📁 Total procesados: ${resourcesNeedingSolutions.length}`);
  console.log("=".repeat(60) + "\n");
}

// Execute
main().catch((error) => {
  console.error("❌ Error fatal:", error.message);
  process.exit(1);
});
