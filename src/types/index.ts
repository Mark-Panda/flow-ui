// 节点类型
export interface NodeData {
  id: string;
  type: string;
  x: number;
  y: number;
  properties: NodeProperties;
  text?: {
    x: number;
    y: number;
    value: string;
  };
}

// 节点属性
export interface NodeProperties {
  name: string;
  desc?: string;
  frontend_status?: string;
  [key: string]: any;
}

// 连接类型
export interface Connection {
  from_id: string;
  to_id: string;
  type_name: string;
}

// 节点布局
export interface NodeLayout {
  x: number;
  y: number;
}

// 规则链配置
export interface RuleChainConfig {
  id: string;
  name: string;
  root: boolean;
  nodes: Array<{
    id: string;
    type_name: string;
    chain_id: string;
    config: any;
    layout: NodeLayout;
  }>;
  connections: Connection[];
  metadata: {
    version: number;
    created_at: number;
    updated_at: number;
  };
} 