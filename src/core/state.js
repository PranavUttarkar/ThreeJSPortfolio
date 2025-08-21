// Simple finite state machine for app modes
// Modes: homeStation, traveling, planetView, returning

export const AppState = {
  mode: "homeStation",
  target: null,
  listeners: new Set(),
};

export function setMode(mode, data = {}) {
  const prev = { mode: AppState.mode, target: AppState.target };
  AppState.mode = mode;
  if (data.target !== undefined) AppState.target = data.target;
  AppState.listeners.forEach((l) =>
    l({ prev, current: { mode: AppState.mode, target: AppState.target } })
  );
}

export function onStateChange(fn) {
  AppState.listeners.add(fn);
  return () => AppState.listeners.delete(fn);
}
