import test from "node:test";
import assert from "node:assert/strict";
import {displayRecordText} from "../public/stridebrain-demo/record-locale.js";
test("Chinese display translates business labels while preserving record IDs",()=>{
 assert.equal(displayRecordText("Material selection · APR-1013","zh-TW"),"材料選定 · APR-1013");
 assert.equal(displayRecordText("Supplier quotation · DOC-1007","zh-TW"),"供應商報價單 · DOC-1007");
 assert.equal(displayRecordText("Material selection · APR-1013","en"),"Material selection · APR-1013");
});
test("record keys and already-Chinese names are never changed",()=>{
 assert.equal(displayRecordText("PRJ-101","zh-TW"),"PRJ-101");
 assert.equal(displayRecordText("松山住宅 · Songshan Residence","zh-TW"),"松山住宅 · 松山住宅");
});
