<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <div class="title">{{ title }}</div>
      <div class="actions">
        <el-button type="primary" @click="showDSL">查看DSL</el-button>
        <el-button type="warning" @click="importDSL">导入DSL</el-button>
        <el-button type="info" @click="loadDemo">导入示例</el-button>
        <el-button type="success" @click="saveDSL">保存</el-button>
      </div>
    </div>
    <div class="logic-flow-view">
      <!-- 工具栏 -->
      <Control v-if="showLf" class="control-panel-container" :lf="lf"></Control>
      <!-- 左侧节点面板 -->
      <NodePanel v-if="showLf" :lf="lf" :title="title"></NodePanel>
      <!-- 画布 -->
      <div id="LF-view" ref="container"></div>
      <!-- 属性面板 -->
      <PropertyDialog 
        v-if="showAttribute" 
        :title="title" 
        :nodeData="nodeData" 
        :flowDetail="flowDetail" 
        :lf="lf" 
        @closed="showAttribute = false"
      ></PropertyDialog>
      
      <!-- DSL预览对话框 -->
      <el-dialog
        v-model="dslVisible"
        title="规则引擎DSL"
        width="60%"
      >
        <pre class="dsl-preview">{{ JSON.stringify(dslData, null, 2) }}</pre>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dslVisible = false">关闭</el-button>
            <el-button type="primary" @click="copyDSL">
              复制
            </el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- DSL导入对话框 -->
      <el-dialog
        v-model="importVisible"
        title="导入规则引擎DSL"
        width="60%"
      >
        <el-form>
          <el-form-item>
            <el-input
              v-model="importContent"
              type="textarea"
              :rows="10"
              placeholder="请粘贴DSL内容（JSON格式）"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="importVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmImport">
              导入
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import LogicFlow from '@logicflow/core';
import { Menu, Snapshot, MiniMap } from '@logicflow/extension';
import { ElMessage } from 'element-plus';
import { convertToDSL, convertFromDSL } from '@/utils/index';
import Control from './components/Control.vue';
import NodePanel from './components/NodePanel.vue';
import PropertyDialog from './components/PropertyDialog.vue';
import registerNodes from './registerNode';
import registerEdges from './registerEdge';

const props = defineProps({
  title: {
    type: String,
    default: '规则引擎',
  },
});

// 逻辑流实例
let lf = ref<LogicFlow | null>(null);
// 节点数据
let nodeData = ref<Record<string, any> | null>(null);
// 是否显示属性面板
let showAttribute = ref(false);
// 是否显示DSL对话框
let dslVisible = ref(false);
// DSL数据
let dslData = ref<any>(null);
// 流程详情
let flowDetail = reactive<Record<string, any>>({});
// 容器引用
let container = ref<HTMLElement | null>(null);
// 是否显示逻辑流
let showLf = ref(false);
// 是否显示导入对话框
let importVisible = ref(false);
// 导入内容
let importContent = ref('');

// 初始化逻辑流
const initLogicFlow = () => {
  if (!container.value) return;
  
  // @ts-ignore - 忽略LogicFlow构造函数的类型错误
  const logicFlow = new LogicFlow({
    container: container.value,
    background: {
      backgroundColor: '#ffffff',
    },
    grid: {
      size: 10,
      visible: true,
    },
    keyboard: {
      enabled: true,
    },
    adjustEdge: true,
    adjustEdgeStartAndEnd: true,
    edgeSelectedOutline: true,
    hoverOutline: false,
    nodeTextEdit: false,
    edgeTextEdit: false,
    autoExpand: true,
    plugins: [Menu, MiniMap, Snapshot],
  });
  
  lf.value = logicFlow;
  showLf.value = true;
  
  // 设置主题
  logicFlow.setTheme({
    baseNode: {
      fill: '#FFFFFF',
      stroke: '#000000',
      strokeWidth: 1,
    },
    nodeText: {
      color: '#000000',
      overflowMode: 'ellipsis',
      padding: '0 15px',
      fontSize: 14,
    },
    edgeText: {
      color: '#000000',
      background: {
        fill: '#ffffff',
      },
    },
  });
  
  // 设置默认边类型
  logicFlow.setDefaultEdgeType('bezier');
  
  // 注册节点和边
  registerNodes(logicFlow);
  registerEdges(logicFlow);
  
  // 监听事件
  logicFlow.on('element:click', ({ data }: { data: any }) => {
    nodeData.value = data;
    showAttribute.value = true;
  });
  
  // 监听拖拽添加节点
  logicFlow.on('drop', (data: any) => {
    try {
      const { type, label } = JSON.parse(data.text);
      const { offsetX, offsetY } = data;
      
      // 添加节点
      logicFlow.addNode({
        type,
        x: offsetX,
        y: offsetY,
        text: label,
        properties: {
          name: label,
          desc: `${label}节点`,
          frontend_status: '1',
        },
      });
    } catch (e) {
      console.error('拖拽添加节点失败:', e);
    }
  });
  
  // 渲染初始数据
  renderInitialData();
};

// 渲染初始数据
const renderInitialData = () => {
  if (!lf.value) return;
  
  // 初始数据
  const initData = {
    nodes: [
      {
        id: '1',
        type: 'start',
        x: 300,
        y: 100,
        properties: {
          name: '开始',
          desc: '规则链入口',
          frontend_status: '1',
        },
        text: {
          x: 300,
          y: 100,
          value: '开始',
        },
      },
      {
        id: '2',
        type: 'log',
        x: 300,
        y: 250,
        properties: {
          name: '日志',
          desc: '输出日志',
          template: '${msg.data}',
          frontend_status: '1',
        },
        text: {
          x: 300,
          y: 250,
          value: '日志',
        },
      },
    ],
    edges: [
      {
        id: '1-2',
        type: 'bezier',
        sourceNodeId: '1',
        targetNodeId: '2',
        properties: {
          edgeType: 'success',
        },
      },
    ],
  };
  
  lf.value.render(initData);
};

// 显示DSL
const showDSL = () => {
  if (!lf.value) return;
  
  const data = lf.value.getGraphData();
  dslData.value = convertToDSL(data);
  dslVisible.value = true;
};

// 导入DSL
const importDSL = () => {
  importContent.value = '';
  importVisible.value = true;
};

// 确认导入
const confirmImport = () => {
  if (!importContent.value || !lf.value) {
    ElMessage.warning('请输入有效的DSL内容');
    return;
  }
  
  try {
    const dslObj = JSON.parse(importContent.value);
    const graphData = convertFromDSL(dslObj);
    lf.value.render(graphData);
    importVisible.value = false;
    ElMessage.success('DSL导入成功');
  } catch (e) {
    console.error('DSL导入错误:', e);
    ElMessage.error('DSL格式错误，请检查内容');
  }
};

// 复制DSL
const copyDSL = () => {
  if (!dslData.value) return;
  
  const dslString = JSON.stringify(dslData.value, null, 2);
  navigator.clipboard.writeText(dslString).then(() => {
    ElMessage.success('DSL已复制到剪贴板');
    dslVisible.value = false;
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};

// 保存DSL
const saveDSL = () => {
  if (!lf.value) return;
  
  const data = lf.value.getGraphData();
  const dsl = convertToDSL(data);
  console.log('保存DSL:', dsl);
  ElMessage.success('规则引擎DSL已保存');
};

// 加载演示数据
const loadDemo = () => {
  if (!lf.value) return;
  
  const demoData = {
    id: 'demo-rule-chain',
    name: '示例规则链',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        name: '开始',
        desc: '规则链入口',
        status: true,
        properties: {
          trigger: '温度传感器',
          frontend_status: '1',
        },
        next: [
          {
            id: 'edge-1',
            type: 'default',
            target: 'decision-1',
          }
        ]
      },
      {
        id: 'decision-1',
        type: 'decision',
        name: '温度判断',
        desc: '判断温度是否过高',
        status: true,
        properties: {
          condition: '${msg.temperature} > 30',
          frontend_status: '1',
        },
        next: [
          {
            id: 'edge-2',
            type: 'success',
            target: 'assignment-1',
            condition: '${msg.temperature} > 30'
          },
          {
            id: 'edge-3',
            type: 'fail',
            target: 'log-2',
            condition: '${msg.temperature} <= 30'
          }
        ]
      },
      {
        id: 'assignment-1',
        type: 'assignment',
        name: '设置状态',
        desc: '设置温度过高状态',
        status: true,
        properties: {
          variable: 'status',
          value: '温度过高',
          frontend_status: '1',
        },
        next: [
          {
            id: 'edge-4',
            type: 'default',
            target: 'log-1',
          }
        ]
      },
      {
        id: 'log-1',
        type: 'log',
        name: '警告日志',
        desc: '输出警告日志',
        status: true,
        properties: {
          template: '警告：温度过高 ${msg.temperature}',
          frontend_status: '1',
        },
        next: []
      },
      {
        id: 'log-2',
        type: 'log',
        name: '正常日志',
        desc: '输出正常日志',
        status: true,
        properties: {
          template: '正常：温度正常 ${msg.temperature}',
          frontend_status: '1',
        },
        next: []
      }
    ],
    metadata: {
      layout: {
        nodes: [
          {
            id: 'start-1',
            position: { x: 300, y: 100 }
          },
          {
            id: 'decision-1',
            position: { x: 300, y: 250 }
          },
          {
            id: 'assignment-1',
            position: { x: 500, y: 400 }
          },
          {
            id: 'log-1',
            position: { x: 500, y: 550 }
          },
          {
            id: 'log-2',
            position: { x: 100, y: 400 }
          }
        ]
      }
    }
  };
  
  try {
    const graphData = convertFromDSL(demoData);
    lf.value.render(graphData);
    ElMessage.success('示例数据导入成功');
  } catch (e) {
    console.error('示例数据导入错误:', e);
    ElMessage.error('导入失败，请检查控制台错误');
  }
};

onMounted(() => {
  initLogicFlow();
});
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-toolbar {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  
  .title {
    font-size: 18px;
    font-weight: bold;
  }
  
  .actions {
    display: flex;
    gap: 10px;
  }
}

.logic-flow-view {
  flex: 1;
  position: relative;
  display: flex;
}

#LF-view {
  flex: 1;
  height: 100%;
}

.control-panel-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.dsl-preview {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: monospace;
}
</style> 