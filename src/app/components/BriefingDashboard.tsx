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
  Maximize2,
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
  imageUrl?: string;
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
      { text: "Confirm BOP test completed before spudding operations", checked: false, imageUrl: "/artifacts/driller_bop_test_user.jpg" },
      { text: "Verify weight indicator and deadline anchor are calibrated", checked: false, imageUrl: "/artifacts/driller_weight.png" },
      { text: "Monitor hook load limits — do not exceed rated capacity", checked: false, imageUrl: "/artifacts/driller_hook_load.png" },
      { text: "Confirm top drive torque settings for today's pipe size", checked: false, imageUrl: "/artifacts/driller_top_drive.png" },
    ],
  },
];

const floorman1Sections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Inspect all tongs and dies before making connections", checked: false, imageUrl: "/artifacts/floorman1_tongs.png" },
      { text: "Confirm stabbing board is secured before running casing", checked: false, imageUrl: "/artifacts/floorman1_stabbing.png" },
      { text: "Wear cut-resistant gloves during all pipe handling", checked: false, imageUrl: "/artifacts/floorman1_gloves.png" },
      { text: "Verify floor safety gates are latched before rotary is engaged", checked: false, imageUrl: "/artifacts/floorman1_gates.png" },
    ],
  },
];

const floorman2Sections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Confirm iron roughneck is properly aligned before each connection", checked: false, imageUrl: "/artifacts/floorman2_roughneck.png" },
      { text: "Inspect spinning chain condition and replace if worn", checked: false, imageUrl: "/artifacts/floorman2_chain.png" },
      { text: "Keep personnel clear of the V-door during pipe pickup", checked: false, imageUrl: "/artifacts/floorman2_vdoor.png" },
      { text: "Verify all hand tools are secured and inventoried", checked: false, imageUrl: "/artifacts/floorman2_tools.png" },
    ],
  },
];

const pitHandSections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Check all pit levels and record baseline readings", checked: false, imageUrl: "/artifacts/pithand_levels.png" },
      { text: "Monitor mud weight and viscosity every 30 minutes", checked: false, imageUrl: "/artifacts/pithand_mud.png" },
      { text: "Inspect shaker screens for damage before circulating", checked: false, imageUrl: "/artifacts/pithand_shaker.png" },
      { text: "Confirm chemical inventory levels — flag any low stock", checked: false, imageUrl: "/artifacts/pithand_chemicals.png" },
    ],
  },
];

const derrickmanSections: Section[] = [
  {
    label: "THINGS TO REMEMBER",
    icon: <ClipboardCheck size={14} style={{ color: "var(--text-tertiary)" }} />,
    items: [
      { text: "Inspect elevator links and bails before tripping operations", checked: false, imageUrl: "/artifacts/derrickman_links.png" },
      { text: "Confirm monkey board safety latch is engaged", checked: false, imageUrl: "/artifacts/derrickman_monkey.png" },
      { text: "Verify derrick lights are operational for low-visibility conditions", checked: false, imageUrl: "/artifacts/derrickman_lights.png" },
      { text: "Check all racking board fingers are properly positioned", checked: false, imageUrl: "/artifacts/derrickman_racking.png" },
    ],
  },
];

// ─── Role card data (color placeholders for images) ───────────────────────────
const ROLE_CARDS: Array<{ role: Role; displayName: string; image: string }> = [
  { role: "DRILLER",    displayName: "Driller",     image: "/assets/People/driller.png" },
  { role: "FLOORMAN 1", displayName: "Floorman",    image: "/assets/People/floorman.png" },
  { role: "FLOORMAN 2", displayName: "Floorman 2",  image: "/assets/People/floorman%202.png" },
  { role: "PIT HAND",   displayName: "Pit Hand",    image: "/assets/People/pitman.png" },
  { role: "DERRICKMAN", displayName: "Derrickman",  image: "/assets/People/derrikeman.png" },
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

  const cardSize = 150; // Adjustable height and image width for role cards
  
  // Animation State
  type RoleCardState = 'idle' | 'expanding' | 'expanded' | 'collapsing';
  const [cardState, setCardState] = useState<RoleCardState>('expanded');
  const [expandingRole, setExpandingRole] = useState<Role | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const panelRef = useRef<HTMLDivElement | null>(null);
  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
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

  const getCardScale = (index: number, currentHoveredIndex: number | null) => {
    if (currentHoveredIndex === null) return 1;
    const distance = Math.abs(index - currentHoveredIndex);
    if (distance === 0) return 1.04; // Slightly toned down primary scale
    if (distance === 1) return 1.01; // Barely noticeably scale for neighbors
    return 1;
  };

  const handleRoleClick = (role: Role) => {
    if (role === activeTab) return;

    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
    }

    // 1. Record the card's current position (FIRST)
    const cardEl = cardRefs.current[role];
    const panelEl = panelRef.current;
    if (!cardEl || !panelEl) return;

    const cardRect = cardEl.getBoundingClientRect();
    const panelRect = panelEl.getBoundingClientRect();

    // 2. Calculate the transform needed (INVERT)
    const deltaX = cardRect.left - panelRect.left;
    const deltaY = cardRect.top - panelRect.top;
    const scaleX = cardRect.width / panelRect.width;
    const scaleY = cardRect.height / panelRect.height;

    // Update content immediately so panel shows correct role without delay
    setActiveTab(role);
    setExpandingRole(role);
    setCardState('expanding');

    // 3. Apply inverted transform immediately then animate to identity (PLAY)
    panelEl.style.transformOrigin = 'top left';
    panelEl.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
    panelEl.style.transition = 'none';
    panelEl.style.willChange = 'transform';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panelEl.style.transform = 'translate(0, 0) scale(1)';
        panelEl.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });

    expandTimeoutRef.current = setTimeout(() => {
      setExpandingRole(null);
      setCardState('expanded');
      panelEl.style.transition = '';
      panelEl.style.willChange = '';
    }, 600);
  };

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
            border: "1px solid var(--text-warning)",
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
            border: "1px solid var(--text-warning)",
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
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {ROLE_CARDS.map((rc, index) => {
            const isActive = activeTab === rc.role;
            const isExpanding = expandingRole === rc.role;
            const isOtherExpanding = expandingRole !== null && !isExpanding;
            const roleStatus = roleStatuses.find((rs) => rs.role === rc.role);
            const isReviewed = roleStatus?.status === "reviewed";
            const scale = getCardScale(index, hoveredIndex);
            
            return (
              <div
                key={rc.role}
                ref={(el) => { cardRefs.current[rc.role] = el; }}
                onClick={() => handleRoleClick(rc.role)}
                onMouseEnter={() => setHoveredIndex(index)}
                style={{
                  flex: 1,
                  height: cardSize,
                  display: "flex",
                  backgroundColor: isActive ? "rgba(var(--color-brand-rgb, 107, 72, 255), 0.05)" : "var(--bg-card)",
                  border: isActive
                    ? "2px solid var(--color-brand)"
                    : isExpanding ? "none" : "var(--border-card)",
                  borderLeft: isActive ? "3px solid var(--color-brand)" : "var(--border-card)",
                  borderRadius: "var(--border-radius-lg)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transform: isOtherExpanding ? "scale(0.95)" : isActive ? "scale(0.98)" : `scale(${scale})`,
                  opacity: isOtherExpanding ? 0.5 : (isActive || hoveredIndex === index) ? 1 : 0.6,
                  boxShadow: hoveredIndex === index 
                    ? "0 8px 24px rgba(0,0,0,0.15)" 
                    : isActive 
                      ? "inset 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)" 
                      : "var(--shadow-card)",
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Role Image */}
                <div
                  style={{
                    width: cardSize,
                    height: cardSize,
                    flexShrink: 0,
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "var(--border-radius-lg) 0 0 var(--border-radius-lg)",
                    overflow: "hidden",
                    borderRight: isActive ? "1px solid var(--color-brand)" : "var(--border-default)",
                  }}
                >
                  <img
                    src={rc.image}
                    alt={rc.displayName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: isActive || hoveredIndex === index ? "none" : "grayscale(30%)",
                      transition: "filter 0.2s",
                    }}
                  />
                </div>
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
                    {isReviewed ? t("briefing.reviewed") : t("briefing.notReviewed")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── AI Safety Instructions panel ────────────────────────────────── */}
        <div
          ref={panelRef}
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: "var(--border-radius-lg)",
            overflow: "hidden",
            position: 'relative',
          }}
        >
          <div
            className="panel-transition-wrapper visible"
            style={{
              opacity: 1,
              transform: 'translateY(0)',
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between"
              style={{ padding: "12px 16px" }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: "var(--color-info)" }} />
                <div style={{
                  color: "var(--text-primary)",
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{t("briefing.aiTitle")} —</span>
                  <div style={{ overflow: 'hidden', height: '1.2em', position: 'relative', minWidth: '100px' }}>
                    <span 
                      key={activeTab} 
                      style={{ 
                        display: 'block',
                        animation: 'role-name-in 0.25s cubic-bezier(0.34, 1.2, 0.64, 1) forwards'
                      }}
                    >
                      {activeRoleDisplayName}
                    </span>
                  </div>
                </div>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                    {section.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        onClick={() => toggleCheck(sIdx, iIdx)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          backgroundColor: item.checked ? "rgba(var(--color-brand-rgb, 107, 72, 255), 0.05)" : "var(--bg-card)",
                          border: item.checked ? "2px solid var(--color-brand)" : "2px solid var(--border-checkbox)",
                          borderRadius: "var(--border-radius-lg)",
                          overflow: "hidden",
                          cursor: "pointer",
                          transform: item.checked ? "scale(1.02) translateY(-4px)" : "scale(1) translateY(0)",
                          boxShadow: item.checked ? "0 8px 16px rgba(107, 72, 255, 0.15)" : "var(--shadow-card)",
                          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                        onMouseEnter={(e) => {
                          if (!item.checked) e.currentTarget.style.borderColor = "var(--border-active)";
                        }}
                        onMouseLeave={(e) => {
                          if (!item.checked) e.currentTarget.style.borderColor = "var(--border-checkbox)";
                        }}
                      >
                        {item.imageUrl && (
                          <div style={{ 
                            position: "relative",
                            aspectRatio: "3 / 2", 
                            maxHeight: "28vh",
                            width: "100%", 
                            overflow: "hidden", 
                            borderBottom: item.checked ? "1px solid rgba(var(--color-brand-rgb, 107, 72, 255), 0.2)" : "1px solid var(--border-checkbox)",
                            flexShrink: 0
                          }}>
                            <img 
                              src={item.imageUrl} 
                              alt="Safety instruction" 
                              style={{ 
                                width: "100%", 
                                height: "100%", 
                                objectFit: "cover",
                                objectPosition: "center bottom",
                                transition: "transform 0.4s ease"
                              }} 
                              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                            />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedImage(item.imageUrl || null);
                              }}
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                borderRadius: 4,
                                padding: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                zIndex: 10,
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.8)"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.5)"}
                            >
                              <Maximize2 size={14} />
                            </div>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "16px",
                            flex: 1,
                          }}
                        >
                          <div
                            className="cursor-pointer flex items-center justify-center transform"
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              border: item.checked ? "none" : "2px solid var(--text-muted)",
                              backgroundColor: item.checked ? "var(--color-brand)" : "transparent",
                              marginTop: 0,
                              flexShrink: 0,
                              transform: item.checked ? "scale(1.1)" : "scale(1)",
                              transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease",
                            }}
                          >
                            {item.checked && <Check size={14} color="#FFFFFF" />}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              gap: 12,
                            }}
                          >
                            <span
                              style={{
                                color: "var(--text-primary)",
                                fontSize: 14,
                                fontWeight: 500,
                                lineHeight: 1.4,
                                flex: 1,
                              }}
                            >
                              {itemTextMap[item.text] || item.text}
                            </span>
                            
                            {item.isCustom && (
                              <div className="flex items-center gap-2 shrink-0">
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
                                  }}
                                >
                                  {t("briefing.custom")}
                                </span>
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
                                >
                                  <X size={14} style={{ color: "var(--text-muted)" }} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
                        color: "var(--color-brand)",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        textAlign: "left",
                        marginTop: 4,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-brand-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-brand)")}
                    >
                      {t("briefing.addInstruction")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            cursor: "zoom-out",
          }}
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            alt="Expanded view" 
            style={{ 
              maxWidth: "100%", 
              maxHeight: "100%", 
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)"
            }} 
          />
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              padding: 8,
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedImage(null);
            }}
          >
            <X size={24} />
          </div>
        </div>
      )}

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

      <style>{`
        @keyframes role-name-in {
          from { transform: translateY(60%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .role-card,
          .instructions-panel,
          .panel-transition-wrapper,
          .role-name-label {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span
      style={{
        backgroundColor: "var(--color-surface-1)",
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
