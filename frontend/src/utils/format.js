export function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: d.getDate(),
    mon: d.toLocaleString("en", { month: "short" }),
  };
}
