import Vapi from "@vapi-ai/web";
const globalForVapi = globalThis as unknown as { vapi?: Vapi };

export const vapi =
  globalForVapi.vapi ?? new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);

if (process.env.NODE_ENV !== "production") globalForVapi.vapi = vapi;
