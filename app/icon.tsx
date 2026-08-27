import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            background: "#00FF88",
            boxShadow: "0 0 24px #00FF88",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
