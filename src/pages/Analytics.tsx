import { useMemo, useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import Layout from "@/components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const AnalyticsPage = () => {
  const [trades, setTrades] = useState<any[]>([]);

  const API_URL = `${import.meta.env.VITE_API_URL}/trades`;

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const mapped = data.map((t: any) => ({
          buyerName: t.buyer_name || "",
          amountINR: Number(t.amount_inr),
          orderId: t.order_id || "",
          usdtRate: Number(t.usdt_rate),
          date: t.trade_date ? String(t.trade_date).split("T")[0] : "",
        }));

        setTrades(mapped);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };

    fetchTrades();
  }, []);

  const dailyData = useMemo(() => {
    const map = new Map<string, { inr: number; usdt: number; count: number }>();
    trades.forEach((t) => {
      const existing = map.get(t.date) || { inr: 0, usdt: 0, count: 0 };
      existing.inr += t.amountINR;
      existing.usdt += t.amountINR / t.usdtRate;
      existing.count += 1;
      map.set(t.date, existing);
    });

    return Array.from(map.entries())
      .map(([date, d]) => ({
        date,
        label: format(parseISO(date), "dd MMM"),
        ...d,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [trades]);

  const topBuyers = useMemo(() => {
    const map = new Map<string, { inr: number; count: number }>();
    trades.forEach((t) => {
      const existing = map.get(t.buyerName) || { inr: 0, count: 0 };
      existing.inr += t.amountINR;
      existing.count += 1;
      map.set(t.buyerName, existing);
    });

    return Array.from(map.entries())
      .map(([name, d]) => ({
        name: name.length > 20 ? name.slice(0, 20) + "…" : name,
        ...d,
      }))
      .sort((a, b) => b.inr - a.inr)
      .slice(0, 10);
  }, [trades]);

  const tooltipStyle = {
    contentStyle: {
      background: "hsl(228 14% 10%)",
      border: "1px solid hsl(228 12% 18%)",
      borderRadius: "8px",
      fontSize: "12px",
    },
    labelStyle: { color: "hsl(210 20% 85%)" },
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Sale volume trends and insights
          </p>
        </div>

        {trades.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              No trade data yet. Upload some trades to see analytics.
            </p>
          </div>
        ) : (
          <>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">
                Daily Volume (INR)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient
                      id="colorInr"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(45, 100%, 51%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(45, 100%, 51%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(228 12% 18%)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(215 15% 55%)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(215 15% 55%)" }}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="inr"
                    stroke="hsl(45, 100%, 51%)"
                    fill="url(#colorInr)"
                    strokeWidth={2}
                    name="INR Volume"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4">
                  Daily Sale Count
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(228 12% 18%)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "hsl(215 15% 55%)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(215 15% 55%)" }}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar
                      dataKey="count"
                      fill="hsl(45, 100%, 51%)"
                      radius={[4, 4, 0, 0]}
                      name="Trades"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4">
                  Top Buyers by Volume
                </h3>
                <div className="space-y-3">
                  {topBuyers.map((b, i) => (
                    <div key={b.name} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5">
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium truncate">
                            {b.name}
                          </span>
                          <span className="text-xs text-primary">
                            ₹{b.inr.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${
                                topBuyers.length > 0
                                  ? (b.inr / topBuyers[0].inr) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
