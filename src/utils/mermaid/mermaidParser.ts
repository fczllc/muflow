/**
 * mermaidParser.ts
 * Mermaid流程图解析工具，将Mermaid flowchart脚本转换为MuFlow节点和边数据
 */

import { v4 as uuidv4 } from 'uuid';

// 节点类型映射关系
const NODE_TYPES = {
  DEFAULT: 'roundedRect',         // 默认节点: id或id1[This is the text in the box]
  ROUNDED: 'startEnd',           // 圆角矩形: id1(This is the text in the box)
  STADIUM: 'startEnd',            // 体育场形: id1([This is the text in the box])
  CIRCLE: 'circle',               // 圆形: id1((This is the text in the circle))
  RHOMBUS: 'condition',           // 菱形: id1{This is the text in the box}
};

// 连线样式映射关系
const EDGE_STYLES = {
  SOLID: 'solid',                 // 实线: ---
  THICK: 'solid',                 // 粗线: ===
  DOTTED: 'dotted',               // 点线: -.-
};

// 流程图方向映射
const FLOW_DIRECTIONS = {
  TB: 'TB', // 从上到下
  TD: 'TD', // 从上到下（等同于TB）
  LR: 'LR', // 从左到右
};

// 定义解析后返回的数据接口
export interface ParsedMermaidData {
  nodes: any[];
  edges: any[];
  direction: string;
  success: boolean;
  message?: string;
}

/**
 * 解析Mermaid flowchart脚本
 * @param script Mermaid脚本文本
 * @returns 解析后的节点和边数据
 */
export function parseMermaidFlowchart(script: string): ParsedMermaidData {
  try {
    // 检查是否为flowchart类型
    if (!script.includes('flowchart') && !script.includes('graph')) {
      return {
        nodes: [],
        edges: [],
        direction: 'LR',
        success: false,
        message: '非flowchart类型',
      };
    }

    // 移除注释和其他不需要的内容
    const cleanedScript = removeComments(script);
    
    // 提取流程图方向
    const direction = extractDirection(cleanedScript);
    
    if (!direction || !['TB', 'TD', 'LR'].includes(direction)) {
      return {
        nodes: [],
        edges: [],
        direction: 'LR',
        success: false,
        message: '不支持的流程图方向，仅支持TB、TD和LR',
      };
    }
    
    // 分离节点和连线定义
    const { nodeDefinitions, edgeDefinitions } = separateDefinitions(cleanedScript);
    
    console.log('解析节点定义:', nodeDefinitions);
    
    // 解析节点
    const nodes = parseNodes(nodeDefinitions);
    
    console.log('解析后的节点:', nodes);
    
    // 检查节点ID是否重复
    const nodeIds = nodes.map(node => node.id);
    const hasDuplicateIds = nodeIds.length !== new Set(nodeIds).size;
    
    if (hasDuplicateIds) {
      return {
        nodes: [],
        edges: [],
        direction: direction,
        success: false,
        message: '节点ID重复，请检查',
      };
    }
    
    // 解析连线
    const edges = parseEdges(edgeDefinitions, nodes);
    
    // 布局节点
    const layoutedNodes = layoutNodes(nodes, edges, direction);
    
    return {
      nodes: layoutedNodes,
      edges,
      direction,
      success: true,
    };
  } catch (error) {
    console.error('解析Mermaid脚本时出错:', error);
    
    return {
      nodes: [],
      edges: [],
      direction: 'LR',
      success: false,
      message: '解析失败，请检查脚本格式是否正确',
    };
  }
}

/**
 * 移除注释和其他不需要的内容
 * @param script 原始脚本文本
 * @returns 清理后的脚本文本
 */
function removeComments(script: string): string {
  // 移除title块
  const noTitleScript = script.replace(/---\s*title:.*?---/gs, '').trim();
  
  // 移除注释
  return noTitleScript.replace(/%%.*?%%/g, '').trim();
}

/**
 * 提取流程图方向
 * @param script 清理后的脚本文本
 * @returns 流程图方向
 */
function extractDirection(script: string): string | null {
  // 匹配flowchart或graph方向定义
  const dirMatch = script.match(/(?:flowchart|graph)\s+(TB|TD|LR)/i);
  
  return dirMatch ? dirMatch[1].toUpperCase() : null;
}

/**
 * 分离节点定义和连线定义
 * @param script 清理后的脚本文本
 * @returns 节点定义和连线定义数组
 */
function separateDefinitions(script: string): { nodeDefinitions: string[], edgeDefinitions: string[] } {
  // 移除流程图方向声明行
  const withoutDirectionLine = script.replace(/(?:flowchart|graph)\s+(TB|TD|LR)/i, '').trim();
  
  // 分离行定义
  const lines = withoutDirectionLine.split('\n').map(line => line.trim()).filter(line => line);
  
  const nodeDefinitions: string[] = [];
  const edgeDefinitions: string[] = [];
  
  // 从连线定义中提取节点ID
  const nodeIdsFromEdges = new Set<string>();
  
  // 识别节点和连线定义
  lines.forEach(line => {
    // 包含连线符号的是连线定义
    if (line.includes('-->') || line.includes('---') || 
        line.includes('==>') || line.includes('===') || 
        line.includes('-.-') || line.includes('-.->')) {
      edgeDefinitions.push(line);
      
      // 提取连线定义中的节点ID
      const edgeMatch = line.match(/([A-Za-z0-9_-]+)\s*(?:-{2,3}>|={2,3}>|-\.-?>)\s*([A-Za-z0-9_-]+)/);
      if (edgeMatch) {
        nodeIdsFromEdges.add(edgeMatch[1]);
        nodeIdsFromEdges.add(edgeMatch[2]);
      }
    } 
    // 不包含子图声明的可能是节点定义
    else if (!line.includes('subgraph') && !line.includes('end')) {
      // 检查是否是样式定义
      if (!line.includes('style') && !line.includes('class') && !line.includes('classDef')) {
        nodeDefinitions.push(line);
      }
    }
  });
  
  // 将从连线中提取的简单节点ID添加到节点定义中
  // 但仅当它们不是已经在节点定义中的ID
  const existingNodeIds = new Set<string>();
  
  // 获取已有节点定义中的ID
  nodeDefinitions.forEach(def => {
    const match = def.match(/^([A-Za-z0-9_-]+)/);
    if (match) {
      existingNodeIds.add(match[1]);
    }
  });
  
  // 添加从连线中提取且不在节点定义中的节点ID
  nodeIdsFromEdges.forEach(id => {
    if (!existingNodeIds.has(id)) {
      nodeDefinitions.push(id);
    }
  });
  
  return { nodeDefinitions, edgeDefinitions };
}

/**
 * 解析节点定义
 * @param nodeDefinitions 节点定义数组
 * @returns 解析后的节点数据
 */
function parseNodes(nodeDefinitions: string[]): any[] {
  const nodes: any[] = [];
  
  nodeDefinitions.forEach(def => {
    try {
      // 圆形: id((text)) - 必须放在最前面检查
      const circleMatch = def.match(/^([A-Za-z0-9_-]+)\(\((.*?)\)\)$/);
      if (circleMatch) {
        const nodeId = circleMatch[1];
        const label = cleanText(circleMatch[2]);
        nodes.push(createNode(nodeId, label, NODE_TYPES.CIRCLE));
        return;
      }
      
      // 菱形: id{text} - 严格匹配单个花括号
      const rhombusMatch = def.match(/^([A-Za-z0-9_-]+)\{([^{}]*?)\}$/);
      if (rhombusMatch) {
        const nodeId = rhombusMatch[1];
        const label = cleanText(rhombusMatch[2]);
        nodes.push(createNode(nodeId, label, NODE_TYPES.RHOMBUS));
        return;
      }
      
      // 体育场形: id([text])
      const stadiumMatch = def.match(/^([A-Za-z0-9_-]+)\(\[(.*?)\]\)$/);
      if (stadiumMatch) {
        const nodeId = stadiumMatch[1];
        const label = cleanText(stadiumMatch[2]);
        nodes.push(createNode(nodeId, label, NODE_TYPES.STADIUM));
        return;
      }
      
      // 圆角矩形: id(text)
      const roundMatch = def.match(/^([A-Za-z0-9_-]+)\((.*?)\)$/);
      if (roundMatch) {
        const nodeId = roundMatch[1];
        const label = cleanText(roundMatch[2]);
        nodes.push(createNode(nodeId, label, NODE_TYPES.ROUNDED));
        return;
      }
      
      // 默认情况：处理所有其他格式，包括：
      // 1. 仅ID的节点: id
      // 2. 方括号节点: id[text]
      // 3. 双花括号节点: id{{text}}
      // 4. 任何其他不匹配上述模式的节点
      const nodeId = def.match(/^([A-Za-z0-9_-]+)/)?.[1] || def;
      const label = def.match(/\[(.*?)\]$/)?.[1] || 
                   def.match(/\{\{(.*?)\}\}$/)?.[1] || 
                   nodeId;
      nodes.push(createNode(nodeId, cleanText(label), NODE_TYPES.DEFAULT));
      
    } catch (error) {
      console.warn('解析节点定义时出错:', def, error);
    }
  });
  
  return nodes;
}

/**
 * 创建节点对象
 * @param id 节点ID
 * @param label 节点标签
 * @param type 节点类型
 * @returns 节点对象
 */
function createNode(id: string, label: string, type: string): any {
  // 获取默认节点尺寸
  const dimensions = getNodeDimensions(type, label);
  
  // 基础样式
  const baseStyle = {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    textAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#555',
    borderStyle: 'solid',
  };

  // 根据节点类型设置特定样式
  let specificStyle = {};
  if (type === NODE_TYPES.ROUNDED || type === NODE_TYPES.STADIUM) {
    // StartEndNode.vue 的默认样式
    specificStyle = {
      borderRadius: '20px',
      padding: '8px',
      minWidth: '100px',
      minHeight: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    };
  } else if (type === NODE_TYPES.CIRCLE) {
    // CircleNode.vue 的默认样式
    specificStyle = {
      width: '38px',
      height: '38px',
      minWidth: '38px',
      minHeight: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: '8px',
      background: 'transparent',
      borderWidth: 0,
    };
    dimensions.width = 38;
    dimensions.height = 38;
  } else if (type === NODE_TYPES.RHOMBUS) {
    // ConditionNode.vue 的默认样式
    specificStyle = {
      width: '100px',
      height: '60px',
      minWidth: '100px',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: '8px',
      background: 'transparent'
    };
    dimensions.width = 100;
    dimensions.height = 60;
  }

  // 合并样式
  const defaultStyle = {
    ...baseStyle,
    ...specificStyle
  };

  // 为菱形节点添加特殊处理
  if (type === NODE_TYPES.RHOMBUS) {
    return {
      id,
      type,
      data: {
        label,
        style: defaultStyle,
        isEditing: false,
        fontSize: 12,
        color: '#000000',
        savedBgColor: '#ffffff',
        savedBorderWidth: 1,
        savedBorderColor: '#555',
        savedBorderStyle: 'solid'
      },
      position: { x: 0, y: 0 },
      style: {
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        backgroundColor: 'transparent',
      },
      width: dimensions.width,
      height: dimensions.height,
    };
  }

  return {
    id,
    type,
    data: {
      label,
      style: defaultStyle,
      isEditing: false,
      fontSize: 12,
      color: '#000000',
      savedBgColor: '#ffffff',
    },
    position: { x: 0, y: 0 },
    style: {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
    },
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * 获取节点默认尺寸
 * @param type 节点类型
 * @param label 节点文本
 * @returns 节点尺寸对象
 */
function getNodeDimensions(type: string, label: string): { width: number, height: number } {
  // 根据标签长度估算宽度，每个字符按12px计算，最小宽度为100px
  const estimatedWidth = Math.max(Math.min(label.length * 12, 200), 100);
  
  switch (type) {
    case NODE_TYPES.CIRCLE:
      return { width: 38, height: 38 }; // 圆形节点固定尺寸
    case NODE_TYPES.RHOMBUS:
      return { width: 100, height: 60 }; // 菱形节点固定尺寸
    case NODE_TYPES.STADIUM:
    case NODE_TYPES.ROUNDED:
      return { 
        width: Math.max(100, estimatedWidth),
        height: 38
      };
    case NODE_TYPES.DEFAULT:
    default:
      return {
        width: estimatedWidth,
        height: 38
      };
  }
}

/**
 * 清理文本内容
 * @param text 原始文本
 * @returns 清理后的文本
 */
function cleanText(text: string): string {
  // 移除引号（如果存在）
  if ((text.startsWith('"') && text.endsWith('"')) || 
      (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }
  
  // 如果文本以反引号包裹，移除它们及其中的markdown标记
  if (text.startsWith('`') && text.endsWith('`')) {
    text = text.substring(1, text.length - 1)
      .replace(/\*\*(.*?)\*\*/g, '$1')  // 移除粗体
      .replace(/_(.*?)_/g, '$1')        // 移除斜体
      .replace(/\*(.*?)\*/g, '$1');     // 移除斜体（星号）
  }
  
  // 移除HTML标签
  text = text.replace(/<[^>]*>/g, '');
  
  // 移除转义字符
  text = text.replace(/&[^;]+;/g, '');
  
  // 移除换行符
  text = text.replace(/\n/g, ' ');
  
  return text.trim();
}

/**
 * 解析连线定义
 * @param edgeDefinitions 连线定义数组
 * @param nodes 已解析的节点数组
 * @returns 解析后的连线数据
 */
function parseEdges(edgeDefinitions: string[], nodes: any[]): any[] {
  const edges: any[] = [];
  
  edgeDefinitions.forEach(def => {
    try {
      // 基本连线: A-->B
      let match = def.match(/([A-Za-z0-9_-]+)\s*(-{2,3}>|={2,3}>|-\.-?>)\s*([A-Za-z0-9_-]+)/);
      if (match) {
        const sourceId = match[1];
        const targetId = match[3];
        const edgeType = match[2];
        
        edges.push(createEdge(sourceId, targetId, '', getEdgeStyle(edgeType)));
        return;
      }
      
      // 带标签的连线: A--text-->B 或 A-->|text|B
      match = def.match(/([A-Za-z0-9_-]+)\s*(-{2,3}|={2,3}|-\.{1,3})(.*?)(-{2,3}>|={2,3}>|-\.-?>)\s*([A-Za-z0-9_-]+)/);
      if (match) {
        const sourceId = match[1];
        const targetId = match[5];
        const labelPart = match[3].trim();
        const edgeType = match[2] + match[4];
        
        // 提取标签文本
        let label = '';
        if (labelPart.startsWith('|') && labelPart.endsWith('|')) {
          label = labelPart.substring(1, labelPart.length - 1);
        } else if (labelPart) {
          label = labelPart;
        }
        
        edges.push(createEdge(sourceId, targetId, cleanText(label), getEdgeStyle(edgeType)));
        return;
      }
    } catch (error) {
      console.warn('解析连线定义时出错:', def, error);
    }
  });
  
  return edges;
}

/**
 * 获取连线样式
 * @param edgeType 连线类型标记
 * @returns 连线样式对象
 */
function getEdgeStyle(edgeType: string): { style: string, width: number } {
  if (edgeType.includes('=')) {
    return { style: EDGE_STYLES.THICK, width: 2 };
  } else if (edgeType.includes('-.')) {
    return { style: EDGE_STYLES.DOTTED, width: 1 };
  } else {
    return { style: EDGE_STYLES.SOLID, width: 1 };
  }
}

/**
 * 创建连线对象
 * @param source 源节点ID
 * @param target 目标节点ID
 * @param label 连线标签
 * @param style 连线样式
 * @returns 连线对象
 */
function createEdge(source: string, target: string, label: string = '', style: { style: string, width: number }): any {
  const edgeId = `e${source}-${target}`;
  
  // 限制标签长度最多16个字符
  const trimmedLabel = label.length > 16 ? label.substring(0, 16) : label;
  
  return {
    id: edgeId,
    source,
    target,
    type: 'smoothstep',
    data: {
      savedLineWidth: style.width,
      savedLineColor: '#555555',
      savedLineStyle: style.style,
      savedArrowStyle: 'target',
      label: trimmedLabel
    },
    label: trimmedLabel,
    style: {
      strokeWidth: style.width,
      stroke: '#555555',
      ...(style.style === 'dotted' ? { strokeDasharray: '2 2' } : {})
    },
    markerEnd: {
      type: 'arrow',
      color: '#555555',
      width: 15,
      height: 15,
      strokeWidth: 2
    }
  };
}

/**
 * 简单布局节点
 * @param nodes 节点数组
 * @param edges 连线数组
 * @param direction 流程图方向
 * @returns 带有位置信息的节点数组
 */
function layoutNodes(nodes: any[], edges: any[], direction: string): any[] {
  // 创建节点邻接表
  const adjacencyList: Record<string, string[]> = {};
  
  // 初始化所有节点的邻接列表
  nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  // 填充邻接表
  edges.forEach(edge => {
    if (adjacencyList[edge.source]) {
      adjacencyList[edge.source].push(edge.target);
    }
  });
  
  // 获取所有根节点（没有入边的节点）
  const rootNodes = nodes.filter(node => {
    return !edges.some(edge => edge.target === node.id);
  });
  
  // 如果没有根节点，就选取第一个节点作为根节点
  if (rootNodes.length === 0 && nodes.length > 0) {
    rootNodes.push(nodes[0]);
  }
  
  // 层次布局
  const HORIZONTAL_SPACING = 150; // 水平间距
  const VERTICAL_SPACING = 100;   // 垂直间距
  
  // 记录节点的层级
  const nodeLevels: Record<string, number> = {};
  const visitedNodes = new Set<string>();
  
  // 使用BFS计算节点层级
  function calculateLevels(startNodeIds: string[]) {
    const queue: { id: string, level: number }[] = startNodeIds.map(id => ({ id, level: 0 }));
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      
      if (visitedNodes.has(id)) {
        continue;
      }
      
      visitedNodes.add(id);
      nodeLevels[id] = Math.max(nodeLevels[id] || 0, level);
      
      const neighbors = adjacencyList[id] || [];
      neighbors.forEach(neighborId => {
        queue.push({ id: neighborId, level: level + 1 });
      });
    }
  }
  
  // 从根节点开始计算层级
  calculateLevels(rootNodes.map(node => node.id));
  
  // 找出每一层的节点
  const levelGroups: Record<number, string[]> = {};
  Object.entries(nodeLevels).forEach(([nodeId, level]) => {
    if (!levelGroups[level]) {
      levelGroups[level] = [];
    }
    levelGroups[level].push(nodeId);
  });
  
  // 分配位置
  const nodePositions: Record<string, { x: number, y: number }> = {};
  
  // 根据方向分配节点位置
  if (direction === 'LR') {
    Object.entries(levelGroups).forEach(([level, nodeIds]) => {
      const numNodes = nodeIds.length;
      nodeIds.forEach((nodeId, index) => {
        nodePositions[nodeId] = {
          x: parseInt(level) * HORIZONTAL_SPACING + 100,
          y: (index - numNodes / 2) * VERTICAL_SPACING + (numNodes % 2 === 0 ? VERTICAL_SPACING / 2 : 0) + 200
        };
      });
    });
  } else { // TB 或 TD
    Object.entries(levelGroups).forEach(([level, nodeIds]) => {
      const numNodes = nodeIds.length;
      nodeIds.forEach((nodeId, index) => {
        nodePositions[nodeId] = {
          x: (index - numNodes / 2) * HORIZONTAL_SPACING + (numNodes % 2 === 0 ? HORIZONTAL_SPACING / 2 : 0) + 200,
          y: parseInt(level) * VERTICAL_SPACING + 100
        };
      });
    });
  }
  
  // 更新节点位置
  return nodes.map(node => ({
    ...node,
    position: nodePositions[node.id] || { x: 0, y: 0 }
  }));
} 