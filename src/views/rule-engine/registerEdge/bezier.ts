import type LogicFlow from '@logicflow/core';

export default function registerBezier(lf: any) {
  lf.register('bezier', ({ BezierEdge, BezierEdgeModel }: any) => {
    class CustomBezierEdge extends BezierEdge {}
    
    class CustomBezierEdgeModel extends BezierEdgeModel {
      constructor(data: any, graphModel: any) {
        super(data, graphModel);
        this.properties = {
          edgeType: 'default',
          ...this.properties,
        };
      }
      
      getEdgeStyle() {
        const style = super.getEdgeStyle();
        const { edgeType } = this.properties;
        
        // 设置基本样式
        style.strokeWidth = 2;
        style.strokeDasharray = ''; // 实线
        
        // 根据边类型设置不同颜色
        if (edgeType === 'success') {
          style.stroke = '#67C23A';
        } else if (edgeType === 'fail') {
          style.stroke = '#F56C6C';
        } else {
          style.stroke = '#909399'; // 灰色，与图片中的效果一致
        }
        
        return style;
      }
      
      getTextStyle() {
        const style = super.getTextStyle();
        style.fontSize = 12;
        return style;
      }
      
      getOutlineStyle() {
        const style = super.getOutlineStyle();
        style.stroke = '#409EFF';
        style.strokeWidth = 1;
        return style;
      }
    }
    
    return {
      view: CustomBezierEdge,
      model: CustomBezierEdgeModel,
    };
  });
} 