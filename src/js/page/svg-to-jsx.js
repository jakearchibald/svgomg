const toPascalCase = (value) =>
  value
    .replace(/[^a-zA-Z\d]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

const ensureIconSuffix = (value) =>
  value.endsWith('Icon') ? value : `${value}Icon`;

const escapeAttributeValue = (value) => value.replace(/"/g, '&quot;');

const camelCase = (value) =>
  value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

const toJsxAttributeName = (name) => {
  if (name === 'class') return 'className';
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;

  if (name.includes(':')) {
    const [prefix, suffix, ...rest] = name.split(':');
    const tail = [suffix, ...rest].join(':');
    return `${prefix}${tail.charAt(0).toUpperCase()}${tail.slice(1)}`;
  }

  return camelCase(name);
};

const serializeStyleObject = (styleText) => {
  const entries = styleText
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [rawProperty, ...rest] = entry.split(':');
      const rawValue = rest.join(':');
      const property = rawProperty?.trim();
      const value = rawValue?.trim();
      if (!property || !value) return null;
      const key = property.startsWith('--')
        ? `'${property}'`
        : camelCase(property);
      return `${key}: ${JSON.stringify(value)}`;
    })
    .filter(Boolean);

  return entries.length ? `{ ${entries.join(', ')} }` : '{}';
};

const serializeSvgNodeToJsx = (node, indentLevel) => {
  const indent = '  '.repeat(indentLevel);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return [];
    return [`${indent}{${JSON.stringify(text)}}`];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const el = node;
  const tagName = el.tagName;

  const attributes = Array.from(el.attributes)
    .map((attr) => {
      const attrName = toJsxAttributeName(attr.name);
      if (attrName === 'style')
        return `style={${serializeStyleObject(attr.value)}}`;
      return `${attrName}="${escapeAttributeValue(attr.value)}"`;
    })
    .join(' ');

  const children = Array.from(el.childNodes).flatMap((child) =>
    serializeSvgNodeToJsx(child, indentLevel + 1)
  );

  const openTag = attributes ? `<${tagName} ${attributes}` : `<${tagName}`;

  if (children.length === 0) return [`${indent}${openTag} />`];

  return [`${indent}${openTag}>`, ...children, `${indent}</${tagName}>`];
};

const shouldReplacePaintWithCurrentColor = (value) => {
  const normalized = value.trim();
  if (!normalized) return false;

  const lower = normalized.toLowerCase();
  if (
    [
      'none',
      'transparent',
      'currentcolor',
      'inherit',
      'initial',
      'unset',
    ].includes(lower)
  )
    return false;
  if (
    lower.startsWith('url(') ||
    lower.startsWith('var(') ||
    lower.startsWith('context-')
  )
    return false;

  if (/^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(normalized))
    return true;
  if (/^(rgb|rgba|hsl|hsla|hwb|lab|lch|color)\(/i.test(normalized)) return true;
  if (/^[a-z]+$/i.test(normalized)) return true;

  return false;
};

const convertSvgPaintToCurrentColor = (svgElement) => {
  const elements = [
    svgElement,
    ...Array.from(svgElement.querySelectorAll('*')),
  ];

  for (const el of elements) {
    for (const attrName of ['fill', 'stroke']) {
      const value = el.getAttribute(attrName);
      if (value && shouldReplacePaintWithCurrentColor(value)) {
        el.setAttribute(attrName, 'currentColor');
      }
    }

    for (const attrName of [
      'fill-opacity',
      'stroke-opacity',
      'fillOpacity',
      'strokeOpacity',
    ]) {
      if (el.hasAttribute(attrName)) el.removeAttribute(attrName);
    }

    const style = el.getAttribute('style');
    if (!style) continue;

    const entries = style
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean);

    let changed = false;
    const nextEntries = entries
      .map((entry) => {
        const [rawProperty, ...rest] = entry.split(':');
        const property = rawProperty?.trim();
        const rawValue = rest.join(':');
        const paintValue = rawValue?.trim();
        if (!property || !paintValue) return entry;

        const lowerProperty = property.toLowerCase();
        if (
          lowerProperty === 'fill-opacity' ||
          lowerProperty === 'fillopacity'
        ) {
          changed = true;
          return null;
        }

        if (
          lowerProperty === 'stroke-opacity' ||
          lowerProperty === 'strokeopacity'
        ) {
          changed = true;
          return null;
        }

        if (
          (lowerProperty === 'fill' || lowerProperty === 'stroke') &&
          shouldReplacePaintWithCurrentColor(paintValue)
        ) {
          changed = true;
          return `${property}:currentColor`;
        }

        return `${property}:${rawValue.trim()}`;
      })
      .filter(Boolean);

    if (!changed) continue;

    if (nextEntries.length) {
      el.setAttribute('style', nextEntries.join(';'));
    } else {
      el.removeAttribute('style');
    }
  }
};

const parseSvgMarkup = (svgMarkup, options) => {
  if (typeof DOMParser === 'undefined') {
    throw new TypeError('DOMParser is not available in this browser.');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError)
    throw new Error(
      'SVG parsing failed. Make sure you pasted valid SVG markup.'
    );

  const svgElement = doc.querySelector('svg');
  if (!svgElement) throw new Error('No <svg> root element found.');

  if (options?.convertPaintToCurrentColor) {
    convertSvgPaintToCurrentColor(svgElement);
  }

  return svgElement;
};

const getDefaultSize = (svgElement) => {
  const viewBox = svgElement.getAttribute('viewBox') ?? undefined;
  const width = svgElement.getAttribute('width') ?? undefined;
  const height = svgElement.getAttribute('height') ?? undefined;

  const parseNumeric = (value) => {
    if (!value) return undefined;
    const numeric = Number(value.replace('px', '').trim());
    return Number.isFinite(numeric) ? numeric : undefined;
  };

  const sizeFromWidth = parseNumeric(width);
  const sizeFromHeight = parseNumeric(height);
  const sizeFromViewBox = (() => {
    if (!viewBox) return undefined;
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part)))
      return undefined;
    return Math.max(parts[2], parts[3]);
  })();

  return sizeFromWidth ?? sizeFromHeight ?? sizeFromViewBox ?? 24;
};

const serializeRootAttributes = (svgElement) => {
  const rootAttributes = Array.from(svgElement.attributes)
    .filter(
      (attr) => !['width', 'height', 'class', 'style'].includes(attr.name)
    )
    .map((attr) => {
      const attrName = toJsxAttributeName(attr.name);
      if (attrName === 'style')
        return `style={${serializeStyleObject(attr.value)}}`;
      return `${attrName}="${escapeAttributeValue(attr.value)}"`;
    });

  if (!rootAttributes.some((attr) => attr.startsWith('xmlns='))) {
    rootAttributes.unshift('xmlns="http://www.w3.org/2000/svg"');
  }

  if (!rootAttributes.some((attr) => attr.startsWith('viewBox='))) {
    rootAttributes.push('viewBox="0 0 24 24"');
  }

  return rootAttributes;
};

export const generateReactComponentFromSvg = (
  rawName,
  svgMarkup,
  options = {}
) => {
  const baseName = toPascalCase(rawName);
  if (!baseName) throw new Error('Enter a component name.');

  const componentName =
    options.ensureIconSuffix === false ? baseName : ensureIconSuffix(baseName);

  const svgElement = parseSvgMarkup(svgMarkup, {
    convertPaintToCurrentColor: options.convertPaintToCurrentColor,
  });

  const defaultSize = getDefaultSize(svgElement);
  const rootAttributes = serializeRootAttributes(svgElement);
  const children = Array.from(svgElement.childNodes).flatMap((child) =>
    serializeSvgNodeToJsx(child, 2)
  );

  const isTypeScript = options.typescript !== false;
  const propsType = isTypeScript ? `: ${componentName}Props` : '';

  const componentSource = [
    `import * as React from 'react';`,
    ``,
    ...(isTypeScript
      ? [
          `export type ${componentName}Props = React.SVGProps<SVGSVGElement> & {`,
          `  size?: string | number;`,
          `};`,
          ``,
        ]
      : []),
    `export const ${componentName} = ({ className, size = ${defaultSize}, ...props }${propsType}) => (`,
    `  <svg`,
    ...rootAttributes.map((attr) => `    ${attr}`),
    `    width={size}`,
    `    height={size}`,
    `    className={className}`,
    `    {...props}`,
    `  >`,
    ...children,
    `  </svg>`,
    `);`,
    ``,
  ].join('\n');

  const extension = isTypeScript ? 'tsx' : 'jsx';

  return {
    componentName,
    componentSource,
    fileName: `${componentName}.${extension}`,
  };
};
