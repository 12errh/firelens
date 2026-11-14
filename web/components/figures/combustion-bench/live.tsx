"use client";

import * as React from "react";
import { IsoFigure } from "../../iso/react/draw";
import { asksForStillness, follow, useReadout } from "../../iso/react/live";
import { flameOf, pointerPath, pointerTip } from "./frame";
import { needlePath } from "./geometry";
import {
  clamp,
  needleAngleOf,
  OXYGEN_MAX,
  OXYGEN_MIN,
  readoutOf,
  REST_GRAVITY,
  REST_OXYGEN,
} from "./model";
import {
  DIAL_R,
  gravityAtScreen,
  HEIGHT,
  oxygenAtScreen,
  WIDTH,
} from "./view";

const FOLLOW = 0.085;
const BREATH_PERIOD = 6;
const MOST_DT = 1 / 30;

interface Nodes {
  flameOuter: SVGPathElement | null;
  flameCore: SVGPathElement | null;
  pointer: SVGPathElement | null;
  pointerDot: SVGCircleElement | null;
  needle: SVGPathElement | null;
}

interface Props {
  label: string;
  base: React.ReactNode;
  structure: React.ReactNode;
  camera: React.ReactNode;
  bottle: React.ReactNode;
  chamberBack: React.ReactNode;
  chamberFront: React.ReactNode;
  hose: React.ReactNode;
  recorder: React.ReactNode;
  cable: React.ReactNode;
  controls: React.ReactNode;
}

export function CombustionLive(props: Props) {
  const { anchor, say } = useReadout<HTMLDivElement>();
  const root = React.useRef<HTMLDivElement | null>(null);
  const nodes = React.useRef<Nodes>({
    flameOuter: null,
    flameCore: null,
    pointer: null,
    pointerDot: null,
    needle: null,
  });
  const gravity = React.useRef(REST_GRAVITY);
  const wantGravity = React.useRef(REST_GRAVITY);
  const oxygen = React.useRef(REST_OXYGEN);
  const wantOxygen = React.useRef(REST_OXYGEN);
  const dragging = React.useRef<"knob" | "dial" | null>(null);
  const frame = React.useRef(0);
  const last = React.useRef(0);
  const clock = React.useRef(0);
  const shown = React.useRef({ gravity: REST_GRAVITY, oxygen: REST_OXYGEN, breath: 0 });

  const rest = React.useMemo(() => {
    const flame = flameOf(REST_GRAVITY, 0);
    return {
      outer: flame.outer,
      core: flame.core,
      pointer: pointerPath(REST_GRAVITY),
      tip: pointerTip(REST_GRAVITY),
      needle: needlePath(needleAngleOf(REST_OXYGEN), DIAL_R - 3.4, 2.8),
    };
  }, []);

  const paint = React.useCallback((dt: number) => {
    const calm = asksForStillness();
    if (calm) {
      gravity.current = wantGravity.current;
      oxygen.current = wantOxygen.current;
    } else {
      gravity.current = follow(gravity.current, wantGravity.current, dt, FOLLOW, false);
      oxygen.current = follow(oxygen.current, wantOxygen.current, dt, FOLLOW, false);
    }
    clock.current += calm ? 0 : dt;
    const breath = calm ? 0 : Math.sin((clock.current / BREATH_PERIOD) * Math.PI * 2);
    const state = shown.current;
    const g = gravity.current;
    const o = oxygen.current;
    if (
      state.gravity !== g ||
      state.oxygen !== o ||
      Math.abs(state.breath - breath) > 1e-4
    ) {
      const flame = flameOf(g, breath);
      nodes.current.flameOuter?.setAttribute("d", flame.outer);
      nodes.current.flameCore?.setAttribute("d", flame.core);
      nodes.current.pointer?.setAttribute("d", pointerPath(g));
      const tip = pointerTip(g);
      nodes.current.pointerDot?.setAttribute("cx", `${Math.round(tip[0] * 10) / 10}`);
      nodes.current.pointerDot?.setAttribute("cy", `${Math.round(tip[1] * 10) / 10}`);
      nodes.current.needle?.setAttribute("d", needlePath(needleAngleOf(o), DIAL_R - 3.4, 2.8));
      state.gravity = g;
      state.oxygen = o;
      state.breath = breath;
      say(readoutOf(g, o));
    }
  }, [say]);

  const kick = React.useCallback(() => {
    if (frame.current) return;
    last.current = 0;
    const step = (now: number) => {
      frame.current = 0;
      const dt = last.current ? Math.min((now - last.current) / 1000, MOST_DT) : 1 / 60;
      last.current = now;
      paint(dt);
      if (!asksForStillness()) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [paint]);

  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.at(-1)?.isIntersecting) kick();
      },
      { rootMargin: "140px 0px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [kick]);

  React.useEffect(() => {
    kick();
  }, [kick]);

  const screenOf = (clientX: number, clientY: number) => {
    const svg = root.current?.querySelector("svg");
    const box = svg?.getBoundingClientRect();
    if (!box || !box.width || !box.height) return null;
    return [
      ((clientX - box.left) / box.width) * WIDTH,
      ((clientY - box.top) / box.height) * HEIGHT,
    ] as [number, number];
  };

  const apply = (part: "knob" | "dial", clientX: number, clientY: number) => {
    const screen = screenOf(clientX, clientY);
    if (!screen) return;
    if (part === "knob") wantGravity.current = gravityAtScreen(screen);
    else wantOxygen.current = oxygenAtScreen(screen);
    kick();
  };

  const partOf = (target: EventTarget | null) => {
    const element = target as Element | null;
    return element?.closest?.("[data-part]")?.getAttribute("data-part") ?? null;
  };

  const bind = <K extends keyof Nodes>(key: K) => (node: Nodes[K]) => {
    nodes.current[key] = node;
  };

  return (
    <div
      ref={(node) => {
        root.current = node;
        anchor.current = node;
      }}
      className="cb-root"
      role="group"
      tabIndex={0}
      aria-label="Microgravity combustion bench. Arrow up or right raises gravity, arrow down or left lowers it, shift with an arrow changes the oxygen, Home is one gravity and End is microgravity."
      onPointerDown={(event) => {
        const part = partOf(event.target);
        if (part !== "knob" && part !== "dial") return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragging.current = part;
        apply(part, event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        const part = dragging.current;
        if (!part) return;
        apply(part, event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragging.current = null;
      }}
      onPointerCancel={() => {
        dragging.current = null;
      }}
      onKeyDown={(event) => {
        const fine = event.shiftKey ? 0.02 : 0.05;
        if (event.key === "ArrowUp" || event.key === "ArrowRight") {
          if (event.shiftKey) wantOxygen.current = clamp(wantOxygen.current + 0.5, OXYGEN_MIN, OXYGEN_MAX);
          else wantGravity.current = clamp(wantGravity.current + fine, 0, 1);
        } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
          if (event.shiftKey) wantOxygen.current = clamp(wantOxygen.current - 0.5, OXYGEN_MIN, OXYGEN_MAX);
          else wantGravity.current = clamp(wantGravity.current - fine, 0, 1);
        } else if (event.key === "Home") {
          wantGravity.current = 1;
        } else if (event.key === "End") {
          wantGravity.current = 0;
        } else {
          return;
        }
        event.preventDefault();
        kick();
      }}
    >
      <IsoFigure width={WIDTH} height={HEIGHT} label={props.label}>
        {props.base}
        {props.structure}
        {props.camera}
        {props.bottle}
        {props.chamberBack}
        <g className="cb-flame-group">
          <path ref={bind("flameOuter")} className="cb-flame" d={rest.outer} />
          <path ref={bind("flameCore")} className="cb-flame-core" d={rest.core} />
        </g>
        {props.chamberFront}
        {props.hose}
        {props.recorder}
        {props.cable}
        {props.controls}
        <g className="cb-live">
          <path ref={bind("pointer")} className="iso-line cb-pointer" data-tone="hi" d={rest.pointer} />
          <circle
            ref={bind("pointerDot")}
            className="cb-pointer-dot"
            cx={Math.round(rest.tip[0] * 10) / 10}
            cy={Math.round(rest.tip[1] * 10) / 10}
            r={1.2}
          />
          <path ref={bind("needle")} className="iso-line cb-needle" data-tone="lit" d={rest.needle} />
        </g>
      </IsoFigure>
    </div>
  );
}
