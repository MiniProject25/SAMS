import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "../../config/config";
import { useAuthStore } from "../../store/useAuthStore";

export const useAlerts = (page: number, limit: number = 10) => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["alerts"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(`${SERVER_URL}/api/alert?page=${page}&limit=${limit}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      return response.json();
    },
    // This replaces onSuccess for data transformation
    select: (result) => {
       const formattedAlerts = result.data.map((rawAlert: any) => {
        let derivedCategory: "THERMAL" | "PERFORMANCE" | "INFO" = "INFO";

        if (rawAlert.metric.includes("TEMP")) derivedCategory = "THERMAL";
        else if (rawAlert.metric.includes("USAGE"))
          derivedCategory = "PERFORMANCE";

        return {
          id: rawAlert.id,
          assetId: rawAlert.assetId,
          severity: rawAlert.type, 
          type: rawAlert.metric,
          category: derivedCategory,
          message: rawAlert.message,
          isResolved: rawAlert.isResolved,
          createdAt: rawAlert.createdAt,
          updatedAt: rawAlert.updatedAt,
        };
      });

      return {
        alerts: formattedAlerts,
        totalPages: result.pagination?.totalPages || 1,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 min
    refetchOnWindowFocus: true,
  });
};
