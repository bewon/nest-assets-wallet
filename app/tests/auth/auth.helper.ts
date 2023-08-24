export function loginScript() {
  sessionStorage.setItem(
    "session-data",
    JSON.stringify({ accessToken: "hbgujbngfu", userEmail: "test@bewon.eu" })
  );
}
