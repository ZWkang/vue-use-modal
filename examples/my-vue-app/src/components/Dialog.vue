<script lang="ts" setup>
import { defineProps, toRefs } from 'vue';

interface IProps {
  visible: any;
  currentTab: any;
  onClose: () => void;
}

const props = defineProps<IProps>();

const {} = toRefs(props);
</script>

<template>
  <t-dialog :visible="visible" :onCancel="onClose"
    >1
    <t-input v-model="currentTab.code"></t-input>
  </t-dialog>
</template>

<style lang="scss" scoped></style>
