export default function StatCard({
  title,
  value,
  icon,
  bgColor,
  iconBg,
}: {
  title: string
  value: string
  icon: string
  bgColor: string
  iconBg: string
}) {
  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">{title}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-lg text-2xl`}>{icon}</div>
      </div>
    </div>
  )
}