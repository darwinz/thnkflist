// Backend selector. Picks between the Appwrite (legacy) and Supabase (new)
// implementations based on REACT_APP_BACKEND. Both expose the same surface
// — design components stay oblivious. Default is appwrite until the
// migration cuts over.
//
// Toggle locally with:
//   REACT_APP_BACKEND=supabase npm start
// Or persistently in .env.development.
import appwrite from "./appwrite";
import supabase from "./supabase";

const BACKEND = process.env.REACT_APP_BACKEND === "supabase" ? "supabase" : "appwrite";

const api = BACKEND === "supabase" ? supabase : appwrite;

export const backend = BACKEND;
export default api;
