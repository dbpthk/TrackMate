import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartCard } from "./ChartCard";

const CHART_COLORS = [
  "hsl(var(--color-primary))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

type AnalyticsChartsProps = {
  volumeByDate: { date: string; volume: number }[];
  volumeByWeek: { week: string; volume: number }[];
  typeDistribution: { type: string; count: number }[];
};

export function AnalyticsCharts({
  volumeByDate,
  volumeByWeek,
  typeDistribution,
}: AnalyticsChartsProps) {
  const formatDate = (d: string) =>
    new Date(d + "T12:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  const formatWeek = (w: string) =>
    new Date(w + "T12:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <ChartCard
        title="Volume over time"
        chart={
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={volumeByDate.map((d) => ({
                ...d,
                label: formatDate(d.date),
              }))}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-foreground)" }}
                formatter={(value) => [`${value ?? 0} kg`, "Volume"]}
                labelFormatter={(label) => label}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        }
      >
        <p className="text-sm text-muted-foreground">
          Total volume (sets × reps × weight) per workout date
        </p>
      </ChartCard>

      <ChartCard
        title="Weekly volume"
        chart={
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={volumeByWeek.map((d) => ({
                ...d,
                label: formatWeek(d.week),
              }))}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value ?? 0} kg`, "Volume"]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="volume"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        }
      >
        <p className="text-sm text-muted-foreground">
          Total volume per week (Monday start)
        </p>
      </ChartCard>

      <ChartCard
        title="Workout type distribution"
        className="lg:col-span-2"
        chart={
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={typeDistribution}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name} (${value})`}
              >
                {typeDistribution.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => [
                  `${value ?? 0} workouts`,
                  String(name),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        }
      >
        <p className="text-sm text-muted-foreground">
          Number of workouts by type
        </p>
      </ChartCard>
    </div>
  );
}
