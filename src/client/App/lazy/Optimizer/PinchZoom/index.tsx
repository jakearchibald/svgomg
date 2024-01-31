import { FunctionComponent } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { useComputed, useSignal } from '@preact/signals';

import * as styles from './styles.module.css';
import PointerTracker from '../../../../utils/PointerTracker';

const MIN_SIZE = 30;

interface Point {
  clientX: number;
  clientY: number;
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
  const x = useSignal(0);
  const y = useSignal(0);
  const scale = useSignal(1);

  const moverStyle = useComputed(
    () =>
      `transform: translate(${x.value}px, ${y.value}px) scale(${scale.value});`,
  );

  useLayoutEffect(() => {
    const container = containerRef.current!;
    const mover = moverRef.current!;
    const containerRect = container.getBoundingClientRect();
    const moverRect = mover.getBoundingClientRect();

    // Center the mover
    x.value = (containerRect.width - moverRect.width) / 2;
    y.value = (containerRect.height - moverRect.height) / 2;
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

      const matrix = new DOMMatrix()
        // Translate according to panning.
        .translate(panX, panY)
        // Scale about the origin.
        .translate(originX, originY)
        // Apply current translate
        .translate(x.value, y.value)
        .scale(scaleDiff)
        .translate(-originX, -originY)
        // Apply current scale.
        .scale(scale.value);

      let newX = matrix.e;
      let newY = matrix.f;

      const tl = new DOMPoint(
        currentRect.left,
        currentRect.top,
      ).matrixTransform(matrix);

      const br = new DOMPoint(
        currentRect.right,
        currentRect.bottom,
      ).matrixTransform(matrix);

      // Adjust for bounds
      /*if (tl.x > containerRect.left) {
        newX -= tl.x - containerRect.left;
      }

      if (tl.y > containerRect.top) {
        newY -= tl.y - containerRect.top;
      }

      if (br.x < containerRect.right) {
        newX += containerRect.right - br.x;
      }

      if (br.y < containerRect.bottom) {
        newY += containerRect.bottom - br.y;
      }*/

      x.value = newX;
      y.value = newY;
      scale.value = matrix.a;
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

        // Combine next points with previous points
        const currentRect = moverRef.current!.getBoundingClientRect();

        // For calculating panning movement
        const prevMidpoint = getMidpoint(
          previousPointers[0],
          previousPointers[1],
        );
        const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);

        // Midpoint within the element
        const originX = prevMidpoint.clientX - currentRect.left;
        const originY = prevMidpoint.clientY - currentRect.top;

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

        const currentRect = moverRef.current!.getBoundingClientRect();
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
          originX: event.clientX - currentRect.left,
          originY: event.clientY - currentRect.top,
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
