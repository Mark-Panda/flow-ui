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
import { v4 as uuidv4 } from 'uuid';
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
    
    // 使用更完整的数据格式，包含节点默认属性
    const dragData = {
      type: node.type,
      label: node.label,
      id: uuidv4(),
      icon: node.icon,
      properties: getDefaultProperties(node.type, node.label)
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

// 根据节点类型获取默认属性
const getDefaultProperties = (type: string, label: string) => {
  // 通用属性
  const commonProps = {
    name: label,
    desc: `${label}节点`,
    frontend_status: '1',
    // 添加统一的样式属性
    style: {
      fill: '#A0CFFF',
      stroke: '#E6A23C',
      strokeWidth: 2,
      radius: 10
    }
  };
  
  // 根据节点类型添加特定属性
  switch (type) {
    case 'start':
      return {
        ...commonProps,
        trigger: '默认触发器'
      };
    case 'log':
      return {
        ...commonProps,
        template: '${msg.data}'
      };
    case 'assignment':
      return {
        ...commonProps,
        variable: 'result',
        value: ''
      };
    case 'decision':
      return {
        ...commonProps,
        condition: ''
      };
    case 'startParallel':
      return {
        ...commonProps,
        branches: 2
      };
    case 'endParallel':
      return {
        ...commonProps,
        joinType: 'all'
      };
    default:
      return commonProps;
  }
};
</script>

<style scoped lang="scss">
.node-panel {
  width: 200px;
  height: 100%;
  background-color: #f5f7fa;
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
    background-color: #409eff;
    color: white;
  }
  
  .node-list {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    
    .node-item {
      height: 45px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      margin-bottom: 15px;
      border: 2px solid #dcdfe6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
      background-color: white;
      
      &:hover {
        border-color: #409eff;
        background-color: #ecf5ff;
        transform: translateY(-3px);
        box-shadow: 0 5px 12px rgba(64, 158, 255, 0.2);
      }
      
      .node-icon {
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 12px;
        
        .svg-icon {
          font-size: 20px;
          color: #409eff;
        }
      }
      
      .node-name {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}
</style> 