import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import ToggleSwitch from "./ToggleSwitch";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="theme-toggle-btn">
      {theme === "dark" ? <FiMoon /> : <FiSun />}
      <ToggleSwitch checked={theme === "dark"} onChange={toggleTheme} label="Toggle dark mode" />
    </div>
  );
}
