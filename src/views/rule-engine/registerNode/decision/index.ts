import { h } from 'vue';
import registerBaseNode from '../BaseNode';

export default function registerDecision(lf: any) {
  // 首先注册基础节点
  registerBaseNode(lf);
  
  // 注册决策节点
  lf.register('decision', ({ RectNode, RectNodeModel }: any) => {
    class DecisionNodeView extends RectNode {
      getIcon() {
        const { x, y, width, height, properties } = this.props.model;
        const stroke = properties.frontend_status === '0' ? '#FF0000' : '#1890FF';
        
        return {
          type: 'svg',
          svg: {
            x: x - width / 2 + 5,
            y: y - height / 2 + 5,
            width: 25,
            height: 25,
            viewBox: '0 0 1024 1024',
            body: `<path fill="${stroke}" d="M512 149.333333c200.298667 0 362.666667 162.368 362.666667 362.666667s-162.368 362.666667-362.666667 362.666667S149.333333 712.298667 149.333333 512 311.701333 149.333333 512 149.333333z m0 64c-164.949333 0-298.666667 133.717333-298.666667 298.666667s133.717333 298.666667 298.666667 298.666667 298.666667-133.717333 298.666667-298.666667-133.717333-298.666667-298.666667-298.666667z m-128 213.333334v170.666666h256v-170.666666h-256z" />`
          }
        };
      }
      
      getShape() {
        const { x, y, width, height, properties } = this.props.model;
        const style = properties.frontend_status === '0' ? {
          stroke: '#FF0000',
          strokeWidth: 2,
        } : {
          stroke: '#1890FF',
          strokeWidth: 2,
        };
        
        // 创建一个菱形
        const points = [
          [x, y - height / 2], // 上
          [x + width / 2, y], // 右
          [x, y + height / 2], // 下
          [x - width / 2, y], // 左
        ].map(([x, y]) => `${x},${y}`);
        
        return {
          type: 'polygon',
          points: points.join(' '),
          ...style,
          fill: '#FFFFFF',
        };
      }
    }
    
    class DecisionNodeModel extends RectNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'decision';
        // 节点的默认属性
        this.properties = {
          name: '条件',
          desc: '条件判断节点',
          frontend_status: '1',
          condition: '',
          ...this.properties,
        };
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
      view: DecisionNodeView,
      model: DecisionNodeModel,
    };
  });
}