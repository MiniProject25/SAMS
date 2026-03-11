import { useQuery } from "@tanstack/react-query";
import { SERVER_URL } from "../../config/config";
import { useAuthStore } from "../../store/useAuthStore";

export const useAlerts = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["alerts"],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(`${SERVER_URL}/api/alert`, {
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
      return result.data.map((rawAlert: any) => {
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
    },
    staleTime: 1000 * 60, // 1 min
    refetchOnWindowFocus: true,
  });
};
