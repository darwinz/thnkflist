import { useRef, useState } from "react";
import TitleField from "./TitleField";
import MoodChip from "./MoodChip";
import MoodPicker from "./MoodPicker";
import ListRow from "./ListRow";
import { moodFor } from "./moods";

const fmtDate = (d) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
const fmtTime = (d) =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const dayPart = (d) => {
  const h = d.getHours();
  if (h < 5) return "late night";
  if (h < 11) return "morning";
  if (h < 14) return "midday";
  if (h < 18) return "afternoon";
  if (h < 21) return "evening";
  return "night";
};
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * ListEditor — the center surface. Wraps the data layer with prop callbacks
 * so the design code stays free of Appwrite specifics.
 *
 * Props:
 *   list      — { $id, title, note, mood, $createdAt }
 *   items     — array of { $id, content }
 *   readonly  — disable all editing
 *   bodyType  — 'serif' | 'sans'
 *   moodTreatment — 'chip' | 'tint' | 'header'
 *   layoutKind — 'library' | 'desk' | 'almanac' (used for padding tweaks)
 *   onTitleChange(string)
 *   onMoodChange(string|null)
 *   onNoteChange(string)
 *   onAddItem(string)
 *   onUpdateItem(itemId, string)
 *   onRemoveItem(itemId)
 */
const ListEditor = ({
  list,
  items,
  readonly = false,
  bodyType = "serif",
  moodTreatment = "chip",
  layoutKind = "library",
  onTitleChange,
  onMoodChange,
  onNoteChange,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}) => {
  const itemFont =
    bodyType === "serif"
      ? "400 19px/1.55 var(--font-serif)"
      : "400 16px/1.55 var(--font-sans)";
  const noteFont = "italic 400 15px/1.6 var(--font-serif)";

  const [moodOpen, setMoodOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState(list.note ?? "");
  const moodBtnRef = useRef(null);

  // Keep the note buffer in sync when switching lists.
  const lastListId = useRef(list.$id);
  if (lastListId.current !== list.$id) {
    lastListId.current = list.$id;
    setNote(list.note ?? "");
    setDraft("");
  }

  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    onAddItem?.(v);
    setDraft("");
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const m = moodFor(list.mood);
  const date = new Date(list.$createdAt);
  const today = sameDay(date, new Date());

  const tintBg =
    moodTreatment === "tint" && m
      ? `linear-gradient(180deg, ${m.color}14, transparent 240px), var(--paper-deep)`
      : "transparent";

  const contextLabel = today
    ? `${date.toLocaleDateString(undefined, { weekday: "long" })} · ${dayPart(date)}`
    : `${fmtDate(date).toLowerCase()} · ${fmtTime(date)}`;

  return (
    <div
      style={{
        background: tintBg,
        borderRadius: 16,
        position: "relative",
        padding: layoutKind === "desk" ? "8px 4px 24px" : "4px 4px 24px",
        transition: "background .3s ease",
      }}
    >
      {moodTreatment === "header" && m && (
        <div
          style={{
            height: 80,
            borderRadius: "12px 12px 0 0",
            background: `linear-gradient(135deg, ${m.color}60 0%, ${m.color}20 100%)`,
            marginBottom: 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 24,
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--ink)",
            }}
          >
            <span
              style={{
                fontSize: 28,
                color: "#fff",
                textShadow: `0 1px 2px ${m.color}80`,
              }}
              aria-hidden="true"
            >
              {m.glyph}
            </span>
            <span style={{ font: "italic 400 18px/1 var(--font-serif)" }}>
              feeling {m.name.toLowerCase()}
            </span>
          </div>
        </div>
      )}

      {/* head */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          padding: "0 4px",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              font: "500 10px/1 var(--font-mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
              marginBottom: 10,
            }}
          >
            {contextLabel}
          </div>
          <TitleField
            value={list.title || ""}
            placeholder={
              today
                ? "today, gratefully"
                : date.toLocaleDateString(undefined, { month: "long", day: "numeric" }).toLowerCase()
            }
            readonly={readonly}
            onChange={(v) => onTitleChange?.(v || null)}
          />
        </div>
        {moodTreatment !== "header" && (
          <div ref={moodBtnRef}>
            {m ? (
              <MoodChip mood={list.mood} onClick={readonly ? null : () => setMoodOpen(true)} />
            ) : (
              !readonly && (
                <button
                  type="button"
                  onClick={() => setMoodOpen(true)}
                  style={{
                    font: "italic 400 13px/1 var(--font-serif)",
                    color: "var(--ink-mute)",
                    background: "transparent",
                    border: "1px dashed var(--paper-edge)",
                    borderRadius: "var(--r-full)",
                    padding: "6px 14px",
                    cursor: "pointer",
                  }}
                >
                  + how does it feel?
                </button>
              )
            )}
          </div>
        )}
        {moodOpen && (
          <MoodPicker
            anchor={moodBtnRef.current}
            value={list.mood}
            onChange={(v) => onMoodChange?.(v)}
            onClose={() => setMoodOpen(false)}
          />
        )}
      </div>

      {/* list */}
      <ol style={{ listStyle: "none", margin: 0, padding: "0 4px" }}>
        {items.map((it, i) => (
          <ListRow
            key={it.$id}
            index={i}
            value={it.content}
            font={itemFont}
            readonly={readonly}
            onCommit={(v) => onUpdateItem?.(it.$id, v)}
            onRemove={() => onRemoveItem?.(it.$id)}
          />
        ))}
        {!readonly && (
          <li
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              padding: "12px 0",
              borderBottom: "1px dashed var(--paper-edge)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                font: "500 11px/1 var(--font-mono)",
                color: "var(--accent)",
                minWidth: 24,
              }}
            >
              {String(items.length + 1).padStart(2, "0")}
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              onBlur={submit}
              placeholder="one small thing…"
              maxLength={500}
              aria-label="Add a new item"
              style={{
                flex: 1,
                background: "transparent",
                border: 0,
                outline: "none",
                font: itemFont,
                color: "var(--ink)",
                padding: "4px 0",
                fontStyle: draft ? "normal" : "italic",
              }}
            />
          </li>
        )}
      </ol>

      {/* note */}
      <div
        style={{
          marginTop: 32,
          padding: "20px 4px 0",
          borderTop: "1px solid var(--paper-edge)",
        }}
      >
        <div
          style={{
            font: "500 10px/1 var(--font-mono)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            marginBottom: 10,
          }}
        >
          Note
        </div>
        {readonly ? (
          <p
            style={{
              margin: 0,
              font: noteFont,
              color: note ? "var(--ink-soft)" : "var(--ink-mute)",
              opacity: note ? 1 : 0.7,
            }}
          >
            {note || "— no note for this list —"}
          </p>
        ) : (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => {
              if ((list.note ?? "") !== note) onNoteChange?.(note || null);
            }}
            placeholder="a sentence or two, for later…"
            rows={2}
            maxLength={1000}
            style={{
              width: "100%",
              resize: "vertical",
              background: "transparent",
              border: 0,
              outline: "none",
              padding: 0,
              font: noteFont,
              color: "var(--ink-soft)",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ListEditor;
