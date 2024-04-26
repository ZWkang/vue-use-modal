import type { ComponentInternalInstance } from 'vue';

export function getInstanceExposed(component: null | ComponentInternalInstance) {
  return component?.exposed;
}
