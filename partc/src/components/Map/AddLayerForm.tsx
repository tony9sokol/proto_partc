// components/Map/AddLayerForm.tsx
import React, { useState } from "react";
import type { MapLayer } from "../../modules/MapLayer";

interface Props {
  onSaveLayer: (layer: MapLayer) => void;
  onCancel: () => void;
}

export function AddLayerForm({ onSaveLayer, onCancel }: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    const urlPattern = /^https?:\/\/.+/;
    if (!name.trim()) {
      setError("Layer name cannot be empty.");
      return;
    }
    if (!urlPattern.test(url)) {
      setError("Invalid URL format.");
      return;
    }
    onSaveLayer({ name, url });
    setName("");
    setUrl("");
    setError("");
  };

  return (
    <div className="add-layer-modal">
      <input
        placeholder="Layer name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Layer URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {error && <div className="error-message">{error}</div>}
      <div className="save-button">
        <button onClick={handleSave}>Save Layer</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
