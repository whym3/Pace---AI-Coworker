import type { FC, SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
  stroke?: number
  fill?: string
}

const Icon: FC<IconProps & { d?: string; viewBox?: string; children?: React.ReactNode }> = ({
  d,
  size = 16,
  stroke = 1.6,
  fill = 'none',
  children,
  viewBox = '0 0 24 24',
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
)

export const IconInbox: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z" />
  </Icon>
)

export const IconPipeline: FC<IconProps> = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="12" cy="18" r="2.5" />
    <path d="M6 8.5v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-3" />
    <path d="M12 14.5v1" />
  </Icon>
)

export const IconPlan: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M4 4h12l4 4v12a0 0 0 0 1 0 0H4z" />
    <path d="M16 4v4h4" />
    <path d="M8 13h8M8 17h5" />
  </Icon>
)

export const IconCalendar: FC<IconProps> = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
)

export const IconCheck: FC<IconProps> = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="6" height="6" rx="1" />
    <path d="M12 8h9M12 16h9" />
    <rect x="3" y="13" width="6" height="6" rx="1" />
  </Icon>
)

export const IconActivity: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M3 12h4l3-8 4 16 3-8h4" />
  </Icon>
)

export const IconSparkle: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8" />
  </Icon>
)

export const IconChevron: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
)

export const IconClose: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const IconSearch: FC<IconProps> = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
)

export const IconBolt: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </Icon>
)

export const IconSettings: FC<IconProps> = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
)

export const IconArrowR: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Icon>
)

export const IconAlert: FC<IconProps> = (p) => (
  <Icon {...p}>
    <path d="M12 9v4M12 17h.01M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z" />
  </Icon>
)

export const IconDot: FC<IconProps> = (p) => (
  <Icon viewBox="0 0 24 24" {...p}>
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconClock: FC<IconProps> = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const IconTeams: FC<IconProps> = (p) => (
  <Icon {...p}>
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="M9 9v6M6 12h6" />
    <circle cx="19" cy="9" r="2" />
    <path d="M17 13h4v4a2 2 0 0 1-2 2" />
  </Icon>
)

export const IconGit: FC<IconProps> = (p) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="12" r="2" />
    <path d="M6 8v8M6 12c0 3 3 4 6 4" />
  </Icon>
)

export const IconUser: FC<IconProps> = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
)
