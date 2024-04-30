<script lang="ts" setup>
import { defineProps } from 'vue';

interface IProps {
  onClose: () => void;
  visible: boolean;

  currentTab: any;
}

defineProps<IProps>();
</script>

<template>
  <t-drawer :visible="visible" @update:visible="onClose" header="header">
    <t-input v-model="currentTab.code"></t-input>
  </t-drawer>
</template>

<style lang="scss" scoped></style>
