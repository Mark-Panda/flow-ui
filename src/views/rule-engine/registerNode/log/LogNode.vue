<template>
  <div class="log-node" :class="{ 'node-disabled': disabled, 'node-selected': selected }">
    <div class="node-icon">
      <svg class="icon" viewBox="0 0 1024 1024" width="24" height="24">
        <path d="M832 64H192c-70.4 0-128 57.6-128 128v640c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128zM192 128h640c35.2 0 64 28.8 64 64v64H128v-64c0-35.2 28.8-64 64-64z m640 768H192c-35.2 0-64-28.8-64-64V320h768v512c0 35.2-28.8 64-64 64z" fill="#409EFF"></path>
        <path d="M256 224m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#409EFF"></path>
        <path d="M384 224m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#409EFF"></path>
        <path d="M512 224m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#409EFF"></path>
        <path d="M256 448h512v64H256zM256 576h512v64H256zM256 704h512v64H256z" fill="#409EFF"></path>
      </svg>
    </div>
    <div class="node-text">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: '日志'
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
.log-node {
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