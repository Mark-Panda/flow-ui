<template>
  <div class="control-panel-container">
    <div class="control-item" @click="zoomOut">
      <el-tooltip content="缩小" placement="right">
        <el-icon><ZoomOut /></el-icon>
      </el-tooltip>
    </div>
    <div class="control-item" @click="zoomIn">
      <el-tooltip content="放大" placement="right">
        <el-icon><ZoomIn /></el-icon>
      </el-tooltip>
    </div>
    <div class="control-item" @click="resetZoom">
      <el-tooltip content="重置缩放" placement="right">
        <el-icon><FullScreen /></el-icon>
      </el-tooltip>
    </div>
    <div class="divider"></div>
    <div class="control-item" @click="undo">
      <el-tooltip content="撤销" placement="right">
        <el-icon><Back /></el-icon>
      </el-tooltip>
    </div>
    <div class="control-item" @click="redo">
      <el-tooltip content="重做" placement="right">
        <el-icon><Right /></el-icon>
      </el-tooltip>
    </div>
    <div class="divider"></div>
    <div class="control-item" @click="deleteElement">
      <el-tooltip content="删除选中元素" placement="right">
        <el-icon><Delete /></el-icon>
      </el-tooltip>
    </div>
    <div class="control-item" @click="clearGraph">
      <el-tooltip content="清空画布" placement="right">
        <el-icon><RemoveFilled /></el-icon>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ZoomIn, ZoomOut, FullScreen, Back, Right, Delete, RemoveFilled } from '@element-plus/icons-vue';
import type LogicFlow from '@logicflow/core';
import { ElMessageBox } from 'element-plus';

const props = defineProps({
  lf: {
    type: Object as () => LogicFlow,
    required: true,
  },
});

// 缩小
const zoomOut = () => {
  props.lf.zoom(false);
};

// 放大
const zoomIn = () => {
  props.lf.zoom(true);
};

// 重置缩放
const resetZoom = () => {
  props.lf.resetZoom();
  props.lf.resetTranslate();
};

// 撤销
const undo = () => {
  props.lf.undo();
};

// 重做
const redo = () => {
  props.lf.redo();
};

// 删除选中元素
const deleteElement = () => {
  const elements = props.lf.getSelectElements();
  if (elements.nodes.length || elements.edges.length) {
    elements.nodes.forEach((node: any) => {
      props.lf.deleteNode(node.id);
    });
    elements.edges.forEach((edge: any) => {
      props.lf.deleteEdge(edge.id);
    });
  }
};

// 清空画布
const clearGraph = () => {
  ElMessageBox.confirm('确定要清空画布吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    props.lf.clearGraph();
  }).catch(() => {});
};
</script>

<style scoped lang="scss">
.control-panel-container {
  position: fixed;
  top: 80px;
  right: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  .control-item {
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .el-icon {
      font-size: 18px;
    }
  }
  
  .divider {
    height: 1px;
    background-color: #dcdfe6;
    margin: 5px 0;
  }
}
</style> 