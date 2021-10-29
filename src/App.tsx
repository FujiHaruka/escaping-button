import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  VFC,
} from "react";
import "./App.css";
import { calcDistance, mostDistantPoint } from "./math";

type Viewport = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

const ESCAPING_THRESHOLD_DISTANCE = 200;
const ESCAPING_DISTANCE = 200;

const isZero = (obj: Record<string, number>) =>
  Object.values(obj).every((n) => n === 0);

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

const useButtonPosition = () => {
  const [buttonPosition, setButtonPosition] = useState<Position>({
    x: 400,
    y: 400,
  });
  return {
    buttonPosition,
    setButtonPosition,
  };
};

const EscapingButton: VFC<{
  position: Position;
}> = ({ position }) => {
  const { x, y } = position;
  const style = useMemo(
    () => ({
      top: `${y}px`,
      left: `${x}px`,
    }),
    [x, y]
  );
  return (
    <button className="escaping-button secondary" style={style}>
      CLICK ME IN THE RYE
    </button>
  );
};

function App() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const { viewport, observeSize } = useViewportSize();
  const { mousePosition, observeMousePosition } = useMousePositionTracking();
  const { buttonPosition, setButtonPosition } = useButtonPosition();

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

  useEffect(() => {
    if (isZero(mousePosition) || isZero(viewport)) {
      return;
    }

    if (
      calcDistance(mousePosition, buttonPosition) > ESCAPING_THRESHOLD_DISTANCE
    ) {
      return;
    }

    const nextPosition = mostDistantPoint(
      mousePosition,
      buttonPosition,
      ESCAPING_DISTANCE,
      viewport
    );
    setButtonPosition(nextPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mousePosition.x,
    mousePosition.y,
    buttonPosition.x,
    buttonPosition.y,
    viewport.width,
    viewport.height,
  ]);

  return (
    <>
      <div className="background" ref={backgroundRef}></div>;
      <EscapingButton position={buttonPosition} />
    </>
  );
}

export default App;
