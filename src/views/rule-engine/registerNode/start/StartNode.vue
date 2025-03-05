<template>
  <div class="start-node" :class="{ 'node-disabled': disabled, 'node-selected': selected }">
    <div class="node-icon">
      <svg class="icon" viewBox="0 0 1024 1024" width="24" height="24">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#409EFF"></path>
        <path d="M676.1 505.3L457.7 348.8c-6.3-4.5-14.9-0.3-14.9 7.4v313.7c0 7.6 8.6 11.9 14.9 7.4l218.4-156.5c5.2-3.7 5.2-11.8 0-15.5z" fill="#409EFF"></path>
      </svg>
    </div>
    <div class="node-text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: '开始'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.start-node {
  width: 140px;
  height: 40px;
  line-height: 40px;
  background-color: #fff;
  border: 1px solid #c2c8d5;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.node-selected {
  border: 2px solid #409eff;
}

.node-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.node-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}

.node-text {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 