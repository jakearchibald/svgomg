import { FunctionComponent } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { useComputed, useSignal } from '@preact/signals';

import * as styles from './styles.module.css';
import PointerTracker from '../utils/PointerTracker';

const MIN_SIZE = 30;

interface Point {
  clientX: number;
  clientY: number;
}

interface MoverTransform {
  x: number;
  y: number;
  scale: number;
}

function getDistance(a: Point, b?: Point): number {
  if (!b) return 0;
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

function getMidpoint(a: Point, b?: Point): Point {
  if (!b) return a;

  return {
    clientX: (a.clientX + b.clientX) / 2,
    clientY: (a.clientY + b.clientY) / 2,
  };
}

interface ApplyChangeOpts {
  panX?: number;
  panY?: number;
  scaleDiff?: number;
  originX?: number;
  originY?: number;
  scale?: number;
  x?: number;
  y?: number;
}

interface Props {}

const PinchZoom: FunctionComponent<Props> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const transform = useSignal<Readonly<MoverTransform>>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const moverStyle = useComputed(
    () =>
      `transform: translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.scale});`,
  );

  // Initial centering
  useLayoutEffect(() => {
    const container = containerRef.current!;
    const mover = moverRef.current!;
    const containerRect = container.getBoundingClientRect();
    const moverRect = mover.getBoundingClientRect();

    transform.value = {
      x: (containerRect.width - moverRect.width) / 2,
      y: (containerRect.height - moverRect.height) / 2,
      scale: transform.value.scale,
    };
  }, []);

  // Handle resizing
  useLayoutEffect(() => {
    let previousRect: ResizeObserverSize | undefined;

    const observer = new ResizeObserver(([entry]) => {
      const currentRect = entry.borderBoxSize[0];

      if (previousRect) {
        const xPosDiff = (currentRect.inlineSize - previousRect.inlineSize) / 2;
        const yPosDiff = (currentRect.blockSize - previousRect.blockSize) / 2;

        transform.value = {
          x: transform.value.x + xPosDiff,
          y: transform.value.y + yPosDiff,
          scale: transform.value.scale,
        };
      }

      previousRect = currentRect;
    });

    observer.observe(containerRef.current!);

    return () => observer.disconnect();
  }, []);

  // Pointer and scroll handling
  useEffect(() => {
    const applyChange = ({
      panX = 0,
      panY = 0,
      originX = 0,
      originY = 0,
      scaleDiff = 1,
    }: ApplyChangeOpts = {}) => {
      const currentRect = moverRef.current!.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();

      // Ensure we never go smaller than MIN_SIZExMIN_SIZE
      const minScaleDiff =
        1 /
        Math.max(currentRect.width / MIN_SIZE, currentRect.height / MIN_SIZE);

      scaleDiff = Math.max(minScaleDiff, scaleDiff);

      let applyMatrix = new DOMMatrix()
        // Translate according to panning.
        .translateSelf(panX, panY)
        // Scale about the origin:
        .translateSelf(originX, originY)
        .scaleSelf(scaleDiff)
        .translateSelf(-originX, -originY);

      const tl = new DOMPoint(
        currentRect.left,
        currentRect.top,
      ).matrixTransform(applyMatrix);

      const br = new DOMPoint(
        currentRect.right,
        currentRect.bottom,
      ).matrixTransform(applyMatrix);

      // Adjust for bounds
      if (br.x < containerRect.left) {
        applyMatrix = new DOMMatrix()
          .translateSelf(containerRect.left - br.x, 0)
          .multiplySelf(applyMatrix);
      }

      if (br.y < containerRect.top) {
        applyMatrix = new DOMMatrix()
          .translateSelf(0, containerRect.top - br.y)
          .multiplySelf(applyMatrix);
      }

      if (tl.x > containerRect.right) {
        applyMatrix = new DOMMatrix()
          .translateSelf(containerRect.right - tl.x, 0)
          .multiplySelf(applyMatrix);
      }

      if (tl.y > containerRect.bottom) {
        applyMatrix = new DOMMatrix()
          .translateSelf(0, containerRect.bottom - tl.y)
          .multiplySelf(applyMatrix);
      }

      const finalMatrix = new DOMMatrix()
        .multiplySelf(applyMatrix)
        // Apply current transforms:
        .translateSelf(transform.value.x, transform.value.y)
        .scaleSelf(transform.value.scale);

      transform.value = {
        x: finalMatrix.e,
        y: finalMatrix.f,
        scale: finalMatrix.a,
      };
    };

    const tracker = new PointerTracker(containerRef.current!, {
      start(event) {
        // We only want to track 2 pointers at most
        if (tracker.currentPointers.length === 2) return false;
        event.preventDefault();
        return true;
      },
      move(previousPointers) {
        const currentPointers = tracker.currentPointers;
        const containerRect = containerRef.current!.getBoundingClientRect();

        // For calculating panning movement
        const prevMidpoint = getMidpoint(
          previousPointers[0],
          previousPointers[1],
        );
        const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);

        // Midpoint
        const originX = prevMidpoint.clientX - containerRect.left;
        const originY = prevMidpoint.clientY - containerRect.top;

        // Calculate the desired change in scale
        const prevDistance = getDistance(
          previousPointers[0],
          previousPointers[1],
        );
        const newDistance = getDistance(currentPointers[0], currentPointers[1]);
        const scaleDiff = prevDistance ? newDistance / prevDistance : 1;

        applyChange({
          originX,
          originY,
          scaleDiff,
          panX: newMidpoint.clientX - prevMidpoint.clientX,
          panY: newMidpoint.clientY - prevMidpoint.clientY,
        });
      },
    });

    const abortController = new AbortController();
    const { signal } = abortController;

    containerRef.current!.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();

        const containerRect = containerRef.current!.getBoundingClientRect();
        let { deltaY } = event;
        const { ctrlKey, deltaMode } = event;

        if (deltaMode === 1) {
          // 1 is "lines", 0 is "pixels"
          // Firefox uses "lines" for some types of mouse
          deltaY *= 15;
        }

        // ctrlKey is true when pinch-zooming on a trackpad.
        const divisor = ctrlKey ? 100 : 300;
        const scaleDiff = 1 - deltaY / divisor;

        applyChange({
          scaleDiff,
          originX: event.clientX - containerRect.left,
          originY: event.clientY - containerRect.top,
        });
      },
      { signal },
    );

    return () => {
      tracker.stop();
      abortController.abort();
    };
  }, []);

  return (
    <div ref={containerRef} class={styles.pinchZoom}>
      <div ref={moverRef} style={moverStyle} class={styles.mover}>
        {children}
      </div>
    </div>
  );
};

export { PinchZoom as default };
