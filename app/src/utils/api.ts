import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSessionData } from "@src/utils/session";

type EndpointFunction = (data?: object) => Promise<AxiosResponse>;

const useApi = () => {
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    const session = getSessionData();
    setToken(session?.accessToken);
  }, []);

  const createEndpointFunction = (
    url: string,
    method: AxiosRequestConfig["method"]
  ): EndpointFunction => {
    const headers: AxiosRequestConfig["headers"] = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return async (data?: object) => {
      return axios({
        method,
        url,
        headers,
        data,
      });
    };
  };

  return {
    login: createEndpointFunction("/api/auth/login", "POST"),
  };
};

export default useApi;
