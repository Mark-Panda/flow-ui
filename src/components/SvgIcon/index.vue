<template>
  <div class="svg-icon" :class="iconClass" :style="{ color: color }">
    <svg class="icon" aria-hidden="true">
      <use :xlink:href="iconName" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  iconClass: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '',
  },
});

const iconName = computed(() => `#icon-${props.iconClass}`);
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}

.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style> 