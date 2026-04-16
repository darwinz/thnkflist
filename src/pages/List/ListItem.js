import { useEffect, useRef, useState } from "react";
import api from "../../api/api";
import { deleteButton } from "../icons";

const ListItem = ({ item, onChanged }) => {
  const [value, setValue] = useState(item.content);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(item.content);
  }, [item.$id, item.content]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    setEditing(false);
    const next = value.trim();
    if (!next) {
      setValue(item.content);
      return;
    }
    if (next === item.content) return;
    try {
      await api.updateItem(item.$id, { content: next });
      onChanged?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("item update failed", e);
    }
  };

  const remove = async () => {
    try {
      await api.deleteItem(item.$id);
      onChanged?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("item delete failed", e);
    }
  };

  return (
    <li className="group flex items-center gap-3 py-2 border-b border-gray-100">
      <span className="text-gray-400 select-none">•</span>
      {editing ? (
        <input
          ref={inputRef}
          className="flex-1 bg-transparent border-0 focus:ring-0 px-0"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setValue(item.content);
              setEditing(false);
            }
          }}
          maxLength={500}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 text-left text-lg"
        >
          {item.content}
        </button>
      )}
      <button
        type="button"
        onClick={remove}
        aria-label="Delete item"
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
      >
        {deleteButton}
      </button>
    </li>
  );
};

export default ListItem;
