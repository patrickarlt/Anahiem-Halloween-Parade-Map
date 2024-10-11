import maplibregl, { Map, LngLatBounds } from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Protocol } from "pmtiles";
import { bbox as findBoundingBox, truncate } from "@turf/turf";
import featureData from "./map/features.json";

import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./style.css";

import mapStyle from "./map/style.js";

const DRAW = false;
MapboxDraw.constants.classes.CONTROL_BASE = "maplibregl-ctrl";
MapboxDraw.constants.classes.CONTROL_PREFIX = "maplibregl-ctrl-";
MapboxDraw.constants.classes.CONTROL_GROUP = "maplibregl-ctrl-group";

let protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

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
});

map.addControl(new maplibregl.NavigationControl(), "top-left");

map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  }),
  "top-left"
);

window.__AHP_DEBUG__ = {};
window.__AHP_DEBUG__.map = map;

let drawControl = new MapboxDraw();
if (DRAW) {
  map.addControl(drawControl, "top-left");
}

map.on("load", function () {
  map.on("zoomend", function () {
    const zoom = map.getZoom();
    console.log("Zoom: ", zoom);
  });

  map.on("draw.create", function (e) {
    console.log(
      JSON.stringify(truncate(e.features[0], { precision: 7 }), null, 2)
    );
    console.log(JSON.stringify(bbox(e.features[0]), null, 2));
  });

  map.on("click", (e) => {
    const features = map.queryRenderedFeatures(e.point);

    const displayFeatures = features.map((feature) => {
      const layer = feature.layer;
      const displayFeat = {
        id: layer.id,
        source: layer.source,
        sourceLayer: layer["source-layer"],
        properties: feature.properties,
      };
      return displayFeat;
    });

    console.log(JSON.stringify(displayFeatures, null, 2));
  });
});
