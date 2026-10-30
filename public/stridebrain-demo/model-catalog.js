/**
 * StrideBrain internal-preview model catalog.
 * Same published model allowlist is imported by both server and browser.
 *
 * Models are explicitly supported for tool/function calling in the linked
 * provider documentation, checked 2026-10-19. Model and provider availability,
 * prices and privacy terms may change. Future authenticated company accounts
 * will receive per-tenant entitlement/budget policy rather than this list.
 */
export const MODEL_CATALOG=Object.freeze([
 Object.freeze({
  id:"anthropic/claude-sonnet-5.5",label:"Claude Sonnet 5.5",
  maker:"Anthropic",provider:"openrouter",purpose:"Everyday balance",
  description:"Polished business conversations and everyday operations",
  tier:"balanced",source:"https://openrouter.ai/anthropic/claude-sonnet-5.5"
 }),
 Object.freeze({
  id:"openai/gpt-6-sol",label:"GPT-6 Sol",
  maker:"OpenAI",provider:"openrouter",purpose:"Complex analysis",
  description:"Structured problem-solving and multi-step business questions",
  tier:"advanced",source:"https://openrouter.ai/openai/gpt-6-sol"
 }),
 Object.freeze({
  id:"google/gemini-3.1-pro-preview-customtools",label:"Gemini 3.1 Pro",
  maker:"Google",provider:"openrouter",purpose:"Detailed reasoning",
  description:"Large-context tasks and multi-tool analysis (preview)",
  tier:"advanced",source:"https://openrouter.ai/google/gemini-3.1-pro-preview-customtools"
 }),
 Object.freeze({
  id:"deepseek/deepseek-v4.1-flash",label:"DeepSeek V4.1 Flash",
  maker:"DeepSeek",provider:"openrouter",purpose:"Efficient answers",
  description:"Cost-conscious tool-based conversations",
  tier:"economy",source:"https://openrouter.ai/deepseek/deepseek-v4.1-flash"
 }),
 Object.freeze({
  id:"openai-direct/gpt-5.6",label:"GPT-5.6 · Direct",
  maker:"OpenAI",provider:"openai",purpose:"Direct API",
  description:"Use a directly connected OpenAI API project",
  tier:"advanced",source:"https://platform.openai.com/docs/api-reference/responses"
 })
]);
export const DEFAULT_MODEL_ID="anthropic/claude-sonnet-5.5";
export function findAllowedModel(id){return MODEL_CATALOG.find(item=>item.id===id)||null;}
export function isModelAllowed(id,envAllowed=""){
 const model=findAllowedModel(id);
 if(!model)return false;
 if(typeof envAllowed!=="string"||!envAllowed.trim())return true;
 const allowlist=envAllowed.split(",").map(v=>v.trim()).filter(Boolean);
 return allowlist.includes(model.id);
}
export function visibleModels(){return MODEL_CATALOG.map(({id,label,maker,provider,purpose,description,tier})=>({id,label,maker,provider,purpose,description,tier}));}
