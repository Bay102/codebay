type DiscussionAuthorAvatarProps = {
  name: string;
  avatarUrl: string | null;
  sizeClassName?: string;
  textClassName?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CB";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

export function DiscussionAuthorAvatar({
  name,
  avatarUrl,
  sizeClassName = "h-10 w-10",
  textClassName = "text-sm"
}: DiscussionAuthorAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${name} avatar`}
        className={`${sizeClassName} shrink-0 rounded-full border border-border/70 object-cover`}
      />
    );
  }

  return (
    <div
      className={`flex ${sizeClassName} shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary font-semibold text-foreground ${textClassName}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
