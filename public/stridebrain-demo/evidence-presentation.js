import {escapeHtml as e} from './core-model.js';
import {source} from './ui-shared.js';
/** Counts cited items, not retrieved items, verified claims, or time saved. */
export function citedEvidence(ids,model){
 const sources=[...new Set(Array.isArray(ids)?ids:[])].map(id=>model.document(id)).filter(Boolean);
 return {sources,documents:sources.filter(d=>d.basisType!=='DEMO_REGISTER').length,records:sources.filter(d=>d.basisType==='DEMO_REGISTER').length};
}
export function evidenceList(ids,model,locale='zh-TW'){
 const zh=locale!=='en',x=citedEvidence(ids,model);if(!x.sources.length)return '';
 const label=zh?'引用 '+x.documents+' 份文件 · '+x.records+' 筆紀錄':x.documents+' cited documents · '+x.records+' cited records';
 const links=x.sources.map(d=>source(d.id));
 return '<div class="copilot-tool-sources"><strong>'+e(label)+'</strong><div>'+links.slice(0,4).join(' ')+'</div>'+(links.length>4?'<details class="sb-evidence-more"><summary>'+e(zh?'查看其餘 '+(links.length-4)+' 項來源':'Show '+(links.length-4)+' more sources')+'</summary><div>'+links.slice(4).join(' ')+'</div></details>':'')+'</div>';
}
