import { useState } from "react";
import api from "../../api/api";
import { FetchState } from "../../hooks";
import Btn from "../../design/Btn";
import {
  Divider,
  FieldLabel,
  GoogleButton,
  Shell,
  TextField,
} from "./Login";

const SignUp = ({ setRegister, dispatch }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    dispatch({ type: FetchState.FETCH_INIT });
    try {
      await api.createAccount(email, password, name);
      await api.createSession(email, password);
      const user = await api.getAccount();
      dispatch({ type: FetchState.FETCH_SUCCESS, payload: user });
    } catch (e) {
      setError(e.message || "Sign-up failed.");
      dispatch({ type: FetchState.FETCH_FAILURE });
    }
  };

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
        begin
        <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>.</span>
      </h1>
      <p
        style={{
          font: "400 14px/1.5 var(--font-sans)",
          color: "var(--ink-soft)",
          marginTop: 8,
        }}
      >
        already have an account?{" "}
        <button
          type="button"
          onClick={() => setRegister(false)}
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
          log in
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
        <GoogleButton label="sign up with google" />
      </div>

      <Divider />

      <form onSubmit={handleSignup}>
        <FieldLabel htmlFor="signup-name">name</FieldLabel>
        <TextField
          id="signup-name"
          type="text"
          value={name}
          onChange={setName}
          autoComplete="name"
        />
        <FieldLabel htmlFor="signup-email">email</FieldLabel>
        <TextField
          id="signup-email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <FieldLabel htmlFor="signup-password">password</FieldLabel>
        <TextField
          id="signup-password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Btn
            type="submit"
            kind="primary"
            disabled={!name || !email || !password}
          >
            create account
          </Btn>
        </div>
      </form>
    </Shell>
  );
};

export default SignUp;
