import { Node, Edge } from '@vue-flow/core'

export interface FlowElement extends Node {
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

export interface FlowConnection extends Edge {
  id: string
  source: string
  target: string
  type?: string
}

// 节点类型定义
export interface FlowNode {
  id: string
  type: 'roundedRect' | 'textLabel'
  position: {
    x: number
    y: number
  }
  data: {
    label: string
    fontSize: number
    color: string
  }
  selected?: boolean
  width?: number
  height?: number
}

// 边类型定义
export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type: string
  style?: {
    strokeWidth: number
    stroke: string
  }
  markerEnd?: string
  selected?: boolean
  class?: string
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