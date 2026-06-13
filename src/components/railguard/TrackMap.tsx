import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Segment } from "@/lib/railguard/data";
import { riskColor } from "@/lib/railguard/data";

interface Props {
  segments: Segment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  incidentId: string | null;
  showAll: boolean;
}

export function TrackMap({ segments, selectedId, onSelect, incidentId, showAll }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.Polyline>>(new Map());
  const glowRef = useRef<Map<string, L.Polyline>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [26.8, 80.9],
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap © CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current.clear();
      glowRef.current.clear();
    };
  }, []);

  // Render / update polylines
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const seg of segments) {
      const color = riskColor(seg.riskScore);
      const isSelected = seg.id === selectedId;
      const isIncident = seg.id === incidentId;
      const visible = showAll || isSelected;

      let glow = glowRef.current.get(seg.id);
      let line = layersRef.current.get(seg.id);

      if (!visible) {
        if (line) { map.removeLayer(line); layersRef.current.delete(seg.id); }
        if (glow) { map.removeLayer(glow); glowRef.current.delete(seg.id); }
        continue;
      }

      if (!glow) {
        glow = L.polyline(seg.coords, {
          color: "#ffffff",
          weight: 12,
          opacity: 0,
          interactive: false,
        }).addTo(map);
        glowRef.current.set(seg.id, glow);
      }
      glow.setStyle({ opacity: isSelected ? 0.35 : 0 });

      if (!line) {
        line = L.polyline(seg.coords, {
          color,
          weight: isSelected || isIncident ? 7 : 5,
          opacity: 0.95,
          lineCap: "round",
        }).addTo(map);
        line.on("click", () => onSelect(seg.id));
        line.bindTooltip(`${seg.from} → ${seg.to}`, {
          direction: "top",
          className: "rg-tooltip",
        });
        layersRef.current.set(seg.id, line);
      } else {
        line.setStyle({
          color,
          weight: isSelected || isIncident ? 7 : 5,
        });
      }
    }

    // Fit bounds to the selected segment when isolated
    if (!showAll && selectedId) {
      const seg = segments.find((s) => s.id === selectedId);
      if (seg) {
        map.flyToBounds(L.latLngBounds(seg.coords), {
          padding: [60, 60],
          duration: 0.6,
          maxZoom: 9,
        });
      }
    }
  }, [segments, selectedId, incidentId, onSelect, showAll]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
}
