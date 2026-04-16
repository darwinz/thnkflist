import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const NewListButton = ({ userId, onCreated, className = "" }) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!userId || creating) return;
    setCreating(true);
    try {
      const list = await api.createList(userId);
      onCreated?.(list);
      navigate(`/lists/${list.$id}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("create list failed", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={create}
      disabled={creating}
      className={`py-3 px-6 font-semibold rounded-lg shadow-sm bg-white text-gray-900 border border-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none disabled:opacity-50 ${className}`}
    >
      {creating ? "Creating…" : "Start a new list"}
    </button>
  );
};

export default NewListButton;
