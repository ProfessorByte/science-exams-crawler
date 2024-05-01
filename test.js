import test from "node:test";
import assert from "node:assert";
import { findValidUrls } from "./pseudocrawler.js";

test("Find the valid urls for the given year, semester and row", async () => {
  const year = 2023;
  const semester = 1;
  const row = 1;

  const validUrls = await findValidUrls(year, semester, row);
  console.log(validUrls);
  assert(
    validUrls.length,
    6,
    "Should find 6 valid urls for this given year, semester and row"
  );
});
