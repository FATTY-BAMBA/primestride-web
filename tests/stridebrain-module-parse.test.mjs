import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
test("every StrideBrain browser module parses without duplicate lexical declarations",()=>{
 const path=new URL("../public/stridebrain-demo/views-operations.js",import.meta.url);
 const result=spawnSync(process.execPath,["--check",path.pathname],{encoding:"utf8"});
 assert.equal(result.status,0,result.stderr);
 const source=readFileSync(path,"utf8");
 assert.doesNotMatch(source,/const zh=c\.locale!=="en";\s*const zh=c\.locale!=="en";/);
});
