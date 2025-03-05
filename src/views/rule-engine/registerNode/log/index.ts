import { h, createApp } from 'vue';
import LogNode from './LogNode.vue';
import { randomNumber } from '@/utils/index';
import type LogicFlow from '@logicflow/core';

export default function registerLog(lf: any) {
  lf.register('log', ({ HtmlNode, HtmlNodeModel }: any) => {
    class LogNodeView extends HtmlNode {
      setHtml(rootEl: HTMLElement) {
        const { properties } = this.props.model;
        
        // 使用Vue渲染组件
        const app = createApp(LogNode, {
          text: properties.name || '日志',
          disabled: properties.frontend_status === '0',
          selected: this.props.model.isSelected
        });
        
        const container = document.createElement('div');
        rootEl.appendChild(container);
        app.mount(container);
      }
    }
    
    class LogNodeModel extends HtmlNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'log';
        this.width = 120;
        this.height = 60;
        
        // 节点的默认属性
        this.properties = {
          name: '日志',
          desc: '日志输出节点',
          frontend_status: '1',
          logContent: '',
          logLevel: 'info',
          ...this.properties,
        };
      }
      
      getConnectedTargetRules() {
        const edges = this.outgoing.edges;
        return edges.map((edge: Edge) => {
          return {
            nodeId: edge.targetNodeId,
            edgeId: edge.id,
            edgeLabel: edge.model.properties.condition || '',
            edgeType: edge.model.properties.edgeType || 'default',
          };
        });
      }
      
      getDefaultAnchor() {
        const { id, x, y, width, height } = this;
        return [
          {
            x,
            y: y - height / 2,
            id: `${id}_top`,
            type: 'top',
          },
          {
            x: x + width / 2,
            y,
            id: `${id}_right`,
            type: 'right',
          },
          {
            x,
            y: y + height / 2,
            id: `${id}_bottom`,
            type: 'bottom',
          },
          {
            x: x - width / 2,
            y,
            id: `${id}_left`,
            type: 'left',
          },
        ];
      }
    }
    
    return {
      view: LogNodeView,
      model: LogNodeModel,
    };
  });
} 