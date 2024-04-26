import { createVNode, nextTick, ref, render, computed, shallowRef, cloneVNode, onScopeDispose } from 'vue';
import type { AppContext, Component, ComputedRef, Ref, ShallowRef, VNode } from 'vue';
import type { ComponentExposed, ComponentProps } from './Component';

// Function to deep clone an object
function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Function to get the overlay element
export const getOverlay = () => {
  const popper = document.createElement('div');
  return popper;
};

let DialogContext: AppContext;

// Function to set the dialog context
export function setDialogContext(appContext: AppContext) {
  DialogContext = appContext;
}

// Default configuration for the modal
const defaultConfig = {
  visible: false,
};

// Interface for the props of the useModal function
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

// Type for the computed component exposed
type ComputedComponentExposed<Component> = ComputedRef<ComponentExposed<Component>>;

// Return value type of the useModal function
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
  vm: ShallowRef<VNode | null>;

  visible: Ref<boolean>;
} & (Lazy extends true
  ? {
      expose: ComputedComponentExposed<Comp>;
    }
  : {
      expose?: ComputedComponentExposed<Comp>;
    });

/**
 * Custom hook for managing a modal component.
 * @param config - Configuration object for the modal.
 * @param appContext - Optional application context.
 * @returns An object containing functions and properties for managing the modal.
 */
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

  /**
   * Opens the modal.
   */
  const open = () => {
    if (!vm.value) init();
    if (vm.value?.component) {
      updateConfig({
        visible: true,
      });
    }

    config?.onOpen?.();
  };

  /**
   * Confirms the modal.
   */
  const confirm = () => {
    if (vm.value?.component) {
      updateConfig({
        visible: false,
      });
    }

    config?.onConfirm?.();
  };

  /**
   * Removes the modal.
   */
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

  /**
   * Closes the modal.
   */
  const close = () => {
    if (vm.value?.component) {
      updateConfig({
        visible: false,
      });
    }

    config?.onClose?.();
  };

  /**
   * Updates the configuration of the modal.
   * @param config - The new configuration.
   */
  const updateConfig = (config: Record<string, any> = {}) => {
    if (vm.value) {
      nextTick().then(() => {
        visible.value = config.visible ?? visible.value;
        render(cloneVNode(vm.value, { ...cloneDeep(vm.value?.component.props), ...config }), modalContainer!);
      });
    }
  };

  /**
   * Initializes the modal.
   */
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
