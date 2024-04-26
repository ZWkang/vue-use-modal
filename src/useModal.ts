import { createVNode, nextTick, ref, render, computed, shallowRef, cloneVNode, onScopeDispose } from 'vue';
import type { AppContext, Component, ComputedRef, Ref, VNode } from 'vue';
import type { ComponentExposed, ComponentProps } from './Component';

function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const getOverlay = () => {
  const popper = document.createElement('div');
  return popper;
};

let DialogContext: AppContext;

export function setDialogContext(appContext: AppContext) {
  DialogContext = appContext;
}

const defaultConfig = {
  visible: false,
};

type IProps<T, Lazy> = {
  lazy: Lazy;
  component: T;
  immediate?: boolean;
  getContainer?: () => HTMLElement;
  props?: Omit<ComponentProps<T>, 'visible'>;
  visible?: boolean;

  onConfirm?: () => void;
  onRemove?: () => void;
  onClose?: () => void;
  onOpen?: () => void;

  slots?: any;

  autoDestroy?: boolean;
};

type ComputedComponentExposed<Component> = ComputedRef<ComponentExposed<Component>>;

type ReturnValue<Comp extends Component, Lazy extends boolean> = {
  open: () => void;
  close: () => void;
  confirm: () => void;
  remove: () => void;

  internal: {
    container: HTMLElement | null;
    modalContainer: HTMLElement | null;
  };

  updateConfig: (config: Record<string, any> & ComponentProps<Comp>) => void;
  vm: VNode | null;

  visible: Ref<boolean>;
} & (Lazy extends true
  ? {
      expose: ComputedComponentExposed<Comp>;
    }
  : {
      expose?: ComputedComponentExposed<Comp>;
    });

export function useModal<Comp extends Component>(
  config: IProps<Comp, true>,
  context?: AppContext,
): ReturnValue<Comp, true>;
export function useModal<Comp extends Component>(
  config: IProps<Comp, false>,
  context?: AppContext,
): ReturnValue<Comp, false>;
export function useModal<Comp extends Component>(
  config: IProps<Comp, false> | IProps<Comp, true>,
  appContext?: any,
): ReturnValue<Comp, true> | ReturnValue<Comp, false> {
  let modalContainer: HTMLElement | null = getOverlay();
  let container: HTMLElement | null = null;
  // eslint-disable-next-line no-param-reassign
  appContext = appContext || DialogContext;
  const {
    component,
    props = null,
    immediate = false,
    getContainer,
    lazy = false,
    visible: _visible = defaultConfig.visible,
    autoDestroy = false,
  } = config;

  let vm: any = shallowRef<any>(null);

  const visible = ref(_visible);

  if (immediate) {
    visible.value = true;
  }

  const open = () => {
    if (!vm.value) init();
    if (vm.value?.component) {
      updateConfig({
        visible: true,
      });
    }

    config?.onOpen?.();
  };

  const confirm = () => {
    if (vm.value?.component) {
      updateConfig({
        visible: false,
      });
    }

    config?.onConfirm?.();
  };

  const remove = async () => {
    await nextTick();
    visible.value = false;

    if (modalContainer) {
      render(null, modalContainer);
      modalContainer.parentNode?.removeChild(modalContainer);
    }

    modalContainer = null;

    config?.onRemove?.();
  };

  const close = () => {
    if (vm.value?.component) {
      updateConfig({
        visible: false,
      });
    }

    config?.onClose?.();
  };

  const updateConfig = (config: Record<string, any> = {}) => {
    if (vm.value) {
      nextTick().then(() => {
        visible.value = config.visible ?? visible.value;
        render(cloneVNode(vm.value, { ...cloneDeep(vm.value?.component.props), ...config }), modalContainer!);
      });
    }
  };

  function init() {
    vm.value = createVNode(component, {
      visible: visible,
      ...props,
    });

    if (DialogContext && appContext) {
      vm.value.appContext = appContext;
    }

    render(vm.value, modalContainer!);

    (container = getContainer?.() ?? document.body).appendChild(modalContainer!);
  }

  if (!lazy) {
    init();
  }

  const expose = computed(() => {
    return vm.value?.component?.exposed;
  });

  if (autoDestroy) {
    onScopeDispose(remove);
  }

  return {
    open,
    close,
    confirm,
    updateConfig,
    remove,

    internal: {
      container,
      modalContainer,
    },
    vm,
    expose,
    visible,
  };
}
