import { useMemo } from "react";
import { format } from "date-fns";
import { getTrades } from "@/lib/tradeStorage";
import { IndianRupee, ArrowUpDown, TrendingUp, Users } from "lucide-react";
import StatCard from "@/components/StatCard";
import TradeTable from "@/components/TradeTable";
import Layout from "@/components/Layout";

const Dashboard = () => {
  const trades = getTrades();

  const stats = useMemo(() => {
    const totalINR = trades.reduce((s, t) => s + t.amountINR, 0);
    const totalUSDT = trades.reduce((s, t) => s + t.amountINR / t.usdtRate, 0);
    const uniqueBuyers = new Set(trades.map((t) => t.buyerName)).size;
    const todayTrades = trades.filter((t) => t.date === format(new Date(), "yyyy-MM-dd"));
    const todayINR = todayTrades.reduce((s, t) => s + t.amountINR, 0);
    return { totalINR, totalUSDT, uniqueBuyers, todayTrades: todayTrades.length, todayINR };
  }, [trades]);

  const recentTrades = useMemo(
    () => [...trades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    [trades]
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground text-sm">Welcome back! Here's your trading overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Volume"
            value={`₹${stats.totalINR.toLocaleString("en-IN")}`}
            subtitle={`${trades.length} total trades`}
            icon={IndianRupee}
          />
          <StatCard
            title="USDT Traded"
            value={stats.totalUSDT.toFixed(2)}
            subtitle="Total USDT volume"
            icon={ArrowUpDown}
          />
          <StatCard
            title="Today's Volume"
            value={`₹${stats.todayINR.toLocaleString("en-IN")}`}
            subtitle={`${stats.todayTrades} trades today`}
            icon={TrendingUp}
            trend={stats.todayTrades > 0 ? "up" : "neutral"}
          />
          <StatCard
            title="Unique Buyers"
            value={String(stats.uniqueBuyers)}
            subtitle="All-time unique buyers"
            icon={Users}
          />
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
          <TradeTable trades={recentTrades} onDelete={() => window.location.reload()} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
