import {
  createVNode,
  nextTick,
  ref,
  render,
  computed,
  shallowRef,
  cloneVNode,
  onScopeDispose,
  unref,
  isRef,
} from 'vue';
import type { AppContext, Component, ComputedRef, Ref, RenderFunction, ShallowRef, VNode } from 'vue';
import type { ComponentExposed, ComponentProps, ComponentSlots } from './Component';
import { getSlots } from './helper';

// Function to get the overlay element
export const getOverlay = () => {
  const popper = document.createElement('div');
  return popper;
};

// Type for the computed component exposed
type ComputedComponentExposed<Component> = ComputedRef<ComponentExposed<Component>>;
type MaybeRef<T> = T | Ref<T>;

type MarkMaybeRef<T extends Record<string, any>> = {
  [key in keyof T]: MaybeRef<T[key]>;
};

function handleProps(obj: Record<string, Ref<any> | any>) {
  const keys = Object.keys(obj);
  const refKeys = keys.filter((key) => isRef(obj[key]));
  const values: any = {};
  refKeys.forEach((key) => {
    values[key] = unref(obj[key]);
  });

  return {
    ...obj,
    ...values,
  };
}

let DialogContext: AppContext;

// Function to set the dialog context
export function setDialogContext(appContext: AppContext) {
  DialogContext = appContext;
}

// Default configuration for the modal
const defaultConfig = {
  visible: false,
};

type ISlots<T> = {
  [key in keyof ComponentSlots<T>]: string | Component | RenderFunction;
};

// Interface for the props of the useModal function
type IProps<T, Lazy> = {
  lazy?: Lazy;
  component: T;

  getContainer?: () => HTMLElement;
  props?: MarkMaybeRef<Omit<ComponentProps<T>, 'visible'>>;
  visible?: boolean;
  __exp_autoRef?: boolean;

  _keepAlive?: boolean;

  onConfirm?: () => void;
  onRemove?: () => void;
  onClose?: () => void;
  onOpen?: () => void;

  slots?: ISlots<T>;

  immediate?: boolean;
  autoDestroy?: boolean;
};

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

  updateConfig: (arg: { props: MarkMaybeRef<Record<string, any> & ComponentProps<Comp>>; reset?: boolean }) => void;
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
    lazy = true,
    visible: _visible = defaultConfig.visible,
    autoDestroy = false,
    _keepAlive = false,
    __exp_autoRef = true,
    slots,
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
    if (vm.value && !_keepAlive) {
      destroy();
      vm.value = null;
    }
    if (!vm.value) {
      init();
    }

    if (vm.value?.component) {
      if (__exp_autoRef) {
        updateConfig({
          reset: true,
          props: props === null ? { visible: true } : { ...handleProps(props), visible: true },
        });
      } else {
        updateConfig({
          reset: true,
          props: props === null ? { visible: true } : { ...props, visible: true },
        });
      }
    }

    config?.onOpen?.();
  };

  /**
   * Confirms the modal.
   */
  const confirm = () => {
    if (vm.value?.component) {
      updateConfigNoSet(false);
    }

    config?.onConfirm?.();
  };

  /**
   * Removes the modal.
   */
  const remove = async () => {
    await nextTick();
    visible.value = false;

    destroy();

    modalContainer = null;

    config?.onRemove?.();
  };

  /**
   * Closes the modal.
   */
  const close = () => {
    if (vm.value?.component) {
      updateConfigNoSet(false);
    }

    config?.onClose?.();
  };

  /**
   * Updates the configuration of the modal.
   * @param config - The new configuration.
   */
  const updateConfig = ({ props, reset = false }: { props: Record<string, any>; reset?: boolean }) => {
    if (vm.value) {
      nextTick().then(() => {
        visible.value = config.visible ?? visible.value;
        if (reset) {
          render(cloneVNode(vm.value, { ...props }), modalContainer!);
        } else {
          render(cloneVNode(vm.value, { ...vm.value?.component.props, ...props }), modalContainer!);
        }
      });
    }
  };

  const updateConfigNoSet = (visible: boolean) => {
    updateConfig({
      props: { visible },
    });
  };

  function destroy() {
    if (modalContainer) {
      render(null, modalContainer);
      modalContainer.parentNode?.removeChild(modalContainer);
    }
  }

  /**
   * Initializes the modal.
   */
  function init() {
    vm.value = createVNode(
      component,
      {
        visible: visible.value,
        ...props,
      },
      getSlots<Comp>(slots),
    );

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
