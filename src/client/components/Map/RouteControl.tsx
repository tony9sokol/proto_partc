import React from "react";

interface Props {
  onCalculateRoute: () => void;
  onAddLayer: () => void;
}

export const RouteControls = ({ onCalculateRoute, onAddLayer }: Props) => (
  <div className="controls-wrapper">
    <button className="add-map-button" onClick={onAddLayer}>
      Add Map Layer
    </button>

    <button className="calculate-button" onClick={onCalculateRoute}>
      Calculate Route
    </button>

  </div>
);
