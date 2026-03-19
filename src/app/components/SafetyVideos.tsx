import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Play,
  List,
  CloudRain,
  Eye,
  ArrowLeft,
  Maximize,
  CheckCircle,
  Printer,
} from "lucide-react";
import { StickyFooter, FooterButton } from "./StickyFooter";
import { Header } from "./Header";
import { useLanguage } from "./LanguageContext";

const roles = ["DRILLER", "FLOORMAN 1", "FLOORMAN 2", "PIT HAND", "DERRICKMAN"] as const;

type Role = (typeof roles)[number];

interface VideoData {
  title: string;
  description: string;
  duration: string;
}

const videoData: Record<Role, VideoData> = {
  "DRILLER": {
    title: "Driller — Daily Safety Briefing",
    description: "Covers rig floor hazard awareness, BOP procedures, hook load limits, and emergency protocols specific to the Driller role.",
    duration: "4:32",
  },
  "FLOORMAN 1": {
    title: "Floorman 1 — Rig Floor Connection Safety",
    description: "Covers tong operation, rotary table awareness, pipe handling techniques, and V-door safety procedures.",
    duration: "3:48",
  },
  "FLOORMAN 2": {
    title: "Floorman 2 — Iron Roughneck & Dropped Object Prevention",
    description: "Covers iron roughneck alignment, spinning chain inspection, dropped object reporting, and drill line procedures.",
    duration: "4:15",
  },
  "PIT HAND": {
    title: "Pit Hand — Mud System Monitoring & Chemical Safety",
    description: "Covers pit level monitoring, shaker screen inspection, chemical handling protocols, and trip tank operation.",
    duration: "5:02",
  },
  "DERRICKMAN": {
    title: "Derrickman — Derrick Safety & Tripping Operations",
    description: "Covers elevator and bail inspection, monkey board safety, racking board procedures, and escape line protocols.",
    duration: "4:47",
  },
};

export function SafetyVideos() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Role>("DRILLER");
  const [watchedVideos, setWatchedVideos] = useState<Set<Role>>(new Set());

  // Check if a video has been watched
  const getStatusLabel = (role: Role) => {
    if (watchedVideos.has(role)) {
      return { text: t("videos.watched"), color: "var(--color-positive)" };
    }
    return { text: t("videos.notWatched"), color: "var(--text-not-reviewed)" };
  };

  // Check if all videos have been watched
  const allVideosWatched = roles.every((role) => watchedVideos.has(role));

  const currentVideo = videoData[activeTab];

  return (
    <div
      className="flex flex-col h-screen w-screen"
      style={{ backgroundColor: "var(--bg-page)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <Header breadcrumb={t("header.safetyBriefingDashboard")} />

      {/* Context bar */}
      <div
        className="flex items-center gap-2 px-6 shrink-0 flex-wrap"
        style={{
          backgroundColor: "var(--bg-context-bar)",
          borderBottom: "var(--border-default)",
          padding: "10px 24px",
          minHeight: 42,
        }}
      >
        <Chip text="RIG 145" />
        <Chip text="MIDLAND, TX" />
        <span
          className="flex items-center gap-1.5"
          style={{
            backgroundColor: "rgba(255,218,138,0.08)",
            border: "1px solid rgba(255,218,138,0.2)",
            borderRadius: 4,
            padding: "3px 10px",
            color: "var(--text-warning)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <CloudRain size={12} />
          {t("briefing.lightRainWeather")}
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{
            backgroundColor: "rgba(255,218,138,0.08)",
            border: "1px solid rgba(255,218,138,0.2)",
            borderRadius: 4,
            padding: "3px 10px",
            color: "var(--text-warning)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <Eye size={12} />
          {t("briefing.visibility")}
        </span>
        <div className="flex-1" />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left role navigation panel */}
        <div
          style={{
            width: 200,
            backgroundColor: "var(--bg-sidebar)",
            borderRight: "var(--border-sidebar)",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "var(--border-default)",
            }}
          >
            <span
              style={{
                color: "var(--text-tertiary)",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {t("briefing.roles")}
            </span>
          </div>

          {/* Role list */}
          <div>
            {roles.map((role) => {
              const isActive = activeTab === role;
              const statusInfo = getStatusLabel(role);
              return (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className="w-full cursor-pointer"
                  style={{
                    height: 48,
                    padding: "0 16px",
                    borderLeft: `3px solid ${isActive ? "var(--color-brand)" : "transparent"}`,
                    backgroundColor: isActive ? "var(--bg-active)" : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    textAlign: "left",
                    border: "none",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-card)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    style={{
                      color: isActive ? "var(--text-role-active)" : "var(--text-role-inactive)",
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      textTransform: "uppercase",
                    }}
                  >
                    {role}
                  </span>
                  <span
                    style={{
                      color: statusInfo.color,
                      fontSize: 12,
                      fontWeight: 400,
                      marginTop: 2,
                    }}
                  >
                    {statusInfo.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main video area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1" style={{ padding: "20px 24px", display: "flex", flexDirection: "column" }}>
            {/* Safety Videos panel */}
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                borderRadius: 8,
                overflow: "hidden",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between"
                style={{ padding: "12px 16px", flexShrink: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Play size={14} style={{ color: "var(--color-info)" }} />
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("videos.title")}
                  </span>
                </div>
                <button
                  className="cursor-pointer flex items-center justify-center"
                  title="Playlist"
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: "var(--bg-button-secondary)",
                    border: "var(--border-chip)",
                    borderRadius: 6,
                    color: "var(--text-secondary)",
                  }}
                >
                  <List size={13} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "0 16px 24px 16px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                {/* Role context */}
                <div
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontSize: 14,
                    marginBottom: 12,
                    flexShrink: 0,
                  }}
                >
                  {t("videos.nowWatching")}: {activeTab}
                </div>

                {/* Video player block */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    flex: 1,
                    minHeight: 0,
                    position: "relative",
                    backgroundColor: "var(--bg-page)",
                    border: "var(--border-default)",
                    borderRadius: "var(--border-radius-lg)",
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: 0,
                      display: "block",
                      border: "none",
                    }}
                    src="https://www.youtube.com/embed/FBI7v-cHuKg"
                    title="Driller Safety Briefing"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video info */}
                <div style={{ marginTop: 16, flexShrink: 0 }}>
                  <div
                    style={{
                      color: "var(--color-text-primary)",
                      fontWeight: 700,
                      fontSize: 16,
                      marginBottom: 6,
                    }}
                  >
                    {currentVideo.title}
                  </div>
                  <div
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {currentVideo.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter justify="between">
        <FooterButton
          label={t("briefing.back")}
          icon={<ArrowLeft size={14} />}
          onClick={() => navigate("/briefing")}
        />
        <FooterButton
          label="COMPLETED"
          icon={<CheckCircle size={14} />}
          variant="primary"
          disabled={!allVideosWatched}
        />
      </StickyFooter>
    </div>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span
      style={{
        backgroundColor: "var(--bg-chip)",
        border: "var(--border-chip)",
        color: "var(--text-secondary)",
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 4,
        padding: "3px 10px",
      }}
    >
      {text}
    </span>
  );
}