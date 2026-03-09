"use client";

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
} from "recharts";
import { ChartCard } from "./ChartCard";

type StatsChartsProps = {
  strengthProgress: Array<{
    date: string;
    weight: number;
    exerciseName: string;
  }>;
  workoutFrequency: Array<{ week: string; count: number }>;
  volumeByDate: Array<{ date: string; volume: number }>;
  volumeByWeek: Array<{ week: string; volume: number }>;
};

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatWeek(w: string) {
  return new Date(w + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function StatsCharts({
  strengthProgress,
  workoutFrequency,
  volumeByDate,
  volumeByWeek,
}: StatsChartsProps) {
  const strengthByDate = strengthProgress.reduce<
    Record<string, { date: string; weight: number; label: string }>
  >((acc, row) => {
    const key = row.date;
    const w = row.weight;
    if (!acc[key] || w > acc[key].weight) {
      acc[key] = {
        date: row.date,
        weight: w,
        label: formatDate(row.date),
      };
    }
    return acc;
  }, {});

  const strengthData = Object.values(strengthByDate).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const frequencyData = workoutFrequency.map((d) => ({
    ...d,
    label: formatWeek(d.week),
  }));

  const volumeDateData = volumeByDate.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }));

  const volumeWeekData = volumeByWeek.map((d) => ({
    ...d,
    label: formatWeek(d.week),
  }));

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      <ChartCard
        title="Strength Progress"
        chart={
          strengthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={strengthData}
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
                  formatter={(value) => [`${value ?? 0} kg`, "Max weight"]}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Log workouts with weights to see strength progress
            </div>
          )
        }
      >
        <p className="text-sm text-muted-foreground">
          Max weight lifted per workout date
        </p>
      </ChartCard>

      <ChartCard
        title="Workout Frequency"
        chart={
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={frequencyData}
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
                formatter={(value) => [`${value ?? 0}`, "Workouts"]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="count"
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        }
      >
        <p className="text-sm text-muted-foreground">
          Workouts per week (last 12 weeks)
        </p>
      </ChartCard>

      <ChartCard
        title="Volume Over Time"
        chart={
          volumeDateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={volumeDateData}
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
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Log workouts with sets, reps, and weight to see volume
            </div>
          )
        }
      >
        <p className="text-sm text-muted-foreground">
          Total volume (sets × reps × weight) per workout
        </p>
      </ChartCard>

      <ChartCard
        title="Weekly Volume"
        chart={
          volumeWeekData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={volumeWeekData}
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
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Log workouts to see weekly volume
            </div>
          )
        }
      >
        <p className="text-sm text-muted-foreground">
          Total volume per week
        </p>
      </ChartCard>
    </div>
  );
}
