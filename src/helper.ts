import { h } from 'vue';
import type { RenderFunction, Component, ComponentInternalInstance, VNode } from 'vue';
import type { ComponentSlots } from './Component';

export function getInstanceExposed(component: null | ComponentInternalInstance) {
  return component?.exposed;
}

export function getSlots<T extends Component>(slots?: {
  [K in keyof ComponentSlots<T>]?: string | Component | RenderFunction;
}) {
  return Object.entries(slots || {}).reduce<Record<string, () => VNode>>((acc, cur) => {
    const slotName = cur[0] as string;
    const slot = cur[1] as string | Component;
    if (typeof slot === 'string') acc[slotName] = () => h('div', { innerHTML: slot });
    else acc[slotName] = () => h(slot);
    return acc;
  }, {});
}
