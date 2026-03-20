import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  RefreshCw,
  CloudRain,
  Printer,
  ClipboardCheck,
  Eye,
  Check,
  ArrowLeft,
  X,
} from "lucide-react";
import { StickyFooter, FooterButton } from "./StickyFooter";
import { Header } from "./Header";
import { useLanguage } from "./LanguageContext";
import { PrintModal } from "./PrintModal";

const roles = ["DRILLER", "FLOORMAN 1", "FLOORMAN 2", "PIT HAND", "DERRICKMAN"] as const;

type Role = (typeof roles)[number];

interface CheckItem {
  text: string;
  checked: boolean;
  isCustom?: boolean;
}

interface Section {
  label: string;
  icon: React.ReactNode;
  items: CheckItem[];
}

const drillerSections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Confirm BOP test completed before spudding operations", checked: false },
      { text: "Verify weight indicator and deadline anchor are calibrated", checked: false },
      { text: "Monitor hook load limits — do not exceed rated capacity", checked: false },
      { text: "Confirm top drive torque settings for today's pipe size", checked: false },
      { text: "Check driller's console emergency stop is functional", checked: false },
    ],
  },
];

const floorman1Sections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Inspect all tongs and dies before making connections", checked: false },
      { text: "Confirm stabbing board is secured before running casing", checked: false },
      { text: "Wear cut-resistant gloves during all pipe handling", checked: false },
      { text: "Verify floor safety gates are latched before rotary is engaged", checked: false },
      { text: "Keep clear of the rotary table during drilling operations", checked: false },
      { text: "Check cat line and tugger line for wear before use", checked: false },
    ],
  },
];

const floorman2Sections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Confirm iron roughneck is properly aligned before each connection", checked: false },
      { text: "Inspect spinning chain condition and replace if worn", checked: false },
      { text: "Keep personnel clear of the V-door during pipe pickup", checked: false },
      { text: "Verify all hand tools are secured and inventoried", checked: false },
      { text: "Report any dropped objects immediately to the Driller", checked: false },
      { text: "Confirm drill line slip-and-cut schedule is up to date", checked: false },
    ],
  },
];

const pitHandSections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Check all pit levels and record baseline readings", checked: false },
      { text: "Monitor mud weight and viscosity every 30 minutes", checked: false },
      { text: "Inspect shaker screens for damage before circulating", checked: false },
      { text: "Confirm chemical inventory levels — flag any low stock", checked: false },
      { text: "Verify trip tank is zeroed and functional before tripping", checked: false },
      { text: "Check all agitators and degasser are running correctly", checked: false },
    ],
  },
];

const derrickmanSections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Inspect elevator links and bails before tripping operations", checked: false },
      { text: "Confirm monkey board safety latch is engaged", checked: false },
      { text: "Verify derrick lights are operational for low-visibility conditions", checked: false },
      { text: "Check all racking board fingers are properly positioned", checked: false },
      { text: "Inspect traveling block and crown-o-matic settings", checked: false },
      { text: "Confirm escape line and derrick safety harness are in good condition", checked: false },
    ],
  },
];

// ─── Role card data (color placeholders for images) ───────────────────────────
const ROLE_CARDS: Array<{ role: Role; displayName: string; gradient: string }> = [
  { role: "DRILLER",    displayName: "Driller",     gradient: "linear-gradient(135deg, #0D1F3C 0%, #1A3A6A 100%)" },
  { role: "FLOORMAN 1", displayName: "Floorman",    gradient: "linear-gradient(135deg, #7B3D0A 0%, #C05621 100%)" },
  { role: "FLOORMAN 2", displayName: "Floorman 2",  gradient: "linear-gradient(135deg, #1A3D2B 0%, #2F6A4A 100%)" },
  { role: "PIT HAND",   displayName: "Pit Hand",    gradient: "linear-gradient(135deg, #6B1D1D 0%, #A63232 100%)" },
  { role: "DERRICKMAN", displayName: "Derrickmen",  gradient: "linear-gradient(135deg, #1A2744 0%, #2C4A82 100%)" },
];

interface RoleStatus {
  role: Role;
  status: "reviewed" | "not-reviewed";
}

export function BriefingDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Role>("DRILLER");
  const [sections, setSections] = useState<Section[]>(drillerSections);
  const [addingToSection, setAddingToSection] = useState<number | null>(null);
  const [newInstructionText, setNewInstructionText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Store checklist data for all roles
  const [roleSections, setRoleSections] = useState<Record<Role, Section[]>>({
    "DRILLER":     drillerSections,
    "FLOORMAN 1":  floorman1Sections,
    "FLOORMAN 2":  floorman2Sections,
    "PIT HAND":    pitHandSections,
    "DERRICKMAN":  derrickmanSections,
  });

  useEffect(() => {
    setSections(roleSections[activeTab]);
  }, [activeTab, roleSections]);


  useEffect(() => {
    if (addingToSection !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingToSection]);

  const toggleCheck = (sectionIdx: number, itemIdx: number) => {
    setRoleSections((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((s, si) =>
        si === sectionIdx
          ? { ...s, items: s.items.map((item, ii) => ii === itemIdx ? { ...item, checked: !item.checked } : item) }
          : s
      ),
    }));
  };

  const handleStartAddingInstruction = (sectionIdx: number) => {
    setAddingToSection(sectionIdx);
    setNewInstructionText("");
  };

  const handleCancelAddingInstruction = () => {
    setAddingToSection(null);
    setNewInstructionText("");
  };

  const handleConfirmAddingInstruction = (sectionIdx: number) => {
    if (newInstructionText.trim()) {
      setRoleSections((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((s, si) =>
          si === sectionIdx
            ? { ...s, items: [...s.items, { text: newInstructionText.trim(), checked: true, isCustom: true }] }
            : s
        ),
      }));
      setNewInstructionText("");
      setAddingToSection(null);
    }
  };

  const handleDeleteCustomItem = (sectionIdx: number, itemIdx: number) => {
    setRoleSections((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((s, si) =>
        si === sectionIdx
          ? { ...s, items: s.items.filter((_, ii) => ii !== itemIdx) }
          : s
      ),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, sectionIdx: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirmAddingInstruction(sectionIdx);
    }
  };

  const calculateRoleStatus = (role: Role): "reviewed" | "not-reviewed" => {
    const sects = roleSections[role];
    const allItems = sects.flatMap((s) => s.items);
    return allItems.filter((item) => item.checked).length >= 1 ? "reviewed" : "not-reviewed";
  };

  const roleStatuses: RoleStatus[] = roles.map((role) => ({
    role,
    status: calculateRoleStatus(role),
  }));


  // Translation map for checklist items
  const itemTextMap: Record<string, string> = {
    "Steel-toed boots with slip-resistant soles — mandatory (wet conditions)": t("briefing.ppe1"),
    "Hard hat with chin strap fastened": t("briefing.ppe2"),
    "High-visibility rain gear — required due to precipitation": t("briefing.ppe3"),
    "Non-slip gloves rated for wet environments": t("briefing.ppe4"),
    "Confirm rig floor drainage — no standing water": t("briefing.pre1"),
    "Verify all floor grating secured and anti-slip mats placed": t("briefing.pre2"),
    "Check BOP controls for moisture ingress": t("briefing.pre3"),
    "Confirm wind speed within safe limits for all planned lifts (current: 18 MPH — caution)": t("briefing.pre4"),
    "Review muster point — confirm accessible in current visibility": t("briefing.em1"),
    "Confirm radio channel and backup comms": t("briefing.em2"),
    "Identify nearest sheltered evacuation route": t("briefing.em3"),
    "Confirm BOP test completed before spudding operations": t("briefing.driller1"),
    "Verify weight indicator and deadline anchor are calibrated": t("briefing.driller2"),
    "Monitor hook load limits — do not exceed rated capacity": t("briefing.driller3"),
    "Confirm top drive torque settings for today's pipe size": t("briefing.driller4"),
    "Check driller's console emergency stop is functional": t("briefing.driller5"),
    "Inspect all tongs and dies before making connections": t("briefing.floorman1_1"),
    "Confirm stabbing board is secured before running casing": t("briefing.floorman1_2"),
    "Wear cut-resistant gloves during all pipe handling": t("briefing.floorman1_3"),
    "Verify floor safety gates are latched before rotary is engaged": t("briefing.floorman1_4"),
    "Keep clear of the rotary table during drilling operations": t("briefing.floorman1_5"),
    "Check cat line and tugger line for wear before use": t("briefing.floorman1_6"),
    "Confirm iron roughneck is properly aligned before each connection": t("briefing.floorman2_1"),
    "Inspect spinning chain condition and replace if worn": t("briefing.floorman2_2"),
    "Keep personnel clear of the V-door during pipe pickup": t("briefing.floorman2_3"),
    "Verify all hand tools are secured and inventoried": t("briefing.floorman2_4"),
    "Report any dropped objects immediately to the Driller": t("briefing.floorman2_5"),
    "Confirm drill line slip-and-cut schedule is up to date": t("briefing.floorman2_6"),
    "Check all pit levels and record baseline readings": t("briefing.pithand1"),
    "Monitor mud weight and viscosity every 30 minutes": t("briefing.pithand2"),
    "Inspect shaker screens for damage before circulating": t("briefing.pithand3"),
    "Confirm chemical inventory levels — flag any low stock": t("briefing.pithand4"),
    "Verify trip tank is zeroed and functional before tripping": t("briefing.pithand5"),
    "Check all agitators and degasser are running correctly": t("briefing.pithand6"),
    "Inspect elevator links and bails before tripping operations": t("briefing.derrickman1"),
    "Confirm monkey board safety latch is engaged": t("briefing.derrickman2"),
    "Verify derrick lights are operational for low-visibility conditions": t("briefing.derrickman3"),
    "Check all racking board fingers are properly positioned": t("briefing.derrickman4"),
    "Inspect traveling block and crown-o-matic settings": t("briefing.derrickman5"),
    "Confirm escape line and derrick safety harness are in good condition": t("briefing.derrickman6"),
  };

  // Active role display name
  const activeRoleCard = ROLE_CARDS.find((rc) => rc.role === activeTab);
  const activeRoleDisplayName = activeRoleCard?.displayName.toUpperCase() ?? activeTab;

  return (
    <div
      className="flex flex-col h-screen w-screen"
      style={{ backgroundColor: "var(--bg-page)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <Header breadcrumb={t("header.safetyBriefingDashboard")} />

      {/* Context bar */}
      <div
        className="flex items-center gap-2 flex-wrap"
        style={{
          backgroundColor: "var(--bg-context-bar)",
          borderBottom: "var(--border-default)",
          padding: "10px 24px",
          minHeight: 42,
          flexShrink: 0,
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

      {/* Main content — full width, no sidebar */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "20px 24px" }}>

        {/* ── Horizontal role cards strip ─────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 16,
            paddingBottom: 16,
          }}
        >
          {ROLE_CARDS.map((rc) => {
            const isActive = activeTab === rc.role;
            const roleStatus = roleStatuses.find((rs) => rs.role === rc.role);
            const isReviewed = roleStatus?.status === "reviewed";
            return (
              <div
                key={rc.role}
                onClick={() => setActiveTab(rc.role)}
                style={{
                  flex: 1,
                  height: 90,
                  display: "flex",
                  backgroundColor: "var(--bg-card)",
                  border: isActive
                    ? "2px solid var(--color-brand)"
                    : "var(--border-card)",
                  borderRadius: "var(--border-radius-lg)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-card)";
                }}
              >
                {/* Image placeholder */}
                <div
                  style={{
                    width: 90,
                    height: 90,
                    flexShrink: 0,
                    background: rc.gradient,
                    borderRadius: "var(--border-radius-lg) 0 0 var(--border-radius-lg)",
                  }}
                />
                {/* Text */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 14px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      color: isActive ? "var(--color-brand)" : "var(--text-secondary)",
                      fontWeight: 600,
                      fontSize: 14,
                      fontFamily: "Inter, sans-serif",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {rc.displayName}
                  </span>
                  <span
                    style={{
                      color: isReviewed ? "var(--text-reviewed)" : "var(--text-tertiary)",
                      fontWeight: 400,
                      fontSize: 13,
                      fontFamily: "Inter, sans-serif",
                      marginTop: 2,
                    }}
                  >
                    {isReviewed ? t("briefing.reviewed") : "Info"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── AI Safety Instructions panel ────────────────────────────────── */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "12px 16px" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: "var(--color-info)" }} />
              <span
                style={{
                  color: "var(--text-primary)",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {t("briefing.aiTitle")} — {activeRoleDisplayName}
              </span>
            </div>
            <button
              className="cursor-pointer flex items-center justify-center"
              title="Regenerate"
              style={{
                width: 30,
                height: 30,
                backgroundColor: "var(--bg-button-secondary)",
                border: "var(--border-chip)",
                borderRadius: 6,
                color: "var(--text-secondary)",
              }}
            >
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Checklist content */}
          <div style={{ padding: "0 16px 24px" }}>
            {/* Weather alert banner */}
            <div
              className="flex items-start gap-2"
              style={{
                backgroundColor: "var(--color-error-bg)",
                borderLeft: "3px solid var(--text-alert)",
                borderRadius: "0 4px 4px 0",
                padding: "8px 12px",
                marginBottom: 12,
              }}
            >
              <CloudRain size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-alert)" }} />
              <span style={{ color: "var(--text-alert)", fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                {t("briefing.weatherAlert")}
              </span>
            </div>

            {/* Sections */}
            {sections.map((section, sIdx) => (
              <div key={section.label} style={{ marginBottom: sIdx < sections.length - 1 ? 16 : 0 }}>
                {/* Checklist items */}
                <div style={{ display: "table", width: "100%", borderSpacing: "0" }}>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} style={{ display: "table-row" }}>
                      <div
                        style={{
                          display: "table-cell",
                          width: 18,
                          paddingRight: 12,
                          paddingTop: 6,
                          paddingBottom: 6,
                          verticalAlign: "top",
                        }}
                      >
                        <div
                          onClick={() => toggleCheck(sIdx, iIdx)}
                          className="cursor-pointer flex items-center justify-center"
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 3,
                            border: item.checked ? "none" : "var(--border-checkbox)",
                            backgroundColor: item.checked ? "var(--color-brand)" : "transparent",
                            marginTop: 2,
                          }}
                        >
                          {item.checked && <Check size={12} color="#FFFFFF" />}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "table-cell",
                          paddingTop: 6,
                          paddingBottom: 6,
                          verticalAlign: "top",
                          width: "auto",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--text-primary)",
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: 1.5,
                          }}
                        >
                          {itemTextMap[item.text] || item.text}
                        </span>
                      </div>
                      {item.isCustom && (
                        <>
                          <div
                            style={{
                              display: "table-cell",
                              width: 70,
                              paddingTop: 6,
                              paddingBottom: 6,
                              paddingLeft: 12,
                              verticalAlign: "top",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "rgba(255,218,138,0.15)",
                                border: "var(--border-warning)",
                                borderRadius: 4,
                                padding: "2px 6px",
                                color: "var(--text-warning)",
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                              }}
                            >
                              {t("briefing.custom")}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "table-cell",
                              width: 20,
                              paddingTop: 6,
                              paddingBottom: 6,
                              paddingLeft: 8,
                              verticalAlign: "top",
                            }}
                          >
                            <button
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomItem(sIdx, iIdx);
                              }}
                              style={{
                                backgroundColor: "transparent",
                                border: "none",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                              }}
                              onMouseEnter={(e) => {
                                const svg = e.currentTarget.querySelector("svg");
                                if (svg) svg.setAttribute("stroke", "var(--text-alert)");
                              }}
                              onMouseLeave={(e) => {
                                const svg = e.currentTarget.querySelector("svg");
                                if (svg) svg.setAttribute("stroke", "var(--text-muted)");
                              }}
                            >
                              <X size={14} style={{ color: "var(--text-muted)" }} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add instruction */}
                {addingToSection === sIdx ? (
                  <div className="flex items-center gap-3" style={{ padding: "6px 0", marginTop: 4 }}>
                    <div
                      className="shrink-0 flex items-center justify-center mt-0.5"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        border: "var(--border-checkbox)",
                        backgroundColor: "transparent",
                      }}
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      value={newInstructionText}
                      onChange={(e) => setNewInstructionText(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, sIdx)}
                      placeholder={t("briefing.typeSafety")}
                      style={{
                        flex: 1,
                        height: 32,
                        backgroundColor: "var(--bg-input)",
                        border: "var(--border-active)",
                        borderRadius: 4,
                        padding: "0 12px",
                        color: "var(--text-primary)",
                        fontSize: 14,
                        fontFamily: "Inter, sans-serif",
                        outline: "none",
                      }}
                    />
                    <button
                      className="cursor-pointer flex items-center justify-center"
                      onClick={() => handleConfirmAddingInstruction(sIdx)}
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: 4,
                        padding: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Check size={14} style={{ color: "var(--color-positive)" }} />
                    </button>
                    <button
                      className="cursor-pointer flex items-center justify-center"
                      onClick={handleCancelAddingInstruction}
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: 4,
                        padding: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.querySelector("svg")?.setAttribute("stroke", "var(--text-alert)");
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.querySelector("svg")?.setAttribute("stroke", "var(--text-muted)");
                      }}
                    >
                      <X size={14} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="cursor-pointer"
                    onClick={() => handleStartAddingInstruction(sIdx)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      padding: "6px 0 6px 30px",
                      color: "var(--text-tertiary)",
                      fontSize: 14,
                      fontWeight: 400,
                      fontFamily: "Inter, sans-serif",
                      textAlign: "left",
                      marginTop: 4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                  >
                    {t("briefing.addInstruction")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <StickyFooter justify="between">
        <FooterButton
          label={t("briefing.back")}
          icon={<ArrowLeft size={14} />}
          onClick={() => navigate("/weather-setup")}
        />
        <FooterButton
          label="PRINT ALL"
          icon={<Printer size={14} />}
          onClick={() => setIsPrintModalOpen(true)}
          variant="primary"
        />
      </StickyFooter>

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onWatchVideos={() => {
          setIsPrintModalOpen(false);
          navigate("/safety-videos");
        }}
      />
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
