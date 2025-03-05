import { v4 as uuidv4 } from 'uuid';

/**
 * 生成随机ID
 */
export const generateId = (): string => {
  return uuidv4().replace(/-/g, '');
};

/**
 * 根据值获取标签
 * @param options 选项列表
 * @param value 值
 */
export const getLabelByValue = (options: any[], value: string): string => {
  const option = options.find(item => item.value === value);
  return option ? option.label : value;
};

/**
 * 统计节点连接数
 * @param edges 边列表
 * @param nodeId 节点ID
 * @param isSource 是否为源节点
 */
export const countNodeConnections = (edges: any[], nodeId: string, isSource: boolean = true): number => {
  return edges.filter(edge => {
    return isSource ? edge.sourceNodeId === nodeId : edge.targetNodeId === nodeId;
  }).length;
};

/**
 * 生成指定范围内的随机数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 将LogicFlow图形数据转换为DSL
 * @param data LogicFlow图形数据
 * @returns DSL数据
 */
export const convertToDSL = (data: any) => {
  const { nodes, edges } = data;
  
  // 转换节点
  const dslNodes = nodes.map((node: any) => {
    return {
      id: node.id,
      type: node.type,
      name: node.properties?.name || node.text?.value || '',
      desc: node.properties?.desc || '',
      status: node.properties?.frontend_status === '1',
      properties: { ...node.properties },
      next: []
    };
  });
  
  // 添加连接关系
  edges.forEach((edge: any) => {
    const sourceNode = dslNodes.find((node: any) => node.id === edge.sourceNodeId);
    if (sourceNode) {
      sourceNode.next.push({
        id: edge.id,
        type: edge.properties?.edgeType || 'default',
        target: edge.targetNodeId,
        condition: edge.properties?.condition || ''
      });
    }
  });
  
  // 构建最终DSL
  return {
    id: `rule-chain-${Date.now()}`,
    name: '规则链',
    nodes: dslNodes,
    metadata: {
      layout: {
        nodes: nodes.map((node: any) => ({
          id: node.id,
          position: { x: node.x, y: node.y }
        }))
      }
    }
  };
};

/**
 * 将DSL转换为LogicFlow图形数据
 * @param dsl DSL数据
 * @returns LogicFlow图形数据
 */
export const convertFromDSL = (dsl: any) => {
  const { nodes, metadata } = dsl;
  
  // 转换节点
  const lfNodes = nodes.map((node: any) => {
    // 获取节点位置
    const positionInfo = metadata?.layout?.nodes?.find((n: any) => n.id === node.id);
    const position = positionInfo?.position || { x: 300, y: 300 };
    
    return {
      id: node.id,
      type: node.type,
      x: position.x,
      y: position.y,
      properties: {
        ...node.properties,
        name: node.name,
        desc: node.desc,
        frontend_status: node.status ? '1' : '0'
      },
      text: {
        x: position.x,
        y: position.y,
        value: node.name
      }
    };
  });
  
  // 转换边
  const lfEdges: any[] = [];
  nodes.forEach((node: any) => {
    if (node.next && Array.isArray(node.next)) {
      node.next.forEach((nextNode: any) => {
        lfEdges.push({
          id: nextNode.id,
          type: 'bezier',
          sourceNodeId: node.id,
          targetNodeId: nextNode.target,
          properties: {
            edgeType: nextNode.type,
            condition: nextNode.condition
          }
        });
      });
    }
  });
  
  return {
    nodes: lfNodes,
    edges: lfEdges
  };
}; 