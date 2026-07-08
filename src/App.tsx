import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  LogOut,
  PackageSearch,
  ShieldCheck,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";

type Lang = "ru" | "uz" | "en";
type RoleId = "owner" | "seller" | "manager";

const palette = {
  ink: "#0f172a",
  muted: "#64748b",
  blue: "#2563eb",
  green: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  cyan: "#0891b2",
  violet: "#7c3aed",
};

const dict = {
  ru: {
    app: "BRONUS",
    subtitle: "Оптовая химия и продажи",
    loginTitle: "Вход в систему",
    loginText: "Выберите роль для просмотра нужных данных и прав доступа.",
    enter: "Войти",
    logout: "Выйти",
    chooseRole: "Роль",
    owner: "Руководитель",
    seller: "Продажник",
    manager: "Менеджер",
    ownerDesc: "Полная аналитика, прибыль, партии, команда",
    sellerDesc: "Лиды, клиенты, план, личные продажи",
    managerDesc: "Контроль склада, задач и команды",
    dashboard: "Дашборд",
    salesTeam: "Отдел продаж",
    products: "Продукты",
    batches: "Партии",
    staff: "Сотрудники",
    warehouse: "Склад",
    revenue: "Выручка",
    profit: "Маржа",
    conversion: "Конверсия",
    plan: "План",
    paid: "Оплачено",
    debt: "Долг",
    stock: "Остаток",
    analyticsTitle: "Расширенная статистика продаж",
    analyticsLead: "Видно не просто общий график, а вклад продуктов, партий, менеджеров, маржи и оплаты.",
    byProducts: "По продуктам",
    byBatches: "По партиям",
    byManagers: "По менеджерам",
    dynamic: "Динамика",
    product: "Продукт",
    batch: "Партия",
    managerName: "Менеджер",
    qty: "Кол-во",
    marginPct: "Маржа %",
    status: "Статус",
    topInsight: "Главный вывод",
    insightText: "Перекись даёт лучший оборот, но каустическая сода стабильнее по марже и оплате.",
    search: "Поиск по продукту, партии, клиенту",
    language: "Язык",
  },
  uz: {
    app: "BRONUS",
    subtitle: "Ulgurji kimyo va savdo",
    loginTitle: "Tizimga kirish",
    loginText: "Kerakli ma'lumotlar va huquqlar uchun rolni tanlang.",
    enter: "Kirish",
    logout: "Chiqish",
    chooseRole: "Rol",
    owner: "Rahbar",
    seller: "Sotuvchi",
    manager: "Menejer",
    ownerDesc: "To'liq analitika, foyda, partiyalar, jamoa",
    sellerDesc: "Lidlar, mijozlar, reja, shaxsiy savdo",
    managerDesc: "Ombor, vazifalar va jamoa nazorati",
    dashboard: "Boshqaruv paneli",
    salesTeam: "Savdo bo'limi",
    products: "Mahsulotlar",
    batches: "Partiyalar",
    staff: "Xodimlar",
    warehouse: "Ombor",
    revenue: "Tushum",
    profit: "Marja",
    conversion: "Konversiya",
    plan: "Reja",
    paid: "To'langan",
    debt: "Qarz",
    stock: "Qoldiq",
    analyticsTitle: "Kengaytirilgan savdo statistikasi",
    analyticsLead: "Faqat umumiy grafik emas, mahsulot, partiya, menejer, marja va to'lovlar ko'rinadi.",
    byProducts: "Mahsulotlar bo'yicha",
    byBatches: "Partiyalar bo'yicha",
    byManagers: "Menejerlar bo'yicha",
    dynamic: "Dinamika",
    product: "Mahsulot",
    batch: "Partiya",
    managerName: "Menejer",
    qty: "Soni",
    marginPct: "Marja %",
    status: "Holat",
    topInsight: "Asosiy xulosa",
    insightText: "Perekis katta tushum beradi, kaustik soda esa marja va to'lovda barqarorroq.",
    search: "Mahsulot, partiya, mijoz bo'yicha qidirish",
    language: "Til",
  },
  en: {
    app: "BRONUS",
    subtitle: "Wholesale chemicals and sales",
    loginTitle: "Sign in",
    loginText: "Choose a role to see the right data and access level.",
    enter: "Sign in",
    logout: "Sign out",
    chooseRole: "Role",
    owner: "Director",
    seller: "Sales rep",
    manager: "Manager",
    ownerDesc: "Full analytics, profit, batches, team",
    sellerDesc: "Leads, clients, target, personal sales",
    managerDesc: "Warehouse, tasks and team control",
    dashboard: "Dashboard",
    salesTeam: "Sales department",
    products: "Products",
    batches: "Batches",
    staff: "Staff",
    warehouse: "Warehouse",
    revenue: "Revenue",
    profit: "Margin",
    conversion: "Conversion",
    plan: "Target",
    paid: "Paid",
    debt: "Debt",
    stock: "Stock",
    analyticsTitle: "Expanded sales statistics",
    analyticsLead: "The view shows products, batches, managers, margin and payments instead of one plain chart.",
    byProducts: "By products",
    byBatches: "By batches",
    byManagers: "By managers",
    dynamic: "Trend",
    product: "Product",
    batch: "Batch",
    managerName: "Manager",
    qty: "Qty",
    marginPct: "Margin %",
    status: "Status",
    topInsight: "Main insight",
    insightText: "Hydrogen peroxide drives revenue, while caustic soda is steadier in margin and collections.",
    search: "Search product, batch, client",
    language: "Language",
  },
};

const roleMeta = {
  owner: { label: "owner", icon: ShieldCheck },
  seller: { label: "seller", icon: Users },
  manager: { label: "manager", icon: Warehouse },
} satisfies Record<RoleId, { label: keyof typeof dict.ru; icon: typeof ShieldCheck }>;

const monthly = [
  { month: "Jan", revenue: 310, profit: 52, paid: 282, orders: 42 },
  { month: "Feb", revenue: 355, profit: 61, paid: 326, orders: 49 },
  { month: "Mar", revenue: 332, profit: 57, paid: 308, orders: 46 },
  { month: "Apr", revenue: 418, profit: 76, paid: 376, orders: 58 },
  { month: "May", revenue: 462, profit: 88, paid: 419, orders: 63 },
  { month: "Jun", revenue: 538, profit: 104, paid: 486, orders: 71 },
];

const products = [
  { name: "Перекись водорода 37%", revenue: 168, profit: 31, qty: 402, paid: 152, debt: 16, stock: 520, color: palette.blue },
  { name: "Сода каустическая NaOH", revenue: 142, profit: 35, qty: 386, paid: 137, debt: 5, stock: 480, color: palette.green },
  { name: "Диоксид титана R-2195", revenue: 96, profit: 18, qty: 112, paid: 75, debt: 21, stock: 64, color: palette.violet },
  { name: "Сульфат меди", revenue: 74, profit: 12, qty: 122, paid: 69, debt: 5, stock: 210, color: palette.cyan },
  { name: "Сода кальцинированная", revenue: 58, profit: 8, qty: 216, paid: 53, debt: 5, stock: 90, color: palette.amber },
];

const batches = [
  { batch: "HP-20260612", product: "Перекись водорода", invested: 130, revenue: 168, profit: 31, sold: 77, status: "Активная" },
  { batch: "KS-20260618", product: "Сода каустическая", invested: 169, revenue: 142, profit: 35, sold: 64, status: "Активная" },
  { batch: "TIO2-20260610", product: "Диоксид титана", invested: 178, revenue: 96, profit: 18, sold: 54, status: "Медленно" },
  { batch: "CS-20260607", product: "Сульфат меди", invested: 64, revenue: 74, profit: 12, sold: 88, status: "Закрывается" },
];

const managers = [
  { name: "Азиза Ю.", revenue: 188, plan: 170, profit: 39, conversion: 42, clients: 34 },
  { name: "Санжар Т.", revenue: 152, plan: 160, profit: 28, conversion: 35, clients: 29 },
  { name: "Дилноза К.", revenue: 116, plan: 130, profit: 21, conversion: 31, clients: 22 },
  { name: "Рустам М.", revenue: 82, plan: 100, profit: 16, conversion: 28, clients: 18 },
];

const funnel = [
  { name: "Лиды", value: 156, fill: palette.blue },
  { name: "Переговоры", value: 94, fill: palette.cyan },
  { name: "Бронь", value: 58, fill: palette.amber },
  { name: "Сделка", value: 41, fill: palette.green },
];

const money = (value: number) => `${value} млн сум`;
const pct = (value: number) => `${value}%`;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function LanguageSwitch({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      <Globe2 size={16} className="ml-2 text-slate-400" />
      {(["uz", "ru", "en"] as Lang[]).map((item) => (
        <button
          key={item}
          onClick={() => setLang(item)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-bold uppercase transition ${
            lang === item ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function LoginScreen({ lang, setLang, onLogin }: { lang: Lang; setLang: (lang: Lang) => void; onLogin: (role: RoleId) => void }) {
  const t = dict[lang];
  const [role, setRole] = useState<RoleId>("owner");

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-lg font-black text-white">B</div>
            <div>
              <div className="text-xl font-black tracking-tight">{t.app}</div>
              <div className="text-sm text-slate-500">{t.subtitle}</div>
            </div>
          </div>
          <LanguageSwitch lang={lang} setLang={setLang} />
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_440px]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              <LockKeyhole size={16} /> CRM access
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">{t.loginTitle}</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">{t.loginText}</p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {(["owner", "seller", "manager"] as RoleId[]).map((item) => {
                const Icon = roleMeta[item].icon;
                return (
                  <button
                    key={item}
                    onClick={() => setRole(item)}
                    className={`rounded-lg border bg-white p-4 text-left transition ${
                      role === item ? "border-slate-950 shadow-md" : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <Icon size={20} className="mb-3 text-slate-700" />
                    <div className="font-bold">{t[roleMeta[item].label]}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{t[`${roleMeta[item].label}Desc` as keyof typeof t]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-500">{t.chooseRole}</div>
                <div className="text-2xl font-black">{t[roleMeta[role].label]}</div>
              </div>
              <ChevronDown className="text-slate-400" />
            </div>
            <button
              onClick={() => onLogin(role)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              <LogIn size={18} /> {t.enter}
            </button>
          </Card>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof TrendingUp }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-black tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-emerald-600">{note}</div>
        </div>
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
          <Icon size={19} />
        </div>
      </div>
    </Card>
  );
}

function Dashboard({ t }: { t: typeof dict.ru }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label={t.revenue} value={money(538)} note="+16% к маю" icon={TrendingUp} />
        <StatCard label={t.profit} value={money(104)} note="19.3% средняя маржа" icon={BarChart3} />
        <StatCard label={t.paid} value={money(486)} note="90% оплачено" icon={ShieldCheck} />
        <StatCard label={t.stock} value="1 364 ед." note="5 активных SKU" icon={Boxes} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">{t.dynamic}</h2>
              <p className="text-sm text-slate-500">{t.revenue}, {t.profit.toLowerCase()} и оплаты по месяцам</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Area type="monotone" dataKey="paid" fill="#dbeafe" stroke={palette.blue} name={t.paid} />
                <Bar dataKey="profit" fill={palette.green} radius={[5, 5, 0, 0]} name={t.profit} />
                <Line type="monotone" dataKey="revenue" stroke={palette.rose} strokeWidth={3} name={t.revenue} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-black">{t.topInsight}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t.insightText}</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="28%" outerRadius="95%" data={funnel} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background cornerRadius={8} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProductsTable({ t }: { t: typeof dict.ru }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-black">{t.byProducts}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{t.product}</th>
              <th className="px-4 py-3 text-right">{t.revenue}</th>
              <th className="px-4 py-3 text-right">{t.profit}</th>
              <th className="px-4 py-3 text-right">{t.marginPct}</th>
              <th className="px-4 py-3 text-right">{t.paid}</th>
              <th className="px-4 py-3 text-right">{t.debt}</th>
              <th className="px-4 py-3 text-right">{t.stock}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((item) => (
              <tr key={item.name} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </td>
                <td className="px-4 py-3 text-right">{money(item.revenue)}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700">{money(item.profit)}</td>
                <td className="px-4 py-3 text-right">{pct(Math.round((item.profit / item.revenue) * 100))}</td>
                <td className="px-4 py-3 text-right">{money(item.paid)}</td>
                <td className="px-4 py-3 text-right text-rose-600">{money(item.debt)}</td>
                <td className="px-4 py-3 text-right">{item.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SalesAnalytics({ t }: { t: typeof dict.ru }) {
  const [tab, setTab] = useState<"products" | "batches" | "managers">("products");
  const pieData = products.map((item) => ({ name: item.name, value: item.revenue, fill: item.color }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t.analyticsTitle}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{t.analyticsLead}</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {[
            ["products", t.products],
            ["batches", t.batches],
            ["managers", t.staff],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as "products" | "batches" | "managers")}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                tab === key ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "products" && (
        <>
          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
            <Card className="p-5">
              <h2 className="text-lg font-black">{t.byProducts}</h2>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={products} layout="vertical" margin={{ left: 18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => money(Number(value))} />
                    <Bar dataKey="revenue" name={t.revenue} radius={[0, 6, 6, 0]}>
                      {products.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Bar>
                    <Bar dataKey="profit" name={t.profit} fill={palette.green} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="text-lg font-black">Доля выручки</h2>
              <div className="mt-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={105} paddingAngle={2}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(value) => money(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <ProductsTable t={t} />
        </>
      )}

      {tab === "batches" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Card className="p-5">
            <h2 className="text-lg font-black">{t.byBatches}</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batches}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="batch" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Area type="monotone" dataKey="invested" name="Инвестиция" stroke={palette.amber} fill="#fef3c7" />
                  <Area type="monotone" dataKey="revenue" name={t.revenue} stroke={palette.blue} fill="#dbeafe" />
                  <Line type="monotone" dataKey="profit" name={t.profit} stroke={palette.green} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-lg font-black">Контроль партий</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t.batch}</th>
                  <th className="px-4 py-3">{t.product}</th>
                  <th className="px-4 py-3 text-right">Продано</th>
                  <th className="px-4 py-3">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((item) => (
                  <tr key={item.batch}>
                    <td className="px-4 py-3 font-bold">{item.batch}</td>
                    <td className="px-4 py-3 text-slate-600">{item.product}</td>
                    <td className="px-4 py-3 text-right">{pct(item.sold)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "managers" && (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-5">
            <h2 className="text-lg font-black">{t.byManagers}</h2>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={managers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="plan" name={t.plan} fill="#cbd5e1" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="revenue" name={t.revenue} fill={palette.blue} radius={[5, 5, 0, 0]} />
                  <Line dataKey="conversion" name={t.conversion} stroke={palette.rose} strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-black">Рейтинг</h2>
            <div className="mt-4 space-y-4">
              {managers.map((item) => {
                const done = Math.round((item.revenue / item.plan) * 100);
                return (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-slate-500">{done}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.min(done, 120)}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{money(item.profit)} {t.profit.toLowerCase()} · {item.clients} клиентов</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function SimpleScreen({ title, text }: { title: string; text: string }) {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-black">{title}</h1>
      <p className="mt-2 max-w-2xl leading-7 text-slate-600">{text}</p>
    </Card>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>("ru");
  const [role, setRole] = useState<RoleId | null>(null);
  const [active, setActive] = useState("dashboard");
  const t = dict[lang];

  const nav = useMemo(
    () => [
      { id: "dashboard", label: t.dashboard, icon: LayoutDashboard },
      { id: "sales", label: t.salesTeam, icon: BarChart3 },
      { id: "products", label: t.products, icon: PackageSearch },
      { id: "warehouse", label: t.warehouse, icon: Warehouse },
    ],
    [t],
  );

  if (!role) {
    return <LoginScreen lang={lang} setLang={setLang} onLogin={setRole} />;
  }

  const roleLabel = t[roleMeta[role].label];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <div className="mb-7 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 font-black text-white">B</div>
          <div>
            <div className="text-xl font-black">{t.app}</div>
            <div className="text-xs text-slate-500">{t.subtitle}</div>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition ${
                  active === item.id ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">{roleLabel}</div>
              <h1 className="text-xl font-black">{nav.find((item) => item.id === active)?.label}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden min-w-72 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 lg:flex">
                <PackageSearch size={16} /> {t.search}
              </div>
              <LanguageSwitch lang={lang} setLang={setLang} />
              <button
                onClick={() => setRole(null)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                <LogOut size={16} /> {t.logout}
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${
                  active === item.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {active === "dashboard" && <Dashboard t={t} />}
          {active === "sales" && <SalesAnalytics t={t} />}
          {active === "products" && <ProductsTable t={t} />}
          {active === "warehouse" && (
            <SimpleScreen
              title={t.warehouse}
              text="Здесь можно развить остатки по складам, резервы, критический минимум, сроки годности и движение товара по накладным."
            />
          )}
        </main>
      </div>
    </div>
  );
}
