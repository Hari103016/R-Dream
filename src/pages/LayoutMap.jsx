import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./LayoutMap.css";
import { supabase } from "../services/supabase";

const SVG_URL = "/layout.svg";
const DIMENSIONS_URL = "/plot-dimensions.txt";

const TOTAL_PLOTS = 272;
const SVG_WIDTH = 1191;
const SVG_HEIGHT = 1684;

const MIN_ZOOM = 1;
const MAX_ZOOM = 12;
const BUTTON_ZOOM_FACTOR = 1.25;

const STATUS_META = {
  available: {
    label: "Available",
    fill: "#00A83B",
    stroke: "#006B25",
  },
  booked: {
    label: "Booked",
    fill: "#FF8C00",
    stroke: "#B85C00",
  },
  sold: {
    label: "Sold",
    fill: "#E60000",
    stroke: "#990000",
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeStatus(status) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (
    value.includes("sold") ||
    value.includes("registered") ||
    value.includes("sale completed")
  ) {
    return "sold";
  }

  if (value.includes("book") || value.includes("reserv")) {
    return "booked";
  }

  return "available";
}

function databaseStatus(status) {
  return STATUS_META[normalizeStatus(status)].label;
}

function createInitialStatuses() {
  const result = {};

  for (let i = 1; i <= TOTAL_PLOTS; i += 1) {
    result[i] = "available";
  }

  return result;
}

function createDefaultDimensions() {
  const result = {};

  for (let i = 1; i <= TOTAL_PLOTS; i += 1) {
    result[i] = {
      length: null,
      breadth: null,
    };
  }

  return result;
}

function parseDimensionsText(text) {
  const result = {};

  if (!text) return result;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(
      /Plot\s*(\d+)\s*[-–—:]?\s*Length\s*:\s*([\d.]+)\s*ft\s*,?\s*Breadth\s*:\s*([\d.]+)\s*ft/i
    );

    if (!match) continue;

    const plotNumber = Number(match[1]);
    const length = Number(match[2]);
    const breadth = Number(match[3]);

    if (
      Number.isInteger(plotNumber) &&
      plotNumber >= 1 &&
      plotNumber <= TOTAL_PLOTS &&
      Number.isFinite(length) &&
      Number.isFinite(breadth)
    ) {
      result[plotNumber] = {
        length,
        breadth,
      };
    }
  }

  return result;
}

function getNumericText(element) {
  if (!element) return null;

  const text = (element.textContent || "")
    .replace(/\s+/g, "")
    .trim();

  if (!/^\d+$/.test(text)) return null;

  const number = Number(text);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > TOTAL_PLOTS
  ) {
    return null;
  }

  return number;
}

function isPlotBoundaryPath(element) {
  return (
    element?.tagName?.toLowerCase() === "path" &&
    /[Cc]/.test(element.getAttribute("d") || "")
  );
}

/*
  Maps each ORIGINAL plot boundary to the ORIGINAL plot number.
  No path coordinates, transforms, labels, or plot geometry are changed.

  This mapper has already been verified against the supplied Gudimetla SVG:
  all 272 plot boundaries are detected.
*/
function buildPlotMap(svg) {
  const plotMap = new Map();

  if (!svg) return plotMap;

  const groups = Array.from(svg.querySelectorAll("g"));

  for (const group of groups) {
    const children = Array.from(group.children);

    for (let index = 0; index < children.length; index += 1) {
      const boundary = children[index];

      if (!isPlotBoundaryPath(boundary)) continue;

      let plotNumber = null;
      let plotLabel = null;

      for (
        let nextIndex = index + 1;
        nextIndex < children.length;
        nextIndex += 1
      ) {
        const next = children[nextIndex];

        if (isPlotBoundaryPath(next)) break;
        if (next.tagName?.toLowerCase() !== "text") continue;

        const number = getNumericText(next);

        if (number !== null) {
          plotNumber = number;
          plotLabel = next;
          break;
        }
      }

      if (
        plotNumber === null ||
        !plotLabel ||
        plotMap.has(plotNumber)
      ) {
        continue;
      }

      boundary.dataset.plotNumber = String(plotNumber);
      plotLabel.dataset.plotNumber = String(plotNumber);

      boundary.classList.add("plot-boundary");
      plotLabel.classList.add("plot-number-label");

      /*
        Keeps the interactive boundary stroke visually stable when the
        SVG viewBox zoom changes.
      */
      boundary.setAttribute(
        "vector-effect",
        "non-scaling-stroke"
      );

      plotMap.set(plotNumber, {
        boundary,
        label: plotLabel,
      });
    }
  }

  const missing = [];

  for (let i = 1; i <= TOTAL_PLOTS; i += 1) {
    if (!plotMap.has(i)) {
      missing.push(i);
    }
  }

  console.log(
    `Gudimetla layout: ${plotMap.size}/${TOTAL_PLOTS} plots mapped`
  );

  if (missing.length) {
    console.warn("Missing plot numbers:", missing);
  }

  return plotMap;
}

/*
  Topmost vector-only clarity layer.

  It clones each EXISTING plot boundary and EXISTING number at exactly
  the same SVG coordinates. The clones are stroke/text only and are not
  interactive. This keeps edges and numbers visible above status fills.
*/
function createClarityLayer(svg, plotMap) {
  svg
    .querySelector(".plot-clarity-layer")
    ?.remove();

  const layer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );

  layer.setAttribute(
    "class",
    "plot-clarity-layer"
  );

  layer.setAttribute(
    "pointer-events",
    "none"
  );

  for (
    let plotNumber = 1;
    plotNumber <= TOTAL_PLOTS;
    plotNumber += 1
  ) {
    const item = plotMap.get(plotNumber);

    if (!item) continue;

    const boundaryClone =
      item.boundary.cloneNode(true);

    boundaryClone.removeAttribute("style");
    boundaryClone.removeAttribute(
      "data-plot-number"
    );

    boundaryClone.setAttribute(
      "fill",
      "none"
    );

    boundaryClone.setAttribute(
      "vector-effect",
      "non-scaling-stroke"
    );

    boundaryClone.setAttribute(
      "pointer-events",
      "none"
    );

    boundaryClone.classList.add(
      "plot-clarity-boundary"
    );

    const labelClone =
      item.label.cloneNode(true);

    labelClone.removeAttribute("style");
    labelClone.removeAttribute(
      "data-plot-number"
    );

    labelClone.setAttribute(
      "pointer-events",
      "none"
    );

    labelClone.classList.add(
      "plot-clarity-label"
    );

    layer.appendChild(boundaryClone);
    layer.appendChild(labelClone);
  }

  svg.appendChild(layer);
}

function paintPlot(
  plotNumber,
  status,
  plotMap,
  selectedPlot
) {
  const item =
    plotMap.get(Number(plotNumber));

  if (!item) return;

  const normalized =
    normalizeStatus(status);

  const meta =
    STATUS_META[normalized];

  const selected =
    Number(selectedPlot) ===
    Number(plotNumber);

  const { boundary, label } = item;

  boundary.classList.remove(
    "plot-available",
    "plot-booked",
    "plot-sold",
    "plot-selected"
  );

  boundary.classList.add(
    `plot-${normalized}`
  );

  if (selected) {
    boundary.classList.add(
      "plot-selected"
    );
  }

  boundary.dataset.status =
    normalized;

  boundary.setAttribute(
    "aria-label",
    `Plot ${plotNumber}, ${meta.label}`
  );

  boundary.style.setProperty(
    "fill",
    meta.fill,
    "important"
  );

  boundary.style.setProperty(
    "fill-opacity",
    normalized === "available"
      ? "0.78"
      : "0.82",
    "important"
  );

  boundary.style.setProperty(
    "stroke",
    meta.stroke,
    "important"
  );

  boundary.style.setProperty(
    "stroke-opacity",
    "1",
    "important"
  );

  boundary.style.setProperty(
    "stroke-width",
    selected ? "4.5" : "2",
    "important"
  );

  boundary.style.setProperty(
    "cursor",
    "pointer",
    "important"
  );

  boundary.style.setProperty(
    "pointer-events",
    "all",
    "important"
  );

  if (label) {
    label.classList.toggle(
      "plot-number-selected",
      selected
    );

    label.style.setProperty(
      "fill",
      "#111827",
      "important"
    );

    label.style.setProperty(
      "stroke",
      "#ffffff",
      "important"
    );

    label.style.setProperty(
      "stroke-width",
      "1.5",
      "important"
    );

    label.style.setProperty(
      "paint-order",
      "stroke fill",
      "important"
    );

    label.style.setProperty(
      "font-weight",
      "800",
      "important"
    );

    label.style.setProperty(
      "cursor",
      "pointer",
      "important"
    );

    label.style.setProperty(
      "pointer-events",
      "all",
      "important"
    );
  }
}

function paintAllPlots(
  statuses,
  plotMap,
  selectedPlot
) {
  if (!plotMap?.size) return;

  for (
    let plotNumber = 1;
    plotNumber <= TOTAL_PLOTS;
    plotNumber += 1
  ) {
    paintPlot(
      plotNumber,
      statuses[plotNumber] ??
        "available",
      plotMap,
      selectedPlot
    );
  }
}

function fullViewBox() {
  return {
    x: 0,
    y: 0,
    width: SVG_WIDTH,
    height: SVG_HEIGHT,
  };
}

function clampViewBox(viewBox) {
  const width = clamp(
    viewBox.width,
    SVG_WIDTH / MAX_ZOOM,
    SVG_WIDTH
  );

  const height =
    width *
    (SVG_HEIGHT / SVG_WIDTH);

  const maxX =
    SVG_WIDTH - width;

  const maxY =
    SVG_HEIGHT - height;

  return {
    x: clamp(viewBox.x, 0, Math.max(0, maxX)),
    y: clamp(viewBox.y, 0, Math.max(0, maxY)),
    width,
    height,
  };
}

export default function LayoutMap() {
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const plotMapRef = useRef(new Map());

  const activePointersRef =
    useRef(new Map());

  const gestureRef = useRef(null);

  const viewBoxRef =
    useRef(fullViewBox());

  const [svgLoaded, setSvgLoaded] =
    useState(false);

  const [svgError, setSvgError] =
    useState("");

  const [dimensions, setDimensions] =
    useState(
      createDefaultDimensions
    );

  const [statuses, setStatuses] =
    useState(
      createInitialStatuses
    );

  const [selectedPlot, setSelectedPlot] =
    useState(null);

  const [viewBox, setViewBox] =
    useState(fullViewBox);

  const [isDragging, setIsDragging] =
    useState(false);

  const zoom =
    SVG_WIDTH / viewBox.width;

  const applyViewBox =
    useCallback((next) => {
      const safe =
        clampViewBox(next);

      viewBoxRef.current = safe;
      setViewBox(safe);
    }, []);

  /*
    IMPORTANT CLARITY FIX:
    Zoom is applied by changing the SVG viewBox, not by CSS transform: scale().
    The browser therefore re-renders the SVG paths/text as vectors.
  */
  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) return;

    svg.setAttribute(
      "viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    );
  }, [viewBox]);

  const screenToSvg =
    useCallback((clientX, clientY) => {
      const svg = svgRef.current;

      if (!svg) return null;

      const matrix =
        svg.getScreenCTM();

      if (!matrix) return null;

      const point =
        new DOMPoint(
          clientX,
          clientY
        ).matrixTransform(
          matrix.inverse()
        );

      return {
        x: point.x,
        y: point.y,
      };
    }, []);

  const getRenderedSvgMetrics =
    useCallback((targetViewBox) => {
      const svg = svgRef.current;

      if (!svg) return null;

      const rect =
        svg.getBoundingClientRect();

      const scale = Math.min(
        rect.width /
          targetViewBox.width,
        rect.height /
          targetViewBox.height
      );

      const renderedWidth =
        targetViewBox.width *
        scale;

      const renderedHeight =
        targetViewBox.height *
        scale;

      return {
        rect,
        scale,
        offsetX:
          (rect.width -
            renderedWidth) /
          2,
        offsetY:
          (rect.height -
            renderedHeight) /
          2,
      };
    }, []);

  const zoomToAtScreenPoint =
    useCallback(
      (
        nextZoomValue,
        clientX,
        clientY
      ) => {
        const current =
          viewBoxRef.current;

        const anchor =
          screenToSvg(
            clientX,
            clientY
          );

        const svg =
          svgRef.current;

        if (!anchor || !svg) return;

        const nextZoom = clamp(
          nextZoomValue,
          MIN_ZOOM,
          MAX_ZOOM
        );

        const nextWidth =
          SVG_WIDTH / nextZoom;

        const nextHeight =
          SVG_HEIGHT / nextZoom;

        const nextViewBox = {
          x: 0,
          y: 0,
          width: nextWidth,
          height: nextHeight,
        };

        const metrics =
          getRenderedSvgMetrics(
            nextViewBox
          );

        if (!metrics) return;

        const localX =
          clientX -
          metrics.rect.left -
          metrics.offsetX;

        const localY =
          clientY -
          metrics.rect.top -
          metrics.offsetY;

        /*
          Keep the same SVG coordinate underneath the cursor/touch point.
        */
        nextViewBox.x =
          anchor.x -
          localX / metrics.scale;

        nextViewBox.y =
          anchor.y -
          localY / metrics.scale;

        applyViewBox(nextViewBox);
      },
      [
        applyViewBox,
        getRenderedSvgMetrics,
        screenToSvg,
      ]
    );

  const zoomAtCenter =
    useCallback(
      (nextZoom) => {
        const svg =
          svgRef.current;

        if (!svg) return;

        const rect =
          svg.getBoundingClientRect();

        zoomToAtScreenPoint(
          nextZoom,
          rect.left +
            rect.width / 2,
          rect.top +
            rect.height / 2
        );
      },
      [zoomToAtScreenPoint]
    );

  const fitMap =
    useCallback(() => {
      applyViewBox(
        fullViewBox()
      );
    }, [applyViewBox]);

  const resetMap =
    useCallback(() => {
      setSelectedPlot(null);
      applyViewBox(
        fullViewBox()
      );
    }, [applyViewBox]);

  const loadPlotStatuses =
    useCallback(async () => {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("plots")
          .select(
            "plot_no, status"
          );

        if (error) {
          throw error;
        }

        const next =
          createInitialStatuses();

        for (
          const row of data || []
        ) {
          const plotNumber =
            Number(row.plot_no);

          if (
            Number.isInteger(
              plotNumber
            ) &&
            plotNumber >= 1 &&
            plotNumber <=
              TOTAL_PLOTS
          ) {
            next[
              plotNumber
            ] =
              normalizeStatus(
                row.status
              );
          }
        }

        setStatuses(next);
      } catch (error) {
        console.error(
          "Error loading plot statuses:",
          error
        );
      }
    }, []);

  useEffect(() => {
    loadPlotStatuses();
  }, [loadPlotStatuses]);

  useEffect(() => {
    const channel =
      supabase
        .channel(
          "gudimetla-layout-plot-status"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "plots",
          },
          () => {
            loadPlotStatuses();
          }
        )
        .subscribe();

    const fallback =
      window.setInterval(
        loadPlotStatuses,
        5000
      );

    return () => {
      window.clearInterval(
        fallback
      );

      supabase.removeChannel(
        channel
      );
    };
  }, [loadPlotStatuses]);

  useEffect(() => {
    let cancelled = false;

    async function loadDimensions() {
      try {
        const response =
          await fetch(
            DIMENSIONS_URL,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const text =
          await response.text();

        if (cancelled) {
          return;
        }

        setDimensions(
          (previous) => ({
            ...previous,
            ...parseDimensionsText(
              text
            ),
          })
        );
      } catch (error) {
        console.warn(
          "Dimension loading failed:",
          error
        );
      }
    }

    loadDimensions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSvg() {
      try {
        setSvgLoaded(false);
        setSvgError("");

        const response =
          await fetch(
            SVG_URL,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `Could not load ${SVG_URL}. HTTP ${response.status}`
          );
        }

        const svgText =
          await response.text();

        if (cancelled) return;

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
            "layout.svg is invalid."
          );
        }

        const svg =
          document.documentElement;

        if (
          !svg ||
          svg.tagName.toLowerCase() !==
            "svg"
        ) {
          throw new Error(
            "Loaded file is not an SVG."
          );
        }

        svg.removeAttribute(
          "width"
        );

        svg.removeAttribute(
          "height"
        );

        svg.setAttribute(
          "viewBox",
          `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`
        );

        svg.setAttribute(
          "preserveAspectRatio",
          "xMidYMid meet"
        );

        svg.classList.add(
          "layout-svg"
        );

        const canvas =
          canvasRef.current;

        if (!canvas) return;

        canvas.replaceChildren(
          svg
        );

        svgRef.current = svg;

        const plotMap =
          buildPlotMap(svg);

        plotMapRef.current =
          plotMap;

        createClarityLayer(
          svg,
          plotMap
        );

        if (
          plotMap.size !==
          TOTAL_PLOTS
        ) {
          console.warn(
            `Expected ${TOTAL_PLOTS} plots, mapped ${plotMap.size}.`
          );
        }

        paintAllPlots(
          statuses,
          plotMap,
          selectedPlot
        );

        viewBoxRef.current =
          fullViewBox();

        setViewBox(
          fullViewBox()
        );

        if (!cancelled) {
          setSvgLoaded(true);
        }
      } catch (error) {
        console.error(
          "SVG loading error:",
          error
        );

        if (!cancelled) {
          setSvgError(
            error?.message ||
              "Could not load layout.svg"
          );
        }
      }
    }

    loadSvg();

    return () => {
      cancelled = true;
    };
    // Parse the SVG once; later status changes repaint the existing SVG.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!svgLoaded) {
      return;
    }

    paintAllPlots(
      statuses,
      plotMapRef.current,
      selectedPlot
    );
  }, [
    statuses,
    selectedPlot,
    svgLoaded,
  ]);

  useEffect(() => {
    const svg =
      svgRef.current;

    if (
      !svg ||
      !svgLoaded
    ) {
      return undefined;
    }

    const handleSvgClick =
      (event) => {
        const target =
          event.target?.closest?.(
            "[data-plot-number]"
          );

        if (!target) return;

        const plotNumber =
          Number(
            target.dataset
              .plotNumber
          );

        if (
          !Number.isInteger(
            plotNumber
          ) ||
          plotNumber < 1 ||
          plotNumber >
            TOTAL_PLOTS
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        setSelectedPlot(
          plotNumber
        );
      };

    svg.addEventListener(
      "click",
      handleSvgClick
    );

    return () => {
      svg.removeEventListener(
        "click",
        handleSvgClick
      );
    };
  }, [svgLoaded]);

  /*
    Wheel / trackpad zoom.
    No CSS scale is used.
  */
  useEffect(() => {
    const viewport =
      viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const handleWheel =
      (event) => {
        event.preventDefault();

        const currentZoom =
          SVG_WIDTH /
          viewBoxRef.current.width;

        const modeScale =
          event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
            ? viewport.clientHeight
            : 1;

        const delta =
          event.deltaY *
          modeScale;

        const factor =
          Math.exp(
            -delta * 0.0015
          );

        zoomToAtScreenPoint(
          currentZoom * factor,
          event.clientX,
          event.clientY
        );
      };

    viewport.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    return () => {
      viewport.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, [zoomToAtScreenPoint]);

  const startPanGesture =
    useCallback(
      (pointer) => {
        const svg =
          svgRef.current;

        if (!svg) return;

        const startViewBox = {
          ...viewBoxRef.current,
        };

        const metrics =
          getRenderedSvgMetrics(
            startViewBox
          );

        if (!metrics) return;

        gestureRef.current = {
          type: "pan",
          pointerId:
            pointer.pointerId,
          startClientX:
            pointer.clientX,
          startClientY:
            pointer.clientY,
          startViewBox,
          scale:
            metrics.scale,
        };

        setIsDragging(true);
      },
      [getRenderedSvgMetrics]
    );

  const startPinchGesture =
    useCallback(() => {
      const pointers =
        Array.from(
          activePointersRef
            .current
            .values()
        );

      if (
        pointers.length < 2
      ) {
        return;
      }

      const first =
        pointers[0];

      const second =
        pointers[1];

      const midpointX =
        (first.clientX +
          second.clientX) /
        2;

      const midpointY =
        (first.clientY +
          second.clientY) /
        2;

      const anchor =
        screenToSvg(
          midpointX,
          midpointY
        );

      if (!anchor) return;

      const distance =
        Math.max(
          1,
          Math.hypot(
            second.clientX -
              first.clientX,
            second.clientY -
              first.clientY
          )
        );

      const startViewBox = {
        ...viewBoxRef.current,
      };

      gestureRef.current = {
        type: "pinch",
        startDistance:
          distance,
        startZoom:
          SVG_WIDTH /
          startViewBox.width,
        anchor,
      };

      setIsDragging(false);
    }, [screenToSvg]);

  const handlePointerDown =
    (event) => {
      if (
        event.target?.closest?.(
          ".plot-details"
        ) ||
        event.target?.closest?.(
          ".zoom-controls"
        )
      ) {
        return;
      }

      activePointersRef.current.set(
        event.pointerId,
        {
          pointerId:
            event.pointerId,
          clientX:
            event.clientX,
          clientY:
            event.clientY,
        }
      );

      try {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
      } catch {
        // Pointer capture can be unavailable on some browsers.
      }

      if (
        activePointersRef.current
          .size >= 2
      ) {
        startPinchGesture();
        return;
      }

      if (
        !event.target?.closest?.(
          "[data-plot-number]"
        )
      ) {
        startPanGesture({
          pointerId:
            event.pointerId,
          clientX:
            event.clientX,
          clientY:
            event.clientY,
        });
      }
    };

  const handlePointerMove =
    (event) => {
      if (
        !activePointersRef.current.has(
          event.pointerId
        )
      ) {
        return;
      }

      activePointersRef.current.set(
        event.pointerId,
        {
          pointerId:
            event.pointerId,
          clientX:
            event.clientX,
          clientY:
            event.clientY,
        }
      );

      const gesture =
        gestureRef.current;

      if (!gesture) return;

      if (
        gesture.type === "pan"
      ) {
        if (
          gesture.pointerId !==
          event.pointerId
        ) {
          return;
        }

        const dx =
          event.clientX -
          gesture.startClientX;

        const dy =
          event.clientY -
          gesture.startClientY;

        applyViewBox({
          ...gesture.startViewBox,
          x:
            gesture.startViewBox.x -
            dx / gesture.scale,
          y:
            gesture.startViewBox.y -
            dy / gesture.scale,
        });

        return;
      }

      if (
        gesture.type === "pinch"
      ) {
        const pointers =
          Array.from(
            activePointersRef
              .current
              .values()
          );

        if (
          pointers.length < 2
        ) {
          return;
        }

        const first =
          pointers[0];

        const second =
          pointers[1];

        const midpointX =
          (first.clientX +
            second.clientX) /
          2;

        const midpointY =
          (first.clientY +
            second.clientY) /
          2;

        const distance =
          Math.max(
            1,
            Math.hypot(
              second.clientX -
                first.clientX,
              second.clientY -
                first.clientY
            )
          );

        const nextZoom =
          clamp(
            gesture.startZoom *
              (distance /
                gesture.startDistance),
            MIN_ZOOM,
            MAX_ZOOM
          );

        const nextWidth =
          SVG_WIDTH /
          nextZoom;

        const nextHeight =
          SVG_HEIGHT /
          nextZoom;

        const nextViewBox = {
          x: 0,
          y: 0,
          width: nextWidth,
          height: nextHeight,
        };

        const metrics =
          getRenderedSvgMetrics(
            nextViewBox
          );

        if (!metrics) {
          return;
        }

        const localX =
          midpointX -
          metrics.rect.left -
          metrics.offsetX;

        const localY =
          midpointY -
          metrics.rect.top -
          metrics.offsetY;

        nextViewBox.x =
          gesture.anchor.x -
          localX /
            metrics.scale;

        nextViewBox.y =
          gesture.anchor.y -
          localY /
            metrics.scale;

        applyViewBox(
          nextViewBox
        );
      }
    };

  const handlePointerEnd =
    (event) => {
      activePointersRef.current.delete(
        event.pointerId
      );

      try {
        if (
          event.currentTarget.hasPointerCapture(
            event.pointerId
          )
        ) {
          event.currentTarget.releasePointerCapture(
            event.pointerId
          );
        }
      } catch {
        // Ignore unsupported pointer-capture state.
      }

      const remaining =
        Array.from(
          activePointersRef
            .current
            .values()
        );

      if (
        remaining.length >= 2
      ) {
        startPinchGesture();
        return;
      }

      if (
        remaining.length === 1
      ) {
        startPanGesture(
          remaining[0]
        );

        return;
      }

      gestureRef.current =
        null;

      setIsDragging(false);
    };

  const changeSelectedStatus =
    async (nextStatus) => {
      if (!selectedPlot) {
        return;
      }

      const plotNumber =
        selectedPlot;

      const normalized =
        normalizeStatus(
          nextStatus
        );

      const previousStatus =
        statuses[plotNumber] ??
        "available";

      /*
        Immediate UI repaint.
      */
      setStatuses(
        (current) => ({
          ...current,
          [plotNumber]:
            normalized,
        })
      );

      paintPlot(
        plotNumber,
        normalized,
        plotMapRef.current,
        selectedPlot
      );

      const { error } =
        await supabase
          .from("plots")
          .update({
            status:
              databaseStatus(
                normalized
              ),
          })
          .eq(
            "plot_no",
            plotNumber
          );

      if (error) {
        console.error(
          "Plot status update failed:",
          error
        );

        setStatuses(
          (current) => ({
            ...current,
            [plotNumber]:
              previousStatus,
          })
        );

        paintPlot(
          plotNumber,
          previousStatus,
          plotMapRef.current,
          selectedPlot
        );

        return;
      }

      loadPlotStatuses();
    };

  const bookedCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          (status) =>
            status === "booked"
        ).length,
      [statuses]
    );

  const soldCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          (status) =>
            status === "sold"
        ).length,
      [statuses]
    );

  const availableCount =
    TOTAL_PLOTS -
    bookedCount -
    soldCount;

  const selectedPlotData =
    useMemo(() => {
      if (!selectedPlot) {
        return null;
      }

      return {
        plotNumber:
          selectedPlot,

        status:
          normalizeStatus(
            statuses[
              selectedPlot
            ]
          ),

        length:
          dimensions[
            selectedPlot
          ]?.length ??
          null,

        breadth:
          dimensions[
            selectedPlot
          ]?.breadth ??
          null,
      };
    }, [
      selectedPlot,
      statuses,
      dimensions,
    ]);

  return (
    <div className="layout-page">
      <header className="layout-header">
        <div className="header-title">
          <h1>
            Gudimetla Layout
          </h1>

          <p>
            Select a plot to view
            its status and dimensions.
          </p>
        </div>

        <div className="summary-cards">
          <div className="summary-card total">
            <strong>
              {TOTAL_PLOTS}
            </strong>
            <span>Total</span>
          </div>

          <div className="summary-card available">
            <strong>
              {availableCount}
            </strong>
            <span>Available</span>
          </div>

          <div className="summary-card booked">
            <strong>
              {bookedCount}
            </strong>
            <span>Booked</span>
          </div>

          <div className="summary-card sold">
            <strong>
              {soldCount}
            </strong>
            <span>Sold</span>
          </div>
        </div>
      </header>

      <div className="layout-toolbar">
        <div
          className="legend"
          aria-label="Plot status legend"
        >
          <div className="legend-item">
            <span className="legend-dot available-dot" />
            <span>Available</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot booked-dot" />
            <span>Booked</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot sold-dot" />
            <span>Sold</span>
          </div>
        </div>

        <div
          className="zoom-controls"
          onPointerDown={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            onClick={() =>
              zoomAtCenter(
                zoom /
                  BUTTON_ZOOM_FACTOR
              )
            }
            disabled={
              zoom <= MIN_ZOOM +
                0.001
            }
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>

          <span>
            {Math.round(
              zoom * 100
            )}
            %
          </span>

          <button
            type="button"
            onClick={() =>
              zoomAtCenter(
                zoom *
                  BUTTON_ZOOM_FACTOR
              )
            }
            disabled={
              zoom >= MAX_ZOOM -
                0.001
            }
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>

          <button
            type="button"
            onClick={fitMap}
            aria-label="Fit map"
            title="Fit entire map"
          >
            Fit
          </button>

          <button
            type="button"
            onClick={resetMap}
            aria-label="Reset map"
            title="Reset map"
          >
            Reset
          </button>
        </div>
      </div>

      <main
        ref={viewportRef}
        className={`map-viewport ${
          isDragging
            ? "is-dragging"
            : ""
        }`}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerEnd
        }
        onPointerCancel={
          handlePointerEnd
        }
      >
        <div className="map-background" />

        {/*
          IMPORTANT:
          There is NO CSS transform: scale() around the SVG.
          The SVG occupies this viewport directly and zoom/pan are handled
          by the SVG viewBox for true vector re-rendering.
        */}
        <div
          ref={canvasRef}
          className="map-canvas"
        />

        {!svgLoaded &&
          !svgError && (
            <div className="map-loading">
              <div className="loading-spinner" />
              <p>
                Loading layout map...
              </p>
            </div>
          )}

        {svgError && (
          <div className="map-error">
            <h2>
              Layout map not found
            </h2>

            <p>
              {svgError}
            </p>

            <code>
              public/layout.svg
            </code>
          </div>
        )}

        {selectedPlotData && (
          <aside
            className="plot-details"
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="plot-details-header">
              <div>
                <small>PLOT</small>

                <h2>
                  {
                    selectedPlotData.plotNumber
                  }
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setSelectedPlot(
                    null
                  )
                }
                aria-label="Close plot details"
              >
                ×
              </button>
            </div>

            <div
              className={`status-badge status-${selectedPlotData.status}`}
            >
              {
                STATUS_META[
                  selectedPlotData.status
                ].label
              }
            </div>

            <div className="dimension-grid">
              <div>
                <span>
                  Length
                </span>

                <strong>
                  {selectedPlotData.length !==
                  null
                    ? `${selectedPlotData.length} ft`
                    : "Not available"}
                </strong>
              </div>

              <div>
                <span>
                  Breadth
                </span>

                <strong>
                  {selectedPlotData.breadth !==
                  null
                    ? `${selectedPlotData.breadth} ft`
                    : "Not available"}
                </strong>
              </div>
            </div>

            <div className="status-actions">
              <button
                type="button"
                className="available-button"
                disabled={
                  selectedPlotData.status ===
                  "available"
                }
                onClick={() =>
                  changeSelectedStatus(
                    "available"
                  )
                }
              >
                Available
              </button>

              <button
                type="button"
                className="booked-button"
                disabled={
                  selectedPlotData.status ===
                  "booked"
                }
                onClick={() =>
                  changeSelectedStatus(
                    "booked"
                  )
                }
              >
                Booked
              </button>

              <button
                type="button"
                className="sold-button"
                disabled={
                  selectedPlotData.status ===
                  "sold"
                }
                onClick={() =>
                  changeSelectedStatus(
                    "sold"
                  )
                }
              >
                Sold
              </button>
            </div>
          </aside>
        )}

        <div className="map-help">
          <span>
            {TOTAL_PLOTS} plots
          </span>

          <span>•</span>
          <span>Drag to pan</span>
          <span>•</span>
          <span>
            Wheel/pinch to zoom
          </span>
        </div>
      </main>
    </div>
  );
}
