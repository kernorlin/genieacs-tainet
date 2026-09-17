import { ClosureComponent, Component } from "mithril";
import { m } from "../components.ts";
import config from "../config.ts";
import {
  evaluateExpression,
  getClockSkew,
  getTimestamp,
} from "../store.ts";

const CHARTS = config.ui.overview.charts;
const ONLINE_GRACE_SECONDS = 5 * 60;
const DEFAULT_PERIODIC_INFORM_INTERVAL = 10 * 60;
const RECENTLY_SEEN_SECONDS = 24 * 60 * 60;
const DEVICE_STATUS_LABELS = {
  online: "Online now",
  recent: "Recently seen",
  offline: "Offline / no recent inform",
};

const PERIODIC_INFORM_INTERVAL_PARAMETERS = [
  "InternetGatewayDevice.ManagementServer.PeriodicInformInterval",
  "Device.ManagementServer.PeriodicInformInterval",
];

function getDeviceValue(device, parameter: string): unknown {
  const value = device?.[parameter]?.value;
  return Array.isArray(value) ? value[0] : null;
}

function getPeriodicInformInterval(device): number {
  for (const parameter of PERIODIC_INFORM_INTERVAL_PARAMETERS) {
    const interval = Number(getDeviceValue(device, parameter));
    if (Number.isFinite(interval) && interval > 0) return interval;
  }

  return DEFAULT_PERIODIC_INFORM_INTERVAL;
}

function getInformStatusSlice(
  chart,
  device,
): { slice: Record<string, unknown>; label: string } | null {
  const rawLastInform = getDeviceValue(device, "Events.Inform");
  if (rawLastInform == null) return null;

  const lastInform = Number(rawLastInform);
  if (!Number.isFinite(lastInform)) return null;

  const elapsed =
    (getTimestamp() + getClockSkew() - lastInform) / 1000;
  const onlineThreshold =
    getPeriodicInformInterval(device) + ONLINE_GRACE_SECONDS;

  const slices = chart.slices as Record<string, Record<string, unknown>>;
  if (elapsed <= onlineThreshold)
    return slices["1_onlineNow"]
      ? { slice: slices["1_onlineNow"], label: DEVICE_STATUS_LABELS.online }
      : null;
  if (elapsed <= RECENTLY_SEEN_SECONDS)
    return slices["2_past24"]
      ? { slice: slices["2_past24"], label: DEVICE_STATUS_LABELS.recent }
      : null;
  return slices["3_others"]
    ? { slice: slices["3_others"], label: DEVICE_STATUS_LABELS.offline }
    : null;
}

const component: ClosureComponent = (): Component => {
  return {
    view: (vnode) => {
      const device = vnode.attrs["device"];
      const chartName = evaluateExpression(vnode.attrs["chart"], device || {});
      const chart = CHARTS[chartName as string] as Record<string, unknown>;
      if (!chart) return null;
      const isInformStatus = chartName === "online";
      const informStatusSlice = isInformStatus
        ? getInformStatusSlice(chart, device)
        : null;
      const slices: Record<string, unknown>[] = isInformStatus
        ? informStatusSlice
          ? [informStatusSlice.slice]
          : []
        : Object.values(chart.slices);
      for (const slice of slices) {
        const filter = slice["filter"];
        if (isInformStatus || evaluateExpression(filter, device || {})) {
          const dot = m(
            "svg",
            {
              width: "1em",
              height: "1em",
              xmlns: "http://www.w3.org/2000/svg",
              "xmlns:xlink": "http://www.w3.org/1999/xlink",
            },
            m("circle", {
              cx: "0.5em",
              cy: "0.5em",
              r: "0.4em",
              fill: evaluateExpression(slice["color"], null),
            }),
          );
          return m(
            "span.overview-dot",
            dot,
            isInformStatus
              ? informStatusSlice?.label || ""
              : evaluateExpression(slice["label"], null),
          );
        }
      }
      return null;
    },
  };
};

export default component;
