import { doc, setDoc } from "firebase/firestore";
import { db } from "../database/firebase.js";
import validUrls from "../validUrls.json" with { type: "json" };

validUrls.forEach(async (urlData) => {
  const { year, semester, formVersion, idResource } = urlData;
  try {
    await setDoc(
      doc(db, "dataUrls", `${year}-${semester}-${idResource}-${formVersion}`),
      urlData
    );
  } catch (error) {
    console.error("Error writing document: ", error);
  }
});
