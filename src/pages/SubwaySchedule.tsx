import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Bus, CalendarDays, Clock, Timer, Train } from 'lucide-react';
import { changpingLineSchedules } from '@/data/changpingLine';

type DayType = '工作日' | '双休日';
type DirectionKey = 'morning' | 'evening';
type TabKey = 'subway' | 'bus';

interface SubwayEntry {
  minute: number;
  terminus: string;
}

interface SubwayDataset {
  station: string;
  line: string;
  direction: string;
  type: DayType;
  terminus_info: Record<string, string>;
  timetable: Record<string, readonly SubwayEntry[]>;
}

interface SubwayTrain {
  station: string;
  directionLabel: string;
  destination: string;
  time: string;
  hour: number;
  minute: number;
  minutesLeft: number;
  isPreferred: boolean;
  isDongguanDeparture: boolean;
  isFilteredShortTurn: boolean;
  status: string;
}

interface BusSchedule {
  hour: number;
  minute: number;
  time: string;
}

interface BusRoute {
  name: string;
  from: string;
  to: string;
  gradientFrom: string;
  gradientTo: string;
  schedules: BusSchedule[];
}

const TRAVEL_TIME_MIN = 8;
const TRAVEL_TIME_MAX = 10;
const changpingStations = [
  '昌平西山口',
  '十三陵景区',
  '昌平',
  '昌平东关',
  '北邵洼',
  '南邵',
  '沙河高教园',
  '沙河',
  '巩华城',
  '朱辛庄',
  '生命科学园',
  '西二旗',
  '清河站',
  '朱房北',
  '清河小营桥',
  '学知园',
  '六道口',
  '学院桥',
  '西土城',
  '蓟门桥',
] as const;
const homeStationIndex = changpingStations.indexOf('南邵');
const officeStationIndex = changpingStations.indexOf('西二旗');

const directionOptions: Record<DirectionKey, { label: string; station: string; targetText: string }> = {
  morning: {
    label: '上班去公司',
    station: '南邵站',
    targetText: '开往蓟门桥站方向',
  },
  evening: {
    label: '下班回家',
    station: '西二旗站',
    targetText: '开往昌平西山口站方向',
  },
};

const subwayDatasets = changpingLineSchedules as readonly SubwayDataset[];

const busRoutes: BusRoute[] = [
  {
    name: '方舟→百度大厦',
    from: '方舟大厦',
    to: '百度大厦',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-cyan-500',
    schedules: [
      { hour: 10, minute: 25, time: '10:25' },
      { hour: 11, minute: 0, time: '11:00' },
      { hour: 11, minute: 30, time: '11:30' },
      { hour: 12, minute: 0, time: '12:00' },
      { hour: 13, minute: 0, time: '13:00' },
      { hour: 13, minute: 30, time: '13:30' },
      { hour: 14, minute: 0, time: '14:00' },
      { hour: 14, minute: 30, time: '14:30' },
      { hour: 15, minute: 0, time: '15:00' },
      { hour: 15, minute: 30, time: '15:30' },
      { hour: 16, minute: 0, time: '16:00' },
      { hour: 16, minute: 30, time: '16:30' },
      { hour: 17, minute: 0, time: '17:00' },
      { hour: 17, minute: 30, time: '17:30' },
      { hour: 18, minute: 0, time: '18:00' },
      { hour: 18, minute: 30, time: '18:30' },
      { hour: 19, minute: 0, time: '19:00' },
      { hour: 19, minute: 30, time: '19:30' },
      { hour: 20, minute: 0, time: '20:00' },
      { hour: 20, minute: 30, time: '20:30' },
      { hour: 21, minute: 0, time: '21:00' },
      { hour: 21, minute: 30, time: '21:30' },
      { hour: 22, minute: 0, time: '22:00' },
    ],
  },
  {
    name: '百度大厦→方舟',
    from: '百度大厦',
    to: '方舟大厦',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-fuchsia-500',
    schedules: [
      { hour: 8, minute: 45, time: '08:45' },
      { hour: 9, minute: 0, time: '09:00' },
      { hour: 9, minute: 15, time: '09:15' },
      { hour: 9, minute: 30, time: '09:30' },
      { hour: 10, minute: 0, time: '10:00' },
      { hour: 10, minute: 20, time: '10:20' },
      { hour: 10, minute: 45, time: '10:45' },
      { hour: 11, minute: 15, time: '11:15' },
      { hour: 11, minute: 45, time: '11:45' },
      { hour: 13, minute: 15, time: '13:15' },
      { hour: 13, minute: 45, time: '13:45' },
      { hour: 14, minute: 15, time: '14:15' },
      { hour: 14, minute: 45, time: '14:45' },
      { hour: 15, minute: 15, time: '15:15' },
      { hour: 15, minute: 45, time: '15:45' },
      { hour: 16, minute: 15, time: '16:15' },
      { hour: 16, minute: 45, time: '16:45' },
      { hour: 17, minute: 15, time: '17:15' },
      { hour: 17, minute: 45, time: '17:45' },
    ],
  },
];

function getDefaultDirection(date: Date): DirectionKey {
  return date.getHours() < 12 ? 'morning' : 'evening';
}

function getDayType(date: Date): DayType {
  const day = date.getDay();
  return day === 0 || day === 6 ? '双休日' : '工作日';
}

function getDefaultTab(date: Date): TabKey {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= 9 * 60 + 35 && minutes <= 17 * 60 + 50 ? 'bus' : 'subway';
}

function getTrainStatus(minutesLeft: number, direction: DirectionKey, isPreferred: boolean): string {
  if (direction === 'evening') {
    return isPreferred ? '可到南邵' : '短线车';
  }
  if (!isPreferred) return '普通班次';
  if (minutesLeft < 0) return '已过站';
  if (minutesLeft < TRAVEL_TIME_MIN) return '来不及了';
  if (minutesLeft <= TRAVEL_TIME_MAX) return '赶紧出发';
  if (minutesLeft <= 15) return '可以准备';
  return '时间充裕';
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatCountdown(seconds: number) {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatMinutesLeft(minutesLeft: number) {
  if (minutesLeft === 0) return '现在';
  if (minutesLeft > 0) return `${minutesLeft} 分钟后`;
  return `${Math.abs(minutesLeft)} 分钟前`;
}

function normalizeStationName(station: string) {
  return station.replace(/站$/, '');
}

function canReachHome(destination: string) {
  const destinationIndex = changpingStations.indexOf(normalizeStationName(destination) as (typeof changpingStations)[number]);
  return destinationIndex >= 0 && destinationIndex <= homeStationIndex;
}

function canReachOffice(destination: string) {
  const destinationIndex = changpingStations.indexOf(normalizeStationName(destination) as (typeof changpingStations)[number]);
  return destinationIndex >= officeStationIndex;
}

function isDongguanDeparture(entry: SubwayEntry) {
  return entry.terminus.startsWith('昌平东关站') && !entry.terminus.includes('通过不停车');
}

function skipsNanShao(entry: SubwayEntry) {
  return entry.terminus.includes('南邵站通过不停车');
}

function getTrainDetail(train: SubwayTrain, direction: DirectionKey) {
  if (direction === 'morning') {
    return train.isDongguanDeparture ? '东关发车 · 南邵上车' : `南邵上车 · 开往 ${train.destination.replace('站', '')}`;
  }
  return `开往 ${train.destination.replace('站', '')}`;
}

function findDataset(dayType: DayType, direction: DirectionKey) {
  const option = directionOptions[direction];
  return subwayDatasets.find(
    item => item.type === dayType && item.station === option.station && item.direction === option.targetText,
  );
}

function buildTrains(dataset: SubwayDataset | undefined, now: Date, direction: DirectionKey) {
  if (!dataset) return [];

  const trains: SubwayTrain[] = [];
  Object.entries(dataset.timetable).forEach(([hourText, entries]) => {
    const hour = Number(hourText);
    entries.forEach(entry => {
      const trainTime = new Date(now);
      trainTime.setHours(hour, entry.minute, 0, 0);
      const minutesLeft = Math.floor((trainTime.getTime() - now.getTime()) / 1000 / 60);
      if (minutesLeft < -10) return;

      const isDongguanDepartureTrain = direction === 'morning' && isDongguanDeparture(entry);
      const isFilteredShortTurn = direction === 'morning' ? skipsNanShao(entry) || !canReachOffice(entry.terminus) : !canReachHome(entry.terminus);
      const isPreferred = direction === 'morning' ? isDongguanDepartureTrain : !isFilteredShortTurn;

      trains.push({
        station: dataset.station,
        directionLabel: directionOptions[direction].label,
        destination: entry.terminus,
        time: `${hourText.padStart(2, '0')}:${entry.minute.toString().padStart(2, '0')}`,
        hour,
        minute: entry.minute,
        minutesLeft,
        isPreferred,
        isDongguanDeparture: isDongguanDepartureTrain,
        isFilteredShortTurn,
        status: getTrainStatus(minutesLeft, direction, isPreferred),
      });
    });
  });

  return trains.sort((a, b) => a.hour - b.hour || a.minute - b.minute || a.destination.localeCompare(b.destination, 'zh-CN'));
}

export default function SubwaySchedule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabKey>(() => getDefaultTab(new Date()));
  const [direction, setDirection] = useState<DirectionKey>(() => getDefaultDirection(new Date()));
  const [dayType, setDayType] = useState<DayType>(() => getDayType(new Date()));
  const [isAutoDirection, setIsAutoDirection] = useState(true);
  const [isAutoTab, setIsAutoTab] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<SubwayTrain | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedBusRoute, setSelectedBusRoute] = useState<BusRoute | null>(null);
  const [selectedBus, setSelectedBus] = useState<BusSchedule | null>(null);
  const [isBusManualMode, setIsBusManualMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setDayType(getDayType(currentTime));
    if (isAutoDirection) setDirection(getDefaultDirection(currentTime));
    if (isAutoTab) setActiveTab(getDefaultTab(currentTime));
  }, [currentTime, isAutoDirection, isAutoTab]);

  const dataset = useMemo(() => findDataset(dayType, direction), [dayType, direction]);
  const availableTrains = useMemo(() => buildTrains(dataset, currentTime, direction), [dataset, currentTime, direction]);
  const recommendedTrain = availableTrains.find(train => train.isPreferred && train.minutesLeft >= 0) ?? availableTrains.find(train => !train.isFilteredShortTurn && train.minutesLeft >= 0) ?? null;
  const nextTrain = isManualMode && selectedTrain ? selectedTrain : recommendedTrain;
  const countdown = nextTrain
    ? Math.max(0, Math.floor((new Date(currentTime).setHours(nextTrain.hour, nextTrain.minute, 0, 0) - currentTime.getTime()) / 1000))
    : 0;

  const availableBuses = useMemo(() => {
    if (!selectedBusRoute) return [];
    return selectedBusRoute.schedules
      .filter(schedule => {
        const busTime = new Date(currentTime);
        busTime.setHours(schedule.hour, schedule.minute, 0, 0);
        return busTime.getTime() >= currentTime.getTime();
      })
      .sort((a, b) => a.hour - b.hour || a.minute - b.minute);
  }, [currentTime, selectedBusRoute]);
  const recommendedBus = availableBuses[0] ?? null;
  const nextBus = isBusManualMode && selectedBus ? selectedBus : recommendedBus;
  const busCountdown = nextBus
    ? Math.max(0, Math.floor((new Date(currentTime).setHours(nextBus.hour, nextBus.minute, 0, 0) - currentTime.getTime()) / 1000))
    : 0;

  const handleDirectionChange = (nextDirection: DirectionKey) => {
    setDirection(nextDirection);
    setIsAutoDirection(false);
    setIsManualMode(false);
    setSelectedTrain(null);
  };

  const preferredCount = availableTrains.filter(train => train.isPreferred).length;
  const filteredCount = availableTrains.filter(train => train.isFilteredShortTurn).length;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-950 relative font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-slate-950" />
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20 mix-blend-overlay" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative z-10 scrollbar-hide">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-12 pb-2">
            <div className="mx-auto w-4/5 p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>北京时间</span>
              </div>
              <div className="text-4xl font-extrabold text-white tracking-widest tabular-nums drop-shadow-md">
                {formatTime(currentTime)}
              </div>
              <div className="mt-3 flex items-center justify-center text-[11px] font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1">
                  <CalendarDays className="h-3 w-3" />
                  {dayType}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-2 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 shadow-xl">
            {(['subway', 'bus'] as TabKey[]).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsAutoTab(false);
                }}
                className={`flex h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition ${activeTab === tab ? 'border-cyan-300/30 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)]' : 'border-transparent text-slate-300 hover:bg-white/10'}`}
              >
                {tab === 'subway' ? <Train className="h-4 w-4" /> : <Bus className="h-4 w-4" />}
                {tab === 'subway' ? '地铁' : '班车'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'subway' ? (
              <motion.div key="subway" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-4">
                <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
                  <div className="mb-3">
                    <div>
                      <div className="text-sm text-slate-400">当前通勤</div>
                      <div className="text-xl font-bold text-white">{directionOptions[direction].label}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl [contain:paint]">
                    {(['morning', 'evening'] as DirectionKey[]).map(key => (
                      <button
                        key={key}
                        onClick={() => handleDirectionChange(key)}
                        className={`flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl border px-2 text-sm font-semibold ${direction === key ? 'border-cyan-300/40 bg-cyan-400/20 text-cyan-100' : 'border-white/10 bg-slate-950/35 text-slate-300'}`}
                      >
                        <ArrowLeftRight className="h-4 w-4 shrink-0" />
                        <span>{key === 'morning' ? '上班' : '下班'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {nextTrain ? (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="p-5 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-blue-200 text-xs font-medium bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                          <Timer className="w-3.5 h-3.5" />
                          {isManualMode ? '已选班次' : '系统推荐下一班'}
                        </div>
                        {isManualMode && (
                          <button onClick={() => { setIsManualMode(false); setSelectedTrain(null); }} className="text-xs px-3 py-1.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all font-medium backdrop-blur-md">
                            恢复默认
                          </button>
                        )}
                      </div>
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <div className="text-2xl font-bold text-white">{nextTrain.station.replace('站', '')}</div>
                          <p className="mt-1 text-sm text-slate-400">{getTrainDetail(nextTrain, direction)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm mb-1">发车时间</p>
                          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tabular-nums">
                            {nextTrain.time}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-black/40 border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm text-slate-400 mb-2 font-medium tracking-widest">距离发车还有</span>
                        <div className="text-6xl sm:text-7xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          {formatCountdown(countdown)}
                        </div>
                        <div className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${nextTrain.isPreferred ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/20' : 'bg-white/10 text-slate-300 border border-white/10'}`}>
                          {nextTrain.status || '普通班次'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center shadow-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4 shadow-inner">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-300">今日地铁已停运或暂无排班</p>
                  </div>
                )}

                <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
                  <div className="flex items-center justify-between gap-3 mb-4 text-white">
                    <div className="flex items-center gap-2">
                      <Train className="w-5 h-5 text-indigo-400" />
                      <h3 className="font-semibold text-lg tracking-wide">当日剩余时刻</h3>
                    </div>
                    <span className="text-xs text-slate-400">{direction === 'morning' ? `东关发车 ${preferredCount} 班` : `可到家 ${preferredCount} 班`} · 淡化 {filteredCount} 班{direction === 'morning' ? '不可乘' : '不到家'}</span>
                  </div>
                  {availableTrains.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                    {availableTrains.map(train => {
                      const isSelected = isManualMode && selectedTrain?.time === train.time && selectedTrain?.destination === train.destination;
                      const tone = train.isPreferred
                        ? 'border-emerald-400/25 bg-gradient-to-br from-emerald-400/15 to-cyan-400/5 text-white shadow-[0_0_18px_rgba(16,185,129,0.08)]'
                        : train.isFilteredShortTurn
                          ? 'border-white/5 bg-black/20 text-slate-500 opacity-45'
                          : 'border-white/5 bg-black/20 text-slate-300 opacity-75';
                      return (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          key={`${train.time}-${train.destination}`}
                          onClick={() => { setSelectedTrain(train); setIsManualMode(true); }}
                          className={`relative min-h-[92px] overflow-hidden rounded-2xl border p-3 text-left transition-all hover:opacity-100 ${isSelected ? 'border-blue-400/60 bg-blue-500/20 text-blue-100 shadow-[0_0_22px_rgba(59,130,246,0.15)]' : tone}`}
                        >
                          <div className={`absolute -right-6 -top-8 h-20 w-20 rounded-full blur-2xl ${train.isPreferred ? 'bg-emerald-400/20' : 'bg-white/5'}`} />
                          <div className="relative z-10 flex items-start justify-between gap-2">
                            <div className="text-2xl font-black leading-none tabular-nums tracking-normal">{train.time}</div>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${train.isPreferred ? 'border-emerald-300/25 bg-emerald-300/15 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                              {train.isPreferred ? (direction === 'morning' ? '东关发车' : '到家') : train.isFilteredShortTurn ? (direction === 'morning' ? '不可乘' : '不到家') : '普通'}
                            </span>
                          </div>
                          <div className="relative z-10 mt-3 flex items-end justify-between gap-2">
                            <div className="min-w-0">
                              <div className={`truncate text-sm font-semibold ${train.isPreferred ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {direction === 'morning' && train.isDongguanDeparture ? '南邵上车' : train.destination.replace('站', '')}
                              </div>
                              <div className={`mt-0.5 truncate text-[10px] ${train.isPreferred ? 'text-emerald-200/70' : 'text-slate-600'}`}>
                                {train.status || '普通班次'}
                              </div>
                            </div>
                            <div className={`shrink-0 text-right text-[11px] font-semibold ${train.isPreferred ? 'text-cyan-100' : 'text-slate-500'}`}>
                              {formatMinutesLeft(train.minutesLeft)}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-4 text-sm">暂无可用班次</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="bus" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                {!selectedBusRoute ? (
                  <div className="space-y-4">
                    <h2 className="text-white font-semibold text-lg px-2">请选择班车方向</h2>
                    <div className="grid grid-cols-1 gap-4">
                    {busRoutes.map(route => (
                      <motion.div whileTap={{ scale: 0.98 }} key={route.name} onClick={() => { setSelectedBusRoute(route); setIsBusManualMode(false); setSelectedBus(null); }} className="relative overflow-hidden p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl cursor-pointer hover:bg-white/10 transition-all">
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${route.gradientFrom} ${route.gradientTo} opacity-20 blur-2xl`} />
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${route.gradientFrom} ${route.gradientTo} text-white shadow-lg`}><Bus className="h-6 w-6" /></div>
                          <div><div className="text-xl font-bold text-white tracking-wide">{route.name}</div><div className="mt-1 flex items-center gap-2 text-sm text-slate-400"><span>{route.from}</span><span className="opacity-50">→</span><span>{route.to}</span></div></div>
                        </div>
                      </motion.div>
                    ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${selectedBusRoute.gradientFrom} ${selectedBusRoute.gradientTo} text-white shadow-inner`}><Bus className="w-5 h-5" /></div>
                        <div className="font-bold text-white leading-tight">{selectedBusRoute.name}</div>
                      </div>
                      <button onClick={() => setSelectedBusRoute(null)} className="text-xs px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">换向</button>
                    </div>
                    {nextBus ? (
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                        <div className="absolute top-0 right-0 p-32 bg-green-500/10 rounded-full blur-3xl" />
                        <div className="p-5 relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-green-200 text-xs font-medium bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                              <Timer className="w-3.5 h-3.5" />
                              {isBusManualMode ? '已选班次' : '下一趟发车'}
                            </div>
                            {isBusManualMode && <button onClick={() => { setIsBusManualMode(false); setSelectedBus(null); }} className="text-xs px-3 py-1.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all font-medium backdrop-blur-md">恢复推荐</button>}
                          </div>
                          <div className="text-center mb-6">
                            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-green-500 tabular-nums drop-shadow-sm">{nextBus.time}</div>
                          </div>
                          <div className="rounded-2xl bg-black/40 border border-white/5 p-5 flex flex-col items-center justify-center relative">
                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Countdown</span>
                            <div className="text-5xl font-bold text-white tabular-nums tracking-tighter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">{formatCountdown(busCountdown)}</div>
                          </div>
                        </div>
                      </div>
                    ) : <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center shadow-2xl text-slate-300">今日班车已结束</div>}
                    <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 shadow-2xl mt-4">
                      <h3 className="font-semibold text-slate-200 tracking-wide mb-4">当日剩余时刻</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {availableBuses.map(bus => (
                          <motion.button whileTap={{ scale: 0.95 }} key={bus.time} onClick={() => { setSelectedBus(bus); setIsBusManualMode(true); }} className="relative p-4 rounded-2xl border border-white/5 bg-black/20 text-slate-300 hover:bg-black/40 transition-all text-lg font-bold tabular-nums">{bus.time}</motion.button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
