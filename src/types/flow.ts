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