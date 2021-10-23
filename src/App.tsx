import { useCallback, useEffect, useRef, useState, VFC } from "react";
import "./App.css";

type Viewport = {
  width: number;
  height: number;
};

type MousePosition = {
  x: number;
  y: number;
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
  }, []);
  return {
    viewport,
    observeSize,
  };
};

const useMousePosition = () => {
  const [mousePosition, set] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const observeMousePosition = useCallback((target: HTMLElement) => {
    target.addEventListener("mousemove", (ev: MouseEvent) => {
      const { x, y } = ev;
      set({ x, y });
    });
  }, []);
  return {
    mousePosition,
    observeMousePosition,
  };
};

const useEscapingTimer = () => {
  const timer = setInterval(() => {}, 300);
  return () => {
    clearInterval(timer);
  };
};

const EscapingButton: VFC<{
  viewport: Viewport;
  mousePosition: MousePosition;
}> = ({ viewport, mousePosition }) => {
  return <button>CLICK ME</button>;
};

function App() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const { viewport, observeSize } = useViewportSize();
  const { mousePosition, observeMousePosition } = useMousePosition();

  useEffect(() => {
    const target = backgroundRef.current;
    if (target) {
      observeSize(target);
      observeMousePosition(target);
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
