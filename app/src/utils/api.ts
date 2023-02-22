import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSessionData, logoutUser } from "@src/utils/session";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import type { SessionData } from "@assets-wallet/api/src/auth/types";
import { useRouter } from "next/router";

type EndpointFunction<T> = (data?: object) => {
  makeRequest: () => Promise<AxiosResponse<T> | null>;
  abortRequest: () => void;
};

const useApi = () => {
  const router = useRouter();
  const createEndpointFunction = <T>(
    url: string,
    method: AxiosRequestConfig["method"]
  ): EndpointFunction<T> => {
    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };
    return (data?: object) => {
      const session = getSessionData();
      if (session != null && session.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }
      const abortController = new AbortController();

      const abortRequest = () => {
        abortController.abort();
      };

      const makeRequest = () =>
        axios
          .request<T>({
            method,
            url,
            headers,
            data,
            signal: abortController.signal,
          })
          .catch((error) => {
            if (error.response?.status === 401) {
              console.log("Unauthorized, logging out");
              logoutUser();
              router.push("/auth/login");
            } else if (!axios.isCancel(error)) {
              throw error;
            }
            return null;
          });
      return { makeRequest, abortRequest };
    };
  };

  return {
    login: createEndpointFunction<SessionData>("/api/auth/login", "POST"),
    getAssetsSnapshot: createEndpointFunction<AssetSnapshot[]>(
      "/api/portfolios/default/assets-snapshot",
      "GET"
    ),
  };
};

export default useApi;
