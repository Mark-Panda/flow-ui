import { h } from 'vue';
import registerBaseNode from '../BaseNode';

export default function registerAssignment(lf: any) {
  // 首先注册基础节点
  registerBaseNode(lf);
  
  // 注册赋值节点
  lf.register('assignment', ({ RectNode, RectNodeModel }: any) => {
    class AssignmentNodeView extends RectNode {
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
            body: `<path fill="${stroke}" d="M832 64H192c-70.4 0-128 57.6-128 128v640c0 70.4 57.6 128 128 128h640c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128zM192 128h640c35.2 0 64 28.8 64 64v64H128v-64c0-35.2 28.8-64 64-64z m640 768H192c-35.2 0-64-28.8-64-64V320h768v512c0 35.2-28.8 64-64 64z" />`
          }
        };
      }
    }
    
    class AssignmentNodeModel extends RectNodeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.type = 'assignment';
        // 节点的默认属性
        this.properties = {
          name: '赋值',
          desc: '变量赋值节点',
          frontend_status: '1',
          variable: '',
          value: '',
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
      view: AssignmentNodeView,
      model: AssignmentNodeModel,
    };
  });
} 