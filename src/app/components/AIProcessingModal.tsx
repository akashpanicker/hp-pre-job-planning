import { useState, useEffect } from "react";

interface AIProcessingModalProps {
  onComplete: () => void;
}

const statusMessages = [
  "Analyzing weather conditions...",
  "Identifying role-specific hazards...",
  "Generating Driller instructions...",
  "Generating Floorman 1 instructions...",
  "Generating Floorman 2 instructions...",
  "Generating Pit Hand instructions...",
  "Generating Derrickman instructions...",
  "Finalizing briefing report...",
];

export function AIProcessingModal({ onComplete }: AIProcessingModalProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const messageDuration = 750; // Reduced from 1500ms to 750ms per message
    const totalDuration = messageDuration * statusMessages.length;

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (totalDuration / 50));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 50);

    // Message cycling with fade
    const messageInterval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => {
          const next = prev + 1;
          if (next >= statusMessages.length) {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
            setTimeout(() => onComplete(), 300); // Reduced from 500ms to 300ms
            return prev;
          }
          return next;
        });
        setOpacity(1);
      }, 200); // Reduced fade transition from 300ms to 200ms
    }, messageDuration);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "var(--border-default)",
          borderRadius: 12,
          padding: "40px 48px",
          width: 440,
          boxShadow: "var(--shadow-modal)",
        }}
      >
        {/* Spinner */}
        <div className="flex justify-center">
          <div
            className="rounded-full animate-spin"
            style={{
              width: 48,
              height: 48,
              border: "3px solid var(--bg-hover)",
              borderTop: "3px solid var(--color-brand)",
            }}
          />
        </div>

        <div style={{ height: 24 }} />

        {/* Title */}
        <h2
          style={{
            color: "var(--text-primary)",
            fontSize: 16,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Generating Safety Briefing
        </h2>

        <div style={{ height: 8 }} />

        {/* Subtitle */}
        <p
          style={{
            color: "var(--text-tertiary)",
            fontSize: 14,
            fontWeight: 400,
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 340,
            margin: "0 auto",
          }}
        >
          AI is analyzing site conditions and generating role-specific safety instructions for your
          crew.
        </p>

        <div style={{ height: 28 }} />

        {/* Status message */}
        <div
          style={{
            color: "var(--color-info)",
            fontSize: 14,
            fontWeight: 500,
            textAlign: "center",
            minHeight: 20,
            opacity: opacity,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          {statusMessages[currentMessageIndex]}
        </div>

        <div style={{ height: 28 }} />

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            backgroundColor: "var(--bg-page)",
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: "var(--color-brand)",
              borderRadius: 4,
              transition: "width 0.05s linear",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(94, 127, 200, 0.5), transparent)",
                animation: "shimmer 2s infinite",
              }}
            />
          </div>
        </div>

        <div style={{ height: 16 }} />

        {/* Progress percentage */}
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            fontWeight: 400,
            textAlign: "right",
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}