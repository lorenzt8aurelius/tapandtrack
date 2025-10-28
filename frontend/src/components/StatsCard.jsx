function StatsCard({ title, value, icon, color, delay = 0 }) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-4 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
