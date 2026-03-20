import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import { AIProcessingModal } from "./AIProcessingModal";
import { StickyFooter, FooterButton } from "./StickyFooter";
import { Header } from "./Header";
import { SearchableSelect } from "./SearchableSelect";
import { CreatableMultiSelect } from "./CreatableMultiSelect";
import { useLanguage } from "./LanguageContext";
import svgPaths from "../../imports/svg-n0t5roau72";

// ─── Voice chatbot ─────────────────────────────────────────────────────────────
interface ParsedVoiceData {
  weather?: string[];
  siteCondition?: string;
  inputPlan?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function parseVoiceInput(text: string): ParsedVoiceData {
  const t = text.toLowerCase();
  const result: ParsedVoiceData = {};

  // Weather
  if (t.includes("heavy rain") || t.includes("heavy rainfall"))    result.weather = ["heavy-rain"];
  else if (t.includes("light rain") || t.includes("drizzle"))       result.weather = ["light-rain"];
  else if (t.includes("rain") || t.includes("raining"))             result.weather = ["light-rain"];
  else if (t.includes("thunderstorm") || t.includes("thunder"))     result.weather = ["thunderstorm"];
  else if (t.includes("snow") || t.includes("snowing"))             result.weather = ["snow"];
  else if (t.includes("fog") || t.includes("foggy"))                result.weather = ["fog"];
  else if (t.includes("high wind") || t.includes("strong wind"))    result.weather = ["high-winds"];
  else if (t.includes("overcast") || t.includes("cloudy"))          result.weather = ["overcast"];
  else if (t.includes("partly cloudy") || t.includes("partial"))    result.weather = ["partly-cloudy"];
  else if (t.includes("clear") || t.includes("sunny"))              result.weather = ["clear"];

  // Site condition
  if (t.includes("muddy") || t.includes("mud"))                     result.siteCondition = "muddy";
  else if (t.includes("icy") || t.includes("ice") || t.includes("frozen")) result.siteCondition = "icy";
  else if (t.includes("wet surface") || t.includes("wet floor"))    result.siteCondition = "wet-surfaces";
  else if (t.includes("dust") || t.includes("dusty"))               result.siteCondition = "high-dust";
  else if (t.includes("equipment maintenance"))                      result.siteCondition = "scaffolding";
  else if (t.includes("maintenance"))                                result.siteCondition = "restricted-access";
  else if (t.includes("restricted") || t.includes("access zone"))    result.siteCondition = "restricted-access";
  else if (t.includes("normal") || t.includes("standard"))          result.siteCondition = "normal";

  // Input plan
  if (t.includes("cement") && t.includes("casing"))                 result.inputPlan = "plan-8";
  else if (t.includes("casing") || t.includes("9 5/8") || t.includes("9-5/8") || t.includes("nine five")) result.inputPlan = "plan-1";
  else if (t.includes("drill") && t.includes("hole"))               result.inputPlan = "plan-2";
  else if (t.includes("circulate") || t.includes("condition mud"))   result.inputPlan = "plan-3";
  else if (t.includes("wireline") || t.includes("log"))             result.inputPlan = "plan-4";
  else if (t.includes("bop") || t.includes("pressure test"))        result.inputPlan = "plan-5";
  else if (t.includes("trip") || t.includes("bit change"))          result.inputPlan = "plan-6";
  else if (t.includes("drill pipe"))                                 result.inputPlan = "plan-7";

  return result;
}

function buildFillSummary(data: ParsedVoiceData): string {
  const parts: string[] = [];
  const weatherLabels: Record<string, string> = {
    "clear": "Clear", "partly-cloudy": "Partly Cloudy", "overcast": "Overcast",
    "light-rain": "Light Rain", "heavy-rain": "Heavy Rain", "thunderstorm": "Thunderstorms",
    "high-winds": "High Winds", "fog": "Fog", "snow": "Snow",
  };
  const condLabels: Record<string, string> = {
    "normal": "Normal", "wet-surfaces": "Wet Surface", "muddy": "Muddy",
    "icy": "Icy", "high-dust": "High Dust", "scaffolding": "Equipment Maintenance Ongoing",
    "restricted-access": "Restricted Access Zone Active",
  };
  const planLabels: Record<string, string> = {
    "plan-1": 'Run 9-5/8" casing to 8,450 ft TD',
    "plan-2": 'Drill 8-1/2" hole section to 12,200 ft',
    "plan-3": "Circulate and condition mud — pre-log",
    "plan-4": "Run wireline logs",
    "plan-5": "Perform pressure test on BOP stack",
    "plan-6": "Trip out of hole for bit change",
    "plan-7": 'Make up and run 5" drill pipe to bottom',
    "plan-8": 'Cement 9-5/8" casing — two-stage job',
  };
  if (data.weather?.length)     parts.push(`Weather → ${weatherLabels[data.weather[0]] ?? data.weather[0]}`);
  if (data.siteCondition)        parts.push(`Site → ${condLabels[data.siteCondition] ?? data.siteCondition}`);
  if (data.inputPlan)            parts.push(`Plan → ${planLabels[data.inputPlan] ?? data.inputPlan}`);
  return parts.length
    ? `Got it! Filling in:\n${parts.join("\n")}`
    : "I heard you, but couldn't match any fields. Try mentioning weather, site condition, or plan.";
}

function VoiceChatbot({
  onFill,
  onClose,
}: {
  onFill: (data: ParsedVoiceData) => void;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi! I'm listening. Describe the conditions — e.g. \"The weather is cloudy, site is muddy, planning to run 9-5/8 casing.\"" },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    startListening();
    return () => { try { recognitionRef.current?.stop(); } catch {} };
  }, []);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Voice recognition isn't supported in this browser. Please use Chrome or Edge." }]);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    recognitionRef.current = rec;

    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onerror  = () => {
      setIsListening(false);
      setMessages((prev) => [...prev, { role: "assistant", text: "Couldn't catch that. Tap the mic to try again." }]);
    };
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setMessages((prev) => [...prev, { role: "user", text: transcript }]);
      setTimeout(() => {
        const parsed = parseVoiceInput(transcript);
        const summary = buildFillSummary(parsed);
        setMessages((prev) => [...prev, { role: "assistant", text: summary }]);
        if (Object.keys(parsed).length > 0) {
          setIsFilling(true);
          setTimeout(() => { onFill(parsed); setIsFilling(false); }, 600);
        }
      }, 400);
    };
    try { rec.start(); } catch {}
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        right: 32,
        width: 320,
        backgroundColor: "var(--bg-card)",
        border: "var(--border-card)",
        borderRadius: "var(--border-radius-lg)",
        boxShadow: "var(--shadow-modal)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          backgroundColor: "var(--bg-header)",
          borderBottom: "var(--border-default)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M5 10a7 7 0 0 0 14 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>Voice Assistant</div>
            <div style={{ color: isListening ? "var(--color-positive)" : "var(--text-muted)", fontSize: 11 }}>
              {isListening ? "● Listening…" : isFilling ? "Filling form…" : "Ready"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
        >
          <X size={16} style={{ color: "var(--text-tertiary)" }} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          padding: "12px",
          maxHeight: 220,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "85%",
                backgroundColor: msg.role === "user" ? "var(--color-brand)" : "var(--bg-hover)",
                color: msg.role === "user" ? "var(--text-on-primary)" : "var(--text-primary)",
                borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                padding: "8px 11px",
                fontSize: 12,
                lineHeight: 1.5,
                whiteSpace: "pre-line",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isListening && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                backgroundColor: "var(--bg-hover)",
                borderRadius: "12px 12px 12px 3px",
                padding: "8px 14px",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "var(--color-brand)",
                    animation: `pulse-dot 1.2s ease-in-out ${j * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "var(--border-default)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={startListening}
          disabled={isListening || isFilling}
          title="Tap to speak"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: isListening ? "var(--color-negative)" : "var(--color-brand)",
            border: "none",
            cursor: isListening || isFilling ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: isFilling ? 0.5 : 1,
            transition: "background-color 0.2s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10a7 7 0 0 0 14 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="9" y1="21" x2="15" y2="21" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <span style={{ color: "var(--text-muted)", fontSize: 11, lineHeight: 1.4 }}>
          {isListening ? "Speak now — mention weather, site condition, or plan" : "Tap mic to speak again"}
        </span>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Site condition card data & illustrations ──────────────────────────────────
interface SiteCondCard {
  value: string;
  label: string;
  gradient: string;
  image: string;
}

const SITE_CARDS: SiteCondCard[] = [
  { value: "normal",            label: "Normal",                        gradient: "linear-gradient(135deg, #1B3A2F 0%, #2D6A4F 100%)",   image: "/assets/site-conditions/normal.png" },
  { value: "wet-surfaces",      label: "Wet Surface",                   gradient: "linear-gradient(135deg, #0D2B4A 0%, #1A4A7A 100%)",   image: "/assets/site-conditions/wet-surfaces.png" },
  { value: "muddy",             label: "Muddy",                         gradient: "linear-gradient(135deg, #2E1A0A 0%, #6B3A1A 100%)",   image: "/assets/site-conditions/muddy.png" },
  { value: "icy",               label: "Icy",                           gradient: "linear-gradient(135deg, #0D2340 0%, #1A4060 100%)",   image: "https://images.unsplash.com/photo-1562237548-2e0fd9797537?q=80&w=800&auto=format&fit=crop" },
  { value: "high-dust",         label: "High Dust",                     gradient: "linear-gradient(135deg, #3A2000 0%, #7A4A00 100%)",   image: "https://images.unsplash.com/photo-1773097258874-17d6446c3113?q=80&w=800&auto=format&fit=crop" },
  { value: "scaffolding",       label: "Equipment Maintenance Ongoing", gradient: "linear-gradient(135deg, #0E1E3A 0%, #1A3060 100%)",   image: "https://images.unsplash.com/photo-1563118351-2d4040fe5980?q=80&w=800&auto=format&fit=crop" },
  { value: "restricted-access", label: "Restricted Access Zone Active", gradient: "linear-gradient(135deg, #111827 0%, #1F2E44 100%)",   image: "https://images.unsplash.com/photo-1773517459319-ae1dd572c974?q=80&w=800&auto=format&fit=crop" },
];

export function WeatherSetupScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedRig, setSelectedRig] = useState("");
  const [weatherConditions, setWeatherConditions] = useState<string[]>([]);
  const [selectedSiteCondition, setSelectedSiteCondition] = useState("");
  const [newCrewMembers, setNewCrewMembers] = useState<string[]>([]);
  const [showCrewPlaceholder, setShowCrewPlaceholder] = useState(true);
  const [inputPlan, setInputPlan] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleVoiceFill = (data: ParsedVoiceData) => {
    if (data.weather)        setWeatherConditions(data.weather);
    if (data.siteCondition)  setSelectedSiteCondition(data.siteCondition);
    if (data.inputPlan)      setInputPlan(data.inputPlan);
  };

  // ── Options ────────────────────────────────────────────────────────────────
  const rigOptions = [
    { value: "rig-145", label: "Rig 145 — Midland, TX" },
    { value: "rig-146", label: "Rig 146 — Midland, TX" },
    { value: "rig-147", label: "Rig 147 — Odessa, TX" },
    { value: "rig-148", label: "Rig 148 — Pecos, TX" },
    { value: "rig-203", label: "Rig 203 — Odessa, TX" },
    { value: "rig-347", label: "Rig 347 — Pecos, TX" },
    { value: "rig-412", label: "Rig 412 — Andrews, TX" },
    { value: "rig-528", label: "Rig 528 — Big Spring, TX" },
    { value: "rig-631", label: "Rig 631 — Snyder, TX" },
  ];

  const weatherOptions = [
    { value: "clear",          label: t("weather.opt.clear") },
    { value: "partly-cloudy",  label: t("weather.opt.partlyCloudy") },
    { value: "overcast",       label: t("weather.opt.overcast") },
    { value: "light-rain",     label: t("weather.opt.lightRain") },
    { value: "heavy-rain",     label: t("weather.opt.heavyRain") },
    { value: "thunderstorm",   label: t("weather.opt.thunderstorm") },
    { value: "high-winds",     label: t("weather.opt.highWinds") },
    { value: "fog",            label: t("weather.opt.fog") },
    { value: "snow",           label: t("weather.opt.snow") },
  ];

  const planOptions = [
    { value: "plan-1", label: 'Run 9-5/8" casing to 8,450 ft TD' },
    { value: "plan-2", label: 'Drill 8-1/2" hole section to 12,200 ft' },
    { value: "plan-3", label: "Circulate and condition mud — pre-log" },
    { value: "plan-4", label: "Run wireline logs — density/neutron/resistivity" },
    { value: "plan-5", label: "Perform pressure test on BOP stack" },
    { value: "plan-6", label: "Trip out of hole for bit change" },
    { value: "plan-7", label: 'Make up and run 5" drill pipe to bottom' },
    { value: "plan-8", label: 'Cement 9-5/8" casing — two-stage job' },
  ];

  const handleGenerate = () => setShowModal(true);

  // ── Field label style ──────────────────────────────────────────────────────
  const fieldLabel: React.CSSProperties = {
    color: "var(--color-text-secondary)",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
    display: "block",
    marginBottom: 6,
  };

  const divider = (
    <div style={{ borderTop: "var(--border-subtle)", margin: "16px 0" }} />
  );

  return (
    <div
      className="flex flex-col h-screen w-screen"
      style={{ backgroundColor: "var(--bg-page)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <Header breadcrumb={t("header.siteConditions")} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex justify-center" style={{ padding: "24px 0 100px" }}>
        <div style={{ width: "100%", padding: "0 24px" }}>

          {/* ── Page header (outside card) ─────────────────────────────────── */}
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              {/* Sun / weather icon */}
              <div className="shrink-0" style={{ width: 20, height: 20 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V4" stroke="var(--color-brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M4.93 4.93L6.34 6.34" stroke="var(--color-brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M20 12H22" stroke="var(--color-brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M19.07 4.93L17.66 6.34" stroke="var(--color-brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d={svgPaths.p136fbe40} stroke="var(--color-brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d={svgPaths.p272a0af0} stroke="var(--color-brand)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
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
                {t("weather.sectionTitle")}
              </span>
            </div>

            {/* Auto-detect from GPS */}
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: "transparent",
                border: "var(--border-active)",
                borderRadius: "var(--border-radius-md)",
                padding: "8px 16px",
                color: "var(--text-secondary)",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(43,85,151,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" stroke="var(--color-brand)" strokeWidth="1.2" />
                <path d="M7 1v2M7 11v2M1 7h2M11 7h2" stroke="var(--color-brand)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {t("weather.autoDetect")}
            </button>
          </div>

          {/* ── Unified card ───────────────────────────────────────────────── */}
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "var(--border-card)",
              borderRadius: "var(--border-radius-lg)",
              padding: 24,
            }}
          >
            {/* ── Row 1: 3-column grid ──────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "start" }}>

              {/* RIG */}
              <div>
                <SearchableSelect
                  label={t("weather.rig")}
                  value={selectedRig}
                  onChange={setSelectedRig}
                  options={rigOptions}
                  placeholder={t("weather.selectRig")}
                />
              </div>

              {/* WEATHER */}
              <div>
                <CreatableMultiSelect
                  label={t("weather.weather")}
                  values={weatherConditions}
                  onChange={setWeatherConditions}
                  predefinedOptions={weatherOptions}
                  placeholder={t("weather.selectWeather")}
                />
              </div>

              {/* NEW CREW MEMBER ON SHIFT? */}
              <div>
                <CreatableMultiSelect
                  label={t("weather.newCrew")}
                  values={newCrewMembers}
                  onChange={setNewCrewMembers}
                  predefinedOptions={[
                    { value: "d-harris",   label: "D. Harris — Floorman (Day 1)" },
                    { value: "m-johnson",  label: "M. Johnson — Roughneck (Day 1)" },
                    { value: "r-smith",    label: "R. Smith — Derrickman (Day 2)" },
                    { value: "j-williams", label: "J. Williams — Motorman (Day 1)" },
                    { value: "t-brown",    label: "T. Brown — Driller (Day 3)" },
                  ]}
                  placeholder={t("weather.selectCrew")}
                  showToggle={true}
                  toggleValue={showCrewPlaceholder}
                  onToggleChange={setShowCrewPlaceholder}
                />
              </div>
            </div>

            {divider}

            {/* ── Row 2: Site Condition ────────────────────────────────────── */}
            <div>
              <label style={fieldLabel}>{t("weather.siteConditions")}</label>

              {/* Image cards row — equal width, no scroll */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {SITE_CARDS.map((card) => {
                  const isActive = selectedSiteCondition === card.value;
                  return (
                    <div
                      key={card.value}
                      onClick={() => setSelectedSiteCondition(isActive ? "" : card.value)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: 135,
                        backgroundColor: "var(--bg-card)",
                        border: isActive
                          ? "2px solid var(--color-brand)"
                          : "var(--border-default)",
                        borderRadius: "var(--border-radius-lg)",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                    >
                      {/* Illustration area */}
                      <div
                        style={{
                          height: 100,
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={card.image}
                          alt={card.label}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: isActive ? "transparent" : "rgba(0,0,0,0.1)",
                            transition: "background 0.2s",
                          }}
                        />
                      </div>
                      {/* Label */}
                      <div
                        style={{
                          padding: "6px 8px",
                          backgroundColor: "var(--bg-card)",
                          borderTop: isActive ? "1px solid var(--color-brand)" : "var(--border-default)",
                        }}
                      >
                        <span
                          style={{
                            color: isActive ? "var(--color-brand)" : "var(--text-secondary)",
                            fontWeight: 600,
                            fontSize: 11,
                            fontFamily: "Inter, sans-serif",
                            lineHeight: 1.3,
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {card.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {divider}

            {/* ── Row 3: Input Plan ────────────────────────────────────────── */}
            <div>
              <label style={fieldLabel}>{t("weather.inputPlan")}</label>
              <SearchableSelect
                label=""
                value={inputPlan}
                onChange={setInputPlan}
                options={planOptions}
                placeholder={t("weather.selectPlan")}
              />
            </div>
          </div>

          <div style={{ height: 16 }} />

          {/* AI info callout */}
          <div
            className="flex items-start gap-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "var(--border-default)",
              borderRadius: "var(--border-radius-md)",
              padding: "13px 17px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
              <g clipPath="url(#clip_info2)">
                <path d={svgPaths.p39ee6532} stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d="M8 10.6667V8" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d="M8 5.33333H8.00667" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </g>
              <defs>
                <clipPath id="clip_info2">
                  <rect fill="white" height="16" width="16" />
                </clipPath>
              </defs>
            </svg>
            <span style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 400, lineHeight: 1.5, fontFamily: "Inter, sans-serif" }}>
              {t("weather.aiNote")}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <StickyFooter justify="end">
        <FooterButton
          label={<>{t("weather.generate")}</>}
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <g clipPath="url(#clip_sparkle2)">
                <path d={svgPaths.p115b3700} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M11.6667 1.75V4.08333" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M12.8333 2.91667H10.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M2.33333 9.91667V11.0833" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M2.91667 10.5H1.75" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
              </g>
              <defs>
                <clipPath id="clip_sparkle2">
                  <rect fill="white" height="14" width="14" />
                </clipPath>
              </defs>
            </svg>
          }
          onClick={handleGenerate}
          variant="primary"
        />
      </StickyFooter>

      {/* Voice chatbot FAB */}
      {!showChatbot && (
        <button
          type="button"
          title="Fill form with voice"
          onClick={() => setShowChatbot(true)}
          style={{
            position: "fixed",
            bottom: 96,
            right: 32,
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "var(--color-brand)",
            border: "none",
            boxShadow: "var(--shadow-modal)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 50,
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand)")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" stroke="var(--text-on-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10a7 7 0 0 0 14 0" stroke="var(--text-on-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="17" x2="12" y2="21" stroke="var(--text-on-primary)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="9" y1="21" x2="15" y2="21" stroke="var(--text-on-primary)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Voice chatbot panel */}
      {showChatbot && (
        <VoiceChatbot
          onFill={handleVoiceFill}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {/* AI Processing Modal */}
      {showModal && <AIProcessingModal onComplete={() => navigate("/briefing")} />}
    </div>
  );
}
