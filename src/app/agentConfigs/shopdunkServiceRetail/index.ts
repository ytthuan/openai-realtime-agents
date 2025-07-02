import { authenticationAgent } from './authentication';
import { salesAgent } from './sales';
import { returnsAgent } from './returns';
import { supportAgent } from './support';

// Cast to `any` to satisfy TypeScript until the core types make RealtimeAgent
// assignable to `Agent<unknown>` (current library versions are invariant on
// the context type).
(authenticationAgent.handoffs as any).push(salesAgent, returnsAgent, supportAgent);
(salesAgent.handoffs as any).push(authenticationAgent, returnsAgent, supportAgent);
(returnsAgent.handoffs as any).push(authenticationAgent, salesAgent, supportAgent);
(supportAgent.handoffs as any).push(authenticationAgent, salesAgent, returnsAgent);

export const shopdunkServiceRetailScenario = [
  authenticationAgent,
  salesAgent,
  returnsAgent,
  supportAgent,
];

// Name of the company represented by this agent set. Used by guardrails
export const shopdunkServiceRetailCompanyName = 'ShopDunk'; 