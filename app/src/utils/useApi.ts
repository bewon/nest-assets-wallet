import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getSessionData, logoutUser } from "@src/utils/session";
import type {
  AssetBalanceChangeInterface,
  AssetSnapshotInterface,
  HistoryStatistics,
  PortfolioPerformanceStatistics,
} from "@assets-wallet/api/src/portfolio/types";
import type { SessionData } from "@assets-wallet/api/src/auth/types";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { AppSnackbarState } from "@src/components/AppSnackbar";

type EndpointFunction<T> = (config: {
  data?: Record<string, any>;
  params?: Record<string, any>;
}) => {
  makeRequest: () => Promise<AxiosResponse<T> | null>;
  abortRequest: () => void;
};

const createEndpointFunction = <T>(
  url: string,
  method: AxiosRequestConfig["method"],
  handleError: (error: any) => Promise<boolean> | null
): EndpointFunction<T> => {
  const headers: AxiosRequestConfig["headers"] = {
    "Content-Type": "application/json",
  };
  return ({ data, params }) => {
    const session = getSessionData();
    if (session != null && session.accessToken) {
      headers["Authorization"] = `Bearer ${session.accessToken}`;
    }
    let urlWithParams = url;
    if (params != null) {
      Object.entries(params).forEach(([key, value]) => {
        const paramRegex = new RegExp(`:${key}`);
        if (paramRegex.test(urlWithParams)) {
          urlWithParams = urlWithParams.replace(paramRegex, value);
          delete params[key];
        }
      });
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    const abortRequest = () => {
      abortController.abort();
    };
    const makeRequest = () =>
      axios
        .request<T>({
          method,
          url: urlWithParams,
          headers,
          data,
          signal,
          params,
        })
        .catch((error) => handleError(error) && null);
    return { makeRequest, abortRequest };
  };
};

const useApi = () => {
  const router = useRouter();
  const changeRoute = router.push;

  return useMemo(() => {
    const prepareErrorHandler =
      (redirectOnUnauthorized: boolean) => (error: any) => {
        if (error.response?.status === 401 && redirectOnUnauthorized) {
          console.log("Unauthorized, logging out");
          logoutUser();
          return changeRoute("/auth/login");
        } else if (!axios.isCancel(error)) {
          throw error;
        }
        return null;
      };

    return {
      login: createEndpointFunction<SessionData>(
        "/api/auth/login",
        "POST",
        prepareErrorHandler(false)
      ),
      getAssetsSnapshot: createEndpointFunction<AssetSnapshotInterface[]>(
        "/api/portfolios/default/assets-snapshot",
        "GET",
        prepareErrorHandler(true)
      ),
      getPerformanceStatistics:
        createEndpointFunction<PortfolioPerformanceStatistics>(
          "/api/portfolios/default/performance-statistics",
          "GET",
          prepareErrorHandler(true)
        ),
      getGroupPerformanceStatistics:
        createEndpointFunction<PortfolioPerformanceStatistics>(
          "/api/portfolios/default/group-performance",
          "GET",
          prepareErrorHandler(true)
        ),
      getHistoryStatistics: createEndpointFunction<HistoryStatistics>(
        "/api/portfolios/default/history-statistics",
        "GET",
        prepareErrorHandler(true)
      ),
      getPortfolioGroups: createEndpointFunction<string[]>(
        "/api/portfolios/default/groups",
        "GET",
        prepareErrorHandler(true)
      ),
      createAsset: createEndpointFunction<AssetSnapshotInterface>(
        "/api/portfolios/default/assets",
        "POST",
        prepareErrorHandler(true)
      ),
      updateAsset: createEndpointFunction<AssetSnapshotInterface>(
        "/api/assets/:assetId",
        "POST",
        prepareErrorHandler(true)
      ),
      deleteAsset: createEndpointFunction<void>(
        "/api/assets/:assetId",
        "DELETE",
        prepareErrorHandler(true)
      ),
      getAssetBalanceChanges: createEndpointFunction<
        AssetBalanceChangeInterface[]
      >(
        "/api/assets/:assetId/balance-changes",
        "GET",
        prepareErrorHandler(true)
      ),
      createBalanceChange: createEndpointFunction<void>(
        "/api/assets/:assetId/balance-changes",
        "POST",
        prepareErrorHandler(true)
      ),
      updateBalanceChange: createEndpointFunction<void>(
        "/api/assets/:assetId/balance-changes/:changeId",
        "POST",
        prepareErrorHandler(true)
      ),
      deleteBalanceChange: createEndpointFunction<void>(
        "/api/assets/:assetId/balance-changes/:changeId",
        "DELETE",
        prepareErrorHandler(true)
      ),
    };
  }, [changeRoute]);
};

export default useApi;

export async function callApi<T>(
  makeRequest: () => Promise<AxiosResponse<T> | null>,
  setData: (data: T) => void,
  generalErrorMessage: string,
  setSnackbarState: (state: AppSnackbarState) => void
) {
  try {
    const response = await makeRequest();
    if (response?.data) {
      setData(response.data);
    }
  } catch (error: any) {
    setSnackbarState({
      open: true,
      message: error.response?.data?.message ?? generalErrorMessage,
      severity: "error",
    });
  }
}
