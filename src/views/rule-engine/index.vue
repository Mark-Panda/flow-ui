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
      <div 
        id="LF-view" 
        ref="container" 
        class="lf-container"
        style="width: 100%; height: 100%; position: relative;"
      ></div>
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
import { ref, onMounted, reactive, nextTick } from 'vue';
import LogicFlow from '@logicflow/core';
import { Menu, Snapshot, MiniMap } from '@logicflow/extension';
import { ElMessage } from 'element-plus';
import { convertToDSL, convertFromDSL } from '@/utils/index';
import { v4 as uuidv4 } from 'uuid';
import Control from './components/Control.vue';
import NodePanel from './components/NodePanel.vue';
import PropertyDialog from './components/PropertyDialog.vue';
import registerNodes from './registerNode';
import registerEdges from './registerEdge';

// 声明全局变量
declare global {
  interface Window {
    anchorUpdateThrottle: any;
  }
}

const props = defineProps({
  title: {
    type: String,
    default: '规则引擎',
  },
});

// 逻辑流实例
let lf = ref<LogicFlow | null>(null);
// 节点数据
let nodeData = ref<Record<string, any> | undefined>(undefined);
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
const initLogicFlow = async () => {
  // 确保DOM已经渲染完成
  await nextTick();
  
  if (!container.value) {
    console.error('容器元素不存在');
    return;
  }
  
  // 确保容器有尺寸并且已挂载到DOM
  if (!document.body.contains(container.value)) {
    console.error('容器元素未挂载到DOM');
    return;
  }
  
  // 获取容器尺寸信息
  const clientWidth = container.value.clientWidth || 800;
  const clientHeight = container.value.clientHeight || 600;
  
  console.log('画布容器尺寸:', { clientWidth, clientHeight });
  
  // 直接清空容器内容，准备重新创建
  container.value.innerHTML = '';
  container.value.style.overflow = 'hidden'; // 确保容器不会有滚动条
  
  try {
    // 创建一个固定的div作为LogicFlow容器
    const lfContainer = document.createElement('div');
    lfContainer.id = 'lf-container';
    lfContainer.style.width = '100%';
    lfContainer.style.height = '100%';
    lfContainer.style.position = 'absolute';
    lfContainer.style.top = '0';
    lfContainer.style.left = '0';
    lfContainer.style.overflow = 'hidden';
    
    // 确保容器有明确的尺寸
    lfContainer.style.minWidth = `${clientWidth}px`;
    lfContainer.style.minHeight = `${clientHeight}px`;
    
    // 添加到DOM
    container.value.appendChild(lfContainer);
    
    // 确保容器已经完全渲染并有尺寸
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 再次检查容器尺寸
    const finalWidth = lfContainer.clientWidth || clientWidth;
    const finalHeight = lfContainer.clientHeight || clientHeight;
    
    console.log('最终LogicFlow容器尺寸:', { finalWidth, finalHeight });
    
    // 确保容器已经挂载到DOM并有尺寸
    if (finalWidth === 0 || finalHeight === 0) {
      console.error('容器尺寸无效，无法初始化LogicFlow');
      ElMessage.error('画布初始化失败：容器尺寸无效');
      return;
    }
    
    // 添加全局样式，确保锚点可见
    addGlobalAnchorStyles();
    
    // 使用直接的DOM元素引用而不是ID选择器
    // @ts-ignore - 忽略LogicFlow构造函数的类型错误
  const logicFlow = new LogicFlow({
      container: lfContainer,
      width: finalWidth,
      height: finalHeight,
    background: {
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(#DCDFE6 1px, transparent 0), linear-gradient(90deg, #DCDFE6 1px, transparent 0)',
        backgroundSize: '20px 20px',
    },
    grid: {
      size: 20,
      visible: true,
      type: 'mesh',
      config: {
        color: '#DCDFE6',
        thickness: 1,
      }
    },
    keyboard: {
      enabled: true,
    },
      style: {
    nodeText: {
      overflowMode: 'ellipsis',
      fontSize: 14,
    },
    edgeText: {
          overflowMode: 'ellipsis',
          fontSize: 14,
        },
        anchor: {
          stroke: '#409EFF',
          fill: '#FFFFFF',
          r: 6,
          strokeWidth: 2,
          hover: {
            stroke: '#409EFF',
            fill: '#E6F7FF',
            r: 8,
            strokeWidth: 3,
          },
          visibility: 'visible',
          display: 'block',
          opacity: 1,
        },
        anchorLine: {
          stroke: '#409EFF',
          strokeWidth: 1,
          strokeDasharray: '3,2',
        },
        nodeSelectedOutline: {
          stroke: '#409EFF',
          strokeWidth: 2,
          strokeDasharray: '3,3',
        },
        edgeSelected: {
          stroke: '#409EFF',
          strokeWidth: 2,
        },
        edgeHovered: {
          stroke: '#409EFF',
          strokeWidth: 2,
        },
      },
      snapline: false,
      nodeTextEdit: false,
      edgeTextEdit: false,
      nodeSelectedOutline: true,
      plugins: [Menu, MiniMap, Snapshot],
      // 显示连接点
      edgeType: 'bezier',
      adjustEdge: true,
      adjustNodePosition: true,
      hideAnchors: false,
      // 允许连线
      allowConnect: true,
      // 始终显示锚点
      alwaysShowAnchor: true,
      // 允许所有节点之间连线
      allowConnectNodes: () => true,
      // 强制显示锚点
      overlapMode: 0,
      stopScrollGraph: false,
      stopZoomGraph: false,
      stopMoveGraph: false,
      hoverOutline: false,
      nodeTextDraggable: false,
      edgeTextDraggable: false,
      nodeMovable: true,
      edgeDraggable: true,
      metaKeyMultipleSelected: true,
    });
    
    // 设置为本地变量
    lf.value = logicFlow;
    showLf.value = true;
    
    // 设置画布主题
    setCanvasTheme(logicFlow);
  
  // 设置默认边类型
  logicFlow.setDefaultEdgeType('bezier');
  
  // 注册节点和边
  registerNodes(logicFlow);
  registerEdges(logicFlow);
  
    // 设置拖拽事件
    setupDragEvents(lfContainer, logicFlow);
    
    // 设置事件监听
    setupEventListeners(logicFlow);
    
    // 延迟渲染初始数据，确保画布已完全初始化
    setTimeout(() => {
      renderInitialData();
    }, 100);
    
    // 启用自动缩放以适应内容
    logicFlow.resize(finalWidth, finalHeight);
    
    console.log('LogicFlow初始化完成');
    } catch (e) {
    console.error('初始化LogicFlow失败:', e);
    console.error('错误详情:', e instanceof Error ? e.message : String(e));
    
    // 尝试备用初始化方法
    tryBackupInitMethod();
  }
};

// 备用初始化方法
const tryBackupInitMethod = async () => {
  console.log('尝试备用初始化方法');
  
  if (!container.value) {
    console.error('容器元素不存在');
    return;
  }
  
  try {
    // 清空容器
    container.value.innerHTML = '';
    
    // 创建新的容器
    const backupContainer = document.createElement('div');
    backupContainer.id = 'backup-lf-container';
    backupContainer.style.width = '100%';
    backupContainer.style.height = '100%';
    container.value.appendChild(backupContainer);
    
    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 使用固定尺寸初始化
    const fixedWidth = 800;
    const fixedHeight = 600;
    
    console.log('备用方法使用固定尺寸:', { fixedWidth, fixedHeight });
    
    // 使用简化配置
    // @ts-ignore
    const backupLf = new LogicFlow({
      container: backupContainer,
      width: fixedWidth,
      height: fixedHeight,
      grid: true,
      background: { backgroundColor: '#fff' },
      plugins: [Menu, MiniMap],
    });
    
    // 设置为本地变量
    lf.value = backupLf;
    showLf.value = true;
    
    // 注册节点和边
    registerNodes(backupLf);
    registerEdges(backupLf);
    
    // 设置拖拽事件
    setupDragEvents(backupContainer, backupLf);
    
    // 设置事件监听
    setupEventListeners(backupLf);
    
    // 渲染空画布
    backupLf.render({ nodes: [], edges: [] });
    
    console.log('备用方法初始化成功');
    ElMessage.success('画布已使用备用方法初始化');
  } catch (error) {
    console.error('备用初始化方法失败:', error);
    ElMessage.error('画布初始化失败，请刷新页面重试');
  }
};

// 渲染初始数据
const renderInitialData = () => {
  if (!lf.value) return;
  
  // 初始化一个空画布，不添加任何默认节点
  const initData = {
    nodes: [],
    edges: []
  };
  
  try {
  lf.value.render(initData);
    console.log('初始数据渲染成功');
  } catch (error) {
    console.error('初始数据渲染失败:', error);
    
    // 尝试重新初始化
    setTimeout(() => {
      try {
        if (lf.value) {
          console.log('尝试重新渲染初始数据');
          lf.value.render(initData);
        }
      } catch (retryError) {
        console.error('重新渲染初始数据失败:', retryError);
      }
    }, 300);
  }
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

// 新增函数 - 设置主题
const setCanvasTheme = (lf: any) => {
  lf.setTheme({
    baseNode: {
      fill: '#FFFFFF',
      stroke: '#DCDFE6',
      strokeWidth: 1,
      opacity: 1,
      radius: 4,
    },
    nodeText: {
      color: '#333333',
      overflowMode: 'ellipsis',
      fontSize: 14,
    },
    edgeText: {
      color: '#333333',
      background: {
        fill: '#ffffff',
      },
    },
    anchor: {
      stroke: '#C0C4CC',
      fill: '#FFFFFF',
      r: 4,
      hover: {
        stroke: '#409EFF',
        fill: 'rgba(64, 158, 255, 0.2)',
        r: 6,
      },
    },
  });
};

// 新增函数 - 设置拖拽事件
const setupDragEvents = (container: HTMLElement, lfInstance: any) => {
  // 添加拖拽事件监听器
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('拖拽节点到画布');
    
    if (!e.dataTransfer) {
      console.error('无效的拖拽数据');
      return;
    }
    
    // 确保LogicFlow实例有效
    if (!lfInstance || typeof lfInstance.addNode !== 'function') {
      console.error('LogicFlow实例无效或缺少addNode方法');
      ElMessage.error('系统错误：画布实例无效');
      return;
    }
    
    // 尝试从多种格式获取数据
    let jsonData = '';
    try {
      if (e.dataTransfer.types.includes('application/logicflow')) {
        jsonData = e.dataTransfer.getData('application/logicflow');
      } else if (e.dataTransfer.types.includes('application/json')) {
        jsonData = e.dataTransfer.getData('application/json');
      } else if (e.dataTransfer.types.includes('text/plain')) {
        jsonData = e.dataTransfer.getData('text/plain');
      }
      
      if (!jsonData) {
        console.error('未找到有效的拖拽数据');
        ElMessage.error('无法识别拖拽的节点类型');
        return;
      }
      
      // 解析节点数据
      const nodeData = JSON.parse(jsonData);
      if (!nodeData || !nodeData.type) {
        console.error('节点数据格式无效');
        ElMessage.error('节点数据无效');
        return;
      }
      
      // 获取放置坐标
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 优先使用拖拽源提供的UUID，如果没有则生成新的
      const nodeId = nodeData.id || uuidv4();
      const nodeLabel = nodeData.label || nodeData.type;
      
      // 构造完整的节点配置，保留必要的信息
      const nodeConfig = {
        id: nodeId,
        type: nodeData.type,
        x: x,
        y: y,
        text: { 
          value: nodeLabel,
          x: x,
          y: y
        },
        width: nodeData.type === 'decision' ? 120 : 160,
        height: 60,
        properties: {
          name: nodeLabel,
          desc: `${nodeLabel}节点`,
          frontend_status: '1',
          ...nodeData.properties // 合并原始属性
        }
      };
      
      console.log('添加节点:', nodeConfig);
      
      try {
        // 使用最原始的方法尝试添加节点
        if (lfInstance) {
          // 显示加载状态，提示用户
          ElMessage({
            message: '正在添加节点...',
            duration: 2000,
            type: 'info'
          });
          
          // 延迟处理以避免可能的渲染冲突
          setTimeout(() => {
            try {
              // 使用事务方式添加节点，确保连接点正确显示
              const node = lfInstance.addNode(nodeConfig);
              console.log('节点添加成功', node);
              
              // 强制刷新画布，确保连接点显示
              setTimeout(() => {
                try {
                  // 获取当前画布数据
                  const graphData = lfInstance.getGraphData();
                  console.log('当前画布数据:', graphData);
                  
                  // 确保节点有连接点
                  if (graphData.nodes && graphData.nodes.length > 0) {
                    // 重新渲染画布
                    lfInstance.render(graphData);
                    
                    // 选中新添加的节点
                    lfInstance.selectElementById(nodeId);
                    
                    // 强制更新连接点
                    setTimeout(() => {
                      try {
                        // 触发画布更新事件
                        lfInstance.graphModel.eventCenter.emit('anchor:update', { nodeId });
                        lfInstance.graphModel.eventCenter.emit('graph:transform');
                      } catch (anchorError) {
                        console.warn('更新连接点失败:', anchorError);
                      }
                    }, 50);
                  }
                  
                  ElMessage.success('节点添加成功');
                } catch (refreshError) {
                  console.error('刷新画布失败:', refreshError);
                }
              }, 100);
            } catch (error) {
              console.error('添加节点失败:', error);
              ElMessage.error('添加节点失败');
              
              // 如果首选方法失败，尝试备用方法
              tryBackupAddMethod(lfInstance, nodeData, x, y, nodeId, nodeLabel);
            }
          }, 50);
        }
      } catch (error) {
        console.error('添加节点失败:', error);
        ElMessage.error('添加节点失败');
        
        // 尝试备用方法
        tryBackupAddMethod(lfInstance, nodeData, x, y, nodeId, nodeLabel);
      }
      
    } catch (error) {
      console.error('处理拖拽出错:', error);
      ElMessage.error('添加节点失败');
    }
  });
};

// 修改备用添加节点方法，保留更多节点信息
const tryBackupAddMethod = (lfInstance: any, nodeData: any, x: number, y: number, nodeId: string, nodeLabel: string) => {
  console.log('尝试备用方法添加节点');
  try {
    // 使用LogicFlow API创建完整节点
    const completeNodeData = {
      id: nodeId,
      type: nodeData.type,
      x: x,
      y: y,
      text: { 
        value: nodeLabel,
        x: x,
        y: y
      },
      width: nodeData.type === 'decision' ? 120 : 160,
      height: 60,
      properties: {
        name: nodeLabel,
        desc: `${nodeLabel}节点`,
        frontend_status: '1',
        ...nodeData.properties // 合并原始属性
      }
    };
    
    // 直接使用较低级别的API创建节点
    const nodeModel = lfInstance.graphModel.createNode(completeNodeData);
    lfInstance.graphModel.addNode(nodeModel);
    
    // 强制更新连接点和画布
    setTimeout(() => {
      try {
        // 触发画布更新事件
        lfInstance.graphModel.eventCenter.emit('anchor:update', { nodeId });
        lfInstance.graphModel.eventCenter.emit('node:add', { nodeId });
        lfInstance.graphModel.eventCenter.emit('graph:transform');
        
        // 选中新添加的节点
        lfInstance.selectElementById(nodeId);
        
        // 重新渲染画布以确保连接点显示
        const graphData = lfInstance.getGraphData();
        lfInstance.render(graphData);
      } catch (error) {
        console.warn('更新连接点失败:', error);
      }
    }, 100);
    
    console.log('备用方法添加节点成功');
    ElMessage.success('节点添加成功（备用方法）');
  } catch (error) {
    console.error('备用方法添加节点失败:', error);
    ElMessage.error('节点添加失败，请刷新页面重试');
  }
};

// 新增函数 - 设置事件监听
const setupEventListeners = (lf: any) => {
  // 强制显示所有锚点的函数
  const forceShowAllAnchors = () => {
    try {
      // 查找所有锚点并强制显示
      const anchors = document.querySelectorAll('circle.lf-anchor, circle.lf-node-anchor, circle[data-anchor-id]');
      anchors.forEach((anchor: any) => {
        anchor.style.display = 'block';
        anchor.style.visibility = 'visible';
        anchor.style.opacity = '1';
        anchor.style.pointerEvents = 'auto';
        anchor.style.cursor = 'crosshair';
        anchor.setAttribute('r', '6'); // 缩小锚点大小
        anchor.setAttribute('stroke', '#409EFF');
        anchor.setAttribute('fill', '#FFFFFF');
        anchor.setAttribute('stroke-width', '2');
      });
      
      // 查找所有锚点组并强制显示
      const anchorGroups = document.querySelectorAll('.lf-anchor-group');
      anchorGroups.forEach((group: any) => {
        group.style.display = 'block';
        group.style.visibility = 'visible';
        group.style.opacity = '1';
      });
      
      console.log(`强制显示 ${anchors.length} 个锚点`);
      
      // 如果没有找到锚点，尝试手动创建
      if (anchors.length === 0) {
        createMissingAnchors();
      }
    } catch (error) {
      console.warn('强制显示锚点失败:', error);
    }
  };
  
  // 手动创建缺失的锚点
  const createMissingAnchors = () => {
    try {
      // 获取所有节点
      const nodes = document.querySelectorAll('.lf-node');
      console.log(`找到 ${nodes.length} 个节点，准备创建锚点`);
      
      nodes.forEach((node: any) => {
        // 获取节点ID
        const nodeId = node.getAttribute('data-id');
        if (!nodeId) return;
        
        // 获取节点模型
        const nodeModel = lf.getNodeModelById(nodeId);
        if (!nodeModel) return;
        
        // 获取节点位置和尺寸
        const { x, y, width, height } = nodeModel;
        if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return;
        
        // 定义锚点位置 - 只保留左右锚点
        const anchorPositions = [
          { x: x + width / 2, y, type: 'right' },
          { x: x - width / 2, y, type: 'left' }
        ];
        
        // 获取节点的SVG组
        const nodeGroup = node.querySelector('g');
        if (!nodeGroup) return;
        
        // 创建锚点
        anchorPositions.forEach(pos => {
          // 创建SVG圆形元素
          const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          anchor.setAttribute('cx', pos.x.toString());
          anchor.setAttribute('cy', pos.y.toString());
          anchor.setAttribute('r', '6'); // 缩小锚点大小
          anchor.setAttribute('fill', '#FFFFFF');
          anchor.setAttribute('stroke', '#409EFF');
          anchor.setAttribute('stroke-width', '2');
          anchor.setAttribute('class', 'lf-node-anchor node-anchor-visible');
          anchor.setAttribute('data-anchor-id', `${nodeId}_${pos.type}`);
          anchor.setAttribute('data-anchor-type', pos.type);
          anchor.style.display = 'block';
          anchor.style.visibility = 'visible';
          anchor.style.opacity = '1';
          anchor.style.cursor = 'crosshair';
          anchor.style.pointerEvents = 'auto';
          
          // 添加到节点组
          nodeGroup.appendChild(anchor);
          
          // 添加事件监听
          anchor.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            // 触发锚点拖拽开始事件
            lf.graphModel.eventCenter.emit('anchor:dragstart', { 
              nodeId, 
              anchorType: pos.type,
              e
            });
          });
        });
        
        console.log(`为节点 ${nodeId} 创建了 ${anchorPositions.length} 个锚点`);
      });
    } catch (error) {
      console.error('手动创建锚点失败:', error);
    }
  };
  
  // 单击节点
  lf.on('node:click', (data: { data: any }) => {
    console.log('单击节点:', data);
    nodeData.value = data.data as Record<string, any>;
    
    // 单击节点时强制更新连接点
    setTimeout(() => {
      try {
        if (data.data && data.data.id) {
          // 强制显示连接点
          lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.data.id });
          // 确保节点处于选中状态
          lf.selectElementById(data.data.id);
          // 强制刷新画布
          lf.graphModel.eventCenter.emit('graph:transform');
          
          // 手动触发连接点显示
          const nodeModel = lf.getNodeModelById(data.data.id);
          if (nodeModel) {
            nodeModel.setSelected(true);
            nodeModel.setHovered(true);
            // 强制更新节点视图
            lf.graphModel.eventCenter.emit('node:update', { nodeId: data.data.id });
            
            // 手动设置锚点可见
            forceShowAllAnchors();
          }
        }
      } catch (error) {
        console.warn('更新连接点失败:', error);
      }
    }, 50);
  });
  
  // 双击节点
  lf.on('node:dbclick', (data: { data: any }) => {
    console.log('双击节点:', data);
    nodeData.value = data.data as Record<string, any>;
    showAttribute.value = true;
    
    // 双击节点时也强制更新连接点
    setTimeout(() => {
      try {
        if (data.data && data.data.id) {
          lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.data.id });
          lf.selectElementById(data.data.id);
          
          // 手动设置锚点可见
          forceShowAllAnchors();
        }
      } catch (error) {
        console.warn('更新连接点失败:', error);
      }
    }, 50);
  });
  
  // 画布点击
  lf.on('blank:click', () => {
    showAttribute.value = false;
    
    // 画布点击时也强制显示所有锚点
    setTimeout(forceShowAllAnchors, 100);
  });
  
  // 连线相关事件
  lf.on('connection:success', (data: any) => {
    console.log('连线成功:', data);
    
    // 强制更新连接点
    setTimeout(() => {
      try {
        // 获取当前画布数据
        const graphData = lf.getGraphData();
        // 重新渲染画布
        lf.render(graphData);
        
        // 连线成功后，确保源节点和目标节点的连接点可见
        if (data.sourceNodeId) {
          lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.sourceNodeId });
        }
        if (data.targetNodeId) {
          lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.targetNodeId });
        }
        
        // 强制显示所有锚点
        forceShowAllAnchors();
      } catch (error) {
        console.error('刷新画布失败:', error);
      }
    }, 100);
  });
  
  // 开始连线事件
  lf.on('anchor:dragstart', (data: any) => {
    console.log('开始连线:', data);
    // 确保连接点在拖拽过程中可见
    lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.nodeId });
    forceShowAllAnchors();
  });
  
  // 连线拖拽中
  lf.on('anchor:drag', (data: any) => {
    // 连线拖拽中，确保连接点可见
    if (data.nodeId) {
      lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.nodeId });
    }
    forceShowAllAnchors();
  });
  
  // 连线拖拽结束
  lf.on('anchor:drop', (data: any) => {
    console.log('连线拖拽结束:', data);
    // 确保连接点在拖拽结束后可见
    if (data.nodeId) {
      lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.nodeId });
    }
    forceShowAllAnchors();
  });
  
  lf.on('connection:not-allowed', (data: any) => {
    console.log('连线被拒绝:', data);
    ElMessage.warning('连线不被允许');
    forceShowAllAnchors();
  });
  
  // 拖拽相关事件
  lf.on('node:dragstart', (data: any) => {
    console.log('开始拖动节点:', data.id);
    forceShowAllAnchors();
  });
  
  lf.on('node:drag', (data: any) => {
    // 节点拖动中
    // 确保拖动过程中连接点跟随节点移动
    if (data.id) {
      lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.id });
    }
    forceShowAllAnchors();
  });
  
  lf.on('node:drop', (data: any) => {
    console.log('节点放置:', data.id);
    
    // 节点放置后强制更新连接点
    setTimeout(() => {
      try {
        // 触发画布更新事件
        lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.id });
        lf.graphModel.eventCenter.emit('graph:transform');
        
        // 选中节点以显示连接点
        lf.selectElementById(data.id);
        
        // 强制显示所有锚点
        forceShowAllAnchors();
      } catch (error) {
        console.warn('更新连接点失败:', error);
      }
    }, 100);
  });
  
  // 画布缩放事件
  lf.on('graph:transform', () => {
    // 画布变换时，确保所有选中节点的连接点可见
    const selectedElements = lf.getSelectElements();
    if (selectedElements && selectedElements.nodes) {
      selectedElements.nodes.forEach((node: any) => {
        if (node.id) {
          lf.graphModel.eventCenter.emit('anchor:update', { nodeId: node.id });
        }
      });
    }
    
    // 强制显示所有锚点
    forceShowAllAnchors();
  });
  
  // 元素选中事件
  lf.on('element:selected', (data: any) => {
    console.log('元素选中:', data);
    
    // 元素选中后强制更新连接点
    if (data.data && data.data.id) {
      setTimeout(() => {
        try {
          lf.graphModel.eventCenter.emit('anchor:update', { nodeId: data.data.id });
          
          // 手动触发连接点显示
          const nodeModel = lf.getNodeModelById(data.data.id);
          if (nodeModel) {
            nodeModel.setSelected(true);
            // 强制更新节点视图
            lf.graphModel.eventCenter.emit('node:update', { nodeId: data.data.id });
          }
          
          // 强制显示所有锚点
          forceShowAllAnchors();
        } catch (error) {
          console.warn('更新连接点失败:', error);
        }
      }, 50);
    }
  });
  
  // 添加鼠标移动事件，确保锚点始终可见
  document.addEventListener('mousemove', () => {
    // 使用节流函数减少调用频率
    if (!window.anchorUpdateThrottle) {
      window.anchorUpdateThrottle = setTimeout(() => {
        forceShowAllAnchors();
        window.anchorUpdateThrottle = null;
      }, 200);
    }
  });
  
  // 添加画布渲染完成事件
  lf.on('graph:rendered', () => {
    console.log('画布渲染完成，准备创建锚点');
    setTimeout(forceShowAllAnchors, 100);
    setTimeout(createMissingAnchors, 200);
  });
  
  // 添加节点渲染完成事件
  lf.on('node:add', (data: any) => {
    console.log('节点添加完成:', data);
    setTimeout(forceShowAllAnchors, 100);
    setTimeout(createMissingAnchors, 200);
  });
  
  // 初始化时强制显示所有锚点
  setTimeout(forceShowAllAnchors, 500);
  setTimeout(createMissingAnchors, 600);
  setTimeout(forceShowAllAnchors, 1000);
  setTimeout(createMissingAnchors, 1100);
  setTimeout(forceShowAllAnchors, 2000);
};

// 添加全局样式，确保锚点可见
const addGlobalAnchorStyles = () => {
  // 检查是否已存在样式
  if (document.getElementById('lf-anchor-styles')) {
    return;
  }
  
  // 创建样式元素
  const style = document.createElement('style');
  style.id = 'lf-anchor-styles';
  style.textContent = `
    /* 直接修改SVG元素样式，确保锚点可见 */
    circle.lf-anchor,
    circle.lf-node-anchor,
    circle.node-anchor-visible {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      stroke: #409EFF !important;
      fill: #FFFFFF !important;
      stroke-width: 2 !important;
      r: 6 !important;
      pointer-events: auto !important;
      cursor: crosshair !important;
    }
    
    /* 悬停样式 */
    circle.lf-anchor:hover,
    circle.lf-node-anchor:hover,
    circle.node-anchor-visible:hover {
      r: 8 !important;
      stroke: #409EFF !important;
      fill: #E6F7FF !important;
      stroke-width: 3 !important;
    }
    
    /* 确保所有节点状态下锚点都可见 */
    .lf-node circle.lf-anchor,
    .lf-node-selected circle.lf-anchor,
    .lf-node:hover circle.lf-anchor,
    .lf-node-hover circle.lf-anchor,
    .lf-node circle.lf-node-anchor,
    .lf-node-selected circle.lf-node-anchor,
    .lf-node:hover circle.lf-node-anchor,
    .lf-node-hover circle.lf-node-anchor {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* 确保锚点容器可见 */
    .lf-anchor-hover,
    .lf-anchor-group {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* 确保锚点线可见 */
    .lf-anchor-line {
      stroke: #409EFF !important;
      stroke-width: 1 !important;
      stroke-dasharray: 3,2 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* 修复可能的CSS层叠问题 */
    .lf-node * {
      pointer-events: auto !important;
    }
    
    /* 确保节点选中状态正确 */
    .lf-node-selected {
      outline: 2px dashed #409EFF !important;
    }
    
    /* 直接修改SVG元素，确保锚点可见 */
    svg circle[data-anchor-id],
    svg circle[data-anchor-type] {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      stroke: #409EFF !important;
      fill: #FFFFFF !important;
      stroke-width: 2 !important;
      r: 6 !important;
    }
  `;
  
  // 添加到文档头部
  document.head.appendChild(style);
  console.log('添加全局锚点样式');
  
  // 添加额外的样式修复
  setTimeout(() => {
    // 查找所有锚点并强制显示
    const anchors = document.querySelectorAll('circle.lf-anchor, circle.lf-node-anchor, circle[data-anchor-id]');
    anchors.forEach((anchor: any) => {
      anchor.style.display = 'block';
      anchor.style.visibility = 'visible';
      anchor.style.opacity = '1';
      anchor.style.pointerEvents = 'auto';
      anchor.style.cursor = 'crosshair';
      anchor.setAttribute('r', '6'); // 缩小锚点大小
      anchor.setAttribute('stroke', '#409EFF');
      anchor.setAttribute('fill', '#FFFFFF');
      anchor.setAttribute('stroke-width', '2');
    });
    
    console.log(`强制显示 ${anchors.length} 个锚点`);
  }, 500);
};

onMounted(async () => {
  // 使用更可靠的方式确保DOM已渲染
  await nextTick();
  
  // 等待DOM完全渲染
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (container.value) {
    // 先强制读取一次布局尺寸，触发浏览器重排
    const forceReflow = container.value.offsetHeight;
    
    console.log('准备初始化LogicFlow，当前容器尺寸:', {
      width: container.value.clientWidth,
      height: container.value.clientHeight
    });
    
    // 立即初始化LogicFlow
  initLogicFlow();
  } else {
    console.error('容器元素未找到');
  }
});
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 防止出现滚动条
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
  width: 100%;
  height: calc(100vh - 60px); /* 减去顶部工具栏的高度 */
  overflow: hidden;
}

#LF-view {
  flex: 1;
  height: 100%;
  position: relative;
  min-width: 600px;
  min-height: 400px;
  overflow: hidden; // 防止容器出现滚动条
}

// 确保 LogicFlow 容器样式
:deep(.lf-graph) {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: visible !important; // 关键：确保节点不会被裁剪
}

// 确保连接点样式正确
:deep(.lf-anchor) {
  stroke: #409EFF;
  fill: #FFFFFF;
  stroke-width: 2;
  r: 6;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  
  &:hover {
    stroke: #409EFF;
    fill: rgba(64, 158, 255, 0.2);
    r: 8;
  }
}

// 确保连接点在选中节点时可见
:deep(.lf-node-selected) {
  .lf-anchor {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
}

// 全局样式覆盖，确保连接点始终可见
:global(.lf-anchor) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  stroke: #409EFF !important;
  fill: #FFFFFF !important;
  stroke-width: 2 !important;
  r: 6 !important;
}

:global(.lf-anchor:hover) {
  r: 8 !important;
  stroke: #409EFF !important;
  fill: rgba(64, 158, 255, 0.2) !important;
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