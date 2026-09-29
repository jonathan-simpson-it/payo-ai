"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";
import { BuilderView } from "@/components/payo/builder";
import { LandingPage } from "@/components/payo/landing";
import { OverviewScreen, WorkflowsList } from "@/components/payo/misc";
import { RunDetail, RunsList } from "@/components/payo/runs";
import { routeKey, useRoute } from "@/lib/payo/router";
import { PayoProvider, UIProvider } from "@/lib/payo/store";
import { TemplateLibrary } from "@/components/payo/templates";
import { AboutDemoDialog } from "@/components/payo/ui";
import { WorkspaceShell } from "@/components/payo/shell";

function Router() {
  const route = useRoute();
  const key = routeKey(route);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);

  let view: ReactNode;
  if (route.name === "landing") {
    view = <LandingPage />;
  } else if (route.name === "workflow") {
    view = <BuilderView workflowId={route.id} />;
  } else if (route.name === "run") {
    view = <RunDetail runId={route.id} />;
  } else if (route.area === "overview") {
    view = <OverviewScreen />;
  } else if (route.area === "workflows") {
    view = <WorkflowsList />;
  } else if (route.area === "runs") {
    view = <RunsList />;
  } else {
    view = <TemplateLibrary />;
  }

  return (
    <>
      {route.name === "landing" ? view : <WorkspaceShell route={route}>{view}</WorkspaceShell>}
      <AboutDemoDialog />
      <Toaster theme="light" position="bottom-right" />
    </>
  );
}

export function PayoApp() {
  return (
    <PayoProvider>
      <UIProvider>
        <Router />
      </UIProvider>
    </PayoProvider>
  );
}
