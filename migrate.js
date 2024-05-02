import { collection, addDoc } from "firebase/firestore";
import { db } from "./database.js";
import validUrls from "./validUrls.json" assert { type: "json" };

validUrls.forEach(async (urlData) => {
  await addDoc(collection(db, "validUrls"), urlData);
});
