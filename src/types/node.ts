import type LogicFlow from '@logicflow/core';

/**
 * 节点属性组件Props
 */
export interface NodePropertyProps {
  /**
   * 节点数据
   */
  nodeData: any;
  
  /**
   * LogicFlow实例
   */
  lf: LogicFlow;
  
  /**
   * 流程详情
   */
  flowDetail: Record<string, any>;
}

/**
 * 节点组件Props
 */
export interface NodeComponentProps {
  /**
   * 节点数据
   */
  nodeData: any;
  
  /**
   * 节点实例
   */
  graphModel: any;
  
  /**
   * 已选中
   */
  isSelected: boolean;
  
  /**
   * 已禁用
   */
  isDisabled: boolean;
} 