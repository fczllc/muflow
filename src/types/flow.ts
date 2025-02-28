import type { Node, Edge, XYPosition } from '@vue-flow/core'

// 基本元素类型
export interface BaseElement {
  id: string
  type: string
  position: {
    x: number
    y: number
  }
  data: {
    label: string
    [key: string]: any
  }
}

// 基本连接类型
export interface BaseConnection {
  id: string
  source: string
  target: string
  type?: string
}

// 节点宽度函数类型
export type WidthFunc = () => number

// 基本节点类型
export type BaseNode = {
  id: string
  type: string
  position: XYPosition
  data: {
    label: string
    fontSize?: number
    color?: string
    [key: string]: any
  }
  selected?: boolean
}

// 节点类型定义
export interface FlowNode {
  id: string
  type: string
  position: XYPosition
  data: {
    label: string
    fontSize?: number
    color?: string
    [key: string]: any
  }
  selected?: boolean
  class?: string
}

// 基本边类型
export type BaseEdge = {
  id: string
  source: string
  target: string
  type: string
  selected?: boolean
  style?: {
    strokeWidth: number
    stroke: string
  }
}

// 边类型定义
export interface FlowEdge {
  id: string
  source: string
  target: string
  type: string
  selected?: boolean
  class?: string
  style?: {
    strokeWidth: number
    stroke: string
  }
}

// 对齐方向类型
export type AlignDirection = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle'

// 分布方向类型
export type DistributeDirection = 'horizontal' | 'vertical'

// 节点尺寸类型
export interface NodeDimensions {
  width: number
  height: number
} 
} 