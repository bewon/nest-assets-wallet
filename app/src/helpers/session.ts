export type SessionData = {
  accessToken: string;
  userEmail: string;
};

export function loginUser(data: SessionData) {
  // make sure that data has the correct type
  if (!data.accessToken || !data.userEmail) {
    throw new Error("Invalid session data");
  }
  sessionStorage.setItem("session-data", JSON.stringify(data));
}

export function logoutUser() {
  sessionStorage.removeItem("session-data");
}

export function getSessionData(): SessionData | null {
  const rawSessionData = sessionStorage.getItem("session-data");
  if (!rawSessionData) {
    return null;
  }
  const sessionData = JSON.parse(rawSessionData);
  if (!sessionData.accessToken || !sessionData.userEmail) {
    return null;
  }
  return sessionData;
}
