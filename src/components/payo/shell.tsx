"use client";

import { History, Home, Info, LayoutTemplate, Workflow, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { usePayo, useUI } from "@/lib/payo/store";
import type { Route } from "@/lib/payo/router";
import { PayoMark } from "@/components/payo/mark";
import { ThemeToggle } from "@/components/payo/theme-toggle";
import { RunStatusChip } from "@/components/payo/ui";
import { cn } from "@/lib/utils";

interface NavItem {
  area: "overview" | "workflows" | "templates" | "runs";
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { area: "overview", label: "Overview", icon: Home },
  { area: "workflows", label: "Workflows", icon: Workflow },
  { area: "templates", label: "Templates", icon: LayoutTemplate },
  { area: "runs", label: "Runs", icon: History },
];

function areaOfRoute(route: Route): "overview" | "workflows" | "templates" | "runs" {
  switch (route.name) {
    case "workspace":
      return route.area;
    case "workflow":
      return "workflows";
    case "run":
      return "runs";
    default:
      return "templates";
  }
}

export function WorkspaceShell({ route, children }: { route: Route; children: ReactNode }) {
  const { openAbout } = useUI();
  const { state, workflowById, runById } = usePayo();
  const activeArea = areaOfRoute(route);
  const engine = state.engine && state.engine.phase !== "done" ? state.engine : null;
  const needsReviewCount = state.runs.filter((r) => r.status === "needs-review").length;

  // Breadcrumb for the current screen
  let crumbParent = "Workspace";
  let crumbHere = "Templates";
  let crumbParentHref = "#/workspace/templates";
  if (route.name === "workspace") {
    const item = NAV_ITEMS.find((n) => n.area === route.area);
    crumbHere = item?.label ?? "Templates";
    crumbParentHref = `#/workspace/${route.area}`;
  } else if (route.name === "workflow") {
    crumbParent = "Workflows";
    crumbHere = workflowById(route.id)?.name ?? "Workflow";
    crumbParentHref = "#/workspace/workflows";
  } else if (route.name === "run") {
    crumbParent = "Runs";
    crumbHere = runById(route.id)?.code ?? "Run";
    crumbParentHref = "#/workspace/runs";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left navigation */}
      <aside className="hidden w-[212px] shrink-0 flex-col border-r border-border md:flex">
        <a
          href="#/"
          className="flex h-14 items-center gap-2.5 border-b border-border px-5"
          aria-label="Payo AI — back to landing page"
        >
          <PayoMark className="size-[26px]" />
          <span className="text-[14.5px] font-semibold tracking-tight">Payo AI</span>
        </a>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4" aria-label="Workspace">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => {
            const active = item.area === activeArea;
            const Icon = item.icon;
            return (
              <a
                key={item.area}
                href={`#/workspace/${item.area}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-primary-tint text-primary-ink"
                    : "text-ink-2 hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
                {item.area === "runs" && needsReviewCount > 0 && (
                  <span className="ml-auto inline-flex items-center rounded-sm bg-warn-tint px-1.5 text-[10.5px] font-medium tabular-nums text-warn">
                    {needsReviewCount}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
        <div className="border-t border-border px-3 py-3">
          <button
            type="button"
            onClick={openAbout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-ink-2 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Info className="size-4" aria-hidden="true" />
            About this demo
          </button>
          <p className="px-3 pb-1 pt-2 text-[11.5px] leading-relaxed text-ink-3">
            V0 prototype · Simulated data
          </p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Utility header */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13.5px]">
            <span className="hidden text-ink-3 sm:inline">{crumbParent}</span>
            <span className="hidden text-ink-3 sm:inline" aria-hidden="true">
              /
            </span>
            <span className="truncate font-medium text-foreground">{crumbHere}</span>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {engine && (
              <a
                href={`#/workspace/runs/${engine.runId}`}
                className="hidden sm:inline-flex"
                aria-label={`View run in progress (${engine.runId})`}
              >
                <RunStatusChip status={runById(engine.runId)?.status ?? "running"} />
              </a>
            )}
            <ThemeToggle className="size-8" />
            <button
              type="button"
              onClick={openAbout}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-foreground"
              aria-label="About this demo — sample data is simulated"
            >
              <span className="size-1.5 rounded-full bg-ink-3/80" aria-hidden="true" />
              Sample data
            </button>
            <button
              type="button"
              onClick={openAbout}
              className="hidden text-[12.5px] font-medium text-ink-2 transition-colors hover:text-foreground md:inline-flex"
            >
              About this demo
            </button>
          </div>
        </header>

        {/* Mobile navigation */}
        <nav
          aria-label="Workspace sections"
          className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const active = item.area === activeArea;
            return (
              <a
                key={item.area}
                href={`#/workspace/${item.area}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-[13px] font-medium",
                  active ? "bg-primary-tint text-primary-ink" : "text-ink-2",
                )}
              >
                {item.label}
                {item.area === "runs" && needsReviewCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center rounded-sm bg-warn-tint px-1.5 text-[10.5px] font-medium tabular-nums text-warn">
                    {needsReviewCount}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
