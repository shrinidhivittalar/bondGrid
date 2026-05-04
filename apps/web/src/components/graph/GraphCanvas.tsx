import { useMemo } from 'react';

import { Connection, Person, RelationshipType } from '../../types/graph';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';

const graphSize = { width: 1000, height: 760 };

type GraphCanvasProps = {
  people: Person[];
  connections: Connection[];
  peopleById: Map<string, Person>;
  typeById: Map<string, RelationshipType>;
  selectedId: string;
  scale: number;
  pan: { x: number; y: number };
  setSelectedId: (id: string) => void;
  setScale: (next: number | ((current: number) => number)) => void;
  setPan: (next: { x: number; y: number }) => void;
};

export function GraphCanvas({
  people,
  connections,
  peopleById,
  typeById,
  selectedId,
  scale,
  pan,
  setSelectedId,
  setScale,
  setPan,
}: GraphCanvasProps) {
  const visibleIds = useMemo(() => new Set(people.map((person) => person.id)), [people]);
  const visibleConnections = connections.filter(
    (connection) => visibleIds.has(connection.from) && visibleIds.has(connection.to),
  );

  return (
    <div className="relative h-[640px] overflow-hidden bg-[radial-gradient(circle_at_1px_1px,#f0e9e2_1px,transparent_0)] [background-size:28px_28px]">
      <div
        className="absolute left-1/2 top-1/2 origin-center transition-transform duration-300"
        style={{
          width: graphSize.width,
          height: graphSize.height,
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${scale})`,
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${graphSize.width} ${graphSize.height}`}>
          {visibleConnections.map((connection) => {
            const source = peopleById.get(connection.from);
            const target = peopleById.get(connection.to);
            const type = typeById.get(connection.type);

            if (!source || !target || !type) return null;

            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;

            return (
              <g key={connection.id}>
                <line
                  stroke={type.color}
                  strokeDasharray={
                    type.category === 'family' ? '0' : type.category === 'friend' ? '8 8' : '4 9'
                  }
                  strokeLinecap="round"
                  strokeWidth={selectedId === source.id || selectedId === target.id ? 3 : 2}
                  x1={source.x}
                  x2={target.x}
                  y1={source.y}
                  y2={target.y}
                />
                <foreignObject height="34" width="110" x={midX - 55} y={midY - 17}>
                  <button
                    className="edge-label"
                    style={{ borderColor: type.color, color: type.color, background: type.tint }}
                    type="button"
                    onClick={() => setSelectedId(source.id)}
                  >
                    {type.label}
                  </button>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {people.map((person) => (
          <button
            className={`graph-node ${person.id === selectedId ? 'graph-node-active' : ''}`}
            key={person.id}
            style={{ left: person.x, top: person.y }}
            type="button"
            onClick={() => setSelectedId(person.id)}
          >
            <Avatar person={person} size={person.id === selectedId ? 'lg' : 'md'} />
            <strong>{person.name}</strong>
            {person.id === selectedId && <span>{person.role}</span>}
          </button>
        ))}
      </div>

      {/* Zoom/pan controls */}
      <div className="absolute bottom-5 left-4 grid overflow-hidden rounded-md border border-[#e5e7eb] bg-white shadow-lg">
        <button
          className="canvas-tool"
          type="button"
          aria-label="Fit graph"
          onClick={() => setPan({ x: 0, y: -20 })}
        >
          <Icon name="fit" />
        </button>
        <button
          className="canvas-tool"
          type="button"
          aria-label="Zoom in"
          onClick={() => setScale((current) => Math.min(1.35, current + 0.1))}
        >
          <Icon name="zoom-in" />
        </button>
        <button
          className="canvas-tool"
          type="button"
          aria-label="Zoom out"
          onClick={() => setScale((current) => Math.max(0.72, current - 0.1))}
        >
          <Icon name="zoom-out" />
        </button>
        <button
          className="canvas-tool"
          type="button"
          aria-label="Center selected"
          onClick={() => setScale(1)}
        >
          <Icon name="target" />
        </button>
      </div>

      {/* Minimap */}
      <div className="absolute bottom-5 left-20 hidden h-24 w-36 rounded-md border border-[#dbe4ef] bg-[#f8fbff] p-3 md:block">
        <div className="relative h-full w-full rounded border border-[#9cc4ff] bg-white">
          {people.map((person) => (
            <span
              className="absolute h-1.5 w-1.5 rounded-full"
              key={person.id}
              style={{
                left: `${(person.x / graphSize.width) * 100}%`,
                top: `${(person.y / graphSize.height) * 100}%`,
                background: person.id === selectedId ? '#ff5a00' : '#61c1c4',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
