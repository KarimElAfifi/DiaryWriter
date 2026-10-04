// Statistics component
export default function Statistics({ entries }) {
  const visible = entries.filter((e) => !e.hidden);
  const all = entries;

  const totalWords = all.reduce((sum, e) => {
    return sum + e.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const totalChars = all.reduce((sum, e) => sum + e.content.length, 0);

  const longestTitleEntry = [...all].sort((a, b) => b.title.length - a.title.length)[0];
  const longestContentEntry = [...all].sort((a, b) => b.content.length - a.content.length)[0];

  const avgWords =
    all.length > 0 ? Math.round(totalWords / all.length) : 0;

  const mostRecentEntry = [...all].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )[0];

  const oldestEntry = [...all].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  )[0];

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const stats = [
    { label: "Total entries", value: all.length },
    { label: "Visible entries", value: visible.length },
    { label: "Hidden", value: all.length - visible.length },
    { label: "Total words", value: totalWords.toLocaleString("en-US") },
    { label: "Total characters", value: totalChars.toLocaleString("en-US") },
    { label: "Average words per entry", value: avgWords },
    {
      label: "Longest title",
      value: longestTitleEntry?.title
        ? `„${longestTitleEntry.title.slice(0, 22)}${longestTitleEntry.title.length > 22 ? "…" : ""}"`
        : "—",
    },
    {
      label: "Longest entry",
      value: longestContentEntry?.title
        ? `„${longestContentEntry.title.slice(0, 22)}${longestContentEntry.title.length > 22 ? "…" : ""}"`
        : "—",
    },
    {
      label: "First entry",
      value: oldestEntry ? formatDate(oldestEntry.createdAt) : "—",
    },
    {
      label: "Last edited",
      value: mostRecentEntry ? formatDate(mostRecentEntry.updatedAt) : "—",
    },
  ];

  return (
    <div className="stats-panel">
      <div className="stats-title">Statistics</div>
      {all.length === 0 ? (
        <p className="stats-empty">No entries yet.</p>
      ) : (
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-row">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
