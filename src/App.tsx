import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { LayoutDashboard, Warehouse, ClipboardCheck, ArrowLeftRight, CalendarClock, Boxes, PiggyBank, Users, Truck, LineChart as LineIcon, Tag, Receipt, CalendarDays, Search, Bell, ChevronRight, ChevronLeft, ShieldCheck, TriangleAlert as AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, FileText, Lock, RefreshCw, FileCheck, TrendingUp, Percent, MessageSquarePlus, UserCog, PackageSearch, Download, ShoppingCart, BarChart3, Scale, Sparkles, CreditCard, Flame, Clock, PackagePlus, Send, Award, KeyRound, History, Menu, X } from "lucide-react";

// ---------- helpers ----------
const fmt = (n) => n.toLocaleString("ru-RU");
const money = (n) => fmt(n) + " сум";
const mln = (n) => (n / 1000000).toLocaleString("ru-RU", { maximumFractionDigits: 1 }) + " млн";
const C = { teal: "#4f46e5", sky: "#0284c7", amber: "#f59e0b", emerald: "#059669", rose: "#e11d48", violet: "#7c3aed", slate: "#64748b" };

const TODAY = new Date(2026, 5, 18);
const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MON_FULL = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MON_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const mondayOf = (d) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// ---------- data (оптовая химия · BRONUS) ----------
const stock = [
  { p: "20260618-0042", name: "Сода каустическая (NaOH), меш. 25 кг", supp: "Andijon Kimyo", qty: 480, reserved: 60, min: 150, price: 352000, cert: true, foreign: false, exp: "2027-12-01" },
  { p: "20260615-0039", name: "Сода кальцинированная, меш. 25 кг", supp: "Navoiy Kimyo", qty: 90, reserved: 0, min: 140, price: 268000, cert: true, foreign: false, exp: "2026-10-15" },
  { p: "20260612-0037", name: "Перекись водорода 37%, канистра 30 л", supp: "Kazan Chem (Импорт)", qty: 520, reserved: 90, min: 180, price: 418000, cert: true, foreign: true, exp: "2026-08-20" },
  { p: "20260610-0031", name: "Диоксид титана, меш. 25 кг", supp: "Sichuan Titanium (Импорт)", qty: 4, reserved: 3, min: 40, price: 862000, cert: true, foreign: true, exp: "2028-05-01" },
  { p: "20260607-0028", name: "Сульфат меди, меш. 25 кг", supp: "Ural Chem", qty: 210, reserved: 40, min: 70, price: 610000, cert: false, foreign: false, exp: "2026-11-30" },
];

const catalog = [
  { en: "Caustic Soda Flakes (NaOH 99%)", ru: "Сода каустическая (чешуя), 99%", serie: "KS-20260618", coa: "CoA_NaOH_KS0618.pdf", reg: "ЛС-002419", maker: "Kazan Orgsintez", country: "Россия", price: 352000, orderable: true, hazard: "8 · коррозийное", sds: "SDS_NaOH.pdf" },
  { en: "Soda Ash Dense (Na₂CO₃)", ru: "Сода кальцинированная (плотная)", serie: "SA-20260615", coa: "CoA_Na2CO3_SA0615.pdf", reg: "—", maker: "Solvay", country: "Бельгия", price: 268000, orderable: true, hazard: "—", sds: "SDS_Na2CO3.pdf" },
  { en: "Hydrogen Peroxide 37%", ru: "Перекись водорода 37%", serie: "HP-20260612", coa: "CoA_H2O2_HP0612.pdf", reg: "П N013892/01", maker: "Evonik", country: "Германия", price: 418000, orderable: true, hazard: "5.1 · окислитель", sds: "SDS_H2O2.pdf" },
  { en: "Titanium Dioxide Rutile R-2195", ru: "Диоксид титана (рутил) R-2195", serie: "TIO2-20260610", coa: "CoA_TiO2_0610.pdf", reg: "—", maker: "Sichuan Lomon", country: "Китай", price: 862000, orderable: true, hazard: "—", sds: "SDS_TiO2.pdf" },
  { en: "Copper Sulphate Pentahydrate", ru: "Сульфат меди (пятиводный)", serie: "CS-20260607", coa: "CoA_CuSO4_0607.pdf", reg: "—", maker: "Ural Chem", country: "Россия", price: 610000, orderable: true, hazard: "9 · опасно для среды", sds: "SDS_CuSO4.pdf" },
  { en: "Citric Acid Anhydrous", ru: "Лимонная кислота безводная", serie: "CA-20260605", coa: "CoA_CitricAcid_0605.pdf", reg: "ЛС-004511", maker: "COFCO", country: "Китай", price: 121000, orderable: true, hazard: "—", sds: "SDS_CitricAcid.pdf" },
  { en: "Glycerol 99.5% USP", ru: "Глицерин 99,5% (USP)", serie: "GL-20260603", coa: "CoA_Glycerol_0603.pdf", reg: "П N014220/01", maker: "Wilmar", country: "Сингапур", price: 96000, orderable: true, hazard: "—", sds: "SDS_Glycerol.pdf" },
  { en: "Pharma Sodium Chloride", ru: "Натрия хлорид, фармацевтический", serie: "CRS-20260601", coa: "CoA_NaCl_CRS0601.pdf", reg: "ЛС-002419", maker: "Salinen Austria", country: "Австрия", price: 74000, orderable: false, hazard: "—", sds: "SDS_NaCl.pdf" },
];

const movements = [
  { t: "in", date: "18.06 09:14", doc: "Приход №2042", name: "Сода каустическая, меш. 25 кг", qty: "+400", who: "Ботир (склад)" },
  { t: "out", date: "18.06 11:02", doc: "Выписка №5518", name: "Перекись водорода 37%, канистра", qty: "−60", who: "Азиза (продажи)" },
  { t: "out", date: "17.06 16:41", doc: "Выписка №5517", name: "Сода каустическая, меш. 25 кг", qty: "−80", who: "Азиза (продажи)" },
  { t: "in", date: "15.06 10:20", doc: "Приход №2039", name: "Сульфат меди, меш. 25 кг", qty: "+150", who: "Ботир (склад)" },
  { t: "out", date: "14.06 14:08", doc: "Списание №0071", name: "Диоксид титана, меш. 25 кг", qty: "−1", who: "Ботир (повреждение упак.)" },
];

const batches = [
  { p: "20260618-0042", name: "Сода каустическая", investor: "Азиз Каримов", invest: 169000000, share: "100%", sold: 28000000, left: 143000000, status: "Распродаётся" },
  { p: "20260612-0037", name: "Перекись водорода (Импорт)", investor: "ООО «Nur Invest»", invest: 130000000, share: "60%", sold: 78000000, left: 55000000, status: "Распродаётся" },
  { p: "20260607-0028", name: "Сульфат меди", investor: "Ботир Р. + Азиз К.", invest: 64000000, share: "50/50", sold: 61000000, left: 8400000, status: "Закрывается" },
  { p: "20260528-0019", name: "Сода кальцинированная", investor: "Азиз Каримов", invest: 96000000, share: "100%", sold: 96000000, left: 0, status: "Закрыта" },
];

const investors = [
  { name: "Азиз Каримов", invested: 265000000, income: 14700000, rows: [
    { p: "20260618-0042", name: "Сода каустическая", invest: 169000000, sold: 28000000, income: 2400000, status: "Распродаётся" },
    { p: "20260528-0019", name: "Сода кальцинированная", invest: 96000000, sold: 96000000, income: 12300000, status: "Закрыта" }] },
  { name: "ООО «Nur Invest»", invested: 130000000, income: 9600000, rows: [
    { p: "20260612-0037", name: "Перекись водорода (Импорт, доля 60%)", invest: 130000000, sold: 78000000, income: 9600000, status: "Распродаётся" }] },
  { name: "Ботир Рахимов", invested: 32000000, income: 5400000, rows: [
    { p: "20260607-0028", name: "Сульфат меди (доля 50%)", invest: 32000000, sold: 30500000, income: 5400000, status: "Закрывается" }] },
];

const reservations = [
  { doc: "БР-0311", client: "Завод «Kimyo Sanoat»", name: "Сода каустическая, 60 меш.", sum: 21120000, status: "Активна", exp: "до 20.06" },
  { doc: "БР-0310", client: "ООО «Farg'ona Plastik»", name: "Перекись водорода, 90 канистр", sum: 37620000, status: "Активна", exp: "до 19.06" },
  { doc: "БР-0309", client: "Текстиль «Buxoro Teks»", name: "Диоксид титана, 3 меш. (последние!)", sum: 2586000, status: "Активна", exp: "до 19.06" },
  { doc: "ВП-5518", client: "ЧП «Himprom»", name: "Перекись водорода, 60 канистр", sum: 25080000, status: "Выписана", exp: "18.06" },
];

const competitors = [
  { name: "Сода каустическая, меш. 25 кг", mine: 352000, c1: 359000, c2: 348000, c3: 355000 },
  { name: "Перекись водорода 37%, канистра", mine: 418000, c1: 425000, c2: 410000, c3: 420000 },
  { name: "Диоксид титана, меш. 25 кг", mine: 862000, c1: 855000, c2: 875000, c3: 868000 },
  { name: "Сульфат меди, меш. 25 кг", mine: 610000, c1: 618000, c2: 605000, c3: 614000 },
];

const clients = [
  { name: "Завод «Kimyo Sanoat»", legalName: "ООО «KIMYO SANOAT ISHLAB CHIQARISH»", city: "Ташкент", address: "г. Ташкент, Сергелийский р-н, ул. Янгишахар, 14", inn: "305 847 219", account: "2020 8000 3054 8721 9001", bank: "«Ипотека-банк» АТИБ, МФО 00450", phone: "+998 90 123-45-67", contact: "Рустамов Шерзод (снабжение)", turnover: 412000000, owner: "Азиза Ю.", shipped: 412000000, paid: 389000000, creditLimit: 30000000,
    history: [{ date: "01.06.2026", who: "Азиза Ю.", prev: "Санжар Т.", reason: "перераспределение клиентов по регионам" }],
    contactLog: [{ date: "01.06.2026", to: "Азиза Ю.", by: "Рук. — Азиз К.", status: "Использован" }],
    orders: [{ d: "18.06", doc: "БР-0311", sum: 21120000 }, { d: "09.06", doc: "ВП-5502", sum: 41800000 }] },
  { name: "ООО «Farg'ona Plastik»", legalName: "ООО «FARG'ONA PLASTIK MASSA»", city: "Фергана", address: "г. Фергана, ул. Мустакиллик, 87", inn: "302 119 448", account: "2020 8000 3021 1944 8002", bank: "«Хамкорбанк», МФО 00974", phone: "+998 91 222-33-44", contact: "Юлдашева Нигора (директор)", turnover: 305000000, owner: "Санжар Т.", shipped: 305000000, paid: 305000000, creditLimit: 40000000,
    history: [], contactLog: [{ date: "14.05.2026", to: "Санжар Т.", by: "Рук. — Азиз К.", status: "Использован" }],
    orders: [{ d: "16.06", doc: "ВП-5510", sum: 52000000 }] },
  { name: "Текстиль «Buxoro Teks»", legalName: "ЧП «BUXORO TEKSTIL SERVIS»", city: "Бухара", address: "г. Бухара, промзона «Когон», участок 5", inn: "308 552 671", account: "2020 8000 3085 5267 1003", bank: "«Асака банк», МФО 00445", phone: "+998 93 555-66-77", contact: "Эргашев Botir (гл. инженер)", turnover: 128000000, owner: "Дилноза К.", shipped: 128000000, paid: 116000000, creditLimit: 10000000,
    history: [{ date: "22.05.2026", who: "Дилноза К.", prev: "Азиза Ю.", reason: "клиент попросил сменить менеджера" }],
    contactLog: [{ date: "20.04.2026", to: "Азиза Ю.", by: "Рук. — Азиз К.", status: "Использован" }, { date: "22.05.2026", to: "Дилноза К.", by: "Рук. — Азиз К.", status: "Использован" }],
    orders: [{ d: "17.06", doc: "БР-0309", sum: 2586000 }] },
  { name: "ЧП «Himprom»", legalName: "ЧП «HIMPROM SERVIS»", city: "Ташкент", address: "г. Ташкент, Мирзо-Улугбекский р-н, ул. Буюк Ипак Йули, 101", inn: "301 774 902", account: "2020 8000 3017 7490 2004", bank: "«Капиталбанк», МФО 00868", phone: "+998 94 888-99-00", contact: "Каримов Дилшод (снабжение)", turnover: 96000000, owner: "Азиза Ю.", shipped: 96000000, paid: 96000000, creditLimit: 20000000,
    history: [], contactLog: [{ date: "05.06.2026", to: "Азиза Ю.", by: "Рук. — Азиз К.", status: "Просрочен — нет реакции 9 дней" }],
    orders: [{ d: "18.06", doc: "ВП-5518", sum: 25080000 }] },
];

const suppliers = [
  { name: "Andijon Kimyo", goods: "Сода каустическая, кальцинированная", received: 210000000, paid: 198000000, foreign: false,
    purchases: [
      { date: "18.06.2026", product: "Сода каустическая, меш. 25 кг", qty: 400, price: 352000 },
      { date: "02.06.2026", product: "Сода кальцинированная, меш. 25 кг", qty: 250, price: 268000 },
      { date: "15.05.2026", product: "Сода каустическая, меш. 25 кг", qty: 300, price: 349000 },
      { date: "20.04.2026", product: "Сода каустическая, меш. 25 кг", qty: 350, price: 344000 }] },
  { name: "Kazan Chem", goods: "Перекись водорода 37%", received: 265000000, paid: 265000000, foreign: true,
    purchases: [
      { date: "12.06.2026", product: "Перекись водорода 37%, канистра 30 л", qty: 520, price: 418000 },
      { date: "20.05.2026", product: "Перекись водорода 37%, канистра 30 л", qty: 400, price: 412000 },
      { date: "18.04.2026", product: "Перекись водорода 37%, канистра 30 л", qty: 450, price: 405000 }] },
  { name: "Sichuan Titanium", goods: "Диоксид титана", received: 178000000, paid: 150000000, foreign: true,
    purchases: [
      { date: "10.06.2026", product: "Диоксид титана, меш. 25 кг", qty: 200, price: 862000 },
      { date: "28.04.2026", product: "Диоксид титана, меш. 25 кг", qty: 180, price: 858000 }] },
  { name: "Ural Chem", goods: "Сульфат меди", received: 128000000, paid: 128000000, foreign: false,
    purchases: [
      { date: "07.06.2026", product: "Сульфат меди, меш. 25 кг", qty: 210, price: 610000 },
      { date: "12.05.2026", product: "Сульфат меди, меш. 25 кг", qty: 200, price: 604000 }] },
];

const proposals = [
  { client: "ООО «Farg'ona Plastik»", text: "Просят рассрочку 14 дней на крупные партии", status: "Новое" },
  { client: "ЧП «Himprom»", text: "Хотят фасовку перекиси в канистры по 10 л", status: "В работе" },
  { client: "Завод «Kimyo Sanoat»", text: "Забирают своим транспортом со скидкой", status: "Принято" },
];

const inventoryRows = [
  { name: "Сода каустическая, меш. 25 кг", acc: 480, fact: 480 },
  { name: "Сода кальцинированная, меш. 25 кг", acc: 90, fact: 88 },
  { name: "Перекись водорода 37%, канистра", acc: 520, fact: 520 },
  { name: "Диоксид титана, меш. 25 кг", acc: 4, fact: 4 },
  { name: "Сульфат меди, меш. 25 кг", acc: 210, fact: 213 },
];

const expenses = [
  { name: "Зарплаты (ФОТ)", sum: 42000000, cat: "Персонал" },
  { name: "Налоги", sum: 22000000, cat: "Обязательные" },
  { name: "Аренда склада (класс опасности)", sum: 21000000, cat: "Помещение" },
  { name: "Логистика / спецперевозка", sum: 17500000, cat: "Операционные" },
  { name: "Лицензии и сертификация", sum: 5200000, cat: "Обязательные" },
  { name: "Прочее", sum: 6300000, cat: "Операционные" },
];
const pnl = { revenue: 1605000000, cogs: 1402000000 };

const revenueTrend = [
  { m: "Янв", v: 1180 }, { m: "Фев", v: 1240 }, { m: "Мар", v: 1330 },
  { m: "Апр", v: 1410 }, { m: "Май", v: 1435 }, { m: "Июн", v: 1605 },
];
const categorySales = [
  { name: "Сода каустическая", v: 520, color: C.teal },
  { name: "Перекись водорода", v: 430, color: C.sky },
  { name: "Диоксид титана", v: 310, color: C.amber },
  { name: "Сульфат меди", v: 220, color: C.emerald },
  { name: "Прочее", v: 125, color: C.slate },
];

const discountTiers = [
  { from: 1, to: 49, pct: 0 }, { from: 50, to: 99, pct: 2 }, { from: 100, to: 199, pct: 4 },
  { from: 200, to: 499, pct: 6 }, { from: 500, to: Infinity, pct: 8 },
];
const staff = [
  { name: "Азиза Ю.", plan: 900000000, done: 612000000, limit: 5 },
  { name: "Санжар Т.", plan: 750000000, done: 705000000, limit: 4 },
  { name: "Дилноза К.", plan: 600000000, done: 288000000, limit: 3 },
];
const staffSales = [
  { name: "Азиза Ю.", planTons: 300, months: [{ m: "Янв", t: 70 }, { m: "Фев", t: 78 }, { m: "Мар", t: 82 }, { m: "Апр", t: 95 }, { m: "Май", t: 88 }, { m: "Июн", t: 104 }] },
  { name: "Санжар Т.", planTons: 240, months: [{ m: "Янв", t: 55 }, { m: "Фев", t: 60 }, { m: "Мар", t: 62 }, { m: "Апр", t: 71 }, { m: "Май", t: 75 }, { m: "Июн", t: 80 }] },
  { name: "Дилноза К.", planTons: 150, months: [{ m: "Янв", t: 30 }, { m: "Фев", t: 34 }, { m: "Мар", t: 38 }, { m: "Апр", t: 40 }, { m: "Май", t: 36 }, { m: "Июн", t: 44 }] },
];

const calEvents = [
  { day: 0, s: 9, e: 9.5, title: "Утреннее собрание", tone: "sky" },
  { day: 0, s: 10, e: 11.5, title: "Актуализация регламента приёмки химии", tone: "emerald" },
  { day: 0, s: 12.5, e: 15, title: "Сообщить партнёрам о совещании по договору", tone: "rose" },
  { day: 1, s: 9, e: 9.5, title: "Утреннее собрание", tone: "sky" },
  { day: 1, s: 10, e: 12, title: "Входной контроль партии перекиси", tone: "emerald" },
  { day: 1, s: 12.5, e: 13.5, title: "Перезвонить поставщику Kazan Chem", tone: "amber" },
  { day: 1, s: 15, e: 17, title: "Обработка претензии по срокам доставки", tone: "emerald" },
  { day: 2, s: 9, e: 9.5, title: "Утреннее собрание", tone: "sky" },
  { day: 2, s: 9.75, e: 13, title: "Итоги работы склада за месяц", tone: "amber" },
  { day: 2, s: 13.5, e: 14.8, title: "Внести правки после совещания", tone: "amber" },
  { day: 2, s: 15, e: 17.5, title: "Доработать акт сверки по «Buxoro Teks»", tone: "rose" },
  { day: 3, s: 9, e: 9.5, title: "Утреннее собрание", tone: "sky" },
  { day: 3, s: 9.75, e: 12.9, title: "Совещание с партнёрами", tone: "amber" },
  { day: 3, s: 13.5, e: 15.8, title: "Согласование предложения о поставке", tone: "amber" },
  { day: 4, s: 9.5, e: 17, title: "Командировка на завод «Kimyo Sanoat»", tone: "emerald" },
  { day: 4, s: 17, e: 17.5, title: "Составление отчёта", tone: "sky" },
];

// ---------- UI atoms ----------
function Badge({ children, tone = "slate" }) {
  const tones = { slate: "bg-slate-100 text-slate-600", green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", rose: "bg-rose-100 text-rose-700", teal: "bg-indigo-100 text-indigo-700", blue: "bg-sky-100 text-sky-700" };
  return <span className={"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap " + tones[tone]}>{children}</span>;
}
function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {title && <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100"><h3 className="font-semibold text-slate-800 text-sm">{title}</h3>{action}</div>}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
const Th = ({ children, right }) => <th className={"px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide " + (right ? "text-right" : "text-left")}>{children}</th>;
const Td = ({ children, right, className = "" }) => <td className={"px-4 py-3 text-sm text-slate-700 " + (right ? "text-right " : "") + className}>{children}</td>;
const AddBtn = ({ label }) => <button className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 sm:py-1.5 rounded-xl min-h-[44px] sm:min-h-0"><Plus size={14} /> {label}</button>;
function TableScreen({ title, action, children, foot }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100"><h3 className="font-semibold text-slate-800 text-sm">{title}</h3>{action}</div>
      <div className="overflow-x-auto">{children}</div>{foot}
    </div>
  );
}
function StockBar({ avail, min }) {
  const cap = Math.max(avail, min) * 1.25 || 1;
  const pct = Math.min(100, (avail / cap) * 100);
  const low = avail < min;
  return (
    <div className="w-28 sm:w-36">
      <div className="h-2 rounded-full bg-slate-200 relative overflow-hidden">
        <div className={"h-full rounded-full " + (low ? "bg-rose-500" : avail < min * 1.4 ? "bg-amber-400" : "bg-emerald-500")} style={{ width: pct + "%" }} />
        <div className="absolute top-0 bottom-0 w-px bg-slate-500" style={{ left: (min / cap) * 100 + "%" }} />
      </div>
      <div className="text-xs text-slate-400 mt-1">min {fmt(min)}</div>
    </div>
  );
}

// ---------- Dashboard (с графиками) ----------
function Dashboard({ go }) {
  const totalExp = expenses.reduce((a, b) => a + b.sum, 0);
  const profit = pnl.revenue - pnl.cogs - totalExp;
  const rentab = ((profit / pnl.revenue) * 100).toFixed(1);
  const planTonsTotal = staffSales.reduce((a, s) => a + s.planTons, 0);
  const lowStock = stock.filter((s) => (s.qty - s.reserved) < s.min);
  const scarce = reservations.filter((r) => r.name.includes("последние"));
  const nearExpiry = stock.filter((s) => s.exp && Math.round((new Date(s.exp) - TODAY) / 86400000) < 90);
  const attention = [
    ...lowStock.map((s) => ({ tone: "rose", icon: AlertTriangle, text: s.name, sub: "доступно " + fmt(s.qty - s.reserved) + " · min " + fmt(s.min), action: () => go("wh") })),
    ...nearExpiry.map((s) => ({ tone: "amber", icon: Clock, text: s.name, sub: "срок годности истекает скоро", action: () => go("wh") })),
    ...scarce.map((r) => ({ tone: "amber", icon: Lock, text: r.name, sub: "клиент: " + r.client, action: () => go("res") })),
  ];
  const leaders = [...staff].sort((a, b) => b.done / b.plan - a.done / a.plan);
  const medalColor = ["#f59e0b", "#94a3b8", "#b45309"];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white p-4 sm:p-6 shadow-lg">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-center">
          <div className="lg:col-span-2">
            <div className="text-indigo-100 text-xs font-medium mb-1">Выручка за июнь 2026</div>
            <div className="flex items-end gap-2 sm:gap-3 flex-wrap">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">{mln(pnl.revenue)}</div>
              <div className="flex items-center gap-1 text-emerald-300 text-sm font-semibold mb-1"><TrendingUp size={16} />+12% к маю</div>
            </div>
            <div style={{ height: 60 }} className="mt-3 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs><linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffffff" stopOpacity={0.5} /><stop offset="100%" stopColor="#ffffff" stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={2} fill="url(#heroGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 lg:border-l lg:border-white/20 lg:pl-6">
            <div><div className="text-indigo-100 text-xs">Чистая прибыль</div><div className="text-base sm:text-xl font-bold">{mln(profit)}</div></div>
            <div><div className="text-indigo-100 text-xs">Рентабельность</div><div className="text-base sm:text-xl font-bold">{rentab}%</div></div>
            <div><div className="text-indigo-100 text-xs">Остатки на складе</div><div className="text-base sm:text-xl font-bold">{mln(1284500000)}</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Attention */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2"><AlertTriangle size={16} className="text-rose-500" /> Требует внимания</h3>
            <Badge tone={attention.length ? "rose" : "green"}>{attention.length} шт.</Badge>
          </div>
          <div className="divide-y divide-slate-50">
            {attention.map((a, i) => (
              <button key={i} onClick={a.action} className={"w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left hover:bg-slate-50 border-l-4 min-h-[52px] " + (a.tone === "rose" ? "border-rose-400" : "border-amber-400")}>
                <span className={"w-8 h-8 rounded-xl flex items-center justify-center shrink-0 " + (a.tone === "rose" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600")}><a.icon size={15} /></span>
                <div className="flex-1 min-w-0"><div className="text-sm font-medium text-slate-800 truncate">{a.text}</div><div className="text-xs text-slate-400 truncate">{a.sub}</div></div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <Card title="Рейтинг продажников (план · квартал)">
          <div className="space-y-4">
            {leaders.map((s, i) => {
              const pct = Math.round((s.done / s.plan) * 100);
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: medalColor[i] || "#cbd5e1" }}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700 truncate">{s.name}</span><span className="text-slate-400">{pct}%</span></div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-indigo-500" style={{ width: Math.min(100, pct) + "%" }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => go("stats")} className="mt-4 w-full text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 sm:py-1.5 rounded-xl min-h-[44px] sm:min-h-0">Открыть продажников →</button>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <Card title="Выручка по месяцам, млн сум">
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.teal} stopOpacity={0.35} /><stop offset="100%" stopColor={C.teal} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
                  <XAxis dataKey="m" tick={{ fontSize: 12, fill: C.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.slate }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [v + " млн", "Выручка"]} />
                  <Area type="monotone" dataKey="v" stroke={C.teal} strokeWidth={2.5} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="Продажи по категориям, млн">
          <div style={{ height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySales} dataKey="v" nameKey="name" innerRadius={42} outerRadius={75} paddingAngle={2}>
                  {categorySales.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + " млн", n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-1">
            {categorySales.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span><span className="text-slate-500">{c.v} млн</span></div>
            ))}
          </div>
        </Card>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Последние движения</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">План к закупке: {Math.round(planTonsTotal * 1.1)} т</span>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="relative pl-5 border-l-2 border-slate-100 space-y-5">
            {movements.map((m, i) => (
              <div key={i} className="relative">
                <span className={"absolute top-0.5 w-3.5 h-3.5 rounded-full ring-4 ring-white " + (m.t === "in" ? "bg-emerald-500" : "bg-rose-500")} style={{ left: -27 }} />
                <div className="flex items-center justify-between gap-3">
                  <div><div className="text-sm font-medium text-slate-800">{m.name}</div><div className="text-xs text-slate-400">{m.doc} · {m.who}</div></div>
                  <div className="text-right shrink-0"><div className={"text-sm font-semibold " + (m.t === "in" ? "text-emerald-600" : "text-rose-600")}>{m.qty}</div><div className="text-xs text-slate-400">{m.date}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Каталог ----------
function OrderCell({ orderable, onAdd }) {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  if (!orderable) return <span className="text-xs text-slate-400 italic">Продукт не может быть заказан</span>;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="w-16 border border-slate-200 rounded-xl px-2 py-2 sm:py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[44px] sm:min-h-0" />
      <button onClick={() => { onAdd(qty); setDone(true); setTimeout(() => setDone(false), 1300); }} className={"text-xs font-medium px-3 py-2 sm:py-1.5 rounded-xl whitespace-nowrap min-h-[44px] sm:min-h-0 " + (done ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white")}>{done ? "✓ В заказе" : "Заказать"}</button>
    </div>
  );
}
function CatalogScreen() {
  const [basket, setBasket] = useState({});
  const [q, setQ] = useState("");
  const add = (serie, n) => setBasket((b) => ({ ...b, [serie]: (b[serie] || 0) + n }));
  const positions = Object.keys(basket).length;
  const totalSum = catalog.reduce((s, p) => s + (basket[p.serie] || 0) * p.price, 0);
  const rows = catalog.filter((p) => (p.en + p.ru + p.maker).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 sm:py-1.5 text-sm text-slate-500 w-full sm:w-auto"><Search size={15} className="shrink-0" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по продукту, производителю…" className="bg-transparent focus:outline-none w-full sm:w-56 min-w-0" /></div>
        <div className="text-xs text-slate-500 border-l border-slate-200 pl-4 hidden md:block">Курс на 07.07.2026: <span className="font-semibold text-slate-700">€ 1 = 13 720</span> · <span className="font-semibold text-slate-700">$ 1 = 12 610</span> сум</div>
        <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto flex-wrap">
          <div className="flex items-center gap-2 text-sm"><ShoppingCart size={17} className="text-indigo-600 shrink-0" /><span className="text-slate-600">В заказе: <b className="text-slate-800">{positions} поз.</b></span>{positions > 0 && <span className="text-slate-400">· {money(totalSum)}</span>}</div>
          <button className={"text-xs font-medium px-3 py-2 sm:py-1.5 rounded-xl min-h-[44px] sm:min-h-0 " + (positions ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 text-slate-400")}>Оформить заказ</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100"><h3 className="font-semibold text-slate-800 text-sm">Каталог продукции</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Продукт</Th><Th>Серия</Th><Th>CoA</Th><Th>Класс опасности / SDS</Th><Th>Регистрация</Th><Th>Производитель</Th><Th>Страна</Th><Th right>Цена</Th><Th>Создать заказ</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.serie} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{p.ru}<div className="text-xs text-slate-400 font-normal">{p.en}</div></Td>
                  <Td><span className="font-mono text-xs text-slate-500">{p.serie}</span></Td>
                  <Td><button className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"><Download size={13} />{p.coa}</button></Td>
                  <Td><div className="flex flex-col gap-1">{p.hazard !== "—" ? <Badge tone="rose"><Flame size={11} className="mr-1" />{p.hazard}</Badge> : <span className="text-xs text-slate-400">без класса</span>}<button className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"><Download size={12} />{p.sds}</button></div></Td>
                  <Td className="text-slate-500 text-xs">{p.reg}</Td>
                  <Td className="text-slate-600">{p.maker}</Td>
                  <Td className="text-slate-500">{p.country}</Td>
                  <Td right className="font-semibold whitespace-nowrap">{money(p.price)}</Td>
                  <Td><OrderCell orderable={p.orderable} onAdd={(n) => add(p.serie, n)} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-col gap-1.5"><span className="flex items-center gap-2"><ShieldCheck size={14} className="text-indigo-600 shrink-0" /> К каждой серии прикреплён сертификат анализа (CoA). Это же окно может работать как портал самозаказа для клиентов.</span><span className="flex items-center gap-2"><Flame size={14} className="text-rose-500 shrink-0" /><b className="text-amber-700">Предложено BRONUS:</b> паспорт безопасности (SDS) и класс опасности рядом с CoA — для правил хранения и перевозки.</span></div>
      </div>
    </div>
  );
}

// ---------- Склад / инвентаризация / движения / бронь / партии / инвесторы ----------
function WarehouseScreen() {
  return (
    <TableScreen title="Остатки на складе" action={<AddBtn label="Новый приход" />}
      foot={<div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-col gap-1.5"><span className="flex items-center gap-2"><Lock size={14} className="text-indigo-600 shrink-0" /> «Доступно» = физический остаток минус товар в брони. Забронированное списывается сразу — двое операторов не смогут продать одну и ту же единицу.</span><span className="flex items-center gap-2"><Clock size={14} className="text-amber-600 shrink-0" /><b className="text-amber-700">Предложено BRONUS:</b> контроль сроков годности (FEFO) — партии с близким сроком подсвечиваются, чтобы продать их первыми.</span></div>}>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Партия</Th><Th>Химпродукт</Th><Th right>Физ.</Th><Th right>В брони</Th><Th right>Доступно</Th><Th>Уровень</Th><Th>Срок годности</Th><Th right>Цена</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {stock.map((s) => {
            const avail = s.qty - s.reserved;
            return (
              <tr key={s.p} className="hover:bg-slate-50">
                <Td><span className="font-mono text-xs text-slate-500">{s.p}</span></Td>
                <Td className="font-medium text-slate-800"><div className="flex items-center gap-2">{s.name}{s.cert && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}{s.foreign && <Badge tone="blue">импорт</Badge>}</div></Td>
                <Td right className="text-slate-500">{fmt(s.qty)}</Td>
                <Td right>{s.reserved > 0 ? <span className="inline-flex items-center gap-1 text-amber-600 font-medium"><Lock size={12} />{fmt(s.reserved)}</span> : <span className="text-slate-300">—</span>}</Td>
                <Td right className={"font-bold " + (avail < s.min ? "text-rose-600" : "text-slate-800")}>{fmt(avail)}</Td>
                <Td><StockBar avail={avail} min={s.min} /></Td>
                {(() => {
                  const days = Math.round((new Date(s.exp) - TODAY) / 86400000);
                  const d = new Date(s.exp);
                  const label = String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
                  const tone = days < 90 ? "rose" : days < 180 ? "amber" : "green";
                  return <Td><div className="flex items-center gap-2"><span className="text-slate-600 text-xs">{label}</span>{days < 180 && <Badge tone={tone}>{days} дн.</Badge>}</div></Td>;
                })()}
                <Td right className="font-semibold">{money(s.price)}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScreen>
  );
}
function InventoryScreen() {
  const diffs = inventoryRows.filter((r) => r.fact !== r.acc).length;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center gap-4 sm:gap-6">
        <div><div className="text-xs text-slate-400">Ведомость</div><div className="font-semibold text-slate-800">ИНВ-0009 · Основной склад</div></div>
        <div><div className="text-xs text-slate-400">Дата</div><div className="font-semibold text-slate-800">18.06.2026</div></div>
        <div><div className="text-xs text-slate-400">Ответственный</div><div className="font-semibold text-slate-800">Ботир Р.</div></div>
        <div className="ml-auto flex items-center gap-3 flex-wrap"><Badge tone={diffs ? "amber" : "green"}>{diffs ? diffs + " расхождения" : "без расхождений"}</Badge><button className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 sm:py-1.5 rounded-xl min-h-[44px] sm:min-h-0">Завершить и скорректировать</button></div>
      </div>
      <TableScreen title="Пересчёт позиций">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Химпродукт</Th><Th right>Учётный остаток</Th><Th right>Факт</Th><Th right>Расхождение</Th><Th right>Результат</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {inventoryRows.map((r) => {
              const d = r.fact - r.acc;
              return (
                <tr key={r.name} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{r.name}</Td><Td right className="text-slate-500">{fmt(r.acc)}</Td><Td right className="font-semibold">{fmt(r.fact)}</Td>
                  <Td right className={d === 0 ? "text-slate-300" : d < 0 ? "text-rose-600 font-semibold" : "text-emerald-600 font-semibold"}>{d === 0 ? "0" : (d > 0 ? "+" : "") + d}</Td>
                  <Td right>{d === 0 ? <Badge tone="green">совпало</Badge> : d < 0 ? <Badge tone="rose">недостача</Badge> : <Badge tone="blue">излишек</Badge>}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScreen>
    </div>
  );
}
function MovementsScreen() {
  return (
    <TableScreen title="Приход и расход" action={<div className="flex gap-2 flex-wrap"><AddBtn label="Приход" /><button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 sm:py-1.5 rounded-xl min-h-[44px] sm:min-h-0"><Plus size={14} /> Расход</button></div>}>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Дата</Th><Th>Документ</Th><Th>Химпродукт</Th><Th>Ответственный</Th><Th right>Кол-во</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {movements.map((m, i) => (
            <tr key={i} className="hover:bg-slate-50"><Td className="text-slate-400 text-xs">{m.date}</Td><Td><Badge tone={m.t === "in" ? "green" : "rose"}>{m.doc}</Badge></Td><Td className="font-medium text-slate-800">{m.name}</Td><Td className="text-slate-500">{m.who}</Td><Td right className={"font-semibold " + (m.t === "in" ? "text-emerald-600" : "text-rose-600")}>{m.qty}</Td></tr>
          ))}
        </tbody>
      </table>
    </TableScreen>
  );
}
function ReservationsScreen() {
  const tone = (s) => (s === "Активна" ? "teal" : s === "Выписана" ? "green" : s === "Просрочена" ? "rose" : "slate");
  return (
    <TableScreen title="Бронь → Выписка" action={<AddBtn label="Новая бронь" />}
      foot={<div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-col gap-1.5"><span className="flex items-center gap-2"><Lock size={14} className="text-amber-600 shrink-0" /> Бронь сразу списывает товар из доступного остатка и держит его до выписки или отмены (защита от двойной продажи).</span><span className="flex items-center gap-2"><ShieldCheck size={14} className="text-indigo-600 shrink-0" /> При выписке счёт-фактура (ЭСФ) автоматически уходит в Didox.</span></div>}>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Документ</Th><Th>Клиент</Th><Th>Химпродукт</Th><Th right>Сумма</Th><Th>Срок</Th><Th right>Статус</Th><Th right>Действие</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {reservations.map((r) => (
            <tr key={r.doc} className="hover:bg-slate-50">
              <Td><span className="font-mono text-xs text-slate-500">{r.doc}</span></Td><Td className="font-medium text-slate-800">{r.client}</Td><Td className="text-slate-600">{r.name}</Td><Td right className="font-semibold">{money(r.sum)}</Td><Td className="text-slate-400 text-xs">{r.exp}</Td><Td right><Badge tone={tone(r.status)}>{r.status}</Badge></Td>
              <Td right>{r.status === "Активна" ? <div className="inline-flex gap-1.5 flex-wrap justify-end"><button className="text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-2 sm:py-1 rounded-xl inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 whitespace-nowrap">Выписать <ChevronRight size={13} /></button><button className="text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-2 sm:py-1 rounded-xl min-h-[44px] sm:min-h-0 whitespace-nowrap">Отменить</button></div> : <span className="text-xs text-slate-400 inline-flex items-center gap-1"><FileText size={13} /> ЭСФ отправлен</span>}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScreen>
  );
}
function BatchesScreen() {
  return (
    <div className="space-y-4 sm:space-y-6">
    <TableScreen title="Партии" action={<AddBtn label="Новая партия" />}>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Партия</Th><Th>Химпродукт</Th><Th>Инвестор</Th><Th right>Вложено</Th><Th right>Продано</Th><Th right>Остаток</Th><Th right>Статус</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {batches.map((b) => (
            <tr key={b.p} className="hover:bg-slate-50"><Td><span className="font-mono text-xs text-slate-500">{b.p}</span></Td><Td className="font-medium text-slate-800">{b.name}</Td><Td className="text-slate-600">{b.investor}<div className="text-xs text-slate-400">доля {b.share}</div></Td><Td right>{money(b.invest)}</Td><Td right className="text-emerald-600 font-medium">{money(b.sold)}</Td><Td right className="text-slate-500">{money(b.left)}</Td><Td right><Badge tone={b.status === "Закрыта" ? "slate" : b.status === "Закрывается" ? "amber" : "teal"}>{b.status}</Badge></Td></tr>
          ))}
        </tbody>
      </table>
    </TableScreen>
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100"><h3 className="font-semibold text-slate-800 text-sm">Себестоимость импортной партии (landed cost)</h3><Badge tone="amber">предложено BRONUS</Badge></div>
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="text-xs text-slate-400 mb-2">Партия 20260612-0037 · Перекись водорода 37% (Импорт)</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Цена поставщика (FOB), € 9 500 × 13 720</span><span className="font-medium">{money(130340000)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Логистика / доставка</span><span className="font-medium">{money(8500000)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Таможенная пошлина + НДС</span><span className="font-medium">{money(14200000)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">СВХ, брокер, прочее</span><span className="font-medium">{money(2100000)}</span></div>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900 text-white p-4 flex flex-col justify-center">
          <div className="text-xs text-slate-300">Полная себестоимость партии</div>
          <div className="text-2xl font-bold">{money(155140000)}</div>
          <div className="flex justify-between text-sm text-slate-300 border-t border-slate-700 mt-3 pt-3"><span>На единицу (520 канистр)</span><span className="font-semibold text-indigo-300">{money(298346)}</span></div>
          <div className="text-xs text-slate-400 mt-2">Все расходы по импорту (таможня, логистика, курс) автоматически ложатся в себестоимость — прибыль считается честно.</div>
        </div>
      </div>
    </div>
    </div>
  );
}
function InvestorsScreen() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <p className="text-sm text-slate-500">Каждый инвестор видит, в какие именно партии вложены его деньги и какой доход они принесли.</p>
      {investors.map((inv) => (
        <div key={inv.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 sm:px-5 py-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">{inv.name.slice(0, 1)}</div>
            <div><div className="text-xs text-slate-400">Инвестор</div><div className="font-semibold text-slate-800">{inv.name}</div></div>
            <div className="ml-auto flex gap-4 sm:gap-8 flex-wrap"><div className="text-right"><div className="text-xs text-slate-400">Вложено всего</div><div className="font-bold text-slate-800">{money(inv.invested)}</div></div><div className="text-right"><div className="text-xs text-slate-400">Доход</div><div className="font-bold text-emerald-600 flex items-center gap-1 justify-end"><TrendingUp size={15} />+{money(inv.income)}</div></div></div>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Партия</Th><Th>Химпродукт</Th><Th right>Вложено</Th><Th right>Продано</Th><Th right>Доход</Th><Th right>Статус</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {inv.rows.map((r) => (
                <tr key={r.p} className="hover:bg-slate-50"><Td><span className="font-mono text-xs text-slate-500">{r.p}</span></Td><Td className="font-medium text-slate-800">{r.name}</Td><Td right>{money(r.invest)}</Td><Td right className="text-slate-500">{money(r.sold)}</Td><Td right className="text-emerald-600 font-semibold">+{money(r.income)}</Td><Td right><Badge tone={r.status === "Закрыта" ? "slate" : r.status === "Закрывается" ? "amber" : "teal"}>{r.status}</Badge></Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
function PricesScreen() {
  const best = (r) => Math.min(r.c1, r.c2, r.c3);
  return (
    <TableScreen title="Мониторинг цен конкурентов" action={<span className="text-xs text-slate-400">обновлено сегодня, 09:00</span>}>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Химпродукт</Th><Th right>Моя цена</Th><Th right>Конк. A</Th><Th right>Конк. B</Th><Th right>Конк. C</Th><Th right>Вывод</Th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {competitors.map((c) => { const higher = c.mine > best(c); return (
            <tr key={c.name} className="hover:bg-slate-50"><Td className="font-medium text-slate-800">{c.name}</Td><Td right className="font-semibold text-slate-900">{fmt(c.mine)}</Td><Td right className="text-slate-500">{fmt(c.c1)}</Td><Td right className="text-slate-500">{fmt(c.c2)}</Td><Td right className="text-slate-500">{fmt(c.c3)}</Td><Td right>{higher ? <Badge tone="rose">выше рынка</Badge> : <Badge tone="green">конкурентно</Badge>}</Td></tr>
          ); })}
        </tbody>
      </table>
    </TableScreen>
  );
}

// ---------- Акт сверки / клиенты / поставщики ----------
function ReconBlock({ title, aLabel, bLabel, a, b }) {
  const saldo = a - b;
  return (
    <Card title={title}>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-500">{aLabel}</span><span className="font-medium">{money(a)}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">{bLabel}</span><span className="font-medium">{money(b)}</span></div>
        <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-slate-700 font-semibold">Сальдо (долг)</span><span className={"font-bold " + (saldo > 0 ? "text-rose-600" : "text-emerald-600")}>{money(saldo)}</span></div>
      </div>
      <button className="mt-4 w-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 sm:py-1.5 rounded-xl inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0"><FileCheck size={15} /> Сформировать акт сверки</button>
      <div className="text-xs text-slate-400 mt-2 text-center">формируется автоматически и отправляется в Didox</div>
    </Card>
  );
}
function ClientsScreen() {
  const [sel, setSel] = useState(0);
  const c = clients[sel];
  const statusTone = (s) => (s.includes("Использован") ? "green" : s.includes("Ожидает") ? "amber" : "rose");
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      <Card title="Клиенты" action={<AddBtn label="Клиент" />}>
        <div className="space-y-1">
          {clients.map((cl, i) => {
            const on = i === sel;
            return (
              <button key={cl.name} onClick={() => setSel(i)} className={"w-full text-left px-3 py-2.5 rounded-xl border transition-all " + (on ? "bg-indigo-50 border-indigo-200" : "border-transparent hover:bg-slate-50 opacity-50 hover:opacity-100 grayscale hover:grayscale-0")}>
                <div className="flex justify-between items-center"><span className="font-medium text-slate-800 text-sm">{cl.name}</span><span className="text-xs text-slate-400">{cl.city}</span></div>
                {on && <div className="text-xs text-slate-500 mt-0.5">Ответственный: {cl.owner}</div>}
              </button>
            );
          })}
        </div>
      </Card>
      <div className="xl:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div><h3 className="font-bold text-slate-800 text-lg">{c.name}</h3><div className="text-sm text-slate-500">{c.legalName}</div></div>
            <div className="text-right"><div className="text-xs text-slate-400">Оборот</div><div className="font-bold text-slate-800">{money(c.turnover)}</div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-400">ИНН</span><span className="font-medium text-slate-700">{c.inn}</span></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-400">Город</span><span className="font-medium text-slate-700">{c.city}</span></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5 md:col-span-2"><span className="text-slate-400">Адрес</span><span className="font-medium text-slate-700 text-right">{c.address}</span></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5 md:col-span-2"><span className="text-slate-400">Р/с и банк</span><span className="font-medium text-slate-700 text-right">{c.account} · {c.bank}</span></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-400">Контактное лицо</span><span className="font-medium text-slate-700">{c.contact}</span></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-400">Телефон</span><span className="font-medium text-slate-700">{c.phone}</span></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <UserCog size={18} className="text-indigo-600 shrink-0" /><div className="flex-1"><div className="text-xs text-slate-400">Ответственный сотрудник</div><div className="font-semibold text-slate-800">{c.owner}</div></div>
            <button className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 sm:py-1.5 rounded-xl inline-flex items-center gap-1 min-h-[44px] sm:min-h-0"><RefreshCw size={13} /> Сменить (с указанием причины)</button>
          </div>
          {c.history.length > 0 && (
            <div className="mt-4"><div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">История смены ответственного</div>
              <div className="space-y-2">{c.history.map((h, i) => (<div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-3 text-sm bg-white border border-slate-100 rounded-xl px-3 py-2"><span className="text-xs font-mono text-slate-400 w-20 shrink-0">{h.date}</span><span className="text-slate-700"><b>{h.prev}</b> → <b>{h.who}</b><div className="text-xs text-slate-400">Причина: {h.reason}</div></span></div>))}</div>
            </div>
          )}
        </div>

        <Card title="Передача контакта продажнику">
          <div className="space-y-2">
            {c.contactLog.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-sm bg-slate-50 rounded-xl px-3 py-2.5">
                <span className="text-xs font-mono text-slate-400 w-20 shrink-0">{h.date}</span>
                <div className="flex-1"><span className="text-slate-700">Контакт передан <b>{h.to}</b></span><div className="text-xs text-slate-400">Выдал: {h.by}</div></div>
                <Badge tone={statusTone(h.status)}>{h.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {(() => {
          const debt = c.shipped - c.paid;
          const over = debt > c.creditLimit;
          const pct = Math.min(100, Math.round((debt / c.creditLimit) * 100));
          return (
            <div className={"rounded-2xl border shadow-sm p-5 " + (over ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200")}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2"><CreditCard size={16} className="text-indigo-600" /> Кредитный лимит <Badge tone="amber">предложено BRONUS</Badge></h3>
                {over ? <Badge tone="rose">лимит превышен — отгрузка заблокирована</Badge> : <Badge tone="green">в пределах лимита</Badge>}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><div className="text-xs text-slate-400">Лимит</div><div className="font-semibold text-slate-800">{money(c.creditLimit)}</div></div>
                <div><div className="text-xs text-slate-400">Текущий долг</div><div className={"font-semibold " + (over ? "text-rose-600" : "text-slate-800")}>{money(debt)}</div></div>
                <div><div className="text-xs text-slate-400">Доступно</div><div className="font-semibold text-emerald-600">{money(Math.max(0, c.creditLimit - debt))}</div></div>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden mt-3"><div className={"h-full rounded-full " + (over ? "bg-rose-500" : pct > 80 ? "bg-amber-400" : "bg-emerald-500")} style={{ width: pct + "%" }} /></div>
              {over && <div className="text-xs text-rose-600 mt-2">Новые брони и выписки для этого клиента блокируются до погашения долга.</div>}
            </div>
          );
        })()}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ReconBlock title="Акт сверки — клиент (Didox)" aLabel="Отгружено" bLabel="Оплачено" a={c.shipped} b={c.paid} />
          <Card title="Последние заказы"><div className="space-y-2">{c.orders.map((o, i) => (<div key={i} className="flex justify-between items-center text-sm"><span className="text-slate-600"><span className="font-mono text-xs text-slate-400 mr-2">{o.d}</span>{o.doc}</span><span className="font-medium">{money(o.sum)}</span></div>))}</div></Card>
        </div>
      </div>
    </div>
  );
}

function ContactControlScreen() {
  const rows = clients.flatMap((c) => c.contactLog.map((h) => ({ client: c.name, ...h })));
  const statusTone = (s) => (s.includes("Использован") ? "green" : s.includes("Ожидает") ? "amber" : "rose");
  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">Контроль передачи контактов: кто, кому и когда передал контакт клиента — и была ли реакция.</p>
      <TableScreen title="Выдача контактов клиентов продажникам">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Клиент</Th><Th>Кому передан</Th><Th>Кто выдал</Th><Th>Дата</Th><Th right>Статус</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-800">{r.client}</Td>
                <Td className="text-slate-600">{r.to}</Td>
                <Td className="text-slate-500 text-xs">{r.by}</Td>
                <Td className="text-slate-400 text-xs">{r.date}</Td>
                <Td right><Badge tone={statusTone(r.status)}>{r.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScreen>
    </div>
  );
}
const ClientsCombined = () => <TabsScreen tabs={[{ label: "Клиенты", content: <ClientsScreen /> }, { label: "Выдача контактов", content: <ContactControlScreen /> }]} />;

function ProposalsScreen() {
  return (
    <TableScreen title="Предложения от клиентов">
      <div className="p-4 sm:p-5 space-y-3">
        {proposals.map((p, i) => (
          <div key={i} className="flex items-start justify-between gap-3 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
            <div className="flex gap-2"><MessageSquarePlus size={15} className="text-indigo-500 mt-0.5 shrink-0" /><div className="text-sm text-slate-700">{p.text}<div className="text-xs text-slate-400">{p.client}</div></div></div>
            <Badge tone={p.status === "Новое" ? "amber" : p.status === "Принято" ? "green" : "blue"}>{p.status}</Badge>
          </div>
        ))}
      </div>
    </TableScreen>
  );
}

function SuppliersScreen() {
  const [sel, setSel] = useState(0);
  const s = suppliers[sel];
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      <Card title="Поставщики" action={<AddBtn label="Поставщик" />}>
        <div className="space-y-1">
          {suppliers.map((sp, i) => (
            <button key={sp.name} onClick={() => setSel(i)} className={"w-full text-left px-3 py-2.5 rounded-xl border " + (i === sel ? "bg-indigo-50 border-indigo-200" : "border-transparent hover:bg-slate-50")}>
              <div className="flex justify-between items-center"><span className="font-medium text-slate-800 text-sm">{sp.name}</span>{sp.foreign && <Badge tone="blue">импорт</Badge>}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sp.goods}</div>
            </button>
          ))}
        </div>
      </Card>
      <div className="xl:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-start justify-between flex-wrap gap-3">
          <div><h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">{s.name}{s.foreign && <Badge tone="blue">импорт</Badge>}</h3><div className="text-sm text-slate-500">Поставляет: {s.goods}</div></div>
        </div>
        <TableScreen title="История закупок">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Дата</Th><Th>Химпродукт</Th><Th right>Кол-во</Th><Th right>Цена за ед.</Th><Th right>Сумма</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {s.purchases.map((pr, i) => {
                const prev = s.purchases[i + 1];
                const up = prev && prev.product === pr.product && pr.price > prev.price;
                const down = prev && prev.product === pr.product && pr.price < prev.price;
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <Td className="text-slate-400 text-xs">{pr.date}</Td>
                    <Td className="font-medium text-slate-800">{pr.product}</Td>
                    <Td right className="text-slate-600">{fmt(pr.qty)}</Td>
                    <Td right className="font-semibold">{money(pr.price)}{up && <span className="ml-1 text-rose-500 text-xs">▲</span>}{down && <span className="ml-1 text-emerald-500 text-xs">▼</span>}</Td>
                    <Td right className="text-slate-500">{money(pr.qty * pr.price)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableScreen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ReconBlock title="Акт сверки — поставщик (Didox)" aLabel="Получено от поставщика" bLabel="Оплачено поставщику" a={s.received} b={s.paid} />
          <Card title="Динамика цен"><p className="text-sm text-slate-600">Стрелки в истории показывают, дорожает (▲) или дешевеет (▼) продукт относительно прошлой закупки — удобно ловить момент выгодной цены и планировать закупки.</p></Card>
        </div>
      </div>
    </div>
  );
}

// ---------- Статистика продаж + планирование в тоннах ----------
function SalesStatsScreen() {
  const [sel, setSel] = useState(0);
  const [addTons, setAddTons] = useState(60);
  const [months, setMonths] = useState(4);
  const person = staffSales[sel];
  const curMonthly = person.planTons / 3;
  const propMonthly = (person.planTons + addTons) / months;
  const totalPlan = staffSales.reduce((a, s) => a + s.planTons, 0);
  const companyByMonth = staffSales[0].months.map((_, i) => ({
    m: staffSales[0].months[i].m,
    ["Азиза Ю."]: staffSales[0].months[i].t,
    ["Санжар Т."]: staffSales[1].months[i].t,
    ["Дилноза К."]: staffSales[2].months[i].t,
  }));
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <Card title="Продажи по тоннажу, т/мес (по продажникам)">
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyByMonth} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 12, fill: C.slate }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.slate }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v, n) => [v + " т", n]} />
                  <Bar dataKey="Азиза Ю." stackId="a" fill={C.teal} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Санжар Т." stackId="a" fill={C.sky} />
                  <Bar dataKey="Дилноза К." stackId="a" fill={C.amber} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.teal }} />Азиза Ю.</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.sky }} />Санжар Т.</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: C.amber }} />Дилноза К.</span>
            </div>
          </Card>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 text-slate-300 text-xs mb-1"><Scale size={15} /> План → закупка</div>
          <div className="text-sm text-slate-300">Совокупный план продажников на квартал:</div>
          <div className="text-3xl font-bold mt-1">{totalPlan} т</div>
          <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm"><div className="text-slate-300 text-xs">Рекомендуемая закупка (с запасом 10%)</div><div className="font-bold text-indigo-300 text-xl">≈ {Math.round(totalPlan * 1.1)} т</div></div>
          <p className="text-xs text-slate-400 mt-3">Продажники дают предварительный план в тоннах на 3 месяца — из суммы этих планов формируется объём закупки.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100"><h3 className="font-semibold text-slate-800 text-sm">Предложение руководителя по плану</h3></div>
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">Продажник</div>
            <div className="space-y-1">
              {staffSales.map((s, i) => (
                <button key={s.name} onClick={() => setSel(i)} className={"w-full text-left px-3 py-2 rounded-xl text-sm border " + (i === sel ? "bg-indigo-50 border-indigo-200 font-medium text-slate-800" : "border-transparent hover:bg-slate-50 text-slate-600")}>
                  {s.name}<span className="float-right text-xs text-slate-400">план {s.planTons} т</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Добавить к плану, тонн</label>
            <input type="number" value={addTons} onChange={(e) => setAddTons(Math.max(0, Number(e.target.value) || 0))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 sm:py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[44px]" />
            <label className="block text-xs font-medium text-slate-500 mb-1">Растянуть на срок, мес</label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((mo) => (
                <button key={mo} onClick={() => setMonths(mo)} className={"flex-1 py-2.5 sm:py-2 rounded-xl text-sm font-medium border min-h-[44px] sm:min-h-0 " + (months === mo ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{mo}</button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 sm:p-4">
            <div className="text-sm text-slate-500">Предложение для <b className="text-slate-800">{person.name}</b></div>
            <div className="mt-3 flex items-center justify-between text-sm"><span className="text-slate-500">Сейчас</span><span className="font-semibold text-slate-700">{curMonthly.toFixed(0)} т/мес · 3 мес</span></div>
            <div className="mt-1 flex items-center justify-between text-sm"><span className="text-slate-500">Предложение</span><span className="font-bold text-indigo-700">{propMonthly.toFixed(0)} т/мес · {months} мес</span></div>
            <div className="mt-2 text-xs text-slate-500">Итого объём: <b>{person.planTons + addTons} т</b> вместо {person.planTons} т, но темп {propMonthly < curMonthly ? "ниже" : "выше"} — {propMonthly.toFixed(0)} против {curMonthly.toFixed(0)} т/мес.</div>
            <button className="mt-3 w-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2.5 sm:py-2 rounded-xl min-h-[44px]">Отправить предложение</button>
          </div>
        </div>
      </div>

      <TableScreen title="Планы сотрудников и выполнение (в деньгах)">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Сотрудник</Th><Th right>План (квартал)</Th><Th right>Выполнено</Th><Th>Прогресс</Th><Th right>Лимит скидки</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => {
              const pct = Math.round((s.done / s.plan) * 100);
              return (
                <tr key={s.name} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{s.name}</Td>
                  <Td right>{money(s.plan)}</Td>
                  <Td right className="font-medium">{money(s.done)}</Td>
                  <Td>
                    <div className="flex items-center gap-2 w-32 sm:w-44">
                      <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden"><div className={"h-full rounded-full " + (pct >= 90 ? "bg-emerald-500" : pct >= 60 ? "bg-indigo-500" : "bg-amber-400")} style={{ width: pct + "%" }} /></div>
                      <span className="text-xs text-slate-500 w-9 text-right shrink-0">{pct}%</span>
                    </div>
                  </Td>
                  <Td right><span className="inline-flex items-center gap-1 text-slate-700"><Percent size={13} className="text-indigo-500" />до {s.limit}%</span></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScreen>
    </div>
  );
}

// ---------- Скидки ----------
function DiscountScreen() {
  const [qty, setQty] = useState(120);
  const [orderSum, setOrderSum] = useState(30000000);
  const [emp, setEmp] = useState(0);
  const tier = discountTiers.find((t) => qty >= t.from && qty <= t.to) || discountTiers[0];
  const limit = staff[emp].limit;
  const applied = Math.min(tier.pct, limit);
  const discountAmount = Math.round(orderSum * applied / 100);
  const finalSum = orderSum - discountAmount;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      <div className="xl:col-span-2">
        <TableScreen title="Скидка от количества (применяется к сумме заказа)"
          foot={<div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">Право на скидку и её размер зависят от количества в заказе; сам процент применяется к общей сумме заказа.</div>}>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Количество в заказе (меш / канистр)</Th><Th right>Скидка на сумму заказа</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {discountTiers.map((t, i) => (
                <tr key={i} className={qty >= t.from && qty <= t.to ? "bg-indigo-50" : "hover:bg-slate-50"}><Td className="font-medium text-slate-800">{t.to === Infinity ? t.from + " и более" : t.from + " – " + t.to}</Td><Td right className="font-semibold text-indigo-700">{t.pct}%</Td></tr>
              ))}
            </tbody>
          </table>
        </TableScreen>
      </div>
      <Card title="Калькулятор скидки">
        <label className="block text-xs font-medium text-slate-500 mb-1">Количество в заказе</label>
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value) || 0)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 sm:py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[44px]" />
        <label className="block text-xs font-medium text-slate-500 mb-1">Сумма заказа, сум</label>
        <input type="number" value={orderSum} onChange={(e) => setOrderSum(Number(e.target.value) || 0)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 sm:py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[44px]" />
        <label className="block text-xs font-medium text-slate-500 mb-1">Сотрудник</label>
        <select value={emp} onChange={(e) => setEmp(Number(e.target.value))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 sm:py-2 text-sm mb-5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[44px]">{staff.map((s, i) => <option key={i} value={i}>{s.name} (лимит {s.limit}%)</option>)}</select>
        <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-300"><span>Порог по количеству</span><span>{tier.pct}%</span></div>
          <div className="flex justify-between text-sm text-slate-300"><span>Лимит сотрудника</span><span>{limit}%</span></div>
          <div className="flex justify-between items-center border-t border-slate-700 pt-2"><span className="font-medium">Скидка</span><span className="text-2xl font-bold text-indigo-400">{applied}%</span></div>
          <div className="flex justify-between text-sm text-slate-300 pt-1"><span>Сумма скидки</span><span className="text-rose-300">− {money(discountAmount)}</span></div>
          <div className="flex justify-between items-center border-t border-slate-700 pt-2"><span className="font-medium">К оплате</span><span className="font-bold text-emerald-400">{money(finalSum)}</span></div>
        </div>
      </Card>
    </div>
  );
}

// ---------- Расходы ----------
function ExpensesScreen() {
  const totalExp = expenses.reduce((a, b) => a + b.sum, 0);
  const gross = pnl.revenue - pnl.cogs;
  const net = gross - totalExp;
  const line = (label, val, opts = {}) => (
    <div className={"flex justify-between py-2 " + (opts.border ? "border-t border-slate-100" : "")}><span className={opts.strong ? "font-semibold text-slate-800" : "text-slate-500"}>{label}</span><span className={"font-semibold " + (opts.tone || "text-slate-800")}>{opts.minus ? "− " : ""}{money(val)}</span></div>
  );
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      <Card title="Расходы за июнь" action={<AddBtn label="Добавить расход" />}>
        <table className="w-full"><tbody className="divide-y divide-slate-100">
          {expenses.map((e) => (<tr key={e.name}><Td className="font-medium text-slate-800">{e.name}<div className="text-xs text-slate-400 font-normal">{e.cat}</div></Td><Td right className="font-semibold">{money(e.sum)}</Td></tr>))}
          <tr className="bg-slate-50"><Td className="font-bold text-slate-800">Итого расходов</Td><Td right className="font-bold text-slate-800">{money(totalExp)}</Td></tr>
        </tbody></table>
      </Card>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-3">Финансовый итог месяца</h3>
        {line("Выручка", pnl.revenue, { tone: "text-emerald-600" })}
        {line("Себестоимость проданного (COGS)", pnl.cogs, { minus: true, tone: "text-rose-500" })}
        {line("Валовая прибыль", gross, { border: true, strong: true })}
        {line("Операционные расходы", totalExp, { minus: true, tone: "text-rose-500" })}
        <div className="flex justify-between items-center border-t-2 border-slate-800 mt-2 pt-3"><span className="font-bold text-slate-800">Чистая прибыль</span><span className="text-2xl font-extrabold text-emerald-600 flex items-center gap-1"><TrendingUp size={20} />{money(net)}</span></div>
        <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-slate-400">Рентабельность</div><div className="font-bold text-slate-800">{((net / pnl.revenue) * 100).toFixed(1)}%</div></div><div className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-slate-400">К мае</div><div className="font-bold text-emerald-600 flex items-center gap-1"><TrendingUp size={14} />+8%</div></div></div>
      </div>
    </div>
  );
}

// ---------- Календарь (День / Неделя / Месяц) ----------
function MiniMonth({ year, month }) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((offset + days) / 7);
  const cells = [];
  for (let w = 0; w < weeks; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) { const dn = w * 7 + i - offset + 1; row.push(dn >= 1 && dn <= days ? dn : null); }
    cells.push(row);
  }
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-slate-700 mb-1">{MON_FULL[month]} {year}</div>
      <table className="w-full text-center"><thead><tr>{DOW.map((d, i) => <th key={d} className={"py-1 text-xs font-medium " + (i >= 5 ? "text-rose-400" : "text-slate-400")}>{d}</th>)}</tr></thead>
        <tbody>{cells.map((row, wi) => (<tr key={wi}>{row.map((dn, i) => {
          const isToday = dn && year === TODAY.getFullYear() && month === TODAY.getMonth() && dn === TODAY.getDate();
          return <td key={i} className="py-0.5"><div className={"w-6 h-6 mx-auto flex items-center justify-center rounded-full text-xs " + (isToday ? "bg-indigo-600 text-white font-semibold" : dn ? (i >= 5 ? "text-rose-400 hover:bg-slate-100" : "text-slate-600 hover:bg-slate-100") : "text-transparent")}>{dn || "·"}</div></td>;
        })}</tr>))}</tbody>
      </table>
    </div>
  );
}
function CalendarScreen() {
  const [view, setView] = useState("week");
  const ROW = 58, START = 9, END = 18;
  const hours = []; for (let h = START; h <= END; h++) hours.push(h);
  const tones = { sky: "bg-sky-50 border-sky-200 text-sky-800", amber: "bg-amber-50 border-amber-200 text-amber-800", emerald: "bg-emerald-50 border-emerald-200 text-emerald-800", rose: "bg-rose-50 border-rose-200 text-rose-800" };
  const monday = mondayOf(TODAY);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(monday, i));
  const todayIdx = (TODAY.getDay() + 6) % 7;
  const hhmm = (x) => Math.floor(x) + ":" + (x % 1 ? "30" : "00");

  const Toolbar = (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-100">
      <AddBtn label="Создать" />
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"><ChevronLeft size={16} /></button>
        <button className="text-sm font-medium text-slate-700 px-3 py-2 sm:py-1.5 rounded-xl hover:bg-slate-100 min-h-[44px] sm:min-h-0">Сегодня</button>
        <button className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"><ChevronRight size={16} /></button>
      </div>
      <div className="text-sm font-semibold text-slate-700">18 июня 2026</div>
      <div className="ml-auto flex rounded-xl border border-slate-200 overflow-hidden">
        {[["day", "День"], ["week", "Неделя"], ["month", "Месяц"]].map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} className={"px-3 py-2 sm:py-1.5 text-sm min-h-[44px] sm:min-h-0 " + (view === v ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}>{l}</button>
        ))}
      </div>
    </div>
  );

  const TimeGrid = ({ days }) => (
    <div className="overflow-x-auto">
      <div style={{ minWidth: days.length > 1 ? 720 : 360 }}>
        <div className="flex border-b border-slate-100">
          <div className="w-12 shrink-0" />
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0,1fr))` }}>
            {days.map((d, i) => {
              const idx = (d.getDay() + 6) % 7;
              const isT = sameDay(d, TODAY);
              return <div key={i} className={"text-center py-2 border-l border-slate-100 " + (isT ? "bg-indigo-50" : "")}><div className="text-xs text-slate-400">{DOW[idx]}</div><div className={"text-sm font-semibold " + (isT ? "text-indigo-700" : "text-slate-700")}>{d.getDate()} {MON_SHORT[d.getMonth()]}</div></div>;
            })}
          </div>
        </div>
        <div className="flex">
          <div className="w-12 shrink-0 relative" style={{ height: (END - START) * ROW }}>
            {hours.map((h, i) => <div key={h} className="absolute text-xs text-slate-400 right-1" style={{ top: i * ROW - 6 }}>{h}:00</div>)}
          </div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0,1fr))` }}>
            {days.map((d, di) => {
              const idx = (d.getDay() + 6) % 7;
              const evs = calEvents.filter((e) => e.day === idx);
              return (
                <div key={di} className={"relative border-l border-slate-100 " + (sameDay(d, TODAY) ? "bg-indigo-50" : "")} style={{ height: (END - START) * ROW }}>
                  {hours.map((h, i) => <div key={i} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: i * ROW }} />)}
                  {evs.map((ev, i) => (
                    <div key={i} className={"absolute left-0.5 right-0.5 rounded-md border px-1.5 py-1 overflow-hidden shadow-sm " + tones[ev.tone]} style={{ top: (ev.s - START) * ROW + 1, height: (ev.e - ev.s) * ROW - 2 }}>
                      <div className="text-xs font-semibold leading-tight">{hhmm(ev.s)}–{hhmm(ev.e)}</div>
                      <div className="text-xs leading-tight">{ev.title}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const MonthView = () => {
    const y = TODAY.getFullYear(), mo = TODAY.getMonth();
    const first = new Date(y, mo, 1); const offset = (first.getDay() + 6) % 7;
    const dim = new Date(y, mo + 1, 0).getDate(); const weeks = Math.ceil((offset + dim) / 7);
    return (
      <div className="p-4">
        <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400 mb-1">{DOW.map((d, i) => <div key={d} className={i >= 5 ? "text-rose-400" : ""}>{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: weeks * 7 }).map((_, cellIdx) => {
            const dn = cellIdx - offset + 1;
            const valid = dn >= 1 && dn <= dim;
            const date = valid ? new Date(y, mo, dn) : null;
            const idx = valid ? (date.getDay() + 6) % 7 : -1;
            const evs = valid ? calEvents.filter((e) => e.day === idx) : [];
            const isT = valid && dn === TODAY.getDate();
            return (
              <div key={cellIdx} className={"min-h-20 sm:h-24 rounded-xl border p-1 sm:p-1.5 " + (valid ? "border-slate-100 bg-white" : "border-transparent bg-slate-50")}>
                {valid && <div className={"text-xs font-semibold mb-1 " + (isT ? "text-white bg-indigo-600 w-5 h-5 rounded-full flex items-center justify-center" : idx >= 5 ? "text-rose-400" : "text-slate-500")}>{dn}</div>}
                <div className="space-y-0.5 hidden sm:block">
                  {evs.slice(0, 2).map((ev, i) => <div key={i} className={"text-xs rounded px-1 py-0.5 truncate border " + tones[ev.tone]}>{ev.title}</div>)}
                  {evs.length > 2 && <div className="text-xs text-slate-400 px-1">+{evs.length - 2} ещё</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Мой календарь</h3><span className="text-xs text-slate-400">Сегодня, 18 июня 2026 г.</span></div>
      {Toolbar}
      <div className="flex">
        <div className="flex-1 min-w-0">
          {view === "week" && <TimeGrid days={weekDays} />}
          {view === "day" && <TimeGrid days={[TODAY]} />}
          {view === "month" && <MonthView />}
        </div>
        <div className="w-64 shrink-0 border-l border-slate-100 p-4 hidden lg:block">
          <MiniMonth year={2026} month={5} />
          <MiniMonth year={2026} month={6} />
          <div className="text-xs text-indigo-600 font-medium">Сегодня, 18 июня 2026 г.</div>
        </div>
      </div>
    </div>
  );
}

// ---------- v2: предложенные функции BRONUS ----------
const ProposedBanner = ({ text }) => (
  <div className="mb-4 sm:mb-5 flex items-start sm:items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
    <Sparkles size={16} className="text-amber-500 shrink-0" /><span><b>Предложено BRONUS</b> — сверх исходного запроса. {text}</span>
  </div>
);
function Toggle({ on }) {
  const [v, setV] = useState(on);
  return <button onClick={() => setV(!v)} className={"w-9 h-5 rounded-full relative transition-colors " + (v ? "bg-indigo-500" : "bg-slate-300")}><span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " + (v ? "left-4" : "left-0.5")} /></button>;
}

const purchaseRows = [
  { name: "Сода кальцинированная, меш. 25 кг", avail: 90, min: 140, demand: 220, supplier: "Andijon Kimyo", rec: 270 },
  { name: "Диоксид титана, меш. 25 кг", avail: 1, min: 40, demand: 60, supplier: "Sichuan Titanium", rec: 100 },
  { name: "Перекись водорода 37%, канистра", avail: 430, min: 180, demand: 500, supplier: "Kazan Chem", rec: 250 },
];
function PurchaseScreen() {
  return (
    <div>
      <ProposedBanner text="Автозакупка: план продаж в тоннах → потребность → дефицит → черновик заявки поставщику." />
      <TableScreen title="Рекомендации к закупке (по плану и остаткам)" action={<button className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 sm:py-1.5 rounded-xl inline-flex items-center gap-1 min-h-[44px] sm:min-h-0"><PackagePlus size={14} /> Сформировать заявки поставщикам</button>}
        foot={<div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">«Спрос» берётся из плана продаж (экран «Статистика продаж»). Система сама предлагает объём закупки и поставщика — остаётся подтвердить заявку.</div>}>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Химпродукт</Th><Th right>Доступно</Th><Th right>min</Th><Th right>Спрос (план)</Th><Th right>Дефицит</Th><Th right>К закупке</Th><Th>Поставщик</Th><Th right>Действие</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {purchaseRows.map((r) => {
              const deficit = Math.max(0, r.min - r.avail);
              return (
                <tr key={r.name} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{r.name}</Td>
                  <Td right className={r.avail < r.min ? "text-rose-600 font-semibold" : "text-slate-600"}>{fmt(r.avail)}</Td>
                  <Td right className="text-slate-400">{fmt(r.min)}</Td>
                  <Td right className="text-slate-600">{fmt(r.demand)}</Td>
                  <Td right>{deficit > 0 ? <Badge tone="rose">−{fmt(deficit)}</Badge> : <span className="text-slate-300">—</span>}</Td>
                  <Td right className="font-bold text-indigo-700">{fmt(r.rec)}</Td>
                  <Td className="text-slate-500">{r.supplier}</Td>
                  <Td right><button className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 sm:py-1 rounded-xl min-h-[44px] sm:min-h-0">Заявка</button></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScreen>
    </div>
  );
}

const notifications = [
  { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50", text: "Сода кальцинированная ниже min stock (90 < 140)", time: "5 мин назад" },
  { icon: Clock, tone: "text-amber-600 bg-amber-50", text: "Перекись водорода — срок годности < 90 дней (до 20.08.2026)", time: "1 ч назад" },
  { icon: CalendarClock, tone: "text-amber-600 bg-amber-50", text: "Бронь БР-0309 истекает завтра (19.06)", time: "2 ч назад" },
  { icon: FileText, tone: "text-sky-600 bg-sky-50", text: "Выписка ВП-5511 не оплачена — просрочка 3 дня", time: "сегодня" },
  { icon: ShieldCheck, tone: "text-emerald-600 bg-emerald-50", text: "Получен CoA для партии перекиси HP-20260612", time: "вчера" },
];
function NotificationsScreen() {
  const channels = [["Ниже min stock", true], ["Срок годности < 90 дней", true], ["Просроченные брони", true], ["Неоплаченные выписки", true], ["Поступление CoA / SDS", false]];
  return (
    <div>
      <ProposedBanner text="Уведомления в Telegram по ключевым событиям — руководитель и ответственные узнают сразу." />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <Card title="Лента событий">
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className={"w-8 h-8 rounded-xl flex items-center justify-center shrink-0 " + n.tone}><n.icon size={16} /></span>
                  <div className="flex-1"><div className="text-sm text-slate-800">{n.text}</div><div className="text-xs text-slate-400">{n.time}</div></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card title="Каналы уведомлений">
          <div className="flex items-center gap-2 rounded-xl bg-sky-50 text-sky-700 px-3 py-2 text-sm mb-4"><Send size={15} /> Telegram-бот подключён</div>
          <div className="space-y-3">
            {channels.map(([label, on], i) => (
              <div key={i} className="flex items-center justify-between"><span className="text-sm text-slate-700">{label}</span><Toggle on={on} /></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const bonusMargins = { "Азиза Ю.": 88000000, "Санжар Т.": 82000000, "Дилноза К.": 30000000 };
function BonusScreen() {
  return (
    <div>
      <ProposedBanner text="Бонус считается от выполнения плана и принесённой маржи — а не просто от оборота." />
      <TableScreen title="Расчёт бонусов менеджеров"
        foot={<div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">Ставка бонуса зависит от выполнения плана: ≥ 90% → 3%, ≥ 70% → 2%, иначе 1% от принесённой маржи. Мотивирует продавать с прибылью, а не любой ценой.</div>}>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Сотрудник</Th><Th right>Выполнение плана</Th><Th right>Принесённая маржа</Th><Th right>Ставка</Th><Th right>Бонус</Th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s) => {
              const pct = Math.round((s.done / s.plan) * 100);
              const rate = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
              const margin = bonusMargins[s.name];
              const bonus = Math.round(margin * rate / 100);
              return (
                <tr key={s.name} className="hover:bg-slate-50">
                  <Td className="font-medium text-slate-800">{s.name}</Td>
                  <Td right><Badge tone={pct >= 90 ? "green" : pct >= 70 ? "teal" : "amber"}>{pct}%</Badge></Td>
                  <Td right className="text-slate-600">{money(margin)}</Td>
                  <Td right className="font-medium text-slate-700">{rate}%</Td>
                  <Td right className="font-bold text-emerald-600">{money(bonus)}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScreen>
    </div>
  );
}

const roles = [
  { role: "Руководитель / владелец", users: 1, rights: "Полный доступ, дашборды, инвесторы, планы" },
  { role: "Менеджер по продажам", users: 3, rights: "Продажи, брони, скидки в лимите" },
  { role: "Кладовщик", users: 2, rights: "Приход/расход, инвентаризация, сроки годности" },
  { role: "Закупщик", users: 1, rights: "Партии, поставщики, заявки на закупку" },
  { role: "Бухгалтер", users: 1, rights: "Документы, Didox, акты сверки" },
];
const auditLog = [
  { t: "18.06 11:02", u: "Азиза Ю.", a: "Выписка ВП-5518 (перекись, 60 канистр)" },
  { t: "18.06 09:14", u: "Ботир Р.", a: "Приход №2042 (сода каустическая, +400 меш)" },
  { t: "17.06 16:41", u: "Азиза Ю.", a: "Скидка 4% применена к заказу «Kimyo Sanoat»" },
  { t: "17.06 15:20", u: "Админ", a: "Смена ответственного по «Buxoro Teks»" },
  { t: "16.06 10:05", u: "Дилноза К.", a: "Создана бронь БР-0309 (диоксид титана)" },
];
function AccessScreen() {
  return (
    <div>
      <ProposedBanner text="Роли и права доступа + журнал действий — видно, кто что менял. Критично, когда операторов несколько." />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <TableScreen title="Роли и права" action={<AddBtn label="Роль" />}>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100"><tr><Th>Роль</Th><Th right>Польз.</Th><Th>Права</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((r) => (
                <tr key={r.role} className="hover:bg-slate-50"><Td className="font-medium text-slate-800">{r.role}</Td><Td right><Badge tone="teal">{r.users}</Badge></Td><Td className="text-slate-500 text-xs">{r.rights}</Td></tr>
              ))}
            </tbody>
          </table>
        </TableScreen>
        <Card title="Журнал действий">
          <div className="space-y-3">
            {auditLog.map((l, i) => (
              <div key={i} className="flex gap-3 items-start">
                <History size={15} className="text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1"><div className="text-sm text-slate-800">{l.a}</div><div className="text-xs text-slate-400">{l.u} · {l.t}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---------- объединённые экраны (вкладки) ----------
function TabsScreen({ tabs }) {
  const [t, setT] = useState(0);
  return (
    <div>
      <div className="flex gap-1 mb-4 bg-white border border-slate-200 rounded-xl p-1 w-full overflow-x-auto">
        {tabs.map((tb, i) => (
          <button key={i} onClick={() => setT(i)} className={"flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 " + (t === i ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50")}>
            {tb.label}{tb.neu && <span className={"text-xs font-bold px-1.5 rounded " + (t === i ? "bg-white/20 text-white" : "bg-amber-400 text-slate-900")}>NEW</span>}
          </button>
        ))}
      </div>
      {tabs[t].content}
    </div>
  );
}
const CatalogCombined = () => <TabsScreen tabs={[{ label: "Товары", content: <CatalogScreen /> }, { label: "Партии", content: <BatchesScreen /> }]} />;
const WarehouseCombined = () => <TabsScreen tabs={[{ label: "Остатки", content: <WarehouseScreen /> }, { label: "Приход и расход", content: <MovementsScreen /> }, { label: "Инвентаризация", content: <InventoryScreen /> }]} />;
const FinanceCombined = () => <TabsScreen tabs={[{ label: "Расходы и прибыль", content: <ExpensesScreen /> }, { label: "Инвесторы", content: <InvestorsScreen /> }]} />;
const SuppliersCombined = () => <TabsScreen tabs={[{ label: "Поставщики", content: <SuppliersScreen /> }, { label: "Заявки на закупку", content: <PurchaseScreen />, neu: true }]} />;
const SalesTeamCombined = () => <TabsScreen tabs={[{ label: "Статистика продаж", content: <SalesStatsScreen /> }, { label: "Мотивация · бонусы", content: <BonusScreen />, neu: true }, { label: "Настройка скидок", content: <DiscountScreen /> }]} />;

// ---------- shell ----------
const NAV_GROUPS = [
  { title: "Обзор", items: [
    { id: "dash", label: "Дашборд", icon: LayoutDashboard, screen: Dashboard },
    { id: "cat", label: "Каталог продукции", icon: PackageSearch, screen: CatalogCombined },
  ]},
  { title: "Склад и продажи", items: [
    { id: "wh", label: "Склад", icon: Warehouse, screen: WarehouseCombined },
    { id: "res", label: "Бронь → Выписка", icon: CalendarClock, screen: ReservationsScreen },
    { id: "crm", label: "Клиенты", icon: Users, screen: ClientsCombined },
    { id: "prop", label: "Предложения от клиентов", icon: MessageSquarePlus, screen: ProposalsScreen },
    { id: "supp", label: "Поставщики", icon: Truck, screen: SuppliersCombined, neu: true },
  ]},
  { title: "Финансы и аналитика", items: [
    { id: "fin", label: "Финансы", icon: PiggyBank, screen: FinanceCombined },
    { id: "stats", label: "Продажники", icon: BarChart3, screen: SalesTeamCombined, neu: true },
    { id: "price", label: "Цены конкурентов", icon: LineIcon, screen: PricesScreen },
  ]},
  { title: "Система", items: [
    { id: "access", label: "Доступ и журнал", icon: KeyRound, screen: AccessScreen, neu: true },
    { id: "cal", label: "Календарь", icon: CalendarDays, screen: CalendarScreen },
  ]},
];
const NAV = NAV_GROUPS.flatMap((g) => g.items);

function NotifBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="relative w-10 h-10 sm:w-9 sm:h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 shrink-0" aria-label="Notifications">
        <Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-lg z-10 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"><span className="font-semibold text-slate-800 text-sm">Уведомления</span><Badge tone="amber">предложено BRONUS</Badge></div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-2.5 px-4 py-2.5">
                <span className={"w-7 h-7 rounded-xl flex items-center justify-center shrink-0 " + n.tone}><n.icon size={14} /></span>
                <div><div className="text-xs text-slate-800 leading-snug">{n.text}</div><div className="text-xs text-slate-400 mt-0.5">{n.time}</div></div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-slate-50 flex items-center gap-2 text-xs text-slate-500"><Send size={13} className="text-sky-500" /> Также дублируются в Telegram-бот</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("dash");
  const [collapsed, setCollapsed] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const current = NAV.find((n) => n.id === active);
  const Screen = current.screen;

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        closeSidebar();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    closeSidebar();
  }, [active, closeSidebar]);

  const handleSetActive = (id) => {
    setActive(id);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      <aside
        ref={sidebarRef}
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-label="Main navigation"
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-sm">B</div>
            <div><div className="text-white font-bold tracking-tight leading-none text-lg">BRONUS</div><div className="text-xs text-slate-500 mt-0.5">Оптовая химия</div></div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
          {NAV_GROUPS.map((g) => {
            const isCollapsed = collapsed[g.title];
            return (
              <div key={g.title} className="mb-1">
                <button onClick={() => setCollapsed((c) => ({ ...c, [g.title]: !c[g.title] }))} className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-300">
                  {g.title}<ChevronRight size={13} className={"transition-transform " + (isCollapsed ? "" : "rotate-90")} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mb-2">
                    {g.items.map((n) => {
                      const on = n.id === active;
                      return (
                        <button key={n.id} onClick={() => handleSetActive(n.id)} className={"w-full flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded-xl text-sm transition-colors " + (on ? "bg-indigo-500 text-slate-900 font-semibold" : "hover:bg-slate-800 hover:text-white")}>
                          <n.icon size={16} className={on ? "text-slate-900" : "text-slate-400"} /><span className="flex-1 text-left">{n.label}</span>
                          {n.neu && <span className={"text-xs font-bold px-1.5 py-0.5 rounded " + (on ? "bg-slate-900 text-amber-300" : "bg-amber-400 text-slate-900")}>NEW</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-2 text-xs"><ShieldCheck size={15} className="text-emerald-400 shrink-0" /><span>Didox — подключён</span></div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 py-3 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 truncate hidden sm:block">Компания BRONUS · версия 2 — расширенная (NEW = предложено нами)</div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">{current.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 text-sm text-slate-400 w-56"><Search size={15} /> <span className="truncate">Поиск по продукту, партии…</span></div>
            <NotifBell />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm shrink-0">АК</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"><Screen go={handleSetActive} /></main>
      </div>
    </div>
  );
}
