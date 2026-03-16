import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/useAuthStore"
import { SERVER_URL } from "../../config/config";


export const useWarRoom = (page: number, limit: number = 10, search: string = "", category: string = "ALL") => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["war-room-alerts", page, limit, search, category],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(
        `${SERVER_URL}/api/asset/report?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&category=${category}`, 
        {
          headers: { 
            "authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true" 
          },
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch war room data");
      return response.json();
    },
    placeholderData: keepPreviousData,
    refetchInterval: 15000, 
  });
};