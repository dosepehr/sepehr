"use client"

import "@xyflow/react/dist/style.css"
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import { useMemo, useState } from "react"
import type { LabData } from "./types"
import { NEON } from "./shared"

type NeonNodeData = {
  label: string
  sub?: string
  color: string
  big?: boolean
}
type NeonNode = Node<NeonNodeData, "neon">

/** One node style for every flow: a dark pill with a colored glow. */
function NeonNodeView({ data, selected }: NodeProps<NeonNode>) {
  return (
    <div
      className={`rounded-xl border bg-[#0b0618]/95 px-4 py-2 text-center transition-shadow ${data.big ? "min-w-36 py-4" : "min-w-24"}`}
      style={{
        borderColor: data.color,
        boxShadow: `0 0 ${selected ? 28 : 14}px color-mix(in oklch, ${data.color} ${selected ? 70 : 40}%, transparent)`,
      }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0!" />
      <Handle
        type="target"
        id="t"
        position={Position.Top}
        className="opacity-0!"
      />
      <p
        className={`font-display font-bold ${data.big ? "text-lg" : "text-sm"}`}
        style={{ color: data.color }}
      >
        {data.label}
      </p>
      {data.sub && (
        <p className="mt-0.5 text-[10px] text-white/60">{data.sub}</p>
      )}
      <Handle type="source" position={Position.Right} className="opacity-0!" />
      <Handle
        type="source"
        id="b"
        position={Position.Bottom}
        className="opacity-0!"
      />
      {/* Center handles for radial layouts with straight edges. */}
      <Handle
        type="source"
        id="cs"
        position={Position.Top}
        className="top-1/2! opacity-0!"
      />
      <Handle
        type="target"
        id="ct"
        position={Position.Top}
        className="top-1/2! opacity-0!"
      />
    </div>
  )
}

const nodeTypes = { neon: NeonNodeView }

function FlowFrame({
  nodes,
  edges,
  height = 460,
}: {
  nodes: NeonNode[]
  edges: Edge[]
  height?: number
}) {
  return (
    <div
      className="lab-flow overflow-hidden rounded-2xl border border-white/10 bg-[#05020c]"
      style={{ height }}
      dir="ltr"
    >
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        style={{ width: "100%", height: "100%" }}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        panOnScroll={false}
        zoomOnScroll={false}
        preventScrolling={false}
        minZoom={0.3}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="#3b2a5c"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

const edge = (
  source: string,
  target: string,
  color: string,
  animated = true,
  extra: Partial<Edge> = {}
): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  animated,
  style: { stroke: color },
  ...extra,
})

/** 15: skills as a graph radiating from you, grouped by area. Drag the nodes around. */
export function SkillsGraph({ data }: { data: LabData }) {
  const { nodes, edges } = useMemo(() => {
    const groups = [
      { id: "frontend", color: NEON[0] },
      { id: "backend", color: NEON[1] },
      { id: "tools", color: NEON[3] },
    ] as const
    const nodes: NeonNode[] = [
      {
        id: "me",
        type: "neon",
        position: { x: 0, y: 0 },
        data: {
          label: data.profile.name,
          sub: data.profile.role,
          color: NEON[2],
          big: true,
        },
      },
    ]
    const edges: Edge[] = []
    groups.forEach((g, gi) => {
      const a = (gi / groups.length) * Math.PI * 2 - Math.PI / 2
      const gx = Math.cos(a) * 240
      const gy = Math.sin(a) * 190
      nodes.push({
        id: g.id,
        type: "neon",
        position: { x: gx, y: gy },
        data: { label: g.id.toUpperCase(), color: g.color },
      })
      edges.push(
        edge("me", g.id, g.color, true, {
          type: "straight",
          sourceHandle: "cs",
          targetHandle: "ct",
        })
      )
      const skills = data.profile.skills.filter((s) => s.group === g.id)
      skills.forEach((s, si) => {
        const spread = (si - (skills.length - 1) / 2) * 0.5
        const r = 250
        nodes.push({
          id: s.name,
          type: "neon",
          position: {
            x: gx + Math.cos(a + spread) * r,
            y: gy + Math.sin(a + spread) * r * 0.8,
          },
          data: { label: s.name, sub: `${s.level}%`, color: g.color },
        })
        edges.push(
          edge(g.id, s.name, g.color, false, {
            type: "straight",
            sourceHandle: "cs",
            targetHandle: "ct",
            style: { stroke: g.color, opacity: 0.5 },
          })
        )
      })
    })
    return { nodes, edges }
  }, [data])
  return <FlowFrame nodes={nodes} edges={edges} height={520} />
}

/** 25: a project's stack as a request pipeline (in stack order). Pick a project. */
export function ArchitectureFlow({ data }: { data: LabData }) {
  const [slug, setSlug] = useState(data.projects[0]?.slug)
  const project = data.projects.find((p) => p.slug === slug) ?? data.projects[0]
  const { nodes, edges } = useMemo(() => {
    if (!project) return { nodes: [], edges: [] }
    const c = project.color
    const stack = project.stack
    const layers = [
      { id: "user", label: "Browser", sub: "user" },
      { id: "ui", label: stack[0] ?? "UI", sub: "layer 1" },
      { id: "app", label: stack[1] ?? "App", sub: "layer 2" },
      { id: "api", label: stack[2] ?? "API", sub: "layer 3" },
      { id: "store", label: stack[3] ?? "Storage", sub: "layer 4" },
    ]
    const nodes: NeonNode[] = layers.map((l, i) => ({
      id: l.id,
      type: "neon",
      position: { x: i * 210, y: i % 2 ? 70 : 0 },
      data: { label: l.label, sub: l.sub, color: i === 0 ? NEON[1] : c },
    }))
    stack.slice(4).forEach((t, i) =>
      nodes.push({
        id: `x${i}`,
        type: "neon",
        position: { x: 420 + i * 160, y: 220 },
        data: { label: t, sub: "tooling", color: NEON[3] },
      })
    )
    const edges: Edge[] = layers.slice(1).map((l, i) =>
      edge(layers[i].id, l.id, c, true, {
        markerEnd: { type: MarkerType.ArrowClosed, color: c },
      })
    )
    stack.slice(4).forEach((_, i) =>
      edges.push(
        edge("app", `x${i}`, NEON[3], false, {
          sourceHandle: "b",
          targetHandle: "t",
          style: { stroke: NEON[3], strokeDasharray: "4 4" },
        })
      )
    )
    return { nodes, edges }
  }, [project])
  if (!project) return null
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {data.projects.map((p) => (
          <button
            key={p.slug}
            onClick={() => setSlug(p.slug)}
            className="min-h-9 rounded-full border px-4 text-sm transition-colors"
            style={{
              borderColor: p.color,
              background: p.slug === slug ? p.color : "transparent",
              color: p.slug === slug ? "#0b0618" : p.color,
            }}
          >
            {p.title}
          </button>
        ))}
      </div>
      {/* key remounts the flow so fitView runs for each project */}
      <FlowFrame key={project.slug} nodes={nodes} edges={edges} height={360} />
    </div>
  )
}

/** 30: career path as a flow: jobs on a track, with the projects that came out of them. */
export function CareerFlow({ data }: { data: LabData }) {
  const { nodes, edges } = useMemo(() => {
    const jobs = [...data.profile.experience].reverse()
    const nodes: NeonNode[] = [
      {
        id: "start",
        type: "neon",
        position: { x: 0, y: 0 },
        data: {
          label: "Hello, world",
          sub: "first line of code",
          color: NEON[3],
        },
      },
    ]
    const edges: Edge[] = []
    let prev = "start"
    jobs.forEach((j, i) => {
      const id = `job${i}`
      nodes.push({
        id,
        type: "neon",
        position: { x: (i + 1) * 280, y: 0 },
        data: {
          label: j.company,
          sub: `${j.role} · ${j.period}`,
          color: NEON[i % 2 ? 1 : 0],
          big: true,
        },
      })
      edges.push(
        edge(prev, id, NEON[i % 2 ? 1 : 0], true, {
          markerEnd: { type: MarkerType.ArrowClosed },
        })
      )
      prev = id
    })
    data.projects.forEach((p, i) => {
      const parent = `job${Math.min(jobs.length - 1, Math.floor((i * jobs.length) / Math.max(1, data.projects.length)))}`
      const id = `p${i}`
      nodes.push({
        id,
        type: "neon",
        position: { x: 180 + i * 220, y: 170 + (i % 2) * 70 },
        data: { label: p.title, sub: p.date.slice(0, 4), color: p.color },
      })
      edges.push(
        edge(parent, id, p.color, false, {
          sourceHandle: "b",
          targetHandle: "t",
          style: { stroke: p.color, strokeDasharray: "5 5" },
        })
      )
    })
    nodes.push({
      id: "next",
      type: "neon",
      position: { x: (jobs.length + 1) * 280, y: 0 },
      data: {
        label: "Your team?",
        sub: "next level",
        color: NEON[2],
        big: true,
      },
    })
    edges.push(
      edge(prev, "next", NEON[2], true, {
        style: { stroke: NEON[2], strokeDasharray: "6 4" },
      })
    )
    return { nodes, edges }
  }, [data])
  return <FlowFrame nodes={nodes} edges={edges} height={400} />
}
