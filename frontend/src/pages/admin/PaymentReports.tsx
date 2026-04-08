import { useEffect, useMemo, useState } from "react";
import { format, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, FileSpreadsheet, FileText, Search, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type PaymentStatus = "pending" | "approved" | "rejected" | "paid" | "delivered";
type PaymentType = "event" | "item";
type Period = "daily" | "weekly" | "monthly";

type Payment = {
  _id: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  user?: { name?: string; email?: string };
  transactionRef?: string;
  createdAt: string;
};

type TimeBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

const chartPalette = {
  collected: "#22c55e",
  approved: "#38bdf8",
  rejected: "#f87171",
  event: "#f59e0b",
  item: "#14b8a6",
};

const exportedStatuses = new Set<PaymentStatus>(["approved", "paid", "delivered"]);

export default function PaymentReports() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("monthly");

  const getToken = () => localStorage.getItem("token") || "";

  const parsePayments = (payload: unknown): Payment[] => {
    if (Array.isArray(payload)) return payload as Payment[];
    if (payload && typeof payload === "object" && "data" in payload) {
      const data = (payload as { data?: unknown }).data;
      return Array.isArray(data) ? (data as Payment[]) : [];
    }
    return [];
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/payments?limit=1000", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error("Failed to load payment reports");
      const data = await res.json();
      setPayments(parsePayments(data));
    } catch (error) {
      toast.error("Failed to load payment reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments;

    return payments.filter((payment) => {
      const haystack = [
        payment._id,
        payment.transactionRef || "",
        payment.user?.name || "",
        payment.user?.email || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [payments, search]);

  const totalCollectedAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => {
      if (exportedStatuses.has(payment.status)) return sum + (payment.amount || 0);
      return sum;
    }, 0);
  }, [filteredPayments]);

  const approvalRate = useMemo(() => {
    const decisions = filteredPayments.filter((p) => p.status === "approved" || p.status === "rejected");
    if (decisions.length === 0) return 0;
    const approved = decisions.filter((p) => p.status === "approved").length;
    return Math.round((approved / decisions.length) * 100);
  }, [filteredPayments]);

  const paymentTypeData = useMemo(() => {
    const eventAmount = filteredPayments
      .filter((payment) => payment.type === "event" && exportedStatuses.has(payment.status))
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const itemAmount = filteredPayments
      .filter((payment) => payment.type === "item" && exportedStatuses.has(payment.status))
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return [
      { name: "Event", value: eventAmount, color: chartPalette.event },
      { name: "Item", value: itemAmount, color: chartPalette.item },
    ];
  }, [filteredPayments]);

  const buildBuckets = (selectedPeriod: Period): TimeBucket[] => {
    const now = new Date();

    if (selectedPeriod === "daily") {
      return Array.from({ length: 14 }).map((_, i) => {
        const date = subDays(now, 13 - i);
        return {
          key: format(date, "yyyy-MM-dd"),
          label: format(date, "dd MMM"),
          start: startOfDay(date),
          end: endOfDay(date),
        };
      });
    }

    if (selectedPeriod === "weekly") {
      return Array.from({ length: 12 }).map((_, i) => {
        const date = subWeeks(now, 11 - i);
        return {
          key: format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-'W'II"),
          label: format(startOfWeek(date, { weekStartsOn: 1 }), "dd MMM"),
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 }),
        };
      });
    }

    return Array.from({ length: 12 }).map((_, i) => {
      const date = subMonths(now, 11 - i);
      return {
        key: format(date, "yyyy-MM"),
        label: format(date, "MMM yy"),
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });
  };

  const buckets = useMemo(() => buildBuckets(period), [period]);

  const trendData = useMemo(() => {
    return buckets.map((bucket) => {
      let approved = 0;
      let rejected = 0;

      filteredPayments.forEach((payment) => {
        const createdAt = new Date(payment.createdAt);
        if (!isWithinInterval(createdAt, { start: bucket.start, end: bucket.end })) return;
        if (payment.status === "approved") approved += 1;
        if (payment.status === "rejected") rejected += 1;
      });

      return {
        period: bucket.label,
        approved,
        rejected,
      };
    });
  }, [buckets, filteredPayments]);

  const collectedSeriesData = useMemo(() => {
    return buckets.map((bucket) => {
      let amount = 0;

      filteredPayments.forEach((payment) => {
        const createdAt = new Date(payment.createdAt);
        if (!isWithinInterval(createdAt, { start: bucket.start, end: bucket.end })) return;
        if (exportedStatuses.has(payment.status)) amount += payment.amount || 0;
      });

      return {
        period: bucket.label,
        amount,
      };
    });
  }, [buckets, filteredPayments]);

  const handleExportCsv = () => {
    const header = [
      "Transaction ID",
      "User",
      "Email",
      "Type",
      "Status",
      "Amount",
      "Transaction Ref",
      "Created At",
    ];

    const rows = filteredPayments.map((payment) => [
      payment._id,
      payment.user?.name || "",
      payment.user?.email || "",
      payment.type,
      payment.status,
      String(payment.amount ?? 0),
      payment.transactionRef || "",
      new Date(payment.createdAt).toISOString(),
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map((value) => escapeCsv(String(value))).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payment-reports-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const handleExportPdf = () => {
    const reportWindow = window.open("", "_blank", "width=1024,height=768");
    if (!reportWindow) {
      toast.error("Allow popups to export PDF");
      return;
    }

    const rowsHtml = filteredPayments
      .slice(0, 200)
      .map(
        (payment) => `
          <tr>
            <td>${payment._id}</td>
            <td>${payment.user?.name || "-"}</td>
            <td>${payment.type}</td>
            <td>${payment.status}</td>
            <td>${Number(payment.amount || 0).toLocaleString()}</td>
            <td>${new Date(payment.createdAt).toLocaleString()}</td>
          </tr>
        `,
      )
      .join("");

    reportWindow.document.write(`
      <html>
        <head>
          <title>Payment Reports</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 6px 0; }
            p { margin: 0 0 16px 0; color: #4b5563; }
            .summary { display: flex; gap: 16px; margin-bottom: 16px; }
            .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; min-width: 180px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Payment Reports</h1>
          <p>Generated at ${new Date().toLocaleString()}</p>
          <div class="summary">
            <div class="box"><strong>Total Collected</strong><br/>LKR ${totalCollectedAmount.toLocaleString()}</div>
            <div class="box"><strong>Approval Rate</strong><br/>${approvalRate}%</div>
            <div class="box"><strong>Filtered Records</strong><br/>${filteredPayments.length}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
    toast.success("PDF print view opened");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Reports"
        description="Finance insights across transaction volume, payment types, and approval outcomes."
      >
        <Button onClick={handleExportCsv} variant="outline" className="border-slate-500/60 bg-slate-900 text-slate-100 hover:bg-slate-800">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button onClick={handleExportPdf} className="bg-amber-500 text-slate-950 hover:bg-amber-400">
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </PageHeader>

      <Card className="overflow-hidden border-slate-700 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user or transaction ID"
                className="border-slate-600 bg-slate-900 pl-9 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["daily", "weekly", "monthly"] as Period[]).map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  onClick={() => setPeriod(option)}
                  className={
                    period === option
                      ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                  }
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-200/80">Total Collected</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-100">LKR {totalCollectedAmount.toLocaleString()}</p>
              </div>
              <Wallet className="h-5 w-5 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-cyan-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-cyan-200/80">Approval Rate</p>
                <p className="mt-2 text-3xl font-semibold text-cyan-100">{approvalRate}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-cyan-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-rose-200/80">Rejected Volume</p>
                <p className="mt-2 text-3xl font-semibold text-rose-100">
                  {filteredPayments.filter((p) => p.status === "rejected").length}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-rose-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-slate-700 bg-slate-900/90 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-100">Collected Amount ({period})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={collectedSeriesData}>
                  <defs>
                    <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartPalette.collected} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={chartPalette.collected} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="period" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }} />
                  <Area type="monotone" dataKey="amount" stroke={chartPalette.collected} fill="url(#collectedFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-slate-100">Payment by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentTypeData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={5}>
                    {paymentTypeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <Badge variant="outline" className="border-amber-500/50 text-amber-200">Event</Badge>
              <Badge variant="outline" className="border-teal-500/50 text-teal-200">Item</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-900/90">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-100">Approved vs Rejected Trend ({period})</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="border-slate-600 text-slate-100 hover:bg-slate-800">
            <Download className="mr-2 h-4 w-4" />
            Quick Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }} />
                <Line type="monotone" dataKey="approved" stroke={chartPalette.approved} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rejected" stroke={chartPalette.rejected} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: chartPalette.approved }} /> Approved
            </span>
            <span className="inline-flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: chartPalette.rejected }} /> Rejected
            </span>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-sm text-slate-400">Refreshing reports...</div>
      )}
    </div>
  );
}
