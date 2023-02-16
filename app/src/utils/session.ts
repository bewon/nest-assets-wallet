import type { SessionData } from "@assets-wallet/api/src/auth/types";

const sessionDataKey = "session-data";

export function loginUser(data: SessionData) {
  if (data == null || !data.accessToken || !data.userEmail) {
    throw new Error("Invalid session data");
  }
  sessionStorage.setItem(sessionDataKey, JSON.stringify(data));
}

export function logoutUser() {
  sessionStorage.removeItem(sessionDataKey);
}

export function getSessionData(): SessionData | null {
  const rawSessionData = sessionStorage.getItem(sessionDataKey);
  if (!rawSessionData) {
    return null;
  }
  const sessionData = JSON.parse(rawSessionData);
  if (!sessionData.accessToken || !sessionData.userEmail) {
    return null;
  }
  return sessionData;
}
