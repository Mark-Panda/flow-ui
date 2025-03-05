import { h, createApp } from 'vue';
import StartNode from './StartNode.vue';
import { randomNumber } from '@/utils/index';

export default function registerStart(lf: any) {
  lf.register('start', ({ HtmlNode, HtmlNodeModel }: any) => {
    class StartNodeView extends HtmlNode {
      setHtml(rootEl: HTMLElement) {
        const { properties } = this.props.model;
        
        // 清空根元素内容，避免重复渲染
        rootEl.innerHTML = '';
        
        // 使用Vue渲染组件
        const app = createApp(StartNode, {
          text: properties.name || '开始',
          disabled: properties.frontend_status === '0',
          selected: this.props.model.isSelected
        });
        
        const container = document.createElement('div');
        rootEl.appendChild(container);
        app.mount(container);
      }
    }
    
    class StartNodeModel extends HtmlNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'start';
        // 设置固定大小
        this.width = 120;
        this.height = 60;
        // 禁用大小调整
        this.resizable = false;
        
        // 节点的默认属性
        this.properties = {
          name: '开始',
          desc: '流程开始节点',
          frontend_status: '1',
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
      
      // 只保留左右连接点
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
      view: StartNodeView,
      model: StartNodeModel,
    };
  });
} 