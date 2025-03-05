import { h } from 'vue';
import registerBaseNode from '../BaseNode';

export default function registerEndParallel(lf: any) {
  // 首先注册基础节点
  registerBaseNode(lf);
  
  // 注册并行结束节点
  lf.register('endParallel', ({ RectNode, RectNodeModel }: any) => {
    class EndParallelNodeView extends RectNode {
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
            body: `<path fill="${stroke}" d="M512 149.333333c200.298667 0 362.666667 162.368 362.666667 362.666667s-162.368 362.666667-362.666667 362.666667S149.333333 712.298667 149.333333 512 311.701333 149.333333 512 149.333333z m0 64c-164.949333 0-298.666667 133.717333-298.666667 298.666667s133.717333 298.666667 298.666667 298.666667 298.666667-133.717333 298.666667-298.666667-133.717333-298.666667-298.666667-298.666667z m85.333333 149.333334L512 448l-85.333333-85.333333-60.330667 60.330666L451.669333 512l-85.333333 85.333333 60.330667 60.330667L512 572.330667l85.333333 85.333333 60.330667-60.330667L572.330667 512l85.333333-85.333333-60.330667-60.330667z" />`
          }
        };
      }
    }
    
    class EndParallelNodeModel extends RectNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'endParallel';
        // 设置固定大小
        this.width = 120;
        this.height = 60;
        // 禁用大小调整
        this.resizable = false;
        
        // 节点的默认属性
        this.properties = {
          name: '并行结束',
          desc: '并行流程结束节点',
          frontend_status: '1',
          icon: 'endParallel', // 设置图标
          ...this.properties,
        };
      }
      
      getDefaultAnchor() {
        const { id, x, y, width, height } = this;
        return [
          // 右侧连接点
          {
            x: x + width / 2,
            y,
            id: `${id}_right`,
            type: 'right',
            edgeAddable: true,
            nodeAddable: false,
            className: 'node-anchor'
          },
          // 左侧连接点
          {
            x: x - width / 2,
            y,
            id: `${id}_left`,
            type: 'left',
            edgeAddable: true,
            nodeAddable: false,
            className: 'node-anchor'
          },
        ];
      }
    }
    
    return {
      view: EndParallelNodeView,
      model: EndParallelNodeModel,
    };
  });
} 