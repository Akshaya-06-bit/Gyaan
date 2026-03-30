export default function Card({ title, description, children, action }) {
  return (
    <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
