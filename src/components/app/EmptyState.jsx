export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-10 text-center">
      {Icon && <Icon className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />}
      <p className="mt-3 font-medium">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}