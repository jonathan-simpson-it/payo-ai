"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";
import { BuilderView } from "@/components/payo/builder";
import { CreateBrief } from "@/components/payo/create-brief";
import { LandingPage } from "@/components/payo/landing";
import { OverviewScreen, WorkflowsList } from "@/components/payo/misc";
import { RunDetail, RunsList } from "@/components/payo/runs";
import { routeKey, useRoute } from "@/lib/payo/router";
import { PayoProvider, UIProvider } from "@/lib/payo/store";
import { TourProvider, useTour } from "@/lib/payo/tour";
import { TemplateLibrary } from "@/components/payo/templates";
import { AboutDemoDialog } from "@/components/payo/ui";
import { ProductTour } from "@/components/payo/tour-overlay";
import { WorkspaceShell } from "@/components/payo/shell";

function Router() {
  const route = useRoute();
  const { active: tourActive } = useTour();
  const key = routeKey(route);

  useEffect(() => {
    if (!tourActive) window.scrollTo(0, 0);
  }, [key, tourActive]);

  let view: ReactNode;
  if (route.name === "landing") {
    view = <LandingPage />;
  } else if (route.name === "workflow") {
    view = <BuilderView workflowId={route.id} />;
  } else if (route.name === "run") {
    view = <RunDetail runId={route.id} />;
  } else if (route.area === "overview") {
    view = <OverviewScreen />;
  } else if (route.area === "create") {
    view = <CreateBrief />;
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
      <Toaster position="bottom-left" />
    </>
  );
}

export function PayoApp() {
  return (
    <PayoProvider>
      <UIProvider>
        <TourProvider>
          <Router />
          <ProductTour />
        </TourProvider>
      </UIProvider>
    </PayoProvider>
  );
}
