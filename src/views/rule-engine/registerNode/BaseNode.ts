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
        const iconColor = properties.frontend_status === '0' ? '#FF0000' : '#1890FF';
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 使用简单的SVG元素替代foreignObject
        return h('g', {}, [
          h('rect', {
            width: 24,
            height: 24,
            x: safeX - safeWidth / 2 + 8,
            y: safeY - safeHeight / 2 + (safeHeight - 24) / 2,
            fill: 'transparent',
          }),
          h('path', {
            d: 'M512 149.333333c200.298667 0 362.666667 162.368 362.666667 362.666667s-162.368 362.666667-362.666667 362.666667S149.333333 712.298667 149.333333 512 311.701333 149.333333 512 149.333333z m0 64c-164.949333 0-298.666667 133.717333-298.666667 298.666667s133.717333 298.666667 298.666667 298.666667 298.666667-133.717333 298.666667-298.666667-133.717333-298.666667-298.666667-298.666667z m-128 213.333334v170.666666h256v-170.666666h-256z',
            fill: iconColor,
            transform: `translate(${safeX - safeWidth / 2 + 8}, ${safeY - safeHeight / 2 + (safeHeight - 24) / 2}) scale(0.025)`,
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
                         (typeof text === 'string' ? text : '节点');
        
        // 使用简单的文本元素替代foreignObject
        return h('text', {
          x: safeX + 15,
          y: safeY + 5,
          fill: textColor,
          fontSize: 14,
          textAnchor: 'start',
          dominantBaseline: 'middle',
        }, textValue);
      }
      
      // 获取分隔线
      getDivider() {
        const { x, y, width, height } = this.props.model;
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 使用简单的线条元素
        return h('line', {
          x1: safeX - safeWidth / 2 + 40,
          y1: safeY - safeHeight / 2,
          x2: safeX - safeWidth / 2 + 40,
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
        const { x, y, width, height, id } = model;
        
        // 确保坐标有效
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 160 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 获取节点形状
        const shape = this.getShape();
        
        // 获取图标
        const icon = this.getIcon();
        
        // 获取文本
        const text = this.getText();
        
        // 获取分隔线
        const divider = this.getDivider();
        
        // 手动创建锚点
        const anchors = this.createAnchors(safeX, safeY, safeWidth, safeHeight, id);
        
        // 返回完整的节点渲染
        return h('g', {}, [shape, icon, text, divider, ...anchors]);
      }
      
      // 创建锚点元素
      createAnchors(x: number, y: number, width: number, height: number, id: string) {
        // 定义锚点位置
        const anchorPositions = [
          { x: x + width / 2, y: y, type: 'right' },
          { x: x - width / 2, y: y, type: 'left' },
          { x: x, y: y - height / 2, type: 'top' },
          { x: x, y: y + height / 2, type: 'bottom' }
        ];
        
        // 创建锚点元素
        return anchorPositions.map(pos => {
          return h('circle', {
            cx: pos.x,
            cy: pos.y,
            r: 8,
            fill: '#FFFFFF',
            stroke: '#409EFF',
            strokeWidth: 2,
            className: `lf-node-anchor lf-node-anchor-${pos.type} node-anchor-visible`,
            style: {
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              cursor: 'crosshair'
            },
            'data-anchor-id': `${id}_${pos.type}`,
            'data-anchor-type': pos.type
          });
        });
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
        
        // 通用锚点配置
        const commonAnchorProps = {
          edgeAddable: true,
          nodeAddable: false,
          className: 'node-anchor node-anchor-visible',
          // 确保连接点始终可见
          isVisible: true,
          isShowAnchor: true,
          isSourceAnchor: true,
          isTargetAnchor: true,
          showAnchor: true,
          visible: true,
          // 添加更多控制属性
          disableRotate: false,
          style: {
            stroke: '#409EFF',
            fill: '#FFFFFF',
            strokeWidth: 2,
            r: 6,
            visibility: 'visible',
            display: 'block',
            opacity: 1
          }
        };
        
        return [
          // 右侧连接点
          {
            x: safeX + safeWidth / 2,
            y: safeY,
            id: `${id}_right`,
            type: 'right',
            ...commonAnchorProps
          },
          // 左侧连接点
          {
            x: safeX - safeWidth / 2,
            y: safeY,
            id: `${id}_left`,
            type: 'left',
            ...commonAnchorProps
          },
          // 顶部连接点
          {
            x: safeX,
            y: safeY - safeHeight / 2,
            id: `${id}_top`,
            type: 'top',
            ...commonAnchorProps
          },
          // 底部连接点
          {
            x: safeX,
            y: safeY + safeHeight / 2,
            id: `${id}_bottom`,
            type: 'bottom',
            ...commonAnchorProps
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
      
      // 获取锚点样式
      getAnchorStyle() {
        // 使用更简单的样式定义，确保锚点可见
        return {
          stroke: '#409EFF',
          fill: '#FFFFFF',
          strokeWidth: 2,
          r: 8, // 增大锚点尺寸，使其更容易被点击
          opacity: 1,
          display: 'block',
          visibility: 'visible',
          className: 'node-anchor-visible', // 添加自定义类名
          // 悬停样式
          hover: {
            stroke: '#409EFF',
            fill: '#E6F7FF',
            r: 10,
            strokeWidth: 3,
          },
        };
      }
      
      // 获取锚点配置
      getAnchorConfig() {
        return {
          visible: true,
          showAnchor: true,
          edgeAddable: true,
        };
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