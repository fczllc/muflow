import type { Node, Edge, XYPosition, Position, Connection } from '@vue-flow/core'

/**
 * 节点样式类型定义
 */
export interface NodeStyle {
  /** 背景颜色 */
  backgroundColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 边框宽度 */
  borderWidth?: number
  /** 边框样式 */
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  /** 字体大小 */
  fontSize?: number
  /** 字体颜色 */
  color?: string
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 透明度 */
  opacity?: number
  /** 圆角半径 */
  borderRadius?: number
  /** 阴影 */
  boxShadow?: string
  /** 其他样式属性 */
  [key: string]: any
  padding?: number
}

/**
 * 边样式类型定义
 */
export interface EdgeStyle {
  /** 线条宽度 */
  strokeWidth?: number | string
  /** 线条颜色 */
  stroke?: string
  /** 线条类型 */
  strokeDasharray?: string
  /** 透明度 */
  opacity?: number
  /** 动画 */
  animation?: string
  /** 其他样式属性 */
  [key: string]: any
  markerEnd?: string
  markerStart?: string
}

/**
 * 基本元素类型
 */
export interface BaseElement {
  /** 元素唯一标识 */
  id: string
  /** 元素类型 */
  type: string
  /** 元素位置 */
  position: {
    x: number
    y: number
  }
  /** 元素数据 */
  data: {
    /** 显示标签 */
    label: string
    /** 其他数据属性 */
    [key: string]: any
  }
  /** 元素样式 */
  style?: NodeStyle
}

/**
 * 基本连接类型
 */
export interface BaseConnection extends Connection {
  /** 连接唯一标识 */
  id: string
  /** 源节点ID */
  source: string
  /** 目标节点ID */
  target: string
  /** 连接类型 */
  type?: string
  /** 源节点连接点位置 */
  sourceHandle?: string | null
  /** 目标节点连接点位置 */
  targetHandle?: string | null
}

/**
 * 节点宽度计算函数类型
 */
export type WidthFunc = () => number

/**
 * 基本节点类型
 */
export interface BaseNode {
  /** 节点唯一标识 */
  id: string
  /** 节点类型 */
  type: string
  /** 节点位置 */
  position: {
    x: number
    y: number
  }
  /** 节点数据 */
  data?: {
    /** 显示标签 */
    label?: string
    /** 字体大小 */
    fontSize?: number
    /** 字体颜色 */
    color?: string
    /** 其他数据属性 */
    [key: string]: any
    style?: Record<string, any>
  }
  /** 是否选中 */
  selected?: boolean
  /** 节点样式 */
  style?: NodeStyle
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可连接 */
  connectable?: boolean
}

/**
 * 流程图节点类型
 */
export type FlowNode = BaseNode

/**
 * 基本边类型
 */
export interface BaseEdge {
  /** 边的唯一标识 */
  id: string
  /** 源节点ID */
  source: string
  /** 目标节点ID */
  target: string
  /** 边的类型 */
  type?: string
  /** 源节点连接点 */
  sourceHandle?: string | null
  /** 目标节点连接点 */
  targetHandle?: string | null
  /** 边的样式 */
  style?: EdgeStyle
  /** 是否可选择 */
  selectable?: boolean
  /** 是否可删除 */
  deletable?: boolean
  /** 是否显示 */
  hidden?: boolean
  /** 动画 */
  animated?: boolean
  /** 标签 */
  label?: string
  /** 数据 */
  data?: Record<string, any>
  markerEnd?: string
  markerStart?: string
}

/**
 * 流程图边类型
 */
export type FlowEdge = BaseEdge

/**
 * 对齐方向类型
 */
export type AlignDirection = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle'

/**
 * 分布方向类型
 */
export type DistributeDirection = 'horizontal' | 'vertical'

/**
 * 节点尺寸类型
 */
export interface NodeDimensions {
  /** 节点宽度 */
  width: number
  /** 节点高度 */
  height: number
}

/**
 * API响应数据类型
 */
export interface APIResponse<T = FlowData> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 流程图数据类型
 */
export interface FlowData {
  /** 节点列表 */
  nodes: FlowNode[]
  /** 边列表 */
  edges: FlowEdge[]
  metadata?: {
    version: string
    timestamp: string
    title: string
  }
}

/**
 * 事件处理函数类型
 */
export type EventHandler<T = any> = (event: T) => void

/**
 * 错误类型
 */
export interface FlowError {
  code: string
  message: string
  details?: Record<string, any>
} 