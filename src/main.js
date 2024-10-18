import {
  Map,
  LngLatBounds,
  addProtocol,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  Popup,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import { bbox as findBoundingBox } from "@turf/turf";
import featureData from "./map/features.json";

import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";

import mapStyle from "./map/style.js";

let protocol = new Protocol();
addProtocol("pmtiles", protocol.tile);

function boundsForFeature(kind) {
  const feature = featureData.features.find((f) => f.properties.kind === kind);
  const bbox = findBoundingBox(feature);
  return new LngLatBounds([
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ]);
}

const festivalBounds = boundsForFeature("festival-initial-bounds");
const paradeBounds = boundsForFeature("parade-initial-bounds");
const maxBounds = boundsForFeature("map-max-bounds");

const map = new Map({
  container: "map",
  style: mapStyle,
  bounds: festivalBounds,
  maxBounds: maxBounds,
  minZoom: 15.5,
  maxZoom: 20,
  attributionControl: false,
});

map.scrollZoom.disable();

map.addControl(
  new NavigationControl({
    showCompass: false,
  }),
  "top-right"
);
map.addControl(new FullscreenControl(), "bottom-left");
// map.addControl(
//   new GeolocateControl({
//     positionOptions: {
//       enableHighAccuracy: true,
//     },
//     trackUserLocation: true,
//   }),
//   "top-right"
// );

window.__AHP_DEBUG__ = {};
window.__AHP_DEBUG__.map = map;

const popup = new Popup({
  anchor: "bottom",
  className: "ahp-popup",
  closeOnClick: true,
  closeOnMove: true,
  offset: [7, 0],
});

map.on("load", function () {
  map.once("movestart", () => {
    document.getElementById("attribution").style.opacity = "0";
  });

  map.on("moveend", () => {
    popup.remove();
  });

  map.on("zoomend", function () {
    const zoom = map.getZoom();
    console.log("Zoom: ", zoom);
  });

  function createPopup(e) {
    const features = map.queryRenderedFeatures(e.point);
    const feature = features.find((f) => f.properties.note);
    console.log(feature);
    if (feature) {
      const coordinates = feature.geometry.coordinates.slice();
      const description = feature.properties.note;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat > coordinates[0] ? 360 : -360;
      }

      popup.setLngLat(coordinates).setHTML(description).addTo(map);
    }
  }

  map.on("click", "restroom", createPopup);
  map.on("click", "parking", createPopup);
});
