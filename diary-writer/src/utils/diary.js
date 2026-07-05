export const CORRECT_PASSWORD = "tagebuch";

export const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const newEntry = () => ({
  id: crypto.randomUUID(),
  title: "",
  content: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  hidden: false,
});

export const countWords = (content) =>
  content.trim().split(/\s+/).filter(Boolean).length;
