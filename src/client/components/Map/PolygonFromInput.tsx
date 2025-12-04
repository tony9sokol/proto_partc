import React, { useState } from "react";
import { Coordinate } from "../../modules/coordinates";

interface PolygonInputProps {
  onPolygonChange: (coords: Coordinate[]) => void;
}

export const PolygonFromInput: React.FC<PolygonInputProps> = ({
  onPolygonChange,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const coords: Coordinate[] = [];

    try {
      for (const line of lines) {
        const [lat, lng] = line.split(",").map(Number);
        if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid coordinate");
        coords.push(new Coordinate(lat, lng));
      }

      onPolygonChange(coords); // send to parent (Map.tsx)
      setText("");
      setShowInput(false);
    } catch (e) {
      alert("Invalid input. Use 'lat,lng' per line.");
    }
  };

  return (
    <div className="controls-wrapper">
      {" "}
      <button
        className="add-polygon-button"
        onClick={() => setShowInput((prev) => !prev)}
      >
        {showInput ? "Cancel" : "Add Polygon by Coordinates"}
      </button>
      {showInput && (
        <div className="polygon-input-area">
          <textarea
            rows={5}
            cols={30}
            placeholder="Enter one coordinate per line: lat,lng"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <br />
          <button className="create-polygon-button" onClick={handleSubmit}>
            Create Polygon
          </button>
        </div>
      )}
    </div>
  );
};
