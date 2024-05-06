<script lang="ts" setup>
import { defineEmits, defineProps } from 'vue';
import { useVModel } from '@vueuse/core';

interface IProps {
  visible: boolean;
  code: string;
  onClose: () => void;
}

// sometime use visible
// <Modal v-if="visible" />

const emits = defineEmits(['update:code']);
const props = defineProps<IProps>();

// const { code: propsCode } = toRefs(props);

const code = useVModel(props, 'code', emits, {
  passive: true,
});
</script>

<template>
  <t-drawer :visible="visible" @update:visible="onClose" header="header">
    <div>
      props code: input value: {{ code }}
      <t-input v-model="code"></t-input>
    </div>
  </t-drawer>
</template>

<style lang="scss" scoped></style>
