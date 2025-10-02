import {
  Map,
  LngLatBounds,
  addProtocol,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  ScaleControl
  // Popup,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import { bbox as findBoundingBox } from "@turf/turf";
import boundsData from "./map/bounds.json";

import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";

import mapStyle from "./map/style.js";

let protocol = new Protocol();
addProtocol("pmtiles", protocol.tile);

function boundsForFeature(kind) {
  const feature = boundsData.features.find((f) => f.properties.kind === kind);
  if (!feature) {
    return boundsForFeature("map-max-bounds");
  }
  const bbox = findBoundingBox(feature);
  return new LngLatBounds([
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ]);
}

const festivalBounds = boundsForFeature("festival-initial-bounds");
const paradeBounds = boundsForFeature("parade-initial-bounds");
const carShowInitalBounds = boundsForFeature("car-show-initial-bounds")
const mapInitalBounds = boundsForFeature("map-initial-bounds");
const maxBounds = boundsForFeature("map-max-bounds");
const urlParams = new URLSearchParams(window.location.search);
const area = urlParams.get("area");
const blank = urlParams.get("blank");

let bounds = mapInitalBounds;
if (area === "festival") {
  bounds = festivalBounds;
}
if (area === "parade") {
  bounds = paradeBounds;
}
if (area === "car-show") {
  bounds = carShowInitalBounds;
}

function createBlankStyle(style) {
  const blankStyle = JSON.parse(JSON.stringify(style));
  blankStyle.layers = blankStyle.layers.reduce((acc, layer) => {
    if (layer.source !== "features") {
      acc.push(layer);
    }
    return acc;
  }, []);
  return blankStyle;
}

const map = new Map({
  container: "map",
  style: blank === null ? mapStyle : createBlankStyle(mapStyle),
  bounds: bounds,
  maxBounds: maxBounds,
  minZoom: 12,
  maxZoom: 20,
  attributionControl: false,
});

if (blank) {

  document.getElementById("attribution").style.opacity = "0";
  let scale = new ScaleControl({
    maxWidth: 80,
    unit: 'imperial'
  });
  map.addControl(scale);
} else {
  map.scrollZoom.enable();

  map.addControl(
    new NavigationControl({
      showCompass: false,
    }),
    "top-left"
  );

  map.addControl(new FullscreenControl(), "bottom-left");
  map.addControl(
    new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    }),
    "top-left"
  );
}

// window.__AHP_DEBUG__ = {};
// window.__AHP_DEBUG__.map = map;

// const popup = new Popup({
//   anchor: "bottom",
//   className: "ahp-popup",
//   closeOnClick: true,
//   closeOnMove: true,
//   offset: [7, 0],
// });

map.on("load", function () {
  map.once("movestart", () => {
    document.getElementById("attribution").style.opacity = "0";
  });

  // map.on("moveend", () => {
  //   popup.remove();
  // });

  map.on("zoomend", function () {
    const zoom = map.getZoom();
    console.log("Zoom: ", zoom);
  });

  // function createPopup(e) {
  //   const features = map.queryRenderedFeatures(e.point);
  //   const feature = features.find((f) => f.properties.note);
  //   console.log(feature);
  //   if (feature) {
  //     const coordinates = feature.geometry.coordinates.slice();
  //     const description = feature.properties.note;

  //     // Ensure that if the map is zoomed out such that multiple
  //     // copies of the feature are visible, the popup appears
  //     // over the copy being pointed to.
  //     while (Math.abs(e.lngLat - coordinates[0]) > 180) {
  //       coordinates[0] += e.lngLat > coordinates[0] ? 360 : -360;
  //     }

  //     popup.setLngLat(coordinates).setHTML(description).addTo(map);
  //   }
  // }

  // map.on("click", "restroom", createPopup);
  // map.on("click", "parking", createPopup);

  // map.on("click", (e) => {
  //   const features = map.queryRenderedFeatures(e.point);
  //   const displayFeatures = features.map((feature) => {
  //     const layer = feature.layer;
  //     const displayFeat = {
  //       id: layer.id,
  //       source: layer.source,
  //       sourceLayer: layer["source-layer"],
  //       properties: feature.properties,
  //     };
  //     return displayFeat;
  //   });
  //   console.log(JSON.stringify(displayFeatures, null, 2));
  // });
});
