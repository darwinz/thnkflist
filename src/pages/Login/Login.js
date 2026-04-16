import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/api";
import SignUp from "./SignUp";
import { FetchState } from "../../hooks";

const GoogleButton = ({ label }) => {
  const handleClick = () => {
    // Redirects the browser; Appwrite handles the round-trip.
    api.createOAuth2Session("google");
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.3a7.19 7.19 0 0 1 0-4.6V6.6H1.27a12 12 0 0 0 0 10.8l4.01-3.1z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A12 12 0 0 0 12 0 12 12 0 0 0 1.27 6.6l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
};

const Divider = () => (
  <div className="flex items-center gap-3 my-6" role="separator">
    <span className="flex-1 h-px bg-gray-200" />
    <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
    <span className="flex-1 h-px bg-gray-200" />
  </div>
);

const Login = ({ dispatch }) => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchParams.get("error") === "oauth_failed") {
      setError("Google sign-in was cancelled or failed. Try again.");
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    dispatch({ type: FetchState.FETCH_INIT });
    try {
      await api.createSession(email, password);
      const data = await api.getAccount();
      dispatch({ type: FetchState.FETCH_SUCCESS, payload: data });
    } catch (e) {
      setError(e.message || "Failed to log in. Check your credentials.");
      dispatch({ type: FetchState.FETCH_FAILURE });
    }
  };

  if (register) {
    return <SignUp setRegister={setRegister} dispatch={dispatch} />;
  }

  return (
    <section className="container h-screen mx-auto flex">
      <div className="flex-grow flex flex-col max-w-xl justify-center p-6">
        <h1 className="text-6xl font-bold">Login</h1>
        <p className="mt-6">
          Don't have an account?{" "}
          <span
            className="cursor-pointer underline"
            onClick={() => setRegister(true)}
          >
            Sign up
          </span>
        </p>
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6">
          <GoogleButton label="Continue with Google" />
        </div>

        <Divider />

        <form onSubmit={handleLogin}>
          <label className="block"> Email</label>
          <input
            className="w-full p-4 placeholder-gray-400 text-gray-700 bg-white text-lg border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-gray-900"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block mt-6"> Password</label>
          <input
            className="w-full p-4 placeholder-gray-400 text-gray-700 bg-white text-lg border-0 border-b-2 border-gray-400 focus:ring-0 focus:border-gray-900"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-6">
            <button
              type="submit"
              disabled={!email || !password}
              className="mx-auto mt-4 py-4 px-16 font-semibold rounded-lg shadow-md bg-gray-900 text-white border hover:border-gray-900 hover:text-gray-900 hover:bg-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
