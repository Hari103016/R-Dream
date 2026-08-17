import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import { supabase } from "../services/supabase";

import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
} from "lucide-react";

import "./LayoutMap.css";


/* =========================================================
   SVG FILE
========================================================= */

const SVG_URL = "/GUDIMETLA_LAYOUT.svg";


/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  available: "#22c55e",
  booked: "#f59e0b",
  reserved: "#f59e0b",
  sold: "#ef4444",
};


/* =========================================================
   NUMBER REGEX

   IMPORTANT:
   This correctly handles:
   .12
   -.12
   0.12
========================================================= */

const NUMBER_REGEX =
  /-?(?:\d+(?:\.\d*)?|\.\d+)/g;


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(value) {
  const status = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");

  if (
    status === "booked" ||
    status === "booking" ||
    status === "reserved" ||
    status === "advance paid" ||
    status === "advancepaid"
  ) {
    return "booked";
  }

  if (
    status === "sold" ||
    status === "registration completed" ||
    status === "registered"
  ) {
    return "sold";
  }

  return "available";
}


/* =========================================================
   GET PLOT NUMBER FROM SUPABASE
========================================================= */

function getPlotNumber(plot) {
  return Number(
    plot?.plot_number ??
      plot?.plotNumber ??
      plot?.plot_no ??
      plot?.plotNo ??
      plot?.number ??
      plot?.plot_id
  );
}


/* =========================================================
   GET STATUS FROM SUPABASE
========================================================= */

function getPlotStatus(plot) {
  return normalizeStatus(
    plot?.status ??
      plot?.plot_status ??
      plot?.booking_status ??
      plot?.availability ??
      "available"
  );
}


/* =========================================================
   PARSE SVG MATRIX

   Example:
   matrix(.12 0 -0 .12 14 1656)

   IMPORTANT:
   Do NOT use a regex that converts ".12"
   into "12".
========================================================= */

function parseMatrix(transform) {
  const values = String(transform || "")
    .match(NUMBER_REGEX);

  if (!values || values.length < 6) {
    return [
      1,
      0,
      0,
      1,
      0,
      0,
    ];
  }

  return values
    .slice(0, 6)
    .map(Number);
}


/* =========================================================
   TRANSFORM POINT
========================================================= */

function transformPoint(
  x,
  y,
  matrix
) {
  const [
    a,
    b,
    c,
    d,
    e,
    f,
  ] = matrix;

  return {
    x:
      a * x +
      c * y +
      e,

    y:
      b * x +
      d * y +
      f,
  };
}


/* =========================================================
   EXTRACT PLOT NUMBERS
========================================================= */

function extractPlotCenters(
  svgDocument
) {
  const textElements = [
    ...svgDocument.querySelectorAll(
      "text"
    ),
  ];

  const plots = [];

  for (
    const textElement of textElements
  ) {
    const rawText =
      textElement.textContent
        .trim();

    if (
      !/^\d+$/.test(rawText)
    ) {
      continue;
    }

    const plotNumber =
      Number(rawText);

    if (
      plotNumber < 1 ||
      plotNumber > 272
    ) {
      continue;
    }

    /*
      Plot-number text in this SVG
      normally uses font-size around
      73.457.

      Plot 1 and Plot 2 use larger
      fonts, so we allow > 65.
    */

    const fontSize =
      parseFloat(
        textElement.getAttribute(
          "font-size"
        ) || "0"
      );

    if (
      fontSize < 65
    ) {
      continue;
    }

    const tspan =
      textElement.querySelector(
        "tspan"
      );

    if (!tspan) {
      continue;
    }

    const xValues =
      String(
        tspan.getAttribute(
          "x"
        ) || ""
      )
        .trim()
        .split(/\s+/);

    const yValue =
      parseFloat(
        tspan.getAttribute(
          "y"
        )
      );

    if (
      !xValues.length ||
      !Number.isFinite(yValue)
    ) {
      continue;
    }

    const xValue =
      parseFloat(
        xValues[0]
      );

    if (
      !Number.isFinite(xValue)
    ) {
      continue;
    }

    const matrix =
      parseMatrix(
        textElement.getAttribute(
          "transform"
        )
      );

    const position =
      transformPoint(
        xValue,
        yValue,
        matrix
      );

    plots.push({
      plotNumber,
      x: position.x,
      y: position.y,
    });
  }


  /*
    Remove duplicate number
    positions.
  */

  const unique = [];

  const seen =
    new Set();

  for (
    const plot of plots
  ) {
    const key =
      `${plot.plotNumber}_${plot.x.toFixed(
        1
      )}_${plot.y.toFixed(1)}`;

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    unique.push(plot);
  }

  /*
    Sort by plot number.
  */

  unique.sort(
    (a, b) =>
      a.plotNumber -
      b.plotNumber
  );

  console.log(
    "SVG plot numbers detected:",
    unique.length
  );

  return unique;
}


/* =========================================================
   EXTRACT BLACK HORIZONTAL / VERTICAL LINES
========================================================= */

function extractBoundaryLines(
  svgDocument
) {
  const horizontal = [];
  const vertical = [];

  const paths = [
    ...svgDocument.querySelectorAll(
      "path"
    ),
  ];

  for (
    const path of paths
  ) {
    const stroke =
      String(
        path.getAttribute(
          "stroke"
        ) || ""
      )
        .trim()
        .toLowerCase();

    /*
      Only black lines.

      Blue roads and red outer
      boundary are excluded.
    */

    if (
      stroke !== "#000000" &&
      stroke !== "black"
    ) {
      continue;
    }

    const d =
      String(
        path.getAttribute(
          "d"
        ) || ""
      ).trim();

    /*
      Only pure horizontal /
      vertical paths.

      Circle paths are ignored.
    */

    const match =
      d.match(
        /^M\s*([-\d.]+)\s+([-\d.]+)\s*([HV])\s*([-\d.]+)\s*$/
      );

    if (!match) {
      continue;
    }

    const x =
      Number(match[1]);

    const y =
      Number(match[2]);

    const type =
      match[3];

    const end =
      Number(match[4]);

    const matrix =
      parseMatrix(
        path.getAttribute(
          "transform"
        )
      );


    /* =====================================================
       HORIZONTAL
    ===================================================== */

    if (
      type === "H"
    ) {
      const p1 =
        transformPoint(
          x,
          y,
          matrix
        );

      const p2 =
        transformPoint(
          end,
          y,
          matrix
        );

      const x1 =
        Math.min(
          p1.x,
          p2.x
        );

      const x2 =
        Math.max(
          p1.x,
          p2.x
        );

      const length =
        x2 - x1;

      /*
        Plot-number circles are
        approximately 19px wide.

        Ignore those.
      */

      if (
        length < 25
      ) {
        continue;
      }

      horizontal.push({
        y: p1.y,
        x1,
        x2,
        length,
      });
    }


    /* =====================================================
       VERTICAL
    ===================================================== */

    if (
      type === "V"
    ) {
      const p1 =
        transformPoint(
          x,
          y,
          matrix
        );

      const p2 =
        transformPoint(
          x,
          end,
          matrix
        );

      const y1 =
        Math.min(
          p1.y,
          p2.y
        );

      const y2 =
        Math.max(
          p1.y,
          p2.y
        );

      const length =
        y2 - y1;

      if (
        length < 25
      ) {
        continue;
      }

      vertical.push({
        x: p1.x,
        y1,
        y2,
        length,
      });
    }
  }

  console.log(
    "Boundary lines:",
    {
      horizontal:
        horizontal.length,

      vertical:
        vertical.length,
    }
  );

  return {
    horizontal,
    vertical,
  };
}


/* =========================================================
   FIND HORIZONTAL BOUNDARY
========================================================= */

function findHorizontalBoundary(
  lines,
  x,
  y,
  direction
) {
  const candidates =
    lines.filter(
      (line) => {
        const crossesX =
          line.x1 <= x + 2 &&
          line.x2 >= x - 2;

        if (!crossesX) {
          return false;
        }

        if (
          direction === "top"
        ) {
          return (
            line.y <
            y - 5
          );
        }

        return (
          line.y >
          y + 5
        );
      }
    );

  if (
    !candidates.length
  ) {
    return null;
  }

  candidates.sort(
    (a, b) =>
      Math.abs(
        a.y - y
      ) -
      Math.abs(
        b.y - y
      )
  );

  return candidates[0];
}


/* =========================================================
   FIND VERTICAL BOUNDARY
========================================================= */

function findVerticalBoundary(
  lines,
  x,
  y,
  direction
) {
  const candidates =
    lines.filter(
      (line) => {
        const crossesY =
          line.y1 <= y + 2 &&
          line.y2 >= y - 2;

        if (!crossesY) {
          return false;
        }

        if (
          direction === "left"
        ) {
          return (
            line.x <
            x - 5
          );
        }

        return (
          line.x >
          x + 5
        );
      }
    );

  if (
    !candidates.length
  ) {
    return null;
  }

  candidates.sort(
    (a, b) =>
      Math.abs(
        a.x - x
      ) -
      Math.abs(
        b.x - x
      )
  );

  return candidates[0];
}


/* =========================================================
   CREATE ONE PLOT RECTANGLE
========================================================= */

function getPlotBounds(
  plot,
  boundaryLines
) {
  const {
    x,
    y,
  } = plot;

  const top =
    findHorizontalBoundary(
      boundaryLines.horizontal,
      x,
      y,
      "top"
    );

  const bottom =
    findHorizontalBoundary(
      boundaryLines.horizontal,
      x,
      y,
      "bottom"
    );

  const left =
    findVerticalBoundary(
      boundaryLines.vertical,
      x,
      y,
      "left"
    );

  const right =
    findVerticalBoundary(
      boundaryLines.vertical,
      x,
      y,
      "right"
    );


  /*
    Normal interior plot.
  */

  if (
    top &&
    bottom &&
    left &&
    right
  ) {
    const width =
      right.x -
      left.x;

    const height =
      bottom.y -
      top.y;

    /*
      Prevent roads / huge regions
      from becoming overlays.
    */

    if (
      width >= 12 &&
      width <= 80 &&
      height >= 8 &&
      height <= 80
    ) {
      const inset = 1.2;

      return {
        x:
          left.x +
          inset,

        y:
          top.y +
          inset,

        width:
          width -
          inset * 2,

        height:
          height -
          inset * 2,
      };
    }
  }


  /*
    Edge plots:

    Some outer plots use the red
    boundary instead of a black
    vertical line.

    In that case use the known
    normal plot width.

    This is only a fallback.
  */

  const normalWidth =
    48.5;

  if (
    top &&
    bottom
  ) {
    const height =
      bottom.y -
      top.y;

    if (
      height >= 8 &&
      height <= 80
    ) {
      let leftX;
      let rightX;

      if (
        right &&
        !left
      ) {
        rightX =
          right.x;

        leftX =
          rightX -
          normalWidth;
      } else if (
        left &&
        !right
      ) {
        leftX =
          left.x;

        rightX =
          leftX +
          normalWidth;
      } else {
        return null;
      }

      return {
        x:
          leftX + 1,
        y:
          top.y + 1,

        width:
          rightX -
          leftX -
          2,

        height:
          height - 2,
      };
    }
  }

  return null;
}


/* =========================================================
   CREATE SVG OVERLAY LAYER
========================================================= */

function createPlotOverlays(
  svgDocument,
  plotCenters
) {
  const boundaries =
    extractBoundaryLines(
      svgDocument
    );

  const existing =
    svgDocument.querySelector(
      "#dynamic-plot-overlays"
    );

  if (existing) {
    existing.remove();
  }

  const overlayGroup =
    svgDocument.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );

  overlayGroup.setAttribute(
    "id",
    "dynamic-plot-overlays"
  );

  overlayGroup.setAttribute(
    "pointer-events",
    "all"
  );


  let created = 0;

  for (
    const plot of plotCenters
  ) {
    const bounds =
      getPlotBounds(
        plot,
        boundaries
      );

    if (!bounds) {
      continue;
    }

    const rect =
      svgDocument.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );

    rect.setAttribute(
      "x",
      bounds.x
    );

    rect.setAttribute(
      "y",
      bounds.y
    );

    rect.setAttribute(
      "width",
      bounds.width
    );

    rect.setAttribute(
      "height",
      bounds.height
    );

    rect.setAttribute(
      "data-plot-number",
      plot.plotNumber
    );

    rect.setAttribute(
      "class",
      "dynamic-plot"
    );

    /*
      Start transparent.

      Status will be applied later.
    */

    rect.setAttribute(
      "fill",
      COLORS.available
    );

    rect.setAttribute(
      "fill-opacity",
      "0"
    );

    rect.setAttribute(
      "stroke",
      "none"
    );

    rect.setAttribute(
      "pointer-events",
      "all"
    );

    overlayGroup.appendChild(
      rect
    );

    created++;
  }

  svgDocument.documentElement.appendChild(
    overlayGroup
  );

  console.log(
    "Plot overlays created:",
    created
  );
}


/* =========================================================
   APPLY LIVE STATUS
========================================================= */

function applyStatuses(
  svgDocument,
  plots
) {
  const statusMap =
    new Map();

  for (
    const plot of plots
  ) {
    const number =
      getPlotNumber(
        plot
      );

    if (
      !Number.isFinite(number)
    ) {
      continue;
    }

    statusMap.set(
      number,
      getPlotStatus(
        plot
      )
    );
  }


  const overlays =
    svgDocument.querySelectorAll(
      ".dynamic-plot"
    );


  overlays.forEach(
    (overlay) => {
      const number =
        Number(
          overlay.getAttribute(
            "data-plot-number"
          )
        );

      const status =
        statusMap.get(
          number
        ) ||
        "available";

      overlay.setAttribute(
        "data-status",
        status
      );

      overlay.setAttribute(
        "fill",
        COLORS[
          status
        ] ||
        COLORS.available
      );


      /*
        Keep original plot
        number visible.
      */

      if (
        status === "booked"
      ) {
        overlay.setAttribute(
          "fill-opacity",
          "0.50"
        );
      } else if (
        status === "sold"
      ) {
        overlay.setAttribute(
          "fill-opacity",
          "0.50"
        );
      } else {
        overlay.setAttribute(
          "fill-opacity",
          "0.25"
        );
      }
    }
  );
}


/* =========================================================
   COMPONENT
========================================================= */

function LayoutMap() {

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  const [
    zoom,
    setZoom,
  ] = useState(1);


  const [
    svgMarkup,
    setSvgMarkup,
  ] = useState("");


  const [
    plots,
    setPlots,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    selectedPlot,
    setSelectedPlot,
  ] = useState(null);


  /* =======================================================
     LOAD SVG
  ======================================================= */

  useEffect(() => {

    let cancelled = false;


    async function loadSVG() {

      try {

        setLoading(true);

        setError("");


        const response =
          await fetch(
            SVG_URL,
            {
              cache:
                "no-store",
            }
          );


        if (
          !response.ok
        ) {
          throw new Error(
            `SVG file could not be loaded. HTTP ${response.status}`
          );
        }


        const svgText =
          await response.text();


        const parser =
          new DOMParser();


        const document =
          parser.parseFromString(
            svgText,
            "image/svg+xml"
          );


        if (
          document.querySelector(
            "parsererror"
          )
        ) {
          throw new Error(
            "The SVG file is invalid."
          );
        }


        const plotCenters =
          extractPlotCenters(
            document
          );


        createPlotOverlays(
          document,
          plotCenters
        );


        const markup =
          new XMLSerializer()
            .serializeToString(
              document.documentElement
            );


        if (
          !cancelled
        ) {
          setSvgMarkup(
            markup
          );

          setLoading(false);
        }

      } catch (err) {

        console.error(
          "Layout SVG error:",
          err
        );


        if (
          !cancelled
        ) {
          setError(
            err.message ||
              "Unable to load SVG."
          );

          setLoading(false);
        }
      }
    }


    loadSVG();


    return () => {
      cancelled = true;
    };

  }, []);


  /* =======================================================
     LOAD SUPABASE PLOTS
  ======================================================= */

  useEffect(() => {

    let active = true;


    async function loadPlots() {

      try {

        const {
          data,
          error,
        } =
          await supabase
            .from("plots")
            .select("*");


        if (error) {

          console.error(
            "Plots query error:",
            error
          );

          return;
        }


        if (
          active
        ) {

          setPlots(
            Array.isArray(data)
              ? data
              : []
          );

        }

      } catch (err) {

        console.error(
          "Plot loading error:",
          err
        );

      }
    }


    loadPlots();


    /*
      Refresh every 5 seconds.

      This means when somebody books
      a plot, the layout updates.
    */

    const interval =
      setInterval(
        loadPlots,
        5000
      );


    return () => {

      active = false;

      clearInterval(
        interval
      );

    };

  }, []);


  /* =======================================================
     APPLY STATUS TO SVG
  ======================================================= */

  const finalSvg =
    useMemo(() => {

      if (
        !svgMarkup
      ) {
        return "";
      }


      const parser =
        new DOMParser();


      const document =
        parser.parseFromString(
          svgMarkup,
          "image/svg+xml"
        );


      applyStatuses(
        document,
        plots
      );


      return new XMLSerializer()
        .serializeToString(
          document.documentElement
        );

    }, [
      svgMarkup,
      plots,
    ]);


  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics =
    useMemo(() => {

      let available = 0;
      let booked = 0;
      let sold = 0;


      for (
        const plot of plots
      ) {

        const status =
          getPlotStatus(
            plot
          );


        if (
          status ===
          "available"
        ) {
          available++;
        }


        if (
          status ===
          "booked"
        ) {
          booked++;
        }


        if (
          status ===
          "sold"
        ) {
          sold++;
        }

      }


      return {
        available,
        booked,
        sold,
      };

    }, [plots]);


  /* =======================================================
     MAP CLICK
  ======================================================= */

  function handleMapClick(
    event
  ) {

    const target =
      event.target;


    if (
      !target?.closest
    ) {
      return;
    }


    const overlay =
      target.closest(
        ".dynamic-plot"
      );


    if (!overlay) {
      return;
    }


    const plotNumber =
      Number(
        overlay.getAttribute(
          "data-plot-number"
        )
      );


    const plot =
      plots.find(
        (item) =>
          getPlotNumber(
            item
          ) ===
          plotNumber
      );


    setSelectedPlot(
      plot || {
        plot_number:
          plotNumber,

        status:
          "Available",
      }
    );

  }


  /* =======================================================
     ZOOM
  ======================================================= */

  function zoomOut() {

    setZoom(
      (previous) =>
        Math.max(
          0.5,
          Number(
            (
              previous -
              0.1
            ).toFixed(1)
          )
        )
    );

  }


  function zoomIn() {

    setZoom(
      (previous) =>
        Math.min(
          2.5,
          Number(
            (
              previous +
              0.1
            ).toFixed(1)
          )
        )
    );

  }


  function resetZoom() {

    setZoom(1);

  }


  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="layout-map-page-wrapper">


      {/* SIDEBAR */}

      <Sidebar
        sidebarOpen={
          sidebarOpen
        }
        setSidebarOpen={
          setSidebarOpen
        }
      />


      {/* MAIN */}

      <div className="main-content">


        {/* TOPBAR */}

        <Topbar
          setSidebarOpen={
            setSidebarOpen
          }
        />


        {/* BODY */}

        <div className="layout-map-body">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="layout-map-heading">

            <div>

              <h1>
                Layout Map
              </h1>

              <p>
                GUDIMETLA Plot Layout
              </p>

            </div>


            {/* ZOOM */}

            <div className="layout-controls">

              <button
                type="button"
                onClick={
                  zoomOut
                }
                title="Zoom out"
              >
                <ZoomOut
                  size={15}
                />
              </button>


              <span>
                {Math.round(
                  zoom * 100
                )}
                %
              </span>


              <button
                type="button"
                onClick={
                  zoomIn
                }
                title="Zoom in"
              >
                <ZoomIn
                  size={15}
                />
              </button>


              <button
                type="button"
                className="reset-zoom"
                onClick={
                  resetZoom
                }
              >
                <RotateCcw
                  size={13}
                />

                Reset
              </button>

            </div>

          </div>


          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="layout-statistics">


            <div className="map-stat available-stat">

              <span />

              <div>

                <strong>
                  {statistics.available}
                </strong>

                <small>
                  Available
                </small>

              </div>

            </div>


            <div className="map-stat booked-stat">

              <span />

              <div>

                <strong>
                  {statistics.booked}
                </strong>

                <small>
                  Booked / Reserved
                </small>

              </div>

            </div>


            <div className="map-stat sold-stat">

              <span />

              <div>

                <strong>
                  {statistics.sold}
                </strong>

                <small>
                  Sold
                </small>

              </div>

            </div>

          </div>


          {/* =================================================
              LEGEND
          ================================================= */}

          <div className="layout-legend">

            <div>
              <span className="legend-dot available" />
              Available
            </div>

            <div>
              <span className="legend-dot booked" />
              Booked
            </div>

            <div>
              <span className="legend-dot sold" />
              Sold
            </div>

          </div>


          {/* =================================================
              MAP
          ================================================= */}

          <div className="layout-map-card">

            <div
              className="layout-map-scroll"
              onClick={
                handleMapClick
              }
            >

              {loading && (
                <div className="map-loading">
                  Loading layout map...
                </div>
              )}


              {!loading &&
                error && (
                  <div className="map-error">

                    <strong>
                      Layout map could not be loaded.
                    </strong>

                    <span>
                      {error}
                    </span>

                    <small>
                      Check that this file exists:
                      <br />
                      <b>
                        public/GUDIMETLA_LAYOUT.svg
                      </b>
                    </small>

                  </div>
                )}


              {!loading &&
                !error &&
                finalSvg && (

                  <div
                    className="layout-map-svg"
                    style={{
                      width:
                        `${1191 * zoom}px`,
                    }}
                    dangerouslySetInnerHTML={{
                      __html:
                        finalSvg,
                    }}
                  />

                )}

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SELECTED PLOT
      ===================================================== */}

      {selectedPlot && (

        <div className="selected-plot-card">


          <button
            type="button"
            className="close-plot-card"
            onClick={() =>
              setSelectedPlot(
                null
              )
            }
          >
            <X size={17} />
          </button>


          <div className="selected-plot-title">

            <span
              className={`selected-status-dot ${getPlotStatus(
                selectedPlot
              )}`}
            />

            <h3>
              Plot-
              {getPlotNumber(
                selectedPlot
              )}
            </h3>

          </div>


          <div className="selected-plot-details">


            <div>

              <span>
                Plot Number
              </span>

              <strong>
                {getPlotNumber(
                  selectedPlot
                )}
              </strong>

            </div>


            <div>

              <span>
                Size
              </span>

              <strong>
                {selectedPlot.size ??
                  selectedPlot.plot_size ??
                  selectedPlot.size_sq_yards ??
                  "-"}
              </strong>

            </div>


            <div>

              <span>
                Facing
              </span>

              <strong>
                {selectedPlot.facing ??
                  "-"}
              </strong>

            </div>


            <div>

              <span>
                Road
              </span>

              <strong>
                {selectedPlot.road_width ??
                  selectedPlot.road ??
                  "-"}
              </strong>

            </div>


            <div>

              <span>
                Status
              </span>

              <strong
                className={`plot-${getPlotStatus(
                  selectedPlot
                )}`}
              >
                {selectedPlot.status ??
                  selectedPlot.plot_status ??
                  selectedPlot.booking_status ??
                  "Available"}
              </strong>

            </div>


            <div>

              <span>
                Price
              </span>

              <strong>
                {selectedPlot.price ??
                  selectedPlot.rate ??
                  "-"}
              </strong>

            </div>


          </div>

        </div>

      )}

    </div>
  );
}


export default LayoutMap;