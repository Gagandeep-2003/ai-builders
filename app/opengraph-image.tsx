import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const alt = "AI Builders Academy live AI courses for students";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 18% 20%, rgba(110,231,183,0.26), transparent 34%), radial-gradient(circle at 84% 80%, rgba(245,158,11,0.2), transparent 32%), #080a0f",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "64px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "stretch",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "28px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "54px",
            width: "100%",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: "18px" }}>
            <div
              style={{
                alignItems: "center",
                background: "rgba(110,231,183,0.12)",
                border: "1px solid rgba(110,231,183,0.5)",
                borderRadius: "14px",
                color: "#6ee7b7",
                display: "flex",
                fontSize: "28px",
                fontWeight: 800,
                height: "64px",
                justifyContent: "center",
                width: "64px",
              }}
            >
              AI
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "30px", fontWeight: 800 }}>{siteName}</span>
              <span style={{ color: "#9aa3b5", fontSize: "18px" }}>LIVE LEARNING PROGRAM</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "920px" }}>
            <div style={{ color: "#6ee7b7", fontSize: "20px", fontWeight: 700 }}>
              AI LITERACY · APP BUILDING · AUTOMATION
            </div>
            <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1.06 }}>
              Live AI courses built for students.
            </div>
            <div style={{ color: "#c1c7d3", fontSize: "28px" }}>
              3 modules · 24 live sessions · Project-based learning
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
