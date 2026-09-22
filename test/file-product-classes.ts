import test from "node:test";
import assert from "node:assert/strict";
import {
  parseProductClasses,
  productClassesMatch,
} from "../lib/common/file-product-classes.ts";

void test("parseProductClasses normalizes legacy and multi-class values", () => {
  assert.deepEqual(parseProductClasses("IAD200-45M"), ["IAD200-45M"]);
  assert.deepEqual(
    parseProductClasses(" IAD200-45M ; COMET-1608F ; IAD200-45M ; "),
    ["IAD200-45M", "COMET-1608F"],
  );
  assert.deepEqual(parseProductClasses("  ;  "), []);
});

void test("productClassesMatch requires every selected device to be allowed", () => {
  assert.equal(productClassesMatch("", ["A", "B"]), true);
  assert.equal(productClassesMatch("A", ["A"]), true);
  assert.equal(productClassesMatch("A; B", ["A", "B"]), true);
  assert.equal(productClassesMatch("A; B", ["B"]), true);
  assert.equal(productClassesMatch("A; B", ["A", "C"]), false);
  assert.equal(productClassesMatch("A", ["AB"]), false);
  assert.equal(productClassesMatch("A", []), false);
});
