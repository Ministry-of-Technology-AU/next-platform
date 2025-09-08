import React from "react";
import "./loading.css";

export default function Loader() {
  return (
    <div className="loader">
      <div className="track">
        <div className="mouse"></div>
      </div>
      <div className="face">
        <div className="ears-container"></div>
        <div className="eyes-container">
          <div className="eye"></div>
          <div className="eye"></div>
        </div>
        <div className="phiz">
          <div className="nose"></div>
          <div className="lip"></div>
          <div className="mouth"></div>
        </div>
      </div>
    </div>
  );
}
