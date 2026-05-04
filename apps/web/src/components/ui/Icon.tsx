import React from 'react';

import { IconName } from '../../types/graph';

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2,
};

const paths: Record<IconName, React.ReactNode> = {
  network: (
    <>
      <circle cx="6" cy="18" r="2.5" {...common} />
      <circle cx="12" cy="6" r="2.5" {...common} />
      <circle cx="18" cy="18" r="2.5" {...common} />
      <path d="m7.2 15.8 3.6-7.6m2.4 0 3.6 7.6M8.7 18h6.6" {...common} />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" {...common} />
      <circle cx="9.5" cy="7" r="4" {...common} />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...common} />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" {...common} />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.71-1.71" {...common} />
    </>
  ),
  'person-plus': (
    <>
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" {...common} />
      <circle cx="8.5" cy="7" r="4" {...common} />
      <path d="M20 8v6m3-3h-6" {...common} />
    </>
  ),
  reports: (
    <>
      <path d="M4 20V10m8 10V4m8 16v-7" {...common} />
      <path d="M2 20h20" {...common} />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" {...common} />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82 2 2 0 1 1-3.34 0A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33 2 2 0 1 1 0-3.34A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82 2 2 0 1 1 3.34 0A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.36.5.67.87.87.57.3 1.24.2 1.82-.04a2 2 0 1 1 0 3.34c-.58-.24-1.25-.34-1.82-.04-.37.2-.67.5-.87.87Z"
        {...common}
      />
    </>
  ),
  search: <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" {...common} />,
  plus: <path d="M12 5v14M5 12h14" {...common} />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" {...common} />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" {...common} />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" {...common} />,
  more: <path d="M12 6h.01M12 12h.01M12 18h.01" {...common} />,
  phone: (
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.34 1.9.63 2.8a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.29 1.84.5 2.8.63A2 2 0 0 1 22 16.92Z"
      {...common}
    />
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" {...common} />
      <circle cx="12" cy="10" r="3" {...common} />
    </>
  ),
  calendar: (
    <>
      <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" {...common} />
    </>
  ),
  edit: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" {...common} />,
  trash: <path d="M3 6h18M8 6V4h8v2m-1 5v6M9 11v6M5 6l1 16h12l1-16" {...common} />,
  heart: (
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      {...common}
    />
  ),
  merge: <path d="M8 7h8a4 4 0 0 1 0 8H8m0-8 3-3M8 7l3 3m5 5-3-3m3 3-3 3" {...common} />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" {...common} />
      <circle cx="12" cy="12" r="3" {...common} />
    </>
  ),
  'zoom-in': (
    <>
      <path d="m21 21-4.35-4.35M11 8v6M8 11h6" {...common} />
      <circle cx="11" cy="11" r="7" {...common} />
    </>
  ),
  'zoom-out': (
    <>
      <path d="m21 21-4.35-4.35M8 11h6" {...common} />
      <circle cx="11" cy="11" r="7" {...common} />
    </>
  ),
  fit: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" {...common} />,
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...common} />
      <circle cx="9" cy="7" r="4" {...common} />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...common} />
    </>
  ),
};

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
