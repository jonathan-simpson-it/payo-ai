"use client";

import { useEffect, useState } from "react";

/**
 * Tiny hash-based router. The whole Payo prototype lives on the single `/`
 * Next.js route; views are addressed as `#/workspace/...` hashes so that
 * deep links and browser back/forward keep working.
 */

export type Route =
  | { name: "landing" }
  | { name: "workspace"; area: "overview" | "templates" | "workflows" | "runs" }
  | { name: "workflow"; id: string }
  | { name: "run"; id: string };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, "");
  if (!h.startsWith("/")) return { name: "landing" };
  const parts = h.slice(1).split("/").filter(Boolean);
  if (parts[0] !== "workspace") return { name: "landing" };
  if (parts[1] === "workflows" && parts[2]) return { name: "workflow", id: parts[2] };
  if (parts[1] === "runs" && parts[2]) return { name: "run", id: parts[2] };
  if (parts[1] === "overview") return { name: "workspace", area: "overview" };
  if (parts[1] === "workflows") return { name: "workspace", area: "workflows" };
  if (parts[1] === "runs") return { name: "workspace", area: "runs" };
  return { name: "workspace", area: "templates" };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "landing":
      return "#/";
    case "workspace":
      return `#/workspace/${route.area}`;
    case "workflow":
      return `#/workspace/workflows/${route.id}`;
    case "run":
      return `#/workspace/runs/${route.id}`;
  }
}

export function navigate(path: string): void {
  const target = path.startsWith("#") ? path : `#${path}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
}

export function routeKey(route: Route): string {
  return routeToHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>({ name: "landing" });

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return route;
}
