import { cssVar, onResize } from "./utils.js";

const d3 = window.d3;
const topojson = window.topojson;

// Countries whose shapes are too small to see or click get a marker instead.
const SMALL_AREA_PX = 30;
// Geographic window used when the European dataset is active.
const EUROPE = { type: "MultiPoint", coordinates: [[-24, 35], [42, 35], [42, 71], [-24, 71]] };

export function createMap({ container, topo, onHover, onLeave, onSelect }) {
  const features = topojson.feature(topo, topo.objects.countries).features;
  const projection = d3.geoEqualEarth();
  const path = d3.geoPath(projection);

  const svg = d3.select(container).append("svg").attr("aria-hidden", "true");
  const defs = svg.append("defs");
  const hatch = defs.append("pattern")
    .attr("id", "nodata-hatch").attr("patternUnits", "userSpaceOnUse")
    .attr("width", 6).attr("height", 6).attr("patternTransform", "rotate(45)");
  const hatchBg = hatch.append("rect").attr("width", 6).attr("height", 6);
  const hatchLine = hatch.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke-width", 2);

  const root = svg.append("g");
  const countries = root.append("g").selectAll("path")
    .data(features, (d) => d.id)
    .join("path")
    .attr("class", "country");
  const dotsLayer = root.append("g");

  let width = 0;
  let height = 0;
  let current = { values: new Map(), selected: null };
  let colorOf = () => "#ccc";
  let transform = d3.zoomIdentity;
  let focus = "world";

  const zoom = d3.zoom()
    .scaleExtent([1, 14])
    // On touch screens one finger keeps scrolling the page; two fingers pan and pinch.
    .filter((event) => (event.type.startsWith("touch") ? event.touches.length > 1 : !event.button))
    .on("zoom", (event) => {
      transform = event.transform;
      root.attr("transform", transform);
      // Keep the hatching and markers a constant on-screen size while zooming.
      hatch.attr("patternTransform", `rotate(45) scale(${1 / transform.k})`);
      dotsLayer.selectAll("circle").attr("r", dotRadius()).call(toggleDots);
    });
  svg.call(zoom).on("dblclick.zoom", null);

  const dotRadius = () => 4.5 / transform.k;
  // A marker is only needed while its country is too small to see at this zoom.
  const toggleDots = (sel) => sel.attr("display", (d) => (d.area * transform.k ** 2 < SMALL_AREA_PX ? null : "none"));

  function layout(w) {
    width = w;
    height = container.clientHeight || Math.round(w / 1.9);
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    projection.fitExtent([[8, 8], [width - 8, height - 8]], { type: "FeatureCollection", features });
    countries.attr("d", path);
    zoom.translateExtent([[-width * 0.25, -height * 0.25], [width * 1.25, height * 1.25]]);
    drawDots();
    setFocus(focus, false);
  }

  function drawDots() {
    const small = features
      .filter((f) => current.values.has(f.id))
      .map((f) => Object.assign(f, { area: path.area(f) }))
      .filter((f) => f.area < SMALL_AREA_PX);
    dotsLayer.selectAll("circle")
      .data(small, (d) => d.id)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => path.centroid(d)[0])
      .attr("cy", (d) => path.centroid(d)[1])
      .attr("r", dotRadius())
      .call(toggleDots)
      .call(bindEvents)
      .call(paint);
  }

  function bindEvents(sel) {
    sel
      .on("pointermove", (event, d) => {
        if (!current.values.has(d.id)) return onLeave();
        highlight(d.id);
        onHover(d.id, event.clientX, event.clientY);
      })
      .on("pointerleave", () => {
        highlight(null);
        onLeave();
      })
      .on("click", (event, d) => {
        if (current.values.has(d.id)) onSelect(d.id);
      });
  }
  countries.call(bindEvents);

  function highlight(iso) {
    countries.classed("is-hover", (d) => d.id === iso);
    dotsLayer.selectAll("circle").classed("is-hover", (d) => d.id === iso);
    if (iso) countries.filter((d) => d.id === iso).raise();
  }

  function paint(sel) {
    sel
      .attr("fill", (d) => (current.values.has(d.id) ? colorOf(current.values.get(d.id)) : "url(#nodata-hatch)"))
      .classed("has-data", (d) => current.values.has(d.id))
      .classed("is-selected", (d) => d.id === current.selected);
  }

  function update({ values, selected, color }) {
    current = { values, selected };
    colorOf = color;
    hatchBg.attr("fill", cssVar("--nodata"));
    hatchLine.attr("stroke", cssVar("--nodata-hatch"));
    countries.call(paint);
    countries.filter((d) => d.id === selected).raise();
    drawDots();
  }

  function setFocus(region, animate = true) {
    focus = region;
    if (!width) return;
    let t = d3.zoomIdentity;
    if (region === "europe") {
      const [[x0, y0], [x1, y1]] = path.bounds(EUROPE);
      const k = Math.min(width / (x1 - x0), height / (y1 - y0)) * 0.98;
      t = d3.zoomIdentity.translate(width / 2, height / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    }
    (animate ? svg.transition().duration(750) : svg).call(zoom.transform, t);
  }

  onResize(container, layout);

  return {
    update,
    setFocus,
    zoomBy: (k) => svg.transition().duration(300).call(zoom.scaleBy, k),
    reset: () => setFocus(focus),
  };
}
