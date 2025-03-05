<template>
  <div class="node-panel">
    <div class="panel-title">节点类型</div>
    <div class="node-list">
      <div
        v-for="item in nodeList"
        :key="item.type"
        class="node-item"
        :draggable="true"
        @dragstart="onDragStart($event, item)"
      >
        <div class="node-icon">
          <SvgIcon :icon-class="item.icon" />
        </div>
        <div class="node-name">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type LogicFlow from '@logicflow/core';
import SvgIcon from '@/components/SvgIcon/index.vue';

const props = defineProps({
  lf: {
    type: Object as () => LogicFlow,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

// 节点列表
const nodeList = ref([
  {
    type: 'start',
    label: '开始',
    icon: 'start',
  },
  {
    type: 'log',
    label: '日志',
    icon: 'log',
  },
  {
    type: 'assignment',
    label: '赋值',
    icon: 'assignment',
  },
  {
    type: 'decision',
    label: '判断',
    icon: 'decision',
  },
  {
    type: 'startParallel',
    label: '并行开始',
    icon: 'startParallel',
  },
  {
    type: 'endParallel',
    label: '并行结束',
    icon: 'endParallel',
  },
]);

// 拖拽开始
const onDragStart = (e: DragEvent, node: any) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', JSON.stringify(node));
  }
};
</script>

<style scoped lang="scss">
.node-panel {
  width: 200px;
  height: 100%;
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  
  .panel-title {
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid #dcdfe6;
    background-color: #f5f7fa;
    color: #409eff;
  }
  
  .node-list {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    
    .node-item {
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      margin-bottom: 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      
      &:hover {
        border-color: #409eff;
        background-color: #ecf5ff;
        transform: translateY(-2px);
      }
      
      .node-icon {
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        
        .svg-icon {
          font-size: 18px;
          color: #409eff;
        }
      }
      
      .node-name {
        flex: 1;
        font-size: 14px;
      }
    }
  }
}
</style> 