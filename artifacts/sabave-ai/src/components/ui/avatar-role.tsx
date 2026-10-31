import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type AvatarRoleProps = {
  name: string;
  role: string;
  src?: string;
};

export function AvatarRole({ name, role, src }: AvatarRoleProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';
  return (
    <div className="flex min-h-11 items-center gap-3">
      <Avatar className="size-11">
        {src ? <AvatarImage src={src} alt="" /> : null}
        <AvatarFallback className="bg-ds-primary/15 font-display text-sm font-semibold text-ds-ink">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-ds-ink">{name}</div>
        <div className="truncate text-sm text-ds-muted">{role}</div>
      </div>
    </div>
  );
}
