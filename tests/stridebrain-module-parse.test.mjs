import test from "node:test";
import assert from "node:assert/strict";
import {readdirSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const directory=fileURLToPath(new URL("../public/stridebrain-demo/",import.meta.url));
test("every StrideBrain top-level browser JavaScript module parses",()=>{
 const files=readdirSync(directory).filter(name=>name.endsWith(".js"));
 assert.ok(files.length>15,"Expected all workspace modules to be checked");
 for(const name of files){
  const result=spawnSync(process.execPath,["--check",resolve(directory,name)],{encoding:"utf8"});
  assert.equal(result.status,0,name+": "+result.stderr);
 }
});
