import Vapi from "@vapi-ai/web";

// Fast refresh re-evaluates this module on every edit, and StrictMode mounts
// effects twice. Both create extra Vapi (and therefore Daily/Krisp) instances,
// so cache the client on globalThis and hand back the same one.
const globalForVapi = globalThis as unknown as { vapi?: Vapi };

export const vapi =
  globalForVapi.vapi ?? new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);

if (process.env.NODE_ENV !== "production") globalForVapi.vapi = vapi;
