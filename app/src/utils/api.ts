import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSessionData, logoutUser } from "@src/utils/session";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import type { SessionData } from "@assets-wallet/api/src/auth/types";

type EndpointFunction<T> = (data?: object) => Promise<AxiosResponse<T>>;

const useApi = () => {
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    const session = getSessionData();
    setToken(session?.accessToken);
  }, []);

  const createEndpointFunction = <T>(
    url: string,
    method: AxiosRequestConfig["method"]
  ): EndpointFunction<T> => {
    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return async (data?: object) => {
      try {
        return axios<T>({
          method,
          url,
          headers,
          data,
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          logoutUser();
        }
        throw error;
      }
    };
  };

  return {
    login: createEndpointFunction<SessionData>("/api/auth/login", "POST"),
    assetsSnapshot: createEndpointFunction<AssetSnapshot[]>(
      "/api/portfolio/default/assets-snapshot",
      "GET"
    ),
  };
};

export default useApi;
