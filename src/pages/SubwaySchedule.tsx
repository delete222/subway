import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Bus, CalendarDays, Clock, MapPin, Timer, Train } from 'lucide-react';
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
  focusLabel: string;
  destination: string;
  time: string;
  hour: number;
  minute: number;
  minutesLeft: number;
  isPreferred: boolean;
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

const directionOptions: Record<DirectionKey, { label: string; station: string; targetText: string; focusLabel: string }> = {
  morning: {
    label: '上班去公司',
    station: '南邵站',
    targetText: '开往蓟门桥站方向',
    focusLabel: '南邵出发去西二旗',
  },
  evening: {
    label: '下班回家',
    station: '西二旗站',
    targetText: '开往昌平西山口站方向',
    focusLabel: '西二旗出发回南邵',
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

function getTrainStatus(minutesLeft: number, direction: DirectionKey, isPreferred: boolean): string {
  if (direction === 'evening') {
    return isPreferred ? '可到南邵' : '短线车';
  }
  if (!isPreferred) return '';
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

      const isFilteredShortTurn = direction === 'evening' && !canReachHome(entry.terminus);
      const isPreferred = direction === 'morning' ? entry.terminus === '昌平东关站' : !isFilteredShortTurn;

      trains.push({
        station: dataset.station,
        directionLabel: directionOptions[direction].label,
        focusLabel: directionOptions[direction].focusLabel,
        destination: entry.terminus,
        time: `${hourText.padStart(2, '0')}:${entry.minute.toString().padStart(2, '0')}`,
        hour,
        minute: entry.minute,
        minutesLeft,
        isPreferred,
        isFilteredShortTurn,
        status: getTrainStatus(minutesLeft, direction, isPreferred),
      });
    });
  });

  return trains.sort((a, b) => a.hour - b.hour || a.minute - b.minute || a.destination.localeCompare(b.destination, 'zh-CN'));
}

export default function SubwaySchedule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabKey>('subway');
  const [direction, setDirection] = useState<DirectionKey>(() => getDefaultDirection(new Date()));
  const [dayType, setDayType] = useState<DayType>(() => getDayType(new Date()));
  const [isAutoDirection, setIsAutoDirection] = useState(true);
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
  }, [currentTime, isAutoDirection]);

  const dataset = useMemo(() => findDataset(dayType, direction), [dayType, direction]);
  const availableTrains = useMemo(() => buildTrains(dataset, currentTime, direction), [dataset, currentTime, direction]);
  const recommendedTrain = availableTrains.find(train => train.isPreferred && train.minutesLeft >= 0) ?? availableTrains.find(train => train.minutesLeft >= 0) ?? null;
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#101820] font-sans text-white">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        <div className="mx-auto max-w-2xl space-y-4 p-4">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-xl">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-cyan-100">
                <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />北京时间</span>
                <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{dayType}</span>
              </div>
              <div className="text-4xl font-black tabular-nums tracking-normal">{formatTime(currentTime)}</div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/20 p-1">
            {(['subway', 'bus'] as TabKey[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${activeTab === tab ? 'bg-cyan-400 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}
              >
                {tab === 'subway' ? <Train className="h-4 w-4" /> : <Bus className="h-4 w-4" />}
                {tab === 'subway' ? '地铁' : '班车'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'subway' ? (
              <motion.div key="subway" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-400">当前方向</div>
                      <div className="text-lg font-bold">{directionOptions[direction].label}</div>
                    </div>
                    <button
                      onClick={() => {
                        setIsAutoDirection(true);
                        setDirection(getDefaultDirection(currentTime));
                        setIsManualMode(false);
                        setSelectedTrain(null);
                      }}
                      className={`h-9 rounded-md px-3 text-xs font-semibold transition ${isAutoDirection ? 'bg-cyan-400 text-slate-950' : 'bg-white/10 text-slate-200 hover:bg-white/15'}`}
                    >
                      自动
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['morning', 'evening'] as DirectionKey[]).map(key => (
                      <button
                        key={key}
                        onClick={() => handleDirectionChange(key)}
                        className={`flex min-h-12 items-center justify-center gap-2 rounded-md border px-2 text-sm font-semibold transition ${direction === key ? 'border-cyan-300 bg-cyan-400/20 text-cyan-100' : 'border-white/10 bg-black/20 text-slate-300 hover:bg-white/10'}`}
                      >
                        <ArrowLeftRight className="h-4 w-4 shrink-0" />
                        <span>{key === 'morning' ? '上班' : '下班'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {nextTrain ? (
                  <div className="rounded-lg border border-cyan-300/30 bg-gradient-to-br from-[#13252d] to-[#101820] p-5 shadow-2xl">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-md bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100">
                        <Timer className="h-4 w-4" />
                        {isManualMode ? '已选班次' : '推荐下一班'}
                      </div>
                      {isManualMode && <button onClick={() => { setIsManualMode(false); setSelectedTrain(null); }} className="h-9 rounded-md bg-white/10 px-3 text-xs font-semibold text-white">恢复推荐</button>}
                    </div>
                    <div className="mb-5 grid grid-cols-[1fr_auto] items-end gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{nextTrain.focusLabel}</p>
                        <h1 className="text-2xl font-black">{nextTrain.station.replace('站', '')}</h1>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-300"><MapPin className="h-4 w-4" />终点 {nextTrain.destination}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">发车</p>
                        <div className="text-4xl font-black tabular-nums text-cyan-200">{nextTrain.time}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-5 text-center">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-slate-400">距离发车</div>
                      <div className="text-6xl font-black tabular-nums tracking-normal">{formatCountdown(countdown)}</div>
                      <div className="mt-3 text-sm font-semibold text-amber-200">{nextTrain.status}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-white/[0.06] p-8 text-center text-slate-300">今日地铁已停运或暂无排班</div>
                )}

                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-lg font-bold"><Train className="h-5 w-5 text-cyan-300" />当日剩余时刻</h3>
                    <span className="text-xs text-slate-400">重点 {preferredCount} 班{direction === 'evening' ? ` · 已淡化 ${filteredCount} 班不到家` : ''}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availableTrains.map(train => {
                      const isSelected = isManualMode && selectedTrain?.time === train.time && selectedTrain?.destination === train.destination;
                      return (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          key={`${train.time}-${train.destination}`}
                          onClick={() => { setSelectedTrain(train); setIsManualMode(true); }}
                          className={`min-h-20 rounded-md border p-2 text-left transition ${isSelected ? 'border-cyan-300 bg-cyan-400/20' : train.isPreferred ? 'border-emerald-300/30 bg-emerald-400/10 hover:bg-emerald-400/15' : 'border-white/10 bg-black/20 opacity-55 hover:opacity-80'}`}
                        >
                          <div className="text-lg font-black tabular-nums">{train.time}</div>
                          <div className="mt-1 truncate text-xs text-slate-300">{train.destination.replace('站', '')}</div>
                          <div className={`mt-1 text-xs ${train.isPreferred ? 'text-emerald-200' : 'text-slate-500'}`}>{formatMinutesLeft(train.minutesLeft)}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="bus" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
                {!selectedBusRoute ? (
                  <div className="grid gap-3">
                    {busRoutes.map(route => (
                      <button key={route.name} onClick={() => { setSelectedBusRoute(route); setIsBusManualMode(false); setSelectedBus(null); }} className="rounded-lg border border-white/10 bg-white/[0.06] p-5 text-left shadow-xl transition hover:bg-white/10">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br ${route.gradientFrom} ${route.gradientTo}`}><Bus className="h-6 w-6" /></div>
                          <div><div className="text-xl font-bold">{route.name}</div><div className="mt-1 text-sm text-slate-400">{route.from} → {route.to}</div></div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <div className="font-bold">{selectedBusRoute.name}</div>
                      <button onClick={() => setSelectedBusRoute(null)} className="h-9 rounded-md bg-white/10 px-3 text-xs font-semibold">换向</button>
                    </div>
                    {nextBus ? (
                      <div className="rounded-lg border border-emerald-300/30 bg-[#13251f] p-5 text-center shadow-2xl">
                        <div className="mb-2 text-xs font-semibold text-emerald-100">{isBusManualMode ? '已选班次' : '下一趟发车'}</div>
                        <div className="text-6xl font-black tabular-nums text-emerald-200">{nextBus.time}</div>
                        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4 text-5xl font-black tabular-nums">{formatCountdown(busCountdown)}</div>
                        {isBusManualMode && <button onClick={() => { setIsBusManualMode(false); setSelectedBus(null); }} className="mt-4 h-9 rounded-md bg-white/10 px-3 text-xs font-semibold">恢复推荐</button>}
                      </div>
                    ) : <div className="rounded-lg border border-white/10 bg-white/[0.06] p-8 text-center text-slate-300">今日班车已结束</div>}
                    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                      <h3 className="mb-3 font-bold">当日剩余时刻</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {availableBuses.map(bus => (
                          <button key={bus.time} onClick={() => { setSelectedBus(bus); setIsBusManualMode(true); }} className="rounded-md border border-white/10 bg-black/20 p-3 text-lg font-bold tabular-nums hover:bg-white/10">{bus.time}</button>
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
