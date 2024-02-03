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

function relativeRect(from: DOMRect, to: DOMRect): DOMRect {
  return new DOMRect(to.x - from.x, to.y - from.y, to.width, to.height);
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
  const boundsRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const transform = useSignal<Readonly<MoverTransform>>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const moverStyle = useComputed(
    () =>
      `transform: translate(${transform.value.x}px, ${transform.value.y}px) scale(${transform.value.scale});`,
  );

  // Pointer and scroll handling
  useEffect(() => {
    const applyChange = ({
      panX = 0,
      panY = 0,
      originX = 0,
      originY = 0,
      scaleDiff = 1,
    }: ApplyChangeOpts = {}) => {
      const originRect = originRef.current!.getBoundingClientRect();
      const currentFromOrigin = relativeRect(
        originRect,
        contentRef.current!.getBoundingClientRect(),
      );
      const boundsFromOrigin = relativeRect(
        originRect,
        boundsRef.current!.getBoundingClientRect(),
      );

      // Ensure we never go smaller than MIN_SIZExMIN_SIZE
      const minScaleDiff =
        1 /
        Math.max(
          currentFromOrigin.width / MIN_SIZE,
          currentFromOrigin.height / MIN_SIZE,
        );

      scaleDiff = Math.max(minScaleDiff, scaleDiff);

      let applyMatrix = new DOMMatrix()
        // Translate according to panning.
        .translateSelf(panX, panY)
        // Scale about the origin:
        .translateSelf(originX, originY)
        .scaleSelf(scaleDiff)
        .translateSelf(-originX, -originY);

      const tl = new DOMPoint(
        currentFromOrigin.left,
        currentFromOrigin.top,
      ).matrixTransform(applyMatrix);

      const br = new DOMPoint(
        currentFromOrigin.right,
        currentFromOrigin.bottom,
      ).matrixTransform(applyMatrix);

      // Adjust for bounds
      if (br.x < boundsFromOrigin.left) {
        applyMatrix = new DOMMatrix()
          .translateSelf(boundsFromOrigin.left - br.x, 0)
          .multiplySelf(applyMatrix);
      }

      if (br.y < boundsFromOrigin.top) {
        applyMatrix = new DOMMatrix()
          .translateSelf(0, boundsFromOrigin.top - br.y)
          .multiplySelf(applyMatrix);
      }

      if (tl.x > boundsFromOrigin.right) {
        applyMatrix = new DOMMatrix()
          .translateSelf(boundsFromOrigin.right - tl.x, 0)
          .multiplySelf(applyMatrix);
      }

      if (tl.y > boundsFromOrigin.bottom) {
        applyMatrix = new DOMMatrix()
          .translateSelf(0, boundsFromOrigin.bottom - tl.y)
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

    const tracker = new PointerTracker(boundsRef.current!, {
      start(event) {
        // We only want to track 2 pointers at most
        if (tracker.currentPointers.length === 2) return false;
        event.preventDefault();
        return true;
      },
      move(previousPointers) {
        const currentPointers = tracker.currentPointers;
        const centerRect = originRef.current!.getBoundingClientRect();

        // For calculating panning movement
        const prevMidpoint = getMidpoint(
          previousPointers[0],
          previousPointers[1],
        );
        const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);

        // Midpoint
        const originX = prevMidpoint.clientX - centerRect.left;
        const originY = prevMidpoint.clientY - centerRect.top;

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

    boundsRef.current!.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();

        const centerRect = originRef.current!.getBoundingClientRect();
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
          originX: event.clientX - centerRect.left,
          originY: event.clientY - centerRect.top,
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
    <div ref={boundsRef} class={styles.pinchZoom}>
      <div ref={originRef} class={styles.origin}>
        <div style={moverStyle} class={styles.mover}>
          <div ref={contentRef} class={styles.content}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export { PinchZoom as default };
