import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("experience stylesheet remains CSS and is not overwritten by application JavaScript",()=>{
 const css=readFileSync("public/stridebrain-demo/experience.css","utf8");
 const app=readFileSync("public/stridebrain-demo/app.js","utf8");
 assert.doesNotMatch(css,/^import\s/m);
 assert.match(css,/\.sb-team-hero\{/);
 assert.match(css,/\.sb-connections-panel\{/);
 assert.match(app,/^import\s/m);
 assert.notEqual(css,app);
});
