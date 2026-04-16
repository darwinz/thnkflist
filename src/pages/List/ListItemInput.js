import { useState } from "react";
import api from "../../api/api";

const ListItemInput = ({ userId, listId, onAdded }) => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const content = value.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    try {
      await api.createItem(userId, listId, content);
      setValue("");
      onAdded?.();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("add item failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3 py-3">
      <span className="text-gray-300 select-none">+</span>
      <input
        type="text"
        className="flex-1 text-lg bg-transparent border-0 focus:ring-0 px-0 placeholder-gray-400"
        placeholder="What are you grateful for?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={500}
      />
      <button
        type="submit"
        disabled={!value.trim() || submitting}
        className="text-sm font-medium px-3 py-1 rounded-md bg-gray-900 text-white disabled:opacity-40"
      >
        Add
      </button>
    </form>
  );
};

export default ListItemInput;
