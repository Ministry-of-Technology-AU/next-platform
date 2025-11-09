const clients: { send: (data: string) => void }[] = [];

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
  for (const c of clients) c.send(msg);
  console.log(`📡 Broadcasted to ${clients.length} clients:`, msg);
}
