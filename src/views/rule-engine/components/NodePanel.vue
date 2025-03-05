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
    // 设置拖拽效果，必须包含"copy"或"move"
    e.dataTransfer.effectAllowed = 'copyMove';
    
    // 使用更简洁的数据格式
    const dragData = {
      type: node.type,
      label: node.label
    };
    
    // 设置多种数据格式，确保兼容性
    const jsonString = JSON.stringify(dragData);
    e.dataTransfer.setData('text/plain', jsonString);
    e.dataTransfer.setData('application/json', jsonString);
    // 添加额外的兼容格式
    e.dataTransfer.setData('application/logicflow', jsonString);
    
    // 创建拖拽图像（临时元素）
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.padding = '10px';
    dragImage.style.background = '#409eff';
    dragImage.style.color = 'white';
    dragImage.style.borderRadius = '4px';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '9999';
    dragImage.style.opacity = '0.85';
    dragImage.innerHTML = node.label;
    document.body.appendChild(dragImage);
    
    try {
      // 设置拖拽图像
      e.dataTransfer.setDragImage(dragImage, 20, 20);
    } catch (error) {
      console.error('设置拖拽图像失败:', error);
    }
    
    // 延迟移除临时元素
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 100);
    
    console.log('开始拖拽节点:', node.type, '数据:', jsonString);
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