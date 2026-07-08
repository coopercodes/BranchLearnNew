// Progress lives in localStorage, so render this page on the client only —
// avoids hydrating over a server-rendered "no progress" state.
export const ssr = false;
