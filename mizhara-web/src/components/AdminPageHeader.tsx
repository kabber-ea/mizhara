type AdminPageHeaderProps = {
  title: string;
  description: string;
};

export default function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-primary-dark">{title}</h1>
      <p className="mt-1 text-xs text-muted-custom">{description}</p>
    </div>
  );
}
