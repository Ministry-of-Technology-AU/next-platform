"use client";

import React from "react";
import "./loading.css";

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="cat-loader">
        <div className="head">
          <div className="ear left"></div>
          <div className="ear right"></div>
          <div className="face">
            <div className="eye left"></div>
            <div className="eye right"></div>

            <div className="hair left">
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div className="hair right">
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className="nose"></div>
          </div>
        </div>
        <div className="table"></div>
      </div>
    </div>
  );
}
