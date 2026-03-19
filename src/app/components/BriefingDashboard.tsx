import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  RefreshCw,
  CloudRain,
  Printer,
  ClipboardCheck,
  Eye,
  Clock,
  Check,
  ArrowLeft,
  X,
  Plus,
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
    icon: <ClipboardCheck size={14} style={{ color: "#8A9AB6" }} />,
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
    icon: <ClipboardCheck size={14} style={{ color: "#8A9AB6" }} />,
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
    icon: <ClipboardCheck size={14} style={{ color: "#8A9AB6" }} />,
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
    icon: <ClipboardCheck size={14} style={{ color: "#8A9AB6" }} />,
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
    icon: <ClipboardCheck size={14} style={{ color: "#8A9AB6" }} />,
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

interface RoleStatus {
  role: Role;
  status: "reviewed" | "not-reviewed";
}

export function BriefingDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Role>("DRILLER");
  const [sections, setSections] = useState<Section[]>(drillerSections);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [addingToSection, setAddingToSection] = useState<number | null>(null);
  const [newInstructionText, setNewInstructionText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Store checklist data for all roles
  const [roleSections, setRoleSections] = useState<Record<Role, Section[]>>({
    "DRILLER": drillerSections,
    "FLOORMAN 1": floorman1Sections,
    "FLOORMAN 2": floorman2Sections,
    "PIT HAND": pitHandSections,
    "DERRICKMAN": derrickmanSections,
  });

  // Update sections when active tab changes
  useEffect(() => {
    setSections(roleSections[activeTab]);
  }, [activeTab, roleSections]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-focus input when adding instruction
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
          ? {
              ...s,
              items: s.items.map((item, ii) =>
                ii === itemIdx ? { ...item, checked: !item.checked } : item
              ),
            }
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
            ? {
                ...s,
                items: [...s.items, { text: newInstructionText.trim(), checked: true, isCustom: true }],
              }
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
          ? {
              ...s,
              items: s.items.filter((_, ii) => ii !== itemIdx),
            }
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

  // Calculate status for a role based on its checklist progress
  const calculateRoleStatus = (role: Role): "reviewed" | "not-reviewed" => {
    const sections = roleSections[role];
    const allItems = sections.flatMap(s => s.items);
    const checkedCount = allItems.filter(item => item.checked).length;

    // If at least 1 item is checked, status is "reviewed"
    return checkedCount >= 1 ? "reviewed" : "not-reviewed";
  };

  // Generate role statuses dynamically
  const roleStatuses: RoleStatus[] = roles.map(role => ({
    role,
    status: calculateRoleStatus(role),
  }));

  // Calculate progress bar completion
  const roleProgress = roleStatuses.map(rs => rs.status === "reviewed");

  // Calculate briefing completion stats
  const completedRoles = roleStatuses.filter(rs => rs.status === "reviewed").length;
  const totalRoles = roles.length;

  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const mins = d.getMinutes().toString().padStart(2, "0");
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `${hours.toString().padStart(2, "0")}:${mins} ${ampm} — ${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "reviewed":
        return { text: t("briefing.reviewed"), color: "#4ED199" };
      case "not-reviewed":
        return { text: t("briefing.notReviewed"), color: "#5F6F8A" };
      default:
        return { text: t("briefing.notReviewed"), color: "#5F6F8A" };
    }
  };

  // Translation map for section labels
  const sectionLabelMap: Record<string, string> = {
    "PERSONAL PROTECTIVE EQUIPMENT": t("briefing.ppe"),
    "PRE-SHIFT CHECKS": t("briefing.preShift"),
    "EMERGENCY PROCEDURES": t("briefing.emergency"),
  };

  // Translation map for checklist items
  const itemTextMap: Record<string, string> = {
    // Old PPE/Pre-shift/Emergency items (keeping for backwards compatibility)
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
    
    // Driller items
    "Confirm BOP test completed before spudding operations": t("briefing.driller1"),
    "Verify weight indicator and deadline anchor are calibrated": t("briefing.driller2"),
    "Monitor hook load limits — do not exceed rated capacity": t("briefing.driller3"),
    "Confirm top drive torque settings for today's pipe size": t("briefing.driller4"),
    "Check driller's console emergency stop is functional": t("briefing.driller5"),
    
    // Floorman 1 items
    "Inspect all tongs and dies before making connections": t("briefing.floorman1_1"),
    "Confirm stabbing board is secured before running casing": t("briefing.floorman1_2"),
    "Wear cut-resistant gloves during all pipe handling": t("briefing.floorman1_3"),
    "Verify floor safety gates are latched before rotary is engaged": t("briefing.floorman1_4"),
    "Keep clear of the rotary table during drilling operations": t("briefing.floorman1_5"),
    "Check cat line and tugger line for wear before use": t("briefing.floorman1_6"),
    
    // Floorman 2 items
    "Confirm iron roughneck is properly aligned before each connection": t("briefing.floorman2_1"),
    "Inspect spinning chain condition and replace if worn": t("briefing.floorman2_2"),
    "Keep personnel clear of the V-door during pipe pickup": t("briefing.floorman2_3"),
    "Verify all hand tools are secured and inventoried": t("briefing.floorman2_4"),
    "Report any dropped objects immediately to the Driller": t("briefing.floorman2_5"),
    "Confirm drill line slip-and-cut schedule is up to date": t("briefing.floorman2_6"),
    
    // Pit Hand items
    "Check all pit levels and record baseline readings": t("briefing.pithand1"),
    "Monitor mud weight and viscosity every 30 minutes": t("briefing.pithand2"),
    "Inspect shaker screens for damage before circulating": t("briefing.pithand3"),
    "Confirm chemical inventory levels — flag any low stock": t("briefing.pithand4"),
    "Verify trip tank is zeroed and functional before tripping": t("briefing.pithand5"),
    "Check all agitators and degasser are running correctly": t("briefing.pithand6"),
    
    // Derrickman items
    "Inspect elevator links and bails before tripping operations": t("briefing.derrickman1"),
    "Confirm monkey board safety latch is engaged": t("briefing.derrickman2"),
    "Verify derrick lights are operational for low-visibility conditions": t("briefing.derrickman3"),
    "Check all racking board fingers are properly positioned": t("briefing.derrickman4"),
    "Inspect traveling block and crown-o-matic settings": t("briefing.derrickman5"),
    "Confirm escape line and derrick safety harness are in good condition": t("briefing.derrickman6"),
  };

  return (
    <div
      className="flex flex-col h-screen w-screen"
      style={{ backgroundColor: "var(--color-surface-1)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <Header breadcrumb={t("header.safetyBriefingDashboard")} />

      {/* Context bar */}
      <div
        className="flex items-center gap-2 px-6 shrink-0 flex-wrap"
        style={{
          backgroundColor: "var(--color-surface-3)",
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
            color: "#FFDA8A",
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
            color: "#FFDA8A",
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
            backgroundColor: "var(--color-surface-3)",
            borderRight: "var(--border-default)",
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
                color: "#8A9AB6",
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
            {roleStatuses.map((roleItem) => {
              const isActive = activeTab === roleItem.role;
              const statusInfo = getStatusLabel(roleItem.status);
              return (
                <button
                  key={roleItem.role}
                  onClick={() => setActiveTab(roleItem.role)}
                  className="w-full cursor-pointer"
                  style={{
                    height: 48,
                    padding: "0 16px",
                    borderLeft: `3px solid ${isActive ? "var(--color-brand)" : "transparent"}`,
                    backgroundColor: isActive ? "var(--color-surface-4)" : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    textAlign: "left",
                    border: "none",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    style={{
                      color: isActive ? "#E7ECF5" : "#8A9AB6",
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      textTransform: "uppercase",
                    }}
                  >
                    {roleItem.role}
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

        {/* Main AI instructions area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "20px 24px" }}>
            {/* Briefing progress bar - moved to top */}
            

            {/* AI Safety Instructions */}
            <div
              style={{
                backgroundColor: "#182235",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between"
                style={{ padding: "12px 16px" }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} style={{ color: "#6F8FD9" }} />
                  <span
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("briefing.aiTitle")}
                  </span>
                </div>
                <button
                  className="cursor-pointer flex items-center justify-center"
                  title="Regenerate"
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: "#1F2B42",
                    border: "1px solid #253552",
                    borderRadius: 6,
                    color: "#B6C2D9",
                  }}
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              {/* Tab content */}
              <div style={{ paddingTop: 0, paddingRight: 16, paddingBottom: 24, paddingLeft: 16 }}>
                {/* Weather alert banner */}
                <div
                  className="flex items-start gap-2"
                  style={{
                    backgroundColor: "rgba(247,163,168,0.08)",
                    borderLeft: "3px solid #F7A3A8",
                    borderRadius: "0 4px 4px 0",
                    padding: "8px 12px",
                    marginBottom: 12,
                  }}
                >
                  <CloudRain size={14} className="shrink-0 mt-0.5" style={{ color: "#F7A3A8" }} />
                  <span style={{ color: "#F7A3A8", fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                    {t("briefing.weatherAlert")}
                  </span>
                </div>

                {/* Sections */}
                {sections.map((section, sIdx) => {
                  const checkedCount = section.items.filter((i) => i.checked).length;
                  const total = section.items.length;
                  const allDone = checkedCount === total;
                  return (
                    <div key={section.label} style={{ marginBottom: sIdx < sections.length - 1 ? 16 : 0 }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                        <div className="flex items-center gap-2">
                          {section.icon}
                          <span
                            style={{
                              color: "#8A9AB6",
                              fontSize: 14,
                              fontWeight: 600,
                              letterSpacing: "1px",
                              textTransform: "uppercase",
                            }}
                          >
                            {sectionLabelMap[section.label] || section.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Checklist items table */}
                      <div style={{ display: "table", width: "100%", borderSpacing: "0" }}>
                        {section.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            style={{ display: "table-row" }}
                          >
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
                                  border: item.checked ? "none" : `1px solid var(--color-surface-5)`,
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
                                  color: "#E7ECF5",
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
                                      border: "1px solid #FFDA8A",
                                      borderRadius: 4,
                                      padding: "2px 6px",
                                      color: "#FFDA8A",
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
                                      if (svg) svg.setAttribute("stroke", "#F7A3A8");
                                    }}
                                    onMouseLeave={(e) => {
                                      const svg = e.currentTarget.querySelector("svg");
                                      if (svg) svg.setAttribute("stroke", "#5F6F8A");
                                    }}
                                  >
                                    <X size={14} style={{ color: "#5F6F8A" }} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Add instruction button or input */}
                      {addingToSection === sIdx ? (
                        <div className="flex items-center gap-3" style={{ padding: "6px 0", marginTop: 4 }}>
                          <div
                            className="shrink-0 flex items-center justify-center mt-0.5"
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 3,
                              border: "1px solid #253552",
                              backgroundColor: "transparent",
                            }}
                          />
                          <input
                            ref={inputRef}
                            type="text"
                            value={newInstructionText}
                            onChange={(e) => setNewInstructionText(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, sIdx)}
                            placeholder={t("briefing.typeSafety")}
                            style={{
                              flex: 1,
                              height: 32,
                              backgroundColor: "#0E141F",
                              border: "1px solid #2B5597",
                              borderRadius: 4,
                              padding: "0 12px",
                              color: "#E7ECF5",
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
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1F2B42")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <Check size={14} style={{ color: "#4ED199" }} />
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
                              e.currentTarget.querySelector("svg")?.setAttribute("stroke", "#F7A3A8");
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.querySelector("svg")?.setAttribute("stroke", "#5F6F8A");
                            }}
                          >
                            <X size={14} style={{ color: "#5F6F8A" }} />
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
                            color: "#8A9AB6",
                            fontSize: 14,
                            fontWeight: 400,
                            fontFamily: "Inter, sans-serif",
                            textAlign: "left",
                            marginTop: 4,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#B6C2D9")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#8A9AB6")}
                        >
                          {t("briefing.addInstruction")}
                        </button>
                      )}
                    </div>
                  );
                })}
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
        backgroundColor: "#1F2B42",
        border: "1px solid #253552",
        color: "#B6C2D9",
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