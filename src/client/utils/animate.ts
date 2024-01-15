export function animateTo(
  element: Element,
  to: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
) {
  const anim = element.animate(to, { ...options, fill: 'both' });
  anim.addEventListener('finish', () => {
    anim.commitStyles();
    anim.cancel();
  });
  return anim;
}

/**
 * @param {HTMLElement} element
 * @param {PropertyIndexedKeyframes} from
 * @param {KeyframeAnimationOptions} options
 */
export function animateFrom(
  element: Element,
  from: PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
) {
  return element.animate(
    { ...from, offset: 0 },
    { ...options, fill: 'backwards' },
  );
}
