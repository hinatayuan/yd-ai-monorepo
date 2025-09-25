import type { ReactElement, ReactNode, HookBucket } from 'react';
import { Fragment, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as Internals } from 'react';

interface RootInstance {
  container: Element;
  hooks: HookBucket['hooks'];
  current: ReactNode | null;
}

interface RootController {
  render(element: ReactNode): void;
  unmount(): void;
}

export function createRoot(container: Element): RootController {
  if (!(container instanceof Element)) {
    throw new Error('createRoot 需要一个有效的 DOM 元素');
  }

  const root: RootInstance = {
    container,
    hooks: [],
    current: null,
  };

  const bucket: HookBucket = {
    hooks: root.hooks,
    effects: [],
    rerender: () => {
      if (root.current == null) {
        return;
      }
      performRender(root.current);
    },
  };

  function performRender(element: ReactNode) {
    root.current = element;
    Internals.prepareForRender(bucket);
    const node = renderNode(element);
    root.container.replaceChildren(node);
    for (const effect of Internals.finishRender()) {
      effect.run();
    }
  }

  return {
    render(element: ReactNode) {
      performRender(element);
    },
    unmount() {
      root.current = null;
      root.hooks.forEach((hook: HookBucket['hooks'][number]) => {
        if (typeof hook.cleanup === 'function') {
          hook.cleanup();
        }
      });
      root.hooks.length = 0;
      root.container.replaceChildren();
    },
  };
}

function renderNode(node: ReactNode): Node {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return document.createComment('empty');
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return document.createTextNode(String(node));
  }

  if (Array.isArray(node)) {
    const fragment = document.createDocumentFragment();
    for (const child of node) {
      fragment.appendChild(renderNode(child));
    }
    return fragment;
  }

  const element = node as ReactElement;

  if (element.type === Fragment) {
    const fragment = document.createDocumentFragment();
    appendChildren(fragment, element.props?.children);
    return fragment;
  }

  if (typeof element.type === 'function') {
    const rendered = (element.type as (props: any) => ReactNode)({ ...element.props });
    return renderNode(rendered);
  }

  if (typeof element.type === 'string') {
    const dom = document.createElement(element.type);
    applyProps(dom, element.props ?? {});
    appendChildren(dom, element.props?.children);
    return dom;
  }

  return document.createTextNode('');
}

function appendChildren(target: Node, children: ReactNode | ReactNode[] | undefined): void {
  if (children === undefined || children === null) {
    return;
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    target.appendChild(renderNode(child));
  }
}

function applyProps(dom: Element, props: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || value === undefined) {
      continue;
    }

    if (key === 'className') {
      (dom as HTMLElement).className = value as string;
      continue;
    }

    if (key === 'style' && value && typeof value === 'object') {
      const style = (dom as HTMLElement).style;
      for (const [name, styleValue] of Object.entries(value as Record<string, unknown>)) {
        style.setProperty(toKebabCase(name), styleValue == null ? '' : String(styleValue));
      }
      continue;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      dom.addEventListener(eventName, value as EventListener);
      continue;
    }

    const attribute = key === 'htmlFor' ? 'for' : key;
    if (value === null) {
      dom.removeAttribute(attribute);
    } else {
      dom.setAttribute(attribute, String(value));
    }
  }
}

function toKebabCase(input: string): string {
  return input.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
