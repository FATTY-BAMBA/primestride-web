// Match the repository's Next.js JSON import behavior for isolated Node runner tests.
import {readFile} from 'node:fs/promises';
export async function load(url,context,nextLoad){
 if(url.startsWith('file:')&&url.endsWith('.json'))return {format:'module',source:'export default '+await readFile(new URL(url),'utf8')+';',shortCircuit:true};
 return nextLoad(url,context);
}
