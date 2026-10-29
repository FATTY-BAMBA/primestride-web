import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("root layout does not require remote next/font Google fetches during release builds",()=>{
 const layout=readFileSync("src/app/layout.tsx","utf8");
 assert.equal(layout.includes("next/font/google"),false);
 assert.match(layout,/--font-bricolage/);
 assert.match(layout,/--font-plex/);
 assert.match(layout,/--font-plex-mono/);
 assert.match(layout,/--font-noto-tc/);
});
