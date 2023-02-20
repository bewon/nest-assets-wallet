import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSessionData, logoutUser } from "@src/utils/session";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import type { SessionData } from "@assets-wallet/api/src/auth/types";
import { useRouter } from "next/router";

type EndpointFunction<T> = (data?: object) => Promise<AxiosResponse<T>>;

const useApi = () => {
  const router = useRouter();
  const createEndpointFunction = <T>(
    url: string,
    method: AxiosRequestConfig["method"]
  ): EndpointFunction<T> => {
    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };
    return async (data?: object) => {
      const session = getSessionData();
      if (session != null && session.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
      }
      try {
        return await axios<T>({
          method,
          url,
          headers,
          data,
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          logoutUser();
          await router.push("/auth/login");
        }
        throw error;
      }
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
