import { h } from 'vue';
import registerBaseNode from '../BaseNode';

export default function registerAssignment(lf: any) {
  // 首先注册基础节点
  registerBaseNode(lf);
  
  // 注册赋值节点
  lf.register('assignment', ({ RectNode, RectNodeModel }: any) => {
    class AssignmentNodeView extends RectNode {
      getShape() {
        const { x, y, width, height, properties } = this.props.model;
        const style = properties.frontend_status === '0' ? {
          stroke: '#FF0000',
          strokeWidth: 2,
        } : {
          stroke: '#67C23A', // 绿色边框
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
          fill: '#E1F3D8', // 浅绿色背景
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
        const stroke = properties.frontend_status === '0' ? '#FF0000' : '#67C23A';
        
        // 确保x和y是有效数值
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 0 : y;
        const safeWidth = isNaN(width) ? 120 : width;
        const safeHeight = isNaN(height) ? 60 : height;
        
        // 直接使用h函数创建SVG元素，而不是返回对象
        return h('svg', {
          x: safeX - safeWidth / 2 + 5,
          y: safeY - safeHeight / 2 + 5,
          width: 25,
          height: 25,
          viewBox: '0 0 1024 1024',
          innerHTML: `<path fill="${stroke}" d="M832 64H192c-70.4 0-128 57.6-128 128v640c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128zM192 128h640c35.2 0 64 28.8 64 64v64H128v-64c0-35.2 28.8-64 64-64z m640 768H192c-35.2 0-64-28.8-64-64V320h768v512c0 35.2-28.8 64-64 64z" />`
        });
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
                         (typeof text === 'string' ? text : '赋值');
        
        // 使用h函数创建文本
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

      // 重写渲染方法
      render() {
        const { model } = this.props;
        const { properties } = model;
        const statusClass = properties.frontend_status === '0' ? 'node-disabled' : '';
        
        return h('g', {
          className: `node-container ${statusClass}`,
        }, [
          this.getShape(),
          this.getIcon(),
          this.getText(),
        ]);
      }
    }
    
    class AssignmentNodeModel extends RectNodeModel {
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
          variable: '',
          value: '',
          frontend_status: '1',
          ...this.properties,
        };
      }
      
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
          // 底部连接点
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
      view: AssignmentNodeView,
      model: AssignmentNodeModel,
    };
  });
} 