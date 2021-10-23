import React, { useCallback, useEffect, useRef, useState, VFC } from "react";
import "./App.css";

type Viewport = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

const useIntervalEffect = (
  callback: () => void,
  ms: number,
  deps: React.DependencyList
) => {
  const callbackRef = useRef<() => void>();
  callbackRef.current = callback;
  useEffect(() => {
    callbackRef.current?.();
    const timer = setInterval(() => {
      callbackRef.current?.();
    }, ms);
    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, ...deps]);
};

const useViewportSize = () => {
  const [viewport, set] = useState<Viewport>({ width: 0, height: 0 });
  const observeSize = useCallback((target: HTMLElement) => {
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      const rect = entry.target.getBoundingClientRect();
      set({
        width: rect.width,
        height: rect.height,
      });
    });
    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, []);
  return {
    viewport,
    observeSize,
  };
};

const useMousePositionTracking = () => {
  const [mousePosition, set] = useState<Position>({
    x: 0,
    y: 0,
  });
  const observeMousePosition = useCallback((target: HTMLElement) => {
    const onMouseMove = (ev: MouseEvent) => {
      const { x, y } = ev;
      set({ x, y });
    };
    target.addEventListener("mousemove", onMouseMove);
    return () => {
      target.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return {
    mousePosition,
    observeMousePosition,
  };
};

const useElementPositionTracking = () => {
  const elementRef = useRef<HTMLButtonElement>(null);
  const [{ x, y }, set] = useState<Position>({ x: 0, y: 0 });

  useIntervalEffect(
    () => {
      const element = elementRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.x === x && rect.y === y) {
        return;
      }
      set({
        x: rect.x,
        y: rect.y,
      });
    },
    100,
    [x, y]
  );
  return {
    position: { x, y },
    elementRef,
  };
};

const EscapingButton: VFC<{
  viewport: Viewport;
  mousePosition: Position;
}> = ({ viewport, mousePosition }) => {
  const { position, elementRef } = useElementPositionTracking();
  console.log({
    viewport,
    mousePosition,
    position,
  });
  return (
    <button
      className="escaping-button"
      ref={elementRef}
      style={{ top: "40%", left: "40%" }}
    >
      CLICK ME
    </button>
  );
};

function App() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const { viewport, observeSize } = useViewportSize();
  const { mousePosition, observeMousePosition } = useMousePositionTracking();

  useEffect(() => {
    const target = backgroundRef.current;
    if (target) {
      const unobserveSize = observeSize(target);
      const unobservePosition = observeMousePosition(target);
      return () => {
        unobserveSize();
        unobservePosition();
      };
    } else {
      return () => {};
    }
  }, [observeSize, observeMousePosition]);

  return (
    <>
      <div className="background" ref={backgroundRef}></div>;
      <EscapingButton viewport={viewport} mousePosition={mousePosition} />
    </>
  );
}

export default App;
