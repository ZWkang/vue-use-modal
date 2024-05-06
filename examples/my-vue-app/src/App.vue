<script setup lang="ts">
import { useModal } from '../../../';
import { ref } from 'vue';
import Dialog from './components/Dialog.vue';
import Drawer from './components/Drawer.vue';
import KeepAliveDrawer from './components/KeepAliveDrawer.vue';

const data = ref({
  code: '123',
});

const { open: openDialog, close: closeDialog } = useModal({
  component: Dialog,
  props: {
    onClose() {
      closeDialog();
    },
    currentTab: data.value,
  },
});

const { open: openDrawer, close: closeDrawer } = useModal({
  component: Drawer,
  props: {
    onClose() {
      closeDrawer();
    },
    currentTab: data,
  },
});

const data2 = ref('');

const { open: openDrawer2, close: closeDrawer2 } = useModal({
  component: KeepAliveDrawer,
  // _keepAlive: true,
  props: {
    onClose() {
      closeDrawer2();
    },
    code: data2,
    'onUpdate:code'(val: string) {
      debugger;
      data2.value = val;
    },
  },
});
</script>

<template>
  <p>输入的文本内容</p>
  <p>{{ data.code }}</p>
  <t-button @click="openDialog">打开弹窗</t-button>

  <t-button @click="openDrawer">打开抽屉</t-button>

  <t-button @click="openDrawer2">打开抽屉2</t-button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
