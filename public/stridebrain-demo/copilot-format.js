/** Safe lightweight formatting for model text. No generated HTML is trusted. */
const escapeHtml=value=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function inline(text){
 const placeholders=[];
 const add=html=>{const n=placeholders.length;placeholders.push(html);return "\uE000"+n+"\uE001";};
 let out=String(text||"");
 out=out.replace(/\`([^\`\n]{1,180})\`/g,(_,code)=>add("<code>"+escapeHtml(code)+"</code>"));
 out=out.replace(/\*\*([^*\n]+)\*\*/g,(_,value)=>add("<strong>"+escapeHtml(value)+"</strong>"));
 out=out.replace(/\*([^*\n]+)\*/g,(_,value)=>add("<em>"+escapeHtml(value)+"</em>"));
 out=escapeHtml(out);
 return out.replace(/\uE000(\d+)\uE001/g,(_,i)=>placeholders[Number(i)]||"");
}
function cells(line){
 const value=line.trim();
 if(!value.includes("|"))return null;
 const inner=value.replace(/^\|/,"").replace(/\|$/,"");
 return inner.split("|").map(cell=>cell.trim());
}
function separator(line,count){
 const parsed=cells(line);
 return !!parsed&&parsed.length===count&&parsed.every(v=>/^:?-{3,}:?$/.test(v));
}
function tableAt(lines,i){
 const heads=cells(lines[i]||"");
 if(!heads||heads.length<2||heads.length>8)return null;
 let divider=i+1;
 while(divider<lines.length&&!lines[divider].trim())divider++;
 if(!separator(lines[divider]||"",heads.length))return null;
 const rows=[];let j=divider+1;
 while(j<lines.length&&rows.length<30){
  if(!lines[j].trim()){j++;continue;}
  if(!lines[j].trim().startsWith("|"))break;
  const row=cells(lines[j]);
  if(!row||row.length!==heads.length)break;
  rows.push(row);j++;
 }
 const head='<thead><tr>'+heads.map(v=>'<th scope="col">'+inline(v)+'</th>').join("")+'</tr></thead>';
 const body='<tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+inline(v)+'</td>').join("")+'</tr>').join("")+'</tbody>';
 return {end:j,html:'<div class="copilot-table-scroll" role="region" aria-label="Business results table" tabindex="0"><table class="copilot-result-table">'+head+body+'</table></div>'};
}
export function safeCopilotMarkdown(value){
 // Some providers escape Markdown emphasis and line breaks inside plain-text completions.
 // Normalize only these predictable artifacts before safe HTML escaping.
 value=String(value??"").replace(/\\([*#\`])/g,"$1").replace(/\\\n/g,"\n").replace(/\\n/g,"\n");
 const lines=String(value??"").slice(0,3800).replace(/\\\n/g,"\n").replace(/\r\n?/g,"\n").split("\n");
 const out=[];let list=null;
 function close(){if(list){out.push("</"+list+">");list=null;}}
 for(let i=0;i<lines.length;i++){
  const tab=tableAt(lines,i);
  if(tab){close();out.push(tab.html);i=tab.end-1;continue;}
  const raw=lines[i];
  const line=raw.trim();
  if(!line){close();continue;}
  const header=line.match(/^(#{1,3})\s+(.+)$/);
  if(header){close();const level=Math.min(4,header[1].length+2);out.push("<h"+level+">"+inline(header[2])+"</h"+level+">");continue;}
  const bullet=line.match(/^[-*•]\s+(.+)$/);
  const ordered=line.match(/^\d{1,2}[.)]\s+(.+)$/);
  if(bullet||ordered){const type=bullet?"ul":"ol";if(list!==type){close();out.push("<"+type+">");list=type;}out.push("<li>"+inline((bullet||ordered)[1])+"</li>");continue;}
  close();out.push("<p>"+inline(line)+"</p>");
 }
 close();return out.join("");
}
