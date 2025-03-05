// 为LogicFlow添加类型声明
declare module '@logicflow/core' {
  import { ComponentType } from 'react';
  
  // 基础节点模型接口
  interface BaseNodeModel<P = any> {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    properties: P;
    text?: {
      value: string;
      x: number;
      y: number;
    };
    BaseType: string;
    outgoing: {
      edges: any[];
    };
    incoming: {
      edges: any[];
    };
    
    initNodeData(data: any): void;
    getNodeStyle(): any;
    getTextStyle(): any;
    getAnchorStyle(): any;
    getOutlineStyle(): any;
    getConnectedTargetRules(): any[];
    getDefaultAnchor(): any[];
  }
  
  // 基础节点类
  interface BaseNode<P = any> {
    props: {
      model: {
        id: string;
        type: string;
        x: number;
        y: number;
        width: number;
        height: number;
        properties: P;
        isSelected: boolean;
      };
    };
    getShape(): any;
    getIcon?(): any;
  }
  
  // HTML节点模型
  interface HtmlNodeModel<P = any> extends BaseNodeModel<P> {
    properties: P;
  }
  
  // HTML节点
  interface HtmlNode<P = any> extends BaseNode<P> {
    setHtml(rootEl: HTMLElement): void;
  }
  
  // 矩形节点模型
  interface RectNodeModel<P = any> extends BaseNodeModel<P> {
    properties: P;
  }
  
  // 矩形节点
  interface RectNode<P = any> extends BaseNode<P> {
    getShape(): any;
  }
  
  // 贝塞尔曲线模型
  interface BezierEdgeModel<P = any> {
    properties: P;
    getEdgeStyle(): any;
    getTextStyle(): any;
    getOutlineStyle(): any;
  }
  
  // 贝塞尔曲线
  interface BezierEdge {
    // 贝塞尔曲线相关属性和方法
  }
  
  // 核心类型
  type GraphElementCtor = any;
  
  // LogicFlow主类
  interface LogicFlow {
    register(type: string, component: any): void;
    register(component: {
      type: string;
      view: ComponentType<any> & { isObserved?: boolean };
      model: GraphElementCtor;
    }): void;
  }
} 