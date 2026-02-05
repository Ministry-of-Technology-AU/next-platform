// Using globalThis to persist clients across hot reloads and module boundaries in Next.js
declare global {
  var sseClients: { send: (data: string) => void }[] | undefined;
}

// Initialize the global clients array if it doesn't exist
if (!globalThis.sseClients) {
  globalThis.sseClients = [];
}

const clients = globalThis.sseClients;

export function registerClient(send: (data: string) => void) {
  clients.push({ send });
  console.log("👥 Connected clients:", clients.length);
}

export function removeClient(send: (data: string) => void) {
  const i = clients.findIndex((c) => c.send === send);
  if (i !== -1) clients.splice(i, 1);
  console.log("👋 Clients left:", clients.length);
}

export function broadcast(data: any) {
  const msg = typeof data === "string" ? data : JSON.stringify(data);
  console.log(`📡 Broadcasting to ${clients.length} clients`);
  for (const c of clients) {
    try {
      c.send(msg);
    } catch (err) {
      console.error("Failed to send to client:", err);
    }
  }
}
