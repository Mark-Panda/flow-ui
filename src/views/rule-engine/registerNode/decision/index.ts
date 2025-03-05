import { h } from 'vue';
import registerBaseNode from '../BaseNode';

export default function registerDecision(lf: any) {
  // 首先注册基础节点
  registerBaseNode(lf);
  
  // 注册决策节点
  lf.register('decision', ({ RectNode, RectNodeModel }: any) => {
    class DecisionNodeView extends RectNode {
      getShape() {
        const { x, y, width, height, properties } = this.props.model;
        const style = properties.frontend_status === '0' ? {
          stroke: '#FF0000',
          strokeWidth: 2,
        } : {
          stroke: '#F56C6C', // 红色边框
          strokeWidth: 2,
        };
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 120 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 使用h函数创建矩形
        return h('rect', {
          ...style,
          fill: '#FEF0F0', // 浅红色背景
          width: safeWidth,
          height: safeHeight,
          x: safeX - safeWidth / 2,
          y: safeY - safeHeight / 2,
          rx: 10, // 圆角
          ry: 10,
        });
      }
      
      getIcon() {
        const { x, y, width, height, properties } = this.props.model;
        const iconColor = properties.frontend_status === '0' ? '#FF0000' : '#F56C6C';
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 120 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 创建一个简单的SVG图标，避免使用foreignObject
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
      
      getText() {
        const { x, y, width, height, text, properties } = this.props.model;
        const textColor = properties.frontend_status === '0' ? '#FF0000' : '#333333';
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 120 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 确保text存在且有value属性
        const textValue = text && typeof text === 'object' && text.value ? text.value : 
                         (typeof text === 'string' ? text : '判断');
        
        // 使用简单的文本元素替代foreignObject
        return h('text', {
          x: safeX + 35,
          y: safeY + 5,
          fill: textColor,
          fontSize: 14,
          fontWeight: 'bold',
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
        const safeWidth = isNaN(width) ? 120 : width;
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
    
    class DecisionNodeModel extends RectNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'decision';
        // 设置固定大小
        this.width = 120;
        this.height = 60;
        // 禁用大小调整
        this.resizable = false;
        
        // 节点的默认属性
        this.properties = {
          name: '判断',
          desc: '条件判断节点',
          condition: '',
          frontend_status: '1',
          icon: 'decision', // 设置图标
          ...this.properties,
        };
      }
      
      getDefaultAnchor() {
        const { id, x, y, width, height } = this;
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 120 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        return [
          // 右侧连接点 - 成功路径
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
          // 顶部连接点
          {
            x: safeX,
            y: safeY - safeHeight / 2,
            id: `${id}_top`,
            type: 'top',
            edgeAddable: true,
            nodeAddable: false,
            className: 'node-anchor'
          },
          // 底部连接点 - 失败路径
          {
            x: safeX,
            y: safeY + safeHeight / 2,
            id: `${id}_bottom`,
            type: 'bottom',
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
      view: DecisionNodeView,
      model: DecisionNodeModel,
    };
  });
}