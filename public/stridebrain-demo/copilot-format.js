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
export function safeCopilotMarkdown(value){
 const lines=String(value??"").slice(0,3800).replace(/\\\n/g,"\n").replace(/\r\n?/g,"\n").split("\n");
 const out=[];let list=null;
 function close(){if(list){out.push("</"+list+">");list=null;}}
 for(const raw of lines){
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
