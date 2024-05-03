import { doc, setDoc } from "firebase/firestore";
import { db } from "./database.js";
import validUrls from "./validUrls.json" assert { type: "json" };

validUrls.forEach(async (urlData) => {
  const { year, semester, row, idResource } = urlData;
  try {
    await setDoc(
      doc(db, "dataUrls", `${semester}-${year}-id${idResource}-row${row}`),
      urlData
    );
  } catch (error) {
    console.error("Error writing document: ", error);
  }
});
