/** StrideBrain model authorization regression checks. Run: node --test tests/stridebrain-model-catalog.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import { MODEL_CATALOG, DEFAULT_MODEL_ID, findAllowedModel, isModelAllowed, visibleModels } from "../public/stridebrain-demo/model-catalog.js";

test("approved model catalog contains unique IDs and exactly five known options", () => {
 assert.equal(MODEL_CATALOG.length, 5);
 assert.equal(new Set(MODEL_CATALOG.map(model => model.id)).size, MODEL_CATALOG.length);
 assert.equal(MODEL_CATALOG.filter(model => model.provider === "openrouter").length, 4);
 assert.equal(MODEL_CATALOG.filter(model => model.provider === "openai").length, 1);
 assert.ok(findAllowedModel(DEFAULT_MODEL_ID));
 for (const model of MODEL_CATALOG) {
  assert.ok(model.id && model.label && model.provider);
  assert.equal(isModelAllowed(model.id), true);
 }
});

test("arbitrary IDs and misleading prefixes cannot access a provider", () => {
 for (const id of ["", "openai/gpt-unknown", "anthropic/claude-sonnet-5.5:free", "../secrets", "openrouter/auto", "openai/gpt-6-sol "]) {
  assert.equal(findAllowedModel(id), null);
  assert.equal(isModelAllowed(id), false);
 }
});

test("administrator allowlist narrows the public model catalog", () => {
 const selected = MODEL_CATALOG[1].id;
 assert.equal(isModelAllowed(selected, selected), true);
 assert.equal(isModelAllowed(DEFAULT_MODEL_ID, selected), false);
 assert.equal(isModelAllowed(selected, "unknown/unknown, " + selected + " "), true);
 assert.equal(isModelAllowed(selected, "unknown/unknown"), false);
});

test("browser-visible model metadata never includes keys or provider secrets", () => {
 const visible = visibleModels();
 assert.equal(visible.length, MODEL_CATALOG.length);
 for (const model of visible) {
  assert.deepEqual(Object.keys(model).sort(), ["description","id","label","maker","provider","purpose","tier"].sort());
  assert.equal(typeof model.description, "string");
 }
});
