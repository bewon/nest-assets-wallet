import React, { useEffect } from "react";
import { logoutUser } from "@src/utils/session";
import { useRouter } from "next/router";

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    logoutUser();
    router.push("/auth/login").catch((err) => console.error(err));
  }, [router]);
  return <div />;
}
