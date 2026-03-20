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
  else if (t.includes("maintenance"))                                result.siteCondition = "maintenance";
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
    "maintenance": "Maintenance",
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
  illustration: React.ReactNode;
}

const NormalIllustration = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="10" fill="rgba(255,220,100,0.9)" />
    {[0,45,90,135,180,225,270,315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 26 + 13 * Math.cos(rad); const y1 = 26 + 13 * Math.sin(rad);
      const x2 = 26 + 18 * Math.cos(rad); const y2 = 26 + 18 * Math.sin(rad);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,220,100,0.9)" strokeWidth="2.5" strokeLinecap="round" />;
    })}
  </svg>
);

const WetSurfaceIllustration = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    {[12,20,28,36].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 8 Q${x-3} 16 ${x} 20 Q${x+3} 16 ${x} 8`} fill="rgba(100,180,255,0.85)" />
        <path d={`M${x+4} 20 Q${x+1} 28 ${x+4} 32 Q${x+7} 28 ${x+4} 20`} fill="rgba(100,180,255,0.7)" />
      </g>
    ))}
    <path d="M8 40 Q18 36 26 40 Q34 44 44 40" stroke="rgba(100,180,255,0.6)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M8 45 Q18 41 26 45 Q34 49 44 45" stroke="rgba(100,180,255,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const MuddyIllustration = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <ellipse cx="26" cy="36" rx="18" ry="8" fill="rgba(139,90,43,0.7)" />
    <ellipse cx="20" cy="30" rx="10" ry="5" fill="rgba(160,110,60,0.8)" />
    <ellipse cx="32" cy="28" rx="8" ry="4" fill="rgba(120,75,30,0.8)" />
    <circle cx="18" cy="22" r="4" fill="rgba(139,90,43,0.65)" />
    <circle cx="30" cy="20" r="3" fill="rgba(160,110,60,0.6)" />
    <circle cx="36" cy="25" r="2.5" fill="rgba(120,75,30,0.6)" />
  </svg>
);

const IcyIllustration = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <line x1="26" y1="8" x2="26" y2="44" stroke="rgba(180,230,255,0.9)" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="26" x2="44" y2="26" stroke="rgba(180,230,255,0.9)" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="14" x2="38" y2="38" stroke="rgba(180,230,255,0.9)" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="14" x2="14" y2="38" stroke="rgba(180,230,255,0.9)" strokeWidth="2" strokeLinecap="round" />
    {[0,60,120,180,240,300].map((a, i) => {
      const r = (a * Math.PI) / 180;
      const bx = 26 + 10 * Math.cos(r); const by = 26 + 10 * Math.sin(r);
      return <circle key={i} cx={bx} cy={by} r="2.5" fill="rgba(180,230,255,0.85)" />;
    })}
    <circle cx="26" cy="26" r="4" fill="rgba(220,245,255,0.95)" />
  </svg>
);

const HighDustIllustration = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M6 38 Q14 28 22 34 Q30 40 38 28 Q44 20 48 24" stroke="rgba(210,160,60,0.7)" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M4 30 Q12 22 20 28 Q28 34 36 22 Q42 14 48 18" stroke="rgba(210,160,60,0.5)" strokeWidth="2" strokeLinecap="round" fill="none" />
    {[10,18,28,36,42].map((cx, i) => (
      <circle key={i} cx={cx} cy={12 + (i % 3) * 6} r={2 + (i % 2)} fill="rgba(210,160,60,0.5)" />
    ))}
    {[14,24,34,44].map((cx, i) => (
      <circle key={i} cx={cx} cy={42 + (i % 2) * 4} r={1.5 + (i % 2)} fill="rgba(210,160,60,0.4)" />
    ))}
  </svg>
);

const EquipmentMaintenanceIllustration = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="12" stroke="rgba(140,180,255,0.8)" strokeWidth="2.5" fill="none" />
    <circle cx="26" cy="26" r="6" stroke="rgba(140,180,255,0.8)" strokeWidth="2" fill="none" />
    {[0,45,90,135,180,225,270,315].map((a, i) => {
      const r = (a * Math.PI) / 180;
      const x1 = 26 + 12 * Math.cos(r); const y1 = 26 + 12 * Math.sin(r);
      const x2 = 26 + 19 * Math.cos(r); const y2 = 26 + 19 * Math.sin(r);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(140,180,255,0.7)" strokeWidth="2.5" strokeLinecap="round" />;
    })}
    <path d="M32 10 Q36 8 38 12 L28 22 L24 18 Z" fill="rgba(200,220,255,0.8)" />
    <rect x="22" y="16" width="8" height="3" rx="1" transform="rotate(-45 26 17.5)" fill="rgba(140,180,255,0.9)" />
  </svg>
);

const MaintenanceIllustration = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M14 38 L32 20" stroke="rgba(180,200,230,0.85)" strokeWidth="4" strokeLinecap="round" />
    <path d="M30 14 Q36 10 40 14 L36 18 Q40 22 36 26 Q30 28 26 24 L14 36 Q10 36 10 32 L22 20 Q18 16 22 12 Q26 8 30 14Z" fill="rgba(180,200,230,0.75)" />
    <circle cx="38" cy="38" r="6" stroke="rgba(180,200,230,0.7)" strokeWidth="2.5" fill="none" />
    <line x1="38" y1="32" x2="38" y2="34" stroke="rgba(180,200,230,0.7)" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="42" x2="38" y2="44" stroke="rgba(180,200,230,0.7)" strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="38" x2="34" y2="38" stroke="rgba(180,200,230,0.7)" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="38" x2="44" y2="38" stroke="rgba(180,200,230,0.7)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SITE_CARDS: SiteCondCard[] = [
  { value: "normal",       label: "Normal",                        gradient: "linear-gradient(135deg, #1B3A2F 0%, #2D6A4F 100%)",   illustration: <NormalIllustration /> },
  { value: "wet-surfaces", label: "Wet Surface",                   gradient: "linear-gradient(135deg, #0D2B4A 0%, #1A4A7A 100%)",   illustration: <WetSurfaceIllustration /> },
  { value: "muddy",        label: "Muddy",                         gradient: "linear-gradient(135deg, #2E1A0A 0%, #6B3A1A 100%)",   illustration: <MuddyIllustration /> },
  { value: "icy",          label: "Icy",                           gradient: "linear-gradient(135deg, #0D2340 0%, #1A4060 100%)",   illustration: <IcyIllustration /> },
  { value: "high-dust",    label: "High Dust",                     gradient: "linear-gradient(135deg, #3A2000 0%, #7A4A00 100%)",   illustration: <HighDustIllustration /> },
  { value: "scaffolding",  label: "Equipment Maintenance Ongoing", gradient: "linear-gradient(135deg, #0E1E3A 0%, #1A3060 100%)",   illustration: <EquipmentMaintenanceIllustration /> },
  { value: "maintenance",  label: "Maintenance",                   gradient: "linear-gradient(135deg, #111827 0%, #1F2E44 100%)",   illustration: <MaintenanceIllustration /> },
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
    color: "var(--text-tertiary)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "Inter, sans-serif",
    display: "block",
    marginBottom: 8,
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
                        height: 110,
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
                          flex: 1,
                          background: card.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {card.illustration}
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
