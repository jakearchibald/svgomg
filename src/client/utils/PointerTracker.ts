/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const enum Buttons {
  None,
  LeftMouseOrTouchOrPenDown,
}

const noop = () => {};

type StartCallback = (event: PointerEvent) => boolean;
type MoveCallback = (
  previousPointers: PointerEvent[],
  event: PointerEvent,
) => void;
type EndCallback = (event: PointerEvent, cancelled: boolean) => void;

interface PointerTrackerOptions {
  /**
   * Called when a pointer is pressed/touched within the element.
   *
   * @param event The new pointer. This pointer isn't included in this.currentPointers or
   * this.startPointers yet.
   *
   * @returns Whether you want to track this pointer as it moves.
   */
  start?: StartCallback;
  /**
   * Called when pointers have moved.
   *
   * @param previousPointers The state of the pointers before this event. This contains the same
   * number of pointers, in the same order, as this.currentPointers and this.startPointers.
   * @param event The pointer that has changed since the last move callback.
   */
  move?: MoveCallback;
  /**
   * Called when a pointer is released.
   *
   * @param event The final state of the pointer that ended. This pointer is now absent from
   * this.currentPointers and this.startPointers.
   * @param cancelled Was the action cancelled? Actions are cancelled when the OS takes over pointer
   * events, for actions such as scrolling.
   */
  end?: EndCallback;
}

/**
 * Track pointers across a particular element
 */
export default class PointerTracker {
  /**
   * State of the tracked pointers when they were pressed/touched.
   */
  readonly startPointers: PointerEvent[] = [];
  /**
   * Latest state of the tracked pointers. Contains the same number of pointers, and in the same
   * order as this.startPointers.
   */
  readonly currentPointers: PointerEvent[] = [];

  #startCallback: StartCallback;
  #moveCallback: MoveCallback;
  #endCallback: EndCallback;
  #element: HTMLElement;

  /**
   * Track pointers across a particular element
   *
   * @param element Element to monitor.
   * @param options
   */
  constructor(
    element: HTMLElement,
    { start = () => true, move = noop, end = noop }: PointerTrackerOptions = {},
  ) {
    this.#startCallback = start;
    this.#moveCallback = move;
    this.#endCallback = end;
    this.#element = element;

    // Add listeners
    this.#element.addEventListener('pointerdown', this.#pointerStart);
  }

  /**
   * Remove all listeners.
   */
  stop() {
    this.#element.removeEventListener('pointerdown', this.#pointerStart);
    this.#element.removeEventListener('pointermove', this.#move);
    this.#element.removeEventListener('pointerup', this.#pointerEnd);
    this.#element.removeEventListener('pointercancel', this.#pointerEnd);
  }

  /**
   * Call the start callback for this pointer, and track it if the user wants.
   *
   * @param event
   * @returns Whether the pointer is being tracked.
   */
  #triggerPointerStart(event: PointerEvent): boolean {
    if (!this.#startCallback(event)) return false;
    this.currentPointers.push(event);
    this.startPointers.push(event);
    return true;
  }

  /**
   * Listener for mouse/pointer starts.
   *
   * @param event
   */
  #pointerStart = (event: PointerEvent) => {
    if (!(event.buttons & Buttons.LeftMouseOrTouchOrPenDown)) return;

    // If we're already tracking this pointer, ignore this event.
    // This happens with mouse events when multiple buttons are pressed.
    if (this.currentPointers.some((p) => p.pointerId === event.pointerId))
      return;

    if (!this.#triggerPointerStart(event)) return;

    // Add listeners for additional events.
    // The listeners may already exist, but it's a no-op to add them again.
    const capturingElement =
      event.target && 'setPointerCapture' in event.target
        ? (event.target as Element)
        : this.#element;

    capturingElement.setPointerCapture(event.pointerId);
    this.#element.addEventListener('pointermove', this.#move);
    this.#element.addEventListener('pointerup', this.#pointerEnd);
    this.#element.addEventListener('pointercancel', this.#pointerEnd);
  };

  /**
   * Listener for pointer/mouse/touch move events.
   */
  #move = (event: PointerEvent) => {
    const index = this.currentPointers.findIndex(
      (p) => p.pointerId === event.pointerId,
    );
    if (index === -1) return;

    if (event.pointerType === 'mouse' && event.buttons === Buttons.None) {
      // This happens in a number of buggy cases where the browser failed to deliver a pointerup
      // or pointercancel. If we see the pointer moving without any buttons down, synthesize an end.
      // https://github.com/w3c/pointerevents/issues/407
      // https://github.com/w3c/pointerevents/issues/408
      this.#pointerEnd(event);
      return;
    }

    const oldCurrentPointers = this.currentPointers.slice();
    this.currentPointers[index] = event;

    this.#moveCallback(oldCurrentPointers, event);
  };

  /**
   * Call the end callback for this pointer.
   *
   * @param pointer Pointer
   * @param event Related event
   */
  #triggerPointerEnd = (event: PointerEvent): boolean => {
    // Main button still down?
    // With mouse events, you get a mouseup per mouse button, so the left button might still be down.
    if (event.buttons & Buttons.LeftMouseOrTouchOrPenDown) {
      return false;
    }

    const index = this.currentPointers.findIndex(
      (p) => p.pointerId === event.pointerId,
    );

    // Not a pointer we're interested in?
    if (index === -1) return false;

    this.currentPointers.splice(index, 1);
    this.startPointers.splice(index, 1);

    // The event.type might be a 'move' event due to workarounds for weird mouse behaviour.
    // See #move for details.
    const cancelled = !(
      event.type === 'mouseup' ||
      event.type === 'touchend' ||
      event.type === 'pointerup'
    );

    this.#endCallback(event, cancelled);
    return true;
  };

  /**
   * Listener for mouse/pointer ends.
   *
   * @param event
   */
  #pointerEnd = (event: PointerEvent) => {
    if (!this.#triggerPointerEnd(event) || this.currentPointers.length) return;
    this.#element.removeEventListener('pointermove', this.#move);
    this.#element.removeEventListener('pointerup', this.#pointerEnd);
    this.#element.removeEventListener('pointercancel', this.#pointerEnd);
  };
}
