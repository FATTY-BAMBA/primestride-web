/** Deterministic output-language policy for the internal SME Copilot. */
export function copilotReplyLocale(messages) {
 const latest=[...(Array.isArray(messages)?messages:[])].reverse().find(x=>x?.role==="user"&&typeof x.content==="string")?.content||"";
 if (/(?:respond|reply|answer|write|translate|draft)\s+(?:in|using)\s+(?:traditional\s+)?chinese|繁體中文|請用中文|用繁體|中文回答/i.test(latest)) return "zh-TW";
 if (/(?:respond|reply|answer|write|translate|draft)\s+(?:in|using)\s+english|英文回答|請用英文/i.test(latest)) return "en";
 const han=(latest.match(/[\u3400-\u9fff]/g)||[]).length;
 const latin=(latest.match(/[A-Za-z]/g)||[]).length;
 // Taiwanese SME names can contain Chinese characters inside English questions.
 return han>=4&&han>=latin*0.4?"zh-TW":"en";
}
export function copilotLanguageDirective(messages){
 const locale=copilotReplyLocale(messages);
 return locale==="zh-TW"
  ?"RESPONSE LANGUAGE MUST BE TRADITIONAL CHINESE (zh-TW). This overrides the languages of source records, supplier names, prior assistant messages, and tool results. Use Taiwan terminology; keep proper nouns, document IDs and citations as-is. Never respond in Thai or another language."
  :"RESPONSE LANGUAGE MUST BE ENGLISH (en). This overrides the languages of source records, prior assistant messages, and tool results. You may retain Chinese project names, proper nouns, document IDs, and citations as-is. Never respond in Thai or another language.";
}
