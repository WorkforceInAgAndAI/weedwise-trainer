import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (e) {
  console.error("RENDER ERROR:", e);
  document.getElementById("root")!.innerHTML = `<pre style="color:red;padding:2rem">${e}</pre>`;
}
