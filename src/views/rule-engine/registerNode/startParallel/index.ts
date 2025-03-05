import { h } from 'vue';
import registerBaseNode from '../BaseNode';

export default function registerStartParallel(lf: any) {
  // 首先注册基础节点
  registerBaseNode(lf);
  
  // 注册并行开始节点
  lf.register('startParallel', ({ RectNode, RectNodeModel }: any) => {
    class StartParallelNodeView extends RectNode {
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
            body: `<path fill="${stroke}" d="M128 298.666667h768v426.666666H128V298.666667z m64 64v298.666666h640V362.666667H192z" />
            <path fill="${stroke}" d="M298.666667 128h426.666666v768H298.666667V128z m64 64v640h298.666666V192H362.666667z" />`
          }
        };
      }
    }
    
    class StartParallelNodeModel extends RectNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'startParallel';
        // 设置固定大小
        this.width = 120;
        this.height = 60;
        // 禁用大小调整
        this.resizable = false;
        
        // 节点的默认属性
        this.properties = {
          name: '并行开始',
          desc: '并行流程开始节点',
          frontend_status: '1',
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
          },
          // 左侧连接点
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
      view: StartParallelNodeView,
      model: StartParallelNodeModel,
    };
  });
} 