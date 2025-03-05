import { h, createApp } from 'vue';
import registerBaseNode from '../BaseNode';

export default function registerAssignment(lf: any) {
  // 首先注册基础节点
  registerBaseNode(lf);
  
  // 注册赋值节点
  lf.register('assignment', ({ HtmlNode, HtmlNodeModel }: any) => {
    class AssignmentNodeView extends HtmlNode {
      setHtml(rootEl: HTMLElement) {
        const { properties } = this.props.model;
        
        // 清空根元素内容，避免重复渲染
        rootEl.innerHTML = '';
        
        // 创建节点容器
        const nodeContainer = document.createElement('div');
        nodeContainer.className = 'assignment-node';
        
        if (properties.frontend_status === '0') {
          nodeContainer.classList.add('node-disabled');
        }
        
        if (this.props.model.isSelected) {
          nodeContainer.classList.add('node-selected');
        }
        
        // 创建图标容器
        const iconContainer = document.createElement('div');
        iconContainer.className = 'node-icon';
        
        // 添加SVG图标
        iconContainer.innerHTML = `
          <svg class="icon" viewBox="0 0 1024 1024" width="24" height="24">
            <path d="M832 64H192c-70.4 0-128 57.6-128 128v640c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128zM192 128h640c35.2 0 64 28.8 64 64v64H128v-64c0-35.2 28.8-64 64-64z m640 768H192c-35.2 0-64-28.8-64-64V320h768v512c0 35.2-28.8 64-64 64z" fill="#409EFF"></path>
            <path d="M256 224m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#409EFF"></path>
            <path d="M384 224m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#409EFF"></path>
            <path d="M512 224m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#409EFF"></path>
            <path d="M256 448h512v64H256zM256 576h512v64H256zM256 704h512v64H256z" fill="#409EFF"></path>
          </svg>
        `;
        
        // 创建文本容器
        const textContainer = document.createElement('div');
        textContainer.className = 'node-text';
        textContainer.textContent = properties.name || '赋值';
        
        // 组装节点
        nodeContainer.appendChild(iconContainer);
        nodeContainer.appendChild(textContainer);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
          .assignment-node {
            width: 140px;
            height: 40px;
            line-height: 40px;
            background-color: #A0CFFF;
            border: 2px solid #E6A23C;
            border-radius: 10px;
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
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `;
        
        // 添加到根元素
        rootEl.appendChild(style);
        rootEl.appendChild(nodeContainer);
      }
    }
    
    class AssignmentNodeModel extends HtmlNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'assignment';
        // 设置固定大小
        this.width = 120;
        this.height = 60;
        // 禁用大小调整
        this.resizable = false;
        
        // 节点的默认属性
        this.properties = {
          name: '赋值',
          desc: '变量赋值节点',
          frontend_status: '1',
          assignments: [],
          // 添加默认样式
          style: {
            fill: '#A0CFFF',
            stroke: '#E6A23C',
            strokeWidth: 2,
            radius: 10
          },
          ...this.properties,
        };
      }
      
      getConnectedTargetRules() {
        const edges = this.outgoing.edges;
        return edges.map((edge: any) => {
          return {
            nodeId: edge.targetNodeId,
            edgeId: edge.id,
            edgeLabel: edge.model.properties.condition || '',
            edgeType: edge.model.properties.edgeType || 'default',
          };
        });
      }
      
      // 只保留左右连接点，与开始节点保持一致
      getDefaultAnchor() {
        const { id, x, y, width, height } = this;
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 120 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        return [
          // 右侧连接点
          {
            x: safeX + safeWidth / 2,
            y: safeY,
            id: `${id}_right`,
            type: 'right',
            edgeAddable: true,
            nodeAddable: false,
            className: 'node-anchor'
          },
          // 左侧连接点
          {
            x: safeX - safeWidth / 2,
            y: safeY,
            id: `${id}_left`,
            type: 'left',
            edgeAddable: true,
            nodeAddable: false,
            className: 'node-anchor'
          }
        ];
      }
      
      // 允许作为目标连接
      isAllowConnectedAsTarget() {
        return true;
      }
      
      // 允许作为源连接
      isAllowConnectedAsSource() {
        return true;
      }
    }
    
    return {
      view: AssignmentNodeView,
      model: AssignmentNodeModel,
    };
  });
} 