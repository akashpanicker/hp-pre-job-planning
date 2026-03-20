import React from "react";

type VuiState = "idle" | "listening" | "processing";

interface VoiceInputModalProps {
  state?: VuiState;
  onClose: () => void;
}

/* ── Microphone SVG ─────────────────────────────────────────── */
function MicIcon({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="11" rx="3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10a7 7 0 0 0 14 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9" y1="21" x2="15" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ── Waveform bars (static) ─────────────────────────────────── */
const BAR_HEIGHTS = [8, 20, 14, 28, 10, 24, 16, 28, 12, 20, 8, 16];

function WaveformVisualizer() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 32 }}>
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 2,
            backgroundColor: "var(--color-brand)",
          }}
        />
      ))}
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────────────── */
function Spinner() {
  return (
    <>
      <style>{`
        @keyframes vui-spin { to { transform: rotate(360deg); } }
        @keyframes vui-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.7; } }
        @keyframes vui-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: "3px solid var(--border-default)",
          borderTop: "3px solid var(--color-brand)",
          animation: "vui-spin 1s linear infinite",
        }}
      />
    </>
  );
}

/* ── STATE 1 — IDLE ─────────────────────────────────────────── */
function IdleState({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Mic icon circle */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "var(--bg-hover)",
            border: "var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MicIcon size={28} color="var(--text-tertiary)" />
        </div>
      </div>

      <div style={{ height: 20 }} />

      <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18, textAlign: "center", margin: 0 }}>
        Voice Input
      </p>

      <div style={{ height: 8 }} />

      <p style={{ color: "var(--text-tertiary)", fontSize: 14, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
        Click the microphone and speak to auto-fill the site conditions form.
      </p>

      <div style={{ height: 28 }} />

      {/* Start Listening button */}
      <button
        type="button"
        style={{
          width: "100%",
          height: 44,
          borderRadius: "var(--border-radius-md)",
          backgroundColor: "var(--color-brand)",
          border: "none",
          color: "var(--text-on-primary)",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand)")}
      >
        <MicIcon size={16} color="var(--text-on-primary)" />
        Start Listening
      </button>

      <div style={{ height: 12 }} />

      {/* Cancel button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          width: "100%",
          height: 44,
          borderRadius: "var(--border-radius-md)",
          backgroundColor: "var(--bg-button-secondary)",
          border: "var(--border-default)",
          color: "var(--text-secondary)",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-button-secondary)")}
      >
        Cancel
      </button>
    </>
  );
}

/* ── STATE 2 — LISTENING ────────────────────────────────────── */
function ListeningState({ onClose }: { onClose: () => void }) {
  return (
    <>
      <style>{`
        @keyframes vui-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>

      {/* Animated mic icon with pulse ring */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", height: 80 }}>
        {/* Outer pulse ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "rgba(43, 85, 151, 0.08)",
            border: "1px solid rgba(43, 85, 151, 0.2)",
            animation: "vui-pulse 1.5s ease-in-out infinite",
          }}
        />
        {/* Inner mic circle */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "rgba(43, 85, 151, 0.15)",
            border: "var(--border-active)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MicIcon size={28} color="var(--color-brand)" />
        </div>
      </div>

      <div style={{ height: 20 }} />

      <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18, textAlign: "center", margin: 0 }}>
        Listening...
      </p>

      <div style={{ height: 8 }} />

      {/* Live transcript area */}
      <div
        style={{
          backgroundColor: "var(--bg-input)",
          border: "var(--border-input)",
          borderRadius: "var(--border-radius-md)",
          padding: "12px 16px",
          minHeight: 72,
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 14, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
          Your speech will appear here...
        </p>
      </div>

      <div style={{ height: 20 }} />

      {/* Waveform visualizer */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <WaveformVisualizer />
      </div>

      <div style={{ height: 20 }} />

      {/* Stop & Fill Form button */}
      <button
        type="button"
        style={{
          width: "100%",
          height: 44,
          borderRadius: "var(--border-radius-md)",
          backgroundColor: "var(--bg-button-secondary)",
          border: "var(--border-default)",
          color: "var(--text-secondary)",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-button-secondary)")}
      >
        Stop &amp; Fill Form
      </button>

      <div style={{ height: 12 }} />

      {/* Cancel text link */}
      <p
        onClick={onClose}
        style={{
          color: "var(--text-muted)",
          fontSize: 14,
          textAlign: "center",
          cursor: "pointer",
          margin: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
      >
        Cancel
      </p>
    </>
  );
}

/* ── STATE 3 — PROCESSING ───────────────────────────────────── */
function ProcessingState() {
  return (
    <>
      <style>{`
        @keyframes vui-spin { to { transform: rotate(360deg); } }
        @keyframes vui-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Spinner */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Spinner />
      </div>

      <div style={{ height: 20 }} />

      <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18, textAlign: "center", margin: 0 }}>
        Processing speech...
      </p>

      <div style={{ height: 8 }} />

      <p style={{ color: "var(--text-tertiary)", fontSize: 14, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
        Matching your speech to the form fields.
      </p>

      <div style={{ height: 28 }} />

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 6,
          backgroundColor: "var(--bg-input)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "60%",
            height: "100%",
            borderRadius: 4,
            background: "linear-gradient(90deg, var(--color-brand) 25%, rgba(43,85,151,0.5) 50%, var(--color-brand) 75%)",
            backgroundSize: "200% 100%",
            animation: "vui-shimmer 1.5s linear infinite",
          }}
        />
      </div>
    </>
  );
}

/* ── MAIN MODAL COMPONENT ───────────────────────────────────── */
export function VoiceInputModal({ state = "idle", onClose }: VoiceInputModalProps) {
  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--bg-card)",
          border: "var(--border-card)",
          borderRadius: "var(--border-radius-xl)",
          padding: "40px 48px",
          width: 480,
          maxWidth: "calc(100vw - 48px)",
          boxShadow: "var(--shadow-modal)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {state === "idle" && <IdleState onClose={onClose} />}
        {state === "listening" && <ListeningState onClose={onClose} />}
        {state === "processing" && <ProcessingState />}
      </div>
    </div>
  );
}
