import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, X } from "lucide-react";
import { AIProcessingModal } from "./AIProcessingModal";
import {
  FormSelect,
  FormTextarea,
  FormToggle,
} from "./FormField";
import { StickyFooter, FooterButton } from "./StickyFooter";
import { Header } from "./Header";
import { SearchableSelect } from "./SearchableSelect";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { CreatableMultiSelect } from "./CreatableMultiSelect";
import { useLanguage } from "./LanguageContext";
import svgPaths from "../../imports/svg-n0t5roau72";

export function WeatherSetupScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedRig, setSelectedRig] = useState("");
  const [weatherConditions, setWeatherConditions] = useState<string[]>([]);
  const [customWeather, setCustomWeather] = useState("");
  const [siteConditions, setSiteConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState("");
  const [newCrewMembers, setNewCrewMembers] = useState<string[]>([]);
  const [inputPlan, setInputPlan] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCrewPlaceholder, setShowCrewPlaceholder] = useState(true);

  const rigOptions = [
    { value: "rig-145", label: "Rig 145 — Midland, TX" },
    { value: "rig-203", label: "Rig 203 — Odessa, TX" },
    { value: "rig-347", label: "Rig 347 — Pecos, TX" },
    { value: "rig-412", label: "Rig 412 — Andrews, TX" },
    { value: "rig-528", label: "Rig 528 — Big Spring, TX" },
    { value: "rig-631", label: "Rig 631 — Snyder, TX" },
    { value: "rig-745", label: "Rig 745 — Monahans, TX" },
    { value: "rig-802", label: "Rig 802 — Crane, TX" },
    { value: "rig-914", label: "Rig 914 — Fort Stockton, TX" },
    { value: "rig-1025", label: "Rig 1025 — Kermit, TX" },
  ];

  const predefinedWeather = [
    { value: "clear", label: t("weather.opt.clear") },
    { value: "partly-cloudy", label: t("weather.opt.partlyCloudy") },
    { value: "overcast", label: t("weather.opt.overcast") },
    { value: "light-rain", label: t("weather.opt.lightRain") },
    { value: "heavy-rain", label: t("weather.opt.heavyRain") },
    { value: "thunderstorm", label: t("weather.opt.thunderstorm") },
    { value: "high-winds", label: t("weather.opt.highWinds") },
    { value: "fog", label: t("weather.opt.fog") },
    { value: "snow", label: t("weather.opt.snow") },
  ];

  const predefinedConditions = [
    { value: "normal", label: t("weather.cond.normal") },
    { value: "wet-surfaces", label: t("weather.cond.wetSurfaces") },
    { value: "muddy", label: t("weather.cond.muddy") },
    { value: "icy", label: t("weather.cond.icy") },
    { value: "high-dust", label: t("weather.cond.highDust") },
    { value: "scaffolding", label: t("weather.cond.scaffolding") },
    { value: "maintenance", label: t("weather.cond.maintenance") },
    { value: "restricted", label: t("weather.cond.restricted") },
  ];

  const crewMemberOptions = [
    { value: "d-harris", label: "D. Harris — Floorman (Day 1)" },
    { value: "m-johnson", label: "M. Johnson — Roughneck (Day 1)" },
    { value: "r-smith", label: "R. Smith — Derrickman (Day 2)" },
    { value: "j-williams", label: "J. Williams — Motorman (Day 1)" },
    { value: "t-brown", label: "T. Brown — Driller (Day 3)" },
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

  const addWeather = (weather: string) => {
    if (weather && !weatherConditions.includes(weather)) {
      setWeatherConditions([...weatherConditions, weather]);
    }
  };

  const removeWeather = (weather: string) => {
    setWeatherConditions(weatherConditions.filter((w) => w !== weather));
  };

  const addCondition = (condition: string) => {
    if (condition && !siteConditions.includes(condition)) {
      setSiteConditions([...siteConditions, condition]);
    }
  };

  const removeCondition = (condition: string) => {
    setSiteConditions(siteConditions.filter((c) => c !== condition));
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim()) {
      addCondition(customCondition.trim());
      setCustomCondition("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomCondition();
    }
  };

  const handleGenerate = () => {
    setShowModal(true);
  };

  return (
    <div
      className="flex flex-col h-screen w-screen"
      style={{ backgroundColor: "var(--bg-page)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Header */}
      <Header breadcrumb={t("header.siteConditions")} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex justify-center" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div style={{ width: "100%", maxWidth: 920, padding: 0, paddingBottom: 24 }}>
          {/* Step indicator */}
          

          

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 700, margin: 0, fontFamily: "Inter, sans-serif" }}>
              {t("weather.title")}
            </h1>
            
          </div>

          <div style={{ height: 20 }} />

          {/* Card */}
          <div
            style={{
              backgroundColor: "var(--bg-card)",
              border: "var(--border-default)",
              borderRadius: 8,
              padding: 24,
            }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="shrink-0 size-6">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path d="M12 2V4" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M4.93 4.93L6.34 6.34" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M20 12H22" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M19.07 4.93L17.66 6.34" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p136fbe40} stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p272a0af0} stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
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
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: "transparent",
                  border: "var(--border-active)",
                  borderRadius: 6,
                  padding: "6px 14px",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(43,85,151,0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d={svgPaths.p2023d200} stroke="var(--text-secondary)" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={svgPaths.p2d617c80} stroke="var(--text-secondary)" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("weather.autoDetect")}
              </button>
            </div>

            <div style={{ height: 16 }} />

            {/* Stacked inputs */}
            <div className="flex flex-col gap-8">
              {/* Rig - full width */}
              <SearchableSelect
                label={t("weather.rig")}
                value={selectedRig}
                onChange={setSelectedRig}
                options={rigOptions}
                placeholder={t("weather.selectRig")}
              />
              
              {/* Weather and Site Conditions - side by side on desktop */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <CreatableMultiSelect
                    label={t("weather.weather")}
                    values={weatherConditions}
                    onChange={setWeatherConditions}
                    predefinedOptions={predefinedWeather}
                    placeholder={t("weather.selectWeather")}
                  />
                </div>
                
                <div className="flex-1">
                  <CreatableMultiSelect
                    label={t("weather.siteConditions")}
                    values={siteConditions}
                    onChange={setSiteConditions}
                    predefinedOptions={predefinedConditions}
                    placeholder={t("weather.selectConditions")}
                  />
                </div>
              </div>

              {/* New Crew Member Dropdown */}
              <CreatableMultiSelect
                label={t("weather.newCrew")}
                values={newCrewMembers}
                onChange={setNewCrewMembers}
                predefinedOptions={crewMemberOptions}
                placeholder={t("weather.selectCrew")}
                showToggle={true}
                toggleValue={showCrewPlaceholder}
                onToggleChange={setShowCrewPlaceholder}
              />

              {/* Input Plan */}
              <SearchableSelect
                label={t("weather.inputPlan")}
                value={inputPlan}
                onChange={setInputPlan}
                options={planOptions}
                placeholder={t("weather.selectPlan")}
              />
            </div>
          </div>

          <div style={{ height: 20 }} />

          {/* Info callout */}
          <div
            className="flex items-start gap-3"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "var(--border-default)",
              borderRadius: 6,
              padding: "13px 17px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
              <g clipPath="url(#clip_info)">
                <path d={svgPaths.p39ee6532} stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d="M8 10.6667V8" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                <path d="M8 5.33333H8.00667" stroke="var(--color-info)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
              </g>
              <defs>
                <clipPath id="clip_info">
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
              <g clipPath="url(#clip_sparkle)">
                <path d={svgPaths.p115b3700} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M11.6667 1.75V4.08333" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M12.8333 2.91667H10.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M2.33333 9.91667V11.0833" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                <path d="M2.91667 10.5H1.75" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
              </g>
              <defs>
                <clipPath id="clip_sparkle">
                  <rect fill="white" height="14" width="14" />
                </clipPath>
              </defs>
            </svg>
          }
          onClick={handleGenerate}
          variant="primary"
        />
      </StickyFooter>

      {/* AI Processing Modal */}
      {showModal && <AIProcessingModal onComplete={() => navigate("/briefing")} />}
    </div>
  );
}