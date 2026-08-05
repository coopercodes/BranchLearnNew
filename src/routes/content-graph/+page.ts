// The walker's game state lives in localStorage, so render on the client only —
// avoids hydrating over a server-rendered "fresh game" state.
export const ssr = false;
