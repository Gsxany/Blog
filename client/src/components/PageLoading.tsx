import React from "react";
import "./loading.css";

export const PageLoading = () => {
  return (
    <>
      <div className="cssload-dots">
        <div className="cssload-dot"></div>
        <div className="cssload-dot"></div>
        <div className="cssload-dot"></div>
        <div className="cssload-dot"></div>
        <div className="cssload-dot"></div>
      </div>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation="12"
            ></feGaussianBlur>
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0	0 1 0 0 0	0 0 1 0 0	0 0 0 18 -7"
              result="goo"
            ></feColorMatrix>
          </filter>
        </defs>
      </svg>

      <div id="fountainTextG">
        <div id="fountainTextG_1" className="fountainTextG">
          L
        </div>
        <div id="fountainTextG_2" className="fountainTextG">
          o
        </div>
        <div id="fountainTextG_3" className="fountainTextG">
          a
        </div>
        <div id="fountainTextG_4" className="fountainTextG">
          d
        </div>
        <div id="fountainTextG_5" className="fountainTextG">
          i
        </div>
        <div id="fountainTextG_6" className="fountainTextG">
          n
        </div>
        <div id="fountainTextG_7" className="fountainTextG">
          g
        </div>
      </div>
    </>
  );
};
