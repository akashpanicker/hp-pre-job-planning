import { useState, useEffect } from "react";
import { Printer, Check, Play } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchVideos: () => void;
}

const roleNames = [
  "Driller",
  "Floorman 1",
  "Floorman 2",
  "Pit Hand",
  "Derrickman",
];

export function PrintModal({ isOpen, onClose, onWatchVideos }: PrintModalProps) {
  const { t } = useLanguage();
  const [stage, setStage] = useState<"printing" | "complete">("printing");
  const [progress, setProgress] = useState(0);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStage("printing");
      setProgress(0);
      setCurrentRoleIndex(0);
      return;
    }

    // Progress bar animation (0 to 100 over 2.5 seconds)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (2500 / 50)); // Update every 50ms
      });
    }, 50);

    // Cycling role messages (every 0.6 seconds)
    const roleInterval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roleNames.length);
    }, 600);

    // Transition to complete stage after 2.5 seconds
    const stageTimeout = setTimeout(() => {
      setStage("complete");
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(roleInterval);
      clearTimeout(stageTimeout);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-surface-2)",
          border: "var(--border-default)",
          borderRadius: "var(--border-radius-lg)",
          padding: "40px 48px",
          width: 440,
          boxShadow: "var(--shadow-dropdown)",
          position: "relative",
        }}
      >
        {stage === "printing" ? (
          <PrintingStage
            progress={progress}
            currentRole={roleNames[currentRoleIndex]}
            t={t}
          />
        ) : (
          <CompleteStage
            onClose={onClose}
            onWatchVideos={onWatchVideos}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

function PrintingStage({
  progress,
  currentRole,
  t,
}: {
  progress: number;
  currentRole: string;
  t: (key: string) => string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      {/* Animated printer icon */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginBottom: 20,
        }}
      >
        <Printer
          size={52}
          style={{
            color: "var(--color-brand)",
          }}
        />
        {/* Animated paper sliding out */}
        <div
          style={{
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 30,
            height: 20,
            backgroundColor: "var(--color-text-primary)",
            borderRadius: 2,
            animation: "paperSlide 1.2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          color: "var(--color-text-primary)",
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        {t("print.printing")}
      </div>

      {/* Subtitle */}
      <div
        style={{
          color: "var(--color-text-tertiary)",
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        {t("print.preparing")}
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 6,
          backgroundColor: "var(--color-surface-1)",
          borderRadius: "var(--border-radius-sm)",
          overflow: "hidden",
          position: "relative",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "var(--color-brand)",
            transition: "width 0.05s linear",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shimmer effect */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, transparent, var(--color-brand-hover), transparent)",
              animation: "shimmer 1s infinite",
            }}
          />
        </div>
      </div>

      {/* Cycling status message */}
      <div
        style={{
          color: "var(--color-info)",
          fontSize: 14,
          minHeight: 21,
          animation: "fadeInOut 0.6s ease-in-out infinite",
        }}
      >
        {t(`print.role.${currentRole.toLowerCase().replace(" ", "")}`)}
      </div>

      <style>{`
        @keyframes paperSlide {
          0%, 100% { transform: translate(-50%, 0); opacity: 0; }
          50% { transform: translate(-50%, 12px); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function CompleteStage({
  onClose,
  onWatchVideos,
  t,
}: {
  onClose: () => void;
  onWatchVideos: () => void;
  t: (key: string) => string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      {/* Success icon */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 52,
          height: 52,
          borderRadius: "50%",
          backgroundColor: "rgba(78,209,153,0.15)",
          border: "2px solid var(--color-success)",
          marginBottom: 20,
          animation: "scaleIn 0.3s ease-out",
        }}
      >
        <Check size={28} style={{ color: "var(--color-success)" }} />
      </div>

      {/* Title */}
      <div
        style={{
          color: "var(--color-text-primary)",
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        {t("print.complete")}
      </div>

      {/* Message */}
      <div
        style={{
          color: "var(--color-text-secondary)",
          fontSize: 14,
          lineHeight: 1.6,
          maxWidth: 320,
          margin: "0 auto 28px",
        }}
      >
        {t("print.message")}
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "var(--border-default)",
          marginBottom: 20,
        }}
      />

      {/* Label */}
      <div
        style={{
          color: "var(--color-text-tertiary)",
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        {t("print.reinforceLabel")}
      </div>

      {/* Watch Videos button */}
      <button
        onClick={onWatchVideos}
        style={{
          width: "100%",
          height: 44,
          backgroundColor: "var(--color-brand)",
          color: "var(--text-on-primary)",
          fontWeight: 700,
          fontSize: 14,
          borderRadius: "var(--border-radius-md)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-brand-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-brand)")
        }
      >
        <Play size={14} />
        {t("print.watchVideos")}
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          width: "100%",
          height: 44,
          backgroundColor: "var(--color-surface-4)",
          border: "var(--border-default)",
          color: "var(--color-text-secondary)",
          fontWeight: 600,
          fontSize: 14,
          borderRadius: "var(--border-radius-md)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-surface-5)";
          e.currentTarget.style.color = "var(--color-text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-surface-4)";
          e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
      >
        {t("print.close")}
      </button>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}