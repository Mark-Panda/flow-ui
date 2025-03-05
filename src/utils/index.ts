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
  if (!data) return null;
  
  try {
    // 确保nodes和edges存在
    const nodes = data.nodes || [];
    const edges = data.edges || [];
    
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      console.error('无效的图形数据格式');
      return null;
    }
    
    // 转换节点
    const dslNodes = nodes.map((node: any) => {
      return {
        id: node.id,
        type: node.type,
        name: node.properties?.name || node.text?.value || '',
        desc: node.properties?.desc || '',
        status: node.properties?.frontend_status === '1',
        properties: { ...node.properties },
        next: [] as Array<{id: string, type: string, target: string, condition: string}>
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
  } catch (error) {
    console.error('转换为DSL失败:', error);
    return null;
  }
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

/**
 * 将JSON格式转换为规则引擎DSL格式
 * @param jsonData 原始JSON数据
 * @returns 转换后的规则引擎DSL数据
 */
export const convertJsonToDSL = (jsonData: any) => {
  if (!jsonData) return null;
  
  try {
    // 解析JSON字符串（如果传入的是字符串）
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // 提取节点数据
    const lfNodes = data.nodes.map((node: any) => {
      const position = node.layout || { x: 300, y: 300 };
      
      return {
        id: node.id,
        type: node.type_name, // 将type_name映射为type
        x: position.x,
        y: position.y,
        properties: {
          ...node.config, // 将config映射为properties
          name: node.type_name, // 使用type_name作为节点名称
          nodeType: node.type_name,
          chain_id: node.chain_id
        },
        text: {
          x: position.x,
          y: position.y,
          value: node.type_name
        }
      };
    });
    
    // 转换连接关系
    const lfEdges = data.connections.map((connection: any) => {
      return {
        id: `edge-${generateId()}`,
        type: 'bezier',
        sourceNodeId: connection.from_id,
        targetNodeId: connection.to_id,
        properties: {
          edgeType: connection.type_name
        }
      };
    });
    
    // 返回LogicFlow格式的数据
    return {
      nodes: lfNodes,
      edges: lfEdges
    };
  } catch (error) {
    console.error('转换JSON到DSL失败:', error);
    return null;
  }
};

/**
 * 将规则引擎DSL格式转换为JSON格式
 * @param dslData 规则引擎DSL数据
 * @returns 转换后的JSON格式数据
 */
export const convertDSLToJson = (dslData: any) => {
  if (!dslData) return null;
  
  try {
    // 确保nodes和edges存在，如果不存在则提供默认空数组
    const nodes = dslData.nodes || [];
    const edges = dslData.edges || [];
    
    // 转换节点
    const jsonNodes = Array.isArray(nodes) ? nodes.map((node: any) => {
      return {
        id: node.id,
        type_name: node.type || node.properties?.nodeType,
        chain_id: node.properties?.chain_id || "00000000-0000-0000-0000-000000000000",
        config: { ...node.properties },
        layout: { x: node.x, y: node.y }
      };
    }) : [];
    
    // 转换连接
    const jsonConnections = Array.isArray(edges) ? edges.map((edge: any) => {
      return {
        from_id: edge.sourceNodeId,
        to_id: edge.targetNodeId,
        type_name: edge.properties?.edgeType || "success"
      };
    }) : [];
    
    // 构建最终JSON
    return {
      id: dslData.id || "00000000-0000-0000-0000-000000000000",
      name: dslData.name || "Rule Chain",
      root: true,
      nodes: jsonNodes,
      connections: jsonConnections,
      metadata: {
        version: 1,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      }
    };
  } catch (error) {
    console.error('转换DSL到JSON失败:', error);
    return null;
  }
}; 