"use client";

import { useEffect, useState } from "react";

interface KPIs {
  totalProperties: number;
  totalReservations: number;
  totalOrders: number;
  avgRating: number;
}

interface MonthlyPoint {
  month: string;
  count?: number;
  amount?: number;
}

interface CategoryPoint {
  name: string;
  orders: number;
}

interface StatsData {
  kpis: KPIs;
  monthlyReservations: MonthlyPoint[];
  monthlyRevenue: MonthlyPoint[];
  topCategories: CategoryPoint[];
}

/** Compute a simple moving average of window size `w`. */
function movingAverage(values: number[], w: number): (number | null)[] {
  return values.map((_, i) => {
    if (i < w - 1) return null;
    const slice = values.slice(i - w + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / w;
  });
}

/** Mark data points more than 1.5 * IQR above Q3 as anomalies. */
function detectAnomalies(values: number[]): boolean[] {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const upper = q3 + 1.5 * iqr;
  return values.map((v) => v > upper);
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────

interface LineChartProps {
  data: number[];
  labels: string[];
  color: string;
  label: string;
  formatY?: (v: number) => string;
}

function LineChart({ data, labels, color, label, formatY }: LineChartProps) {
  const W = 480;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const minV = Math.min(...data) * 0.9;
  const maxV = Math.max(...data) * 1.05;
  const scaleX = (i: number) => PAD.left + (i / (data.length - 1)) * iW;
  const scaleY = (v: number) => PAD.top + iH - ((v - minV) / (maxV - minV)) * iH;

  const points = data.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");
  const ma = movingAverage(data, 3);
  const maPoints = ma
    .map((v, i) => (v !== null ? `${scaleX(i)},${scaleY(v)}` : null))
    .filter(Boolean) as string[];

  const anomalies = detectAnomalies(data);

  const fmt = formatY ?? ((v: number) => String(Math.round(v)));

  // Y-axis ticks
  const ticks = [minV, minV + (maxV - minV) * 0.5, maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label={label}>
      {/* Grid lines */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={PAD.left}
          y1={scaleY(t)}
          x2={W - PAD.right}
          y2={scaleY(t)}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}
      {/* Y-axis labels */}
      {ticks.map((t, i) => (
        <text
          key={i}
          x={PAD.left - 6}
          y={scaleY(t) + 4}
          textAnchor="end"
          fontSize="10"
          fill="#9ca3af"
        >
          {fmt(t)}
        </text>
      ))}
      {/* Area fill */}
      <polygon
        points={`${PAD.left},${PAD.top + iH} ${points} ${W - PAD.right},${PAD.top + iH}`}
        fill={color}
        fillOpacity="0.12"
      />
      {/* Main line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Moving-average trendline */}
      {maPoints.length > 1 && (
        <polyline
          points={maPoints.join(" ")}
          fill="none"
          stroke="#6b7280"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinejoin="round"
          opacity="0.7"
        />
      )}
      {/* Data points & anomaly highlights */}
      {data.map((v, i) => (
        <circle
          key={i}
          cx={scaleX(i)}
          cy={scaleY(v)}
          r={anomalies[i] ? 6 : 3.5}
          fill={anomalies[i] ? "#ef4444" : color}
          stroke="white"
          strokeWidth="1.5"
        />
      ))}
      {/* X-axis labels */}
      {labels.map((l, i) =>
        i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1 ? (
          <text
            key={i}
            x={scaleX(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
          >
            {l}
          </text>
        ) : null
      )}
    </svg>
  );
}

// ── SVG Bar Chart ───────────────────────────────────────────────────────────

interface BarChartProps {
  data: number[];
  labels: string[];
  color: string;
  label: string;
}

function BarChart({ data, labels, color, label }: BarChartProps) {
  const W = 480;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 40, left: 48 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const maxV = Math.max(...data) * 1.1;
  const gap = 4;
  const barW = (iW - gap * (data.length - 1)) / data.length;
  const scaleY = (v: number) => PAD.top + iH - (v / maxV) * iH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label={label}>
      {/* Grid */}
      {[0, 0.5, 1].map((f, i) => (
        <line
          key={i}
          x1={PAD.left}
          y1={PAD.top + iH * (1 - f)}
          x2={W - PAD.right}
          y2={PAD.top + iH * (1 - f)}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}
      {data.map((v, i) => {
        const x = PAD.left + i * (barW + gap);
        const y = scaleY(v);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={PAD.top + iH - y}
              rx="3"
              fill={color}
              fillOpacity="0.85"
            />
            <text
              x={x + barW / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: string;
  title: string;
  value: string;
  sub: string;
  color: string;
}

function KpiCard({ icon, title, value, sub, color }: KpiCardProps) {
  return (
    <div className={`rounded-xl p-5 ${color}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // basePath-aware fetch: works both locally and under /belvedere on GitHub Pages
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(`${base}/stats.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-red-500">
        Failed to load statistics data.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading statistics…</p>
      </div>
    );
  }

  const resLabels = data.monthlyReservations.map((d) => d.month);
  const resCounts = data.monthlyReservations.map((d) => d.count ?? 0);
  const revLabels = data.monthlyRevenue.map((d) => d.month);
  const revAmounts = data.monthlyRevenue.map((d) => d.amount ?? 0);
  const catLabels = data.topCategories.map((d) => d.name);
  const catOrders = data.topCategories.map((d) => d.orders);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Statistics</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Platform activity overview — dashed line shows 3-month moving average; red dots mark
          anomalies (IQR method).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KpiCard
          icon="🏠"
          title="Properties"
          value={String(data.kpis.totalProperties)}
          sub="active listings"
          color="bg-indigo-50"
        />
        <KpiCard
          icon="📅"
          title="Reservations"
          value={String(data.kpis.totalReservations)}
          sub="all time"
          color="bg-green-50"
        />
        <KpiCard
          icon="📦"
          title="Orders"
          value={String(data.kpis.totalOrders)}
          sub="supply orders placed"
          color="bg-amber-50"
        />
        <KpiCard
          icon="⭐"
          title="Avg Rating"
          value={data.kpis.avgRating.toFixed(1)}
          sub="manager avg score"
          color="bg-sky-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Reservations */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Monthly Reservations</h2>
          <p className="text-xs text-gray-400 mb-3">
            12-month trend · moving avg (3-mo) · anomaly detection
          </p>
          <LineChart
            data={resCounts}
            labels={resLabels}
            color="#6366f1"
            label="Monthly reservations line chart"
            formatY={(v) => String(Math.round(v))}
          />
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Monthly Revenue</h2>
          <p className="text-xs text-gray-400 mb-3">
            12-month trend · moving avg (3-mo) · anomaly detection
          </p>
          <LineChart
            data={revAmounts}
            labels={revLabels}
            color="#10b981"
            label="Monthly revenue line chart"
            formatY={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl border p-5 shadow-sm md:col-span-2">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Top Supply Categories</h2>
          <p className="text-xs text-gray-400 mb-3">Orders by product category</p>
          <BarChart
            data={catOrders}
            labels={catLabels}
            color="#f59e0b"
            label="Top categories bar chart"
          />
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        Data sourced from{" "}
        <code className="bg-gray-100 px-1 rounded" aria-label="file path: public/stats.json">
          public/stats.json
        </code>{" "}
        — update that file to refresh the graphs.
      </p>
    </div>
  );
}
