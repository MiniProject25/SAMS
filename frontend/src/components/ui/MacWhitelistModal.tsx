import { useState, useEffect, useCallback } from "react";
import { Cpu, X, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useAddAssetMutation } from "../../hooks/queries/useAddAssetMutation";

interface AssetDraft {
  name: string;
  mac: string;
}

interface RowErrors {
  name?: string;
  mac?: string;
}

interface MacWhitelistModalProps {
  onClose: () => void;
}

// regex for validating MAC addresses
const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$/;

// validates a single row and returns any errors found
const validateRow = (index: number, assets: AssetDraft[]): RowErrors => {
  const asset = assets[index];
  const errors: RowErrors = {};

  if (!asset.name.trim()) {
    errors.name = "Name is required";
  }

  const mac = asset.mac.trim();
  if (!mac) {
    errors.mac = "MAC address is required";
  } else if (!MAC_REGEX.test(mac)) {
    errors.mac = "Invalid MAC format";
  } else {
    const isDuplicate = assets.some((a, i) => a.mac === mac && i !== index);
    if (isDuplicate) {
      errors.mac = "Duplicate MAC address";
    }
  }

  return errors;
};

const MacWhitelistModal = ({ onClose }: MacWhitelistModalProps) => {
  const [assets, setAssets] = useState<AssetDraft[]>(() => {
    const saved = localStorage.getItem("blera_assets_draft");
    return saved ? JSON.parse(saved) : [{ name: "", mac: "" }];
  });

  const [errors, setErrors] = useState<Record<number, RowErrors>>({});
  const { mutate: addAssets, isPending } = useAddAssetMutation();

  useEffect(() => {
    localStorage.setItem("blera_assets_draft", JSON.stringify(assets));
  }, [assets]);

  const updateField = (index: number, field: keyof AssetDraft, value: string) => {
    setAssets((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === "mac" ? value.toUpperCase().trim() : value,
      };

      const rowErrors = validateRow(index, next);
      setErrors((errs) => ({ ...errs, [index]: rowErrors }));
      
      return next;
    });
  };

  const removeRow = (index: number) => {
    setAssets((prev) => {
      const next = prev.filter((_, i) => i !== index);
      
      // re-validate all rows to ensure indices and uniqueness are correct
      const nextErrors: Record<number, RowErrors> = {};
      next.forEach((_, i) => {
        const rowErrors = validateRow(i, next);
        if (Object.keys(rowErrors).length > 0) nextErrors[i] = rowErrors;
      });
      setErrors(nextErrors);
      
      return next;
    });
  };

  const addRow = () => {
    setAssets((prev) => [...prev, { name: "", mac: "" }]);
  };

  const validateAndSave = useCallback(() => {
    const allErrors: Record<number, RowErrors> = {};isPending
    let hasErrors = false;

    assets.forEach((_, i) => {
      const rowErrors = validateRow(i, assets);
      if (Object.keys(rowErrors).length > 0) {
        allErrors[i] = rowErrors;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(allErrors);
      return;
    }

    addAssets(assets, {
      onSuccess: () => {
        setAssets([{ name: "", mac: "" }]);
        localStorage.removeItem("blera_assets_draft");
        onClose();
      },
    });
  }, [assets, addAssets, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-(--color-card) border border-(--color-card-border) rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-(--color-card-border) flex justify-between items-center bg-gray-900/20">
          <div className="flex items-center gap-2 text-gray-200">
            <Cpu size={18} className="text-(--color-primary)" />
            <span className="font-bold">Whitelist Assets</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {assets.map((asset, i) => (
              <div
                key={i}
                className="space-y-2 p-3 rounded-lg bg-gray-900/10 border border-gray-800/50"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Device {i + 1}
                  </span>
                  {assets.length > 1 && (
                    <button
                      onClick={() => removeRow(i)}
                      className="text-red-500/50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    value={asset.name}
                    onChange={(e) => updateField(i, "name", e.target.value)}
                    placeholder="Asset Name"
                    className={`w-full bg-(--color-panel) border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none transition-all ${
                      errors[i]?.name
                        ? "border-red-500 ring-1 ring-red-500/10"
                        : "border-(--color-card-border) focus:border-(--color-primary)"
                    }`}
                  />
                  {errors[i]?.name && (
                    <span className="text-[10px] text-red-400 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors[i].name}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    value={asset.mac}
                    onChange={(e) => updateField(i, "mac", e.target.value)}
                    placeholder="00:1A:2B:3C:4D:5E"
                    className={`w-full bg-(--color-panel) border rounded-lg px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none transition-all ${
                      errors[i]?.mac
                        ? "border-red-500 ring-1 ring-red-500/10"
                        : "border-(--color-card-border) focus:border-(--color-primary)"
                    }`}
                  />
                  {errors[i]?.mac && (
                    <span className="text-[10px] text-red-400 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors[i].mac}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="mt-4 w-full py-2 border border-dashed border-gray-700 rounded-lg text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={14} /> Add Another Device
          </button>

          <button
            onClick={validateAndSave}
            disabled={isPending}
            className="mt-6 w-full py-2.5 bg-linear-to-r from-(--color-primary) to-(--color-sec) text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isPending && <Loader2 className="animate-spin h-4 w-4" />}
            {isPending ? "Registering..." : "Register Devices"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MacWhitelistModal;
