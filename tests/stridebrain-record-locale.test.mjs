import test from "node:test";
import assert from "node:assert/strict";
import {displayRecordText} from "../public/stridebrain-demo/record-locale.js";
test("Taiwan terminology displays Chinese record names but preserves IDs",()=>{
 assert.equal(displayRecordText("Material selection · APR-101","zh-TW"),"材料選定 · APR-101");
 assert.equal(displayRecordText("Quotation revision","en"),"Quotation revision");
 assert.equal(displayRecordText("Songshan Residence · Approved","zh-TW"),"松山住宅 · 已核准");
});
