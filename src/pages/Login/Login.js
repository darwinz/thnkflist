import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/api";
import { FetchState } from "../../hooks";
import Mark from "../../design/Mark";
import Btn from "../../design/Btn";
import SignUp from "./SignUp";

export const GoogleButton = ({ label }) => (
  <button
    type="button"
    onClick={() => api.createOAuth2Session("google")}
    style={{
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "12px 16px",
      borderRadius: "var(--r-full)",
      border: "1px solid var(--paper-edge)",
      background: "transparent",
      color: "var(--ink)",
      font: "500 14px/1 var(--font-sans)",
      cursor: "pointer",
      transition: "border-color .15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ink-soft)")}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--paper-edge)")}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.28 14.3a7.19 7.19 0 0 1 0-4.6V6.6H1.27a12 12 0 0 0 0 10.8l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A12 12 0 0 0 12 0 12 12 0 0 0 1.27 6.6l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
    </svg>
    {label}
  </button>
);

export const Divider = () => (
  <div
    role="separator"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "22px 0",
    }}
  >
    <span style={{ flex: 1, height: 1, background: "var(--paper-edge)" }} />
    <span
      style={{
        font: "500 10px/1 var(--font-mono)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-mute)",
      }}
    >
      or
    </span>
    <span style={{ flex: 1, height: 1, background: "var(--paper-edge)" }} />
  </div>
);

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--paper)",
  border: "1px solid var(--paper-edge)",
  borderRadius: "var(--r-md)",
  outline: "none",
  font: "400 15px/1.4 var(--font-sans)",
  color: "var(--ink)",
  marginTop: 6,
  transition: "border-color .15s",
};

export const FieldLabel = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    style={{
      font: "500 10px/1 var(--font-mono)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--ink-mute)",
      display: "block",
      marginTop: 16,
    }}
  >
    {children}
  </label>
);

export const TextField = ({ id, type, value, onChange, autoComplete }) => (
  <input
    id={id}
    type={type}
    required
    value={value}
    autoComplete={autoComplete}
    onChange={(e) => onChange(e.target.value)}
    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ink-soft)")}
    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--paper-edge)")}
    style={inputStyle}
  />
);

export const Shell = ({ children }) => (
  <main
    style={{
      minHeight: "100vh",
      background: "var(--paper)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <header style={{ padding: "28px 32px", display: "flex", alignItems: "center", gap: 10 }}>
      <Mark size={26} />
      <span style={{ font: "400 18px/1 var(--font-serif)", letterSpacing: "-0.02em" }}>
        thnkflist
      </span>
    </header>
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px 64px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--paper)",
          border: "1px solid var(--paper-edge)",
          borderRadius: "var(--r-lg)",
          padding: "32px 28px",
        }}
      >
        {children}
      </div>
    </div>
  </main>
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
    <Shell>
      <h1
        style={{
          font: "300 36px/1 var(--font-serif)",
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          margin: 0,
        }}
      >
        welcome back
        <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>.</span>
      </h1>
      <p
        style={{
          font: "400 14px/1.5 var(--font-sans)",
          color: "var(--ink-soft)",
          marginTop: 8,
        }}
      >
        don't have an account?{" "}
        <button
          type="button"
          onClick={() => setRegister(true)}
          style={{
            background: "transparent",
            border: 0,
            padding: 0,
            color: "var(--ink)",
            textDecoration: "underline",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          sign up
        </button>
      </p>

      {error && (
        <div
          style={{
            marginTop: 18,
            padding: "10px 14px",
            border: "1px solid #C77670",
            borderRadius: "var(--r-md)",
            background: "color-mix(in oklab, #C77670 15%, var(--paper))",
            color: "var(--ink)",
            font: "400 13px/1.5 var(--font-sans)",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <GoogleButton label="continue with google" />
      </div>

      <Divider />

      <form onSubmit={handleLogin}>
        <FieldLabel htmlFor="login-email">email</FieldLabel>
        <TextField
          id="login-email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <FieldLabel htmlFor="login-password">password</FieldLabel>
        <TextField
          id="login-password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Btn
            type="submit"
            kind="primary"
            disabled={!email || !password}
          >
            log in
          </Btn>
        </div>
      </form>
    </Shell>
  );
};

export default Login;
