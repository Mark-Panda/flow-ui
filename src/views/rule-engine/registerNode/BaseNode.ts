import { h } from 'vue';

// 通用节点注册函数
export default function registerBaseNode(lf: any) {
  lf.register('base-node', ({ RectNode, RectNodeModel }: any) => {
    class CustomBaseNode extends RectNode {
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
            body: `<path fill="${stroke}" d="M512 512m-480 0a480 480 0 1 0 960 0 480 480 0 1 0-960 0Z" />`
          }
        };
      }
      
      getShape() {
        const { x, y, width, height, properties } = this.props.model;
        const style = properties.frontend_status === '0' ? {
          stroke: '#FF0000',
          strokeWidth: 2,
        } : {
          stroke: '#DCDFE6',
          strokeWidth: 1,
        };
        
        return {
          type: 'rect',
          x: x - width / 2,
          y: y - height / 2,
          width,
          height,
          ...style,
          fill: '#FFFFFF',
          radius: 4,
        };
      }
    }
    
    class CustomBaseNodeModel extends RectNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        // 设置固定的节点大小
        this.width = 120;
        this.height = 60;
        
        // 禁用大小调整
        this.resizable = false;
      }
      
      getNodeStyle() {
        const style = super.getNodeStyle();
        style.fill = '#fff';
        style.stroke = '#dcdfe6';
        return style;
      }
      
      getTextStyle() {
        const style = super.getTextStyle();
        style.fontSize = 14;
        return style;
      }
      
      // 重写连接点方法，只保留左右两侧的连接点
      getDefaultAnchor() {
        const { id, x, y, width, height } = this;
        return [
          // 右侧连接点
          {
            x: x + width / 2,
            y,
            id: `${id}_right`,
            type: 'right',
            edgeAddable: true,  // 允许添加边
            nodeAddable: false, // 禁止添加节点
            className: 'node-anchor'  // 添加自定义类名
          },
          // 左侧连接点
          {
            x: x - width / 2,
            y,
            id: `${id}_left`,
            type: 'left',
            edgeAddable: true,  // 允许添加边
            nodeAddable: false, // 禁止添加节点
            className: 'node-anchor'  // 添加自定义类名
          },
        ];
      }
    }
    
    return {
      view: CustomBaseNode,
      model: CustomBaseNodeModel,
    };
  });
}

// 为TypeScript添加类型声明，解决属性不存在的错误
declare module '@logicflow/core' {
  interface RectNodeModel {
    width: number;
    height: number;
    resizable: boolean;
  }
} 