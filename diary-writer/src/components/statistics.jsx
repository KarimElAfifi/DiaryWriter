// Statistics.jsx
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
    new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const stats = [
    { label: "Einträge gesamt", value: all.length },
    { label: "Sichtbare Einträge", value: visible.length },
    { label: "Ausgeblendet", value: all.length - visible.length },
    { label: "Wörter gesamt", value: totalWords.toLocaleString("de-DE") },
    { label: "Zeichen gesamt", value: totalChars.toLocaleString("de-DE") },
    { label: "Ø Wörter pro Eintrag", value: avgWords },
    {
      label: "Längster Titel",
      value: longestTitleEntry?.title
        ? `„${longestTitleEntry.title.slice(0, 22)}${longestTitleEntry.title.length > 22 ? "…" : ""}"`
        : "—",
    },
    {
      label: "Längster Eintrag",
      value: longestContentEntry?.title
        ? `„${longestContentEntry.title.slice(0, 22)}${longestContentEntry.title.length > 22 ? "…" : ""}"`
        : "—",
    },
    {
      label: "Erster Eintrag",
      value: oldestEntry ? formatDate(oldestEntry.createdAt) : "—",
    },
    {
      label: "Zuletzt bearbeitet",
      value: mostRecentEntry ? formatDate(mostRecentEntry.updatedAt) : "—",
    },
  ];

  return (
    <div className="stats-panel">
      <div className="stats-title">Statistiken</div>
      {all.length === 0 ? (
        <p className="stats-empty">Noch keine Einträge vorhanden.</p>
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