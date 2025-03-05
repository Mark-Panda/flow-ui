import { h } from 'vue';

// 通用节点注册函数
export default function registerBaseNode(lf: any) {
  lf.register('base-node', ({ RectNode, RectNodeModel }: any) => {
    class CustomBaseNode extends RectNode {
      // 简化方法，使用LogicFlow原生方式渲染节点
      getShape() {
        const { x, y, width, height, properties } = this.props.model;
        const style = properties.frontend_status === '0' ? {
          stroke: '#FF0000',
          strokeWidth: 2,
        } : {
          stroke: '#DCDFE6',
          strokeWidth: 1,
        };
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        return h('rect', {
          ...style,
          fill: '#FFFFFF',
          width: safeWidth,
          height: safeHeight,
          x: safeX - safeWidth / 2,
          y: safeY - safeHeight / 2,
          rx: 4,
          ry: 4,
        });
      }
      
      // 获取左侧图标
      getIcon() {
        const { x, y, width, height, properties } = this.props.model;
        const iconType = properties.icon || this.props.model.type;
        const iconColor = properties.frontend_status === '0' ? '#FF0000' : '#409EFF';
        const iconHtml = this.getIconByType(iconType, iconColor);
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        return h('foreignObject', {
          width: 30,
          height: safeHeight,
          x: safeX - safeWidth / 2 + 5,
          y: safeY - safeHeight / 2,
        }, [
          h('div', {
            className: 'node-icon-container',
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            },
            innerHTML: `<svg viewBox="0 0 1024 1024" width="24" height="24">${iconHtml}</svg>`,
          })
        ]);
      }
      
      // 获取节点文本
      getText() {
        const { x, y, width, height, text, properties } = this.props.model;
        const textColor = properties.frontend_status === '0' ? '#FF0000' : '#333333';
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 确保text存在且有value属性
        const textValue = text && typeof text === 'object' && text.value ? text.value : 
                         (typeof text === 'string' ? text : '');
        
        return h('foreignObject', {
          width: safeWidth - 40,
          height: safeHeight,
          x: safeX - safeWidth / 2 + 40,
          y: safeY - safeHeight / 2,
        }, [
          h('div', {
            className: 'node-text-container',
            style: {
              color: textColor,
              fontSize: '14px',
              fontWeight: 'normal',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              width: '100%',
              padding: '0 10px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }, textValue)
        ]);
      }
      
      // 获取分隔线
      getDivider() {
        const { x, y, width, height } = this.props.model;
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        return h('line', {
          x1: safeX - safeWidth / 2 + 35,
          y1: safeY - safeHeight / 2,
          x2: safeX - safeWidth / 2 + 35,
          y2: safeY + safeHeight / 2,
          stroke: '#DCDFE6',
          strokeWidth: 1,
        });
      }
      
      // 根据节点类型返回不同的图标
      getIconByType(type: string, color: string) {
        // 可以根据不同的节点类型返回不同的SVG图标路径
        const icons: Record<string, string> = {
          start: `<path fill="${color}" d="M512 128c-211.7 0-384 172.3-384 384s172.3 384 384 384 384-172.3 384-384-172.3-384-384-384z m149.3 352L448 685.3c-6.4 6.4-14.8 9.6-23.2 9.6s-16.8-3.2-23.2-9.6l-106.7-106.7c-12.8-12.8-12.8-33.6 0-46.4s33.6-12.8 46.4 0l83.5 83.5 189.9-189.9c12.8-12.8 33.6-12.8 46.4 0 13 12.8 13 33.6 0.2 46.4z" />`,
          log: `<path fill="${color}" d="M832 64H192c-70.4 0-128 57.6-128 128v640c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128zM192 128h640c35.2 0 64 28.8 64 64v64H128v-64c0-35.2 28.8-64 64-64z m640 768H192c-35.2 0-64-28.8-64-64V320h768v512c0 35.2-28.8 64-64 64z M256 448h512v64H256z M256 576h512v64H256z M256 704h512v64H256z" />`,
          decision: `<path fill="${color}" d="M704 192l-320 320-192-192-128 128 320 320 448-448z" />`,
          assignment: `<path fill="${color}" d="M832 64H192c-70.4 0-128 57.6-128 128v640c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128zM320 768H256v-64h64v64z m0-128H256v-64h64v64z m0-128H256v-64h64v64z m384 256H384v-64h320v64z m0-128H384v-64h320v64z m0-128H384v-64h320v64z" />`,
          default: `<circle cx="512" cy="512" r="400" fill="${color}" />`
        };
        
        return icons[type] || icons.default;
      }
      
      // 重写渲染方法
      render() {
        const { model } = this.props;
        const { properties } = model;
        const statusClass = properties.frontend_status === '0' ? 'node-disabled' : '';
        
        return h('g', {
          className: `node-container ${statusClass}`,
        }, [
          this.getShape(),
          this.getDivider(),
          this.getIcon(),
          this.getText(),
        ]);
      }
    }
    
    class CustomBaseNodeModel extends RectNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        // 设置节点尺寸
        this.width = 160;
        this.height = 60;
        
        // 禁用大小调整
        this.resizable = false;
      }
      
      // 获取节点样式
      getNodeStyle() {
        const style = super.getNodeStyle();
        style.fill = '#fff';
        style.stroke = '#dcdfe6';
        style.strokeWidth = 1;
        style.opacity = 1;
        return style;
      }
      
      // 获取文本样式
      getTextStyle() {
        const style = super.getTextStyle();
        style.fontSize = 14;
        return style;
      }
      
      // 设置连接点
      getDefaultAnchor() {
        const { id, x, y, width, height } = this;
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
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
          },
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
      view: CustomBaseNode,
      model: CustomBaseNodeModel,
    };
  });
}

// TypeScript类型声明
declare module '@logicflow/core' {
  interface RectNodeModel {
    width: number;
    height: number;
    resizable: boolean;
    isAllowConnectedAsTarget: () => boolean;
    isAllowConnectedAsSource: () => boolean;
  }
} 