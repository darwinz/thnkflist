// Test-env setup for CRA/Jest under React 19 + React Router 7.
//
// 1. jest-dom adds DOM assertion matchers (toBeInTheDocument, etc.).
// 2. jsdom 16 (shipped with react-scripts 5) doesn't expose TextEncoder /
//    TextDecoder globals, which react-router 7 requires at import time.
//    Polyfill from Node's `util` so the tests can load the router.

import { TextDecoder, TextEncoder } from "util";
import "@testing-library/jest-dom";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}
