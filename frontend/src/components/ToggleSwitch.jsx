export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="toggle" title={label} aria-label={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}
