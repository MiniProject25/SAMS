import { useMutation } from "@tanstack/react-query";
import { SERVER_URL } from "../../config/config";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "sonner";

export const useAddMacsMutation = () => {
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: async (macs: string[]) => {
      const res = await fetch(`${SERVER_URL}/api/asset/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ macAddress: macs }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add MACs");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("MAC addresses registered successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to add MAC addresses", {
        description: error.message,
      });
    },
  });
};
