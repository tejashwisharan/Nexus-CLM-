import React, { useState } from 'react';
import { EntityProfile, ApplicationStatus, RiskLevel } from '../types';
import { ShieldAlert, Flag, CheckCircle, RefreshCw, UserMinus, FileText, Activity, Layers, UserCheck, Ban } from 'lucide-react';

interface WorkflowDiagramProps {
  database: EntityProfile[];
}

interface NodeData {
  id: string;
  label: string;
  count: number;
  x: number; // Percentage on 1200x600 grid
  y: number; // Percentage on 1200x600 grid
  icon: React.ReactNode;
  description?: string;
  statusMatch: ApplicationStatus[];
}

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ database }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Helper to count entities
  const getCount = (statuses: ApplicationStatus[]) => 
    database.filter(e => statuses.includes(e.status)).length;

  // Grid Configuration: 1200w x 600h
  // Nodes are positioned to allow straight lines to pass through gaps.
  
  const nodes: NodeData[] = [
    {
      id: 'pkyc',
      label: 'Monitoring',
      count: getCount([ApplicationStatus.PERIODIC_REVIEW]),
      x: 10, y: 15,
      icon: <RefreshCw className="w-4 h-4" />,
      description: 'Periodic Reviews',
      statusMatch: [ApplicationStatus.PERIODIC_REVIEW]
    },
    {
      id: 'sourcing',
      label: 'Sourcing',
      count: getCount([ApplicationStatus.DRAFT]), 
      x: 10, y: 55,
      icon: <FileText className="w-4 h-4" />,
      description: 'Data Ingestion',
      statusMatch: [ApplicationStatus.DRAFT]
    },
    {
      id: 'enrichment',
      label: 'Enrichment',
      count: 0, 
      x: 30, y: 55,
      icon: <Layers className="w-4 h-4" />,
      description: 'Data Augmentation',
      statusMatch: []
    },
    {
      id: 'screening',
      label: 'Screening',
      count: getCount([ApplicationStatus.PENDING_SCREENING]),
      x: 50, y: 55,
      icon: <Activity className="w-4 h-4" />,
      description: 'Sanctions & PEP',
      statusMatch: [ApplicationStatus.PENDING_SCREENING]
    },
    {
      id: 'edd',
      label: 'Due Diligence',
      count: getCount([ApplicationStatus.REVIEW_REQUIRED]),
      x: 65, y: 25,
      icon: <ShieldAlert className="w-4 h-4" />,
      description: 'High Risk Review',
      statusMatch: [ApplicationStatus.REVIEW_REQUIRED]
    },
    {
      id: 'waiver',
      label: 'Waiver',
      count: getCount([ApplicationStatus.WAIVER_REQUESTED]),
      x: 65, y: 85,
      icon: <Flag className="w-4 h-4" />,
      description: 'Exceptions',
      statusMatch: [ApplicationStatus.WAIVER_REQUESTED]
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: getCount([ApplicationStatus.REJECTED]),
      x: 50, y: 85,
      icon: <Ban className="w-4 h-4" />,
      description: 'Declined Applications',
      statusMatch: [ApplicationStatus.REJECTED]
    },
    {
      id: 'peer',
      label: 'Peer Review',
      count: getCount([ApplicationStatus.PEER_REVIEW]),
      x: 80, y: 55,
      icon: <UserCheck className="w-4 h-4" />,
      description: 'Final Approval',
      statusMatch: [ApplicationStatus.PEER_REVIEW]
    },
    {
      id: 'approved',
      label: 'Active Clients',
      count: getCount([ApplicationStatus.APPROVED]),
      x: 95, y: 55, // Far right
      icon: <CheckCircle className="w-4 h-4" />,
      description: 'Live Portfolio',
      statusMatch: [ApplicationStatus.APPROVED]
    },
    {
      id: 'offboarding',
      label: 'Off-boarding',
      count: getCount([ApplicationStatus.OFFBOARDING_REQUESTED, ApplicationStatus.OFFBOARDED]),
      x: 95, y: 85,
      icon: <UserMinus className="w-4 h-4" />,
      description: 'Closure',
      statusMatch: [ApplicationStatus.OFFBOARDING_REQUESTED, ApplicationStatus.OFFBOARDED]
    }
  ];

  // Connections Definition
  const connections = [
    { from: 'pkyc', to: 'sourcing', type: 'straight-down' },
    { from: 'sourcing', to: 'enrichment', type: 'straight' },
    { from: 'enrichment', to: 'screening', type: 'straight' },
    
    // Screening splits
    { from: 'screening', to: 'peer', type: 'straight' }, // Main path (Low risk) - passes horizontally through the middle gap
    { from: 'screening', to: 'edd', type: 'step-up-right' }, // High risk
    { from: 'screening', to: 'waiver', type: 'step-down-right' }, // Exception
    
    // Returns to main flow
    { from: 'edd', to: 'peer', type: 'step-right-down' },
    { from: 'waiver', to: 'peer', type: 'step-right-up' },

    // Rejections
    { from: 'edd', to: 'rejected', type: 'diagonal-long' },
    { from: 'waiver', to: 'rejected', type: 'straight' }, // Waiver is at 65,85. Rejected at 50,85. 
    { from: 'peer', to: 'rejected', type: 'diagonal-peer-reject' },
    
    // End stages
    { from: 'peer', to: 'approved', type: 'straight' },
    { from: 'approved', to: 'offboarding', type: 'straight-down' },
    
    // Lifecycle loop
    { from: 'approved', to: 'pkyc', type: 'loop-top' },
  ];

  // --- Orthogonal Path Generation ---
  const renderPath = (conn: any) => {
    const start = nodes.find(n => n.id === conn.from);
    const end = nodes.find(n => n.id === conn.to);
    if (!start || !end) return null;

    // ViewBox is 1200 x 600
    // Node center positions
    const sx = start.x * 12;
    const sy = start.y * 6;
    const ex = end.x * 12;
    const ey = end.y * 6;

    // Node dimensions for anchoring (Node is approx 160px wide, 48px high)
    const nodeW = 160;
    const nodeH = 48;
    const halfW = nodeW / 2;
    const halfH = nodeH / 2;

    let d = '';

    switch (conn.type) {
        case 'straight':
            // Connect Right edge to Left edge, or Left to Right if reversed
            if (sx < ex) {
                d = `M ${sx + halfW} ${sy} L ${ex - halfW} ${ey}`;
            } else {
                d = `M ${sx - halfW} ${sy} L ${ex + halfW} ${ey}`;
            }
            break;
        case 'straight-down':
             // Connect Bottom edge to Top edge
            d = `M ${sx} ${sy + halfH} L ${ex} ${ey - halfH}`;
            break;
        case 'step-up-right':
            // Screening (Middle) -> EDD (Top Right)
            // Up from Top edge, then Right to Left edge
            const midY = sy - 100; // Go up high enough
            d = `M ${sx} ${sy - halfH} L ${sx} ${midY} L ${ex - halfW - 20} ${midY} L ${ex - halfW - 20} ${ey} L ${ex - halfW} ${ey}`;
            break;
        case 'step-down-right':
             // Screening (Middle) -> Waiver (Bottom Right)
             // Down from Bottom edge, then Right to Left edge
             const midYDown = sy + 100;
             d = `M ${sx} ${sy + halfH} L ${sx} ${midYDown} L ${ex - halfW - 20} ${midYDown} L ${ex - halfW - 20} ${ey} L ${ex - halfW} ${ey}`;
             break;
        case 'step-right-down':
            // EDD (Top) -> Peer (Middle)
            // Right from Right edge, then Down to Top edge of Peer? 
            // Let's go Right from EDD then Down.
            d = `M ${sx + halfW} ${sy} L ${ex} ${sy} L ${ex} ${ey - halfH}`;
            break;
        case 'step-right-up':
            // Waiver (Bottom) -> Peer (Middle)
            // Right from Waiver, then Up to Bottom of Peer
             d = `M ${sx + halfW} ${sy} L ${ex} ${sy} L ${ex} ${ey + halfH}`;
            break;
        case 'loop-top':
            // Approved -> PKYC
            // Up from Approved, Long Left, Down to PKYC
            const topLoopY = 20; 
            d = `M ${sx} ${sy - halfH} L ${sx} ${topLoopY} L ${ex} ${topLoopY} L ${ex} ${ey - halfH}`;
            break;
        case 'diagonal-long':
             // EDD (65, 25) -> Rejected (50, 85)
             // Left from EDD, Down to Rejected
             d = `M ${sx - halfW} ${sy} L ${ex} ${sy} L ${ex} ${ey - halfH}`;
             break;
        case 'diagonal-peer-reject':
            // Peer (80, 55) -> Rejected (50, 85)
            // Bottom of Peer -> Right of Rejected? No.
            // Bottom of Peer -> Down -> Left -> Rejected Right
            const peerDrop = sy + 80;
            d = `M ${sx} ${sy + halfH} L ${sx} ${peerDrop} L ${ex + halfW} ${peerDrop} L ${ex + halfW} ${ey}`;
            break;
        default:
            d = `M ${sx} ${sy} L ${ex} ${ey}`;
    }

    const isLoop = conn.type === 'loop-top';
    const isReject = conn.to === 'rejected';

    return (
      <g key={`${conn.from}-${conn.to}`}>
        <path 
            d={d} 
            fill="none" 
            stroke={isLoop ? "#cbd5e1" : (isReject ? "#fca5a5" : "#94a3b8")} 
            strokeWidth={isLoop ? "1.5" : "2"} 
            strokeDasharray={isLoop ? "6,6" : "0"}
            markerEnd={isReject ? "url(#arrowhead-red)" : "url(#arrowhead)"}
            className="transition-all duration-500"
        />
      </g>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Entity Lifecycle Map</h3>
            <div className="flex items-center text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                System Operational
            </div>
        </div>
      
      {/* Diagram Container */}
      <div className="relative w-full h-[500px] bg-slate-50/50 rounded-lg border border-slate-100 overflow-hidden select-none">
        
        {/* SVG Layer for Orthogonal Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 L 1 3 Z" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 L 1 3 Z" fill="#fca5a5" />
            </marker>
          </defs>
          {connections.map(renderPath)}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Minimalist Professional Node - NO NUMBERS */}
            <div className={`
                flex items-center justify-center w-40 h-12 bg-white rounded-lg
                border transition-all duration-200 cursor-default
                ${hoveredNode === node.id 
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-100' 
                    : 'border-slate-300 hover:border-slate-400'
                }
            `}>
              <div className={`mr-2 text-slate-400 ${hoveredNode === node.id ? 'text-blue-600' : ''}`}>
                {node.icon}
              </div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {node.label}
              </span>
            </div>

            {/* Compact High-Contrast Tooltip */}
            {hoveredNode === node.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] z-50">
                    <div className="bg-slate-900 text-white text-xs rounded shadow-xl py-2 px-3 flex flex-col items-center">
                        <span className="text-slate-400 text-[10px] uppercase mb-1">{node.description}</span>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-lg font-bold">{node.count}</span>
                            <span className="text-slate-400">Entities</span>
                        </div>
                        {/* Triangle */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowDiagram;