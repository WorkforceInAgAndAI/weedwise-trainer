import "./index.css";

const root = document.getElementById("root")!;

function showFatalError(msg: string) {
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:2rem;background:#0a0a0a;color:#e5e5e5">
      <div style="max-width:480px;text-align:center">
        <h1 style="font-size:1.5rem;margin-bottom:1rem">⚠️ App failed to start</h1>
        <p style="color:#a3a3a3;margin-bottom:1.5rem;font-size:0.875rem">${msg}</p>
        <button onclick="location.reload()" style="padding:0.5rem 1.5rem;border-radius:0.5rem;background:#22c55e;color:#fff;border:none;cursor:pointer;font-weight:600">
          Reload
        </button>
      </div>
    </div>`;
}

async function boot() {
  try {
    // These dynamic imports will trigger supabase client init.
    // If env vars are missing, createClient throws before React mounts.
    const [{ createRoot }, { default: App }, { logger }] = await Promise.all([
      import("react-dom/client"),
      import("./App.tsx"),
      import("./lib/logger"),
    ]);
    logger.devDebug("app mounting");
    createRoot(root).render(<App />);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const { logger } = await import("./lib/logger");
    logger.error("fatal boot error", err);

    if (message.includes("supabaseUrl is required") || message.includes("supabaseKey is required")) {
      showFatalError(
        "Backend configuration is temporarily unavailable. This usually resolves on its own — please reload in a few seconds."
      );
    } else {
      showFatalError(message);
    }
  }
}

boot();
