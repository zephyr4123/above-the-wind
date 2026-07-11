import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/archive.css"; // UI infra: --archive-* token 单一真相源
import "./index.css";
import App from "./App.tsx";
import Chronicle from "./Chronicle.tsx";

// 极简 hash 视图切换(不引 router):#chronicle → 编年记录仪,否则观测仪。
// 观测仪 Timeline 的「进入编年史 →」= a[href="#chronicle"],零改动即入口。
function Root() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash === "#chronicle" ? <Chronicle /> : <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
