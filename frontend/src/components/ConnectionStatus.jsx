import { useEffect, useState } from "react";
import { getRuntimeConnectionStatus } from "../services/api";

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "#f8fafc",
  color: "#0f172a",
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
};

const dot = (ok) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: ok ? "#16a34a" : "#dc2626",
});

const ConnectionStatus = () => {
  const [status, setStatus] = useState({
    apiConnected: false,
    apiPort: "-",
    videoConnected: false,
    videoPort: "-",
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const current = await getRuntimeConnectionStatus();
      if (!mounted) return;
      setStatus({
        apiConnected: current.apiConnected,
        apiPort: current.apiPort || "-",
        videoConnected: current.videoConnected,
        videoPort: current.videoPort || "-",
      });
    };

    load();
    const timer = setInterval(load, 12000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}
    >
      <div style={badgeStyle} title="Runtime service connection status">
        <span style={dot(status.apiConnected)} />
        <span>API:{status.apiPort}</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={dot(status.videoConnected)} />
        <span>Video:{status.videoPort}</span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
