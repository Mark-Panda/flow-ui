// 全局类型定义
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// LogicFlow类型定义
declare type LogicFlow = any;

// LogicFlow边类型定义
declare namespace LogicFlow {
  interface Edge {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    model: {
      properties: Record<string, any>;
    };
  }
}

// 全局Edge接口定义
interface Edge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  model: {
    properties: Record<string, any>;
  };
}

// 添加HTML节点类型声明
interface HtmlNodeModel {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
  outgoing: {
    edges: Edge[];
  };
  incoming: {
    edges: Edge[];
  };
}

interface HtmlNode {
  props: {
    model: {
      properties: Record<string, any>;
      isSelected: boolean;
    };
  };
  setHtml(rootEl: HTMLElement): void;
}

// 添加Rect节点类型声明
interface RectNodeModel {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, any>;
  outgoing: {
    edges: Edge[];
  };
  incoming: {
    edges: Edge[];
  };
  getNodeStyle(): any;
  getTextStyle(): any;
}

interface RectNode {
  props: {
    model: {
      id: string;
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      properties: Record<string, any>;
      isSelected: boolean;
    };
  };
  getShape(): any;
  getIcon?(): any;
}

// 添加Bezier边类型声明
interface BezierEdgeModel {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties: Record<string, any>;
  getEdgeStyle(): any;
  getTextStyle(): any;
  getOutlineStyle(): any;
}

interface BezierEdge {
  props: {
    model: {
      properties: Record<string, any>;
      isSelected: boolean;
      sourceNodeId: string;
      targetNodeId: string;
    };
  };
}