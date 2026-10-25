/** Compatibility surface for existing imports. New teammates share agent-runtime.js. */
export {AGENT_DEFINITIONS,listAgents,defaultAiTeamState,normaliseAiTeamState,selectAgent,runAgent,activeAgentRun,recordModelAgentPlan,approveAndExecuteAgentAction} from "./agent-runtime.js";
import {runAgent,activeAgentRun} from "./agent-runtime.js";
export function runOperationsAssistant(state,model){return runAgent(state,model,"operations-assistant").run;}
export function activeOperationsRun(state){return activeAgentRun(state,"operations-assistant");}
