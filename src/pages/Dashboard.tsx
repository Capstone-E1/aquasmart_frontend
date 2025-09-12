import { MetricCard } from '../components/MetricCard';
import { GaugeChart } from '../components/GaugeChart';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor your water quality</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="PH Level"
          value="7.1"
          color="purple"
          status="normal"
          isBest={true}
        />
        <MetricCard
          title="Turbidity Level"
          value="0.78"
          color="red"
          status="normal"
          isBest={true}
        />
        <MetricCard
          title="TDS Value"
          value="434"
          color="green"
          status="normal"
          isBest={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PH Level Chart */}
        <GaugeChart
          title="PH Level"
          value={12.12}
          maxValue={14}
          color="purple"
          status="The pH level is too high."
        />

        {/* Turbidity Chart */}
        <GaugeChart
          title="Turbidity Level"
          value={5.6}
          maxValue={10}
          color="red"
          status="The turbidity level is too high."
        />

        {/* TDS Chart */}
        <GaugeChart
          title="TDS Value"
          value={434}
          maxValue={1000}
          color="green"
          status="The TDS value is within normal limits."
        />
      </div>
    </div>
  );
}
