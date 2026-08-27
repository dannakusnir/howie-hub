import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Howie Zales, Operator Mindset";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#050505",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* HUD corners */}
        <div style={{ position: "absolute", top: 32, left: 32, display: "flex", width: 44, height: 44, borderTop: "2px solid #00FF88", borderLeft: "2px solid #00FF88" }} />
        <div style={{ position: "absolute", top: 32, right: 32, display: "flex", width: 44, height: 44, borderTop: "2px solid #00FF88", borderRight: "2px solid #00FF88" }} />
        <div style={{ position: "absolute", bottom: 32, left: 32, display: "flex", width: 44, height: 44, borderBottom: "2px solid #00FF88", borderLeft: "2px solid #00FF88" }} />
        <div style={{ position: "absolute", bottom: 32, right: 32, display: "flex", width: 44, height: 44, borderBottom: "2px solid #00FF88", borderRight: "2px solid #00FF88" }} />

        {/* REC dot */}
        <div style={{ position: "absolute", top: 60, left: 100, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF3B3B" }} />
          <div style={{ fontSize: 14, letterSpacing: 6, color: "#ffffffaa", textTransform: "uppercase" }}>
            REC · Operator Mindset
          </div>
        </div>

        {/* Timecode */}
        <div style={{ position: "absolute", top: 60, right: 100, display: "flex", alignItems: "center", gap: 10, fontSize: 14, letterSpacing: 4, color: "#00FF88" }}>
          <span style={{ color: "#ffffff66" }}>TC</span>
          <span>25:00:00:00</span>
        </div>

        {/* Kicker */}
        <div style={{ fontSize: 20, color: "#00FF88", letterSpacing: 8, textTransform: "uppercase", marginTop: 40, marginBottom: 60 }}>
          Emmy · Camera Operator · Founder
        </div>

        {/* Main title */}
        <div style={{ display: "flex", flexDirection: "column", fontSize: 148, fontWeight: 900, color: "#fff", lineHeight: 0.9, letterSpacing: -4 }}>
          <span>OPERATOR</span>
          <span style={{ color: "#00FF88" }}>MINDSET.</span>
        </div>

        {/* Bottom */}
        <div style={{ position: "absolute", bottom: 80, left: 100, right: 100, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 16, letterSpacing: 5, color: "#ffffff88", textTransform: "uppercase" }}>
          <span>Howie Zales</span>
          <span>NYC · Est 2001</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
