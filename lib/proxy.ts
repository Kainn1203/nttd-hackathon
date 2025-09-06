"use server";

// Enable corporate proxy for server-side fetch if env vars are set.
// This affects undici (Node's fetch) globally and is a no-op if not set.
try {
  const url = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (url) {
    const { ProxyAgent, setGlobalDispatcher } = await import("undici");
    setGlobalDispatcher(new ProxyAgent(url));
  }
} catch (_) {
  // ignore if undici is unavailable or runtime is edge
}

