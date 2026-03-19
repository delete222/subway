import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Timer, Train, Bus } from 'lucide-react';

interface Schedule {
  hour: number;
  minutes: number[];
}

interface Station {
  name: string;
  color: string;
  textColor: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  schedules: Schedule[];
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
  color: string;
  textColor: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  schedules: BusSchedule[];
}

const TRAVEL_TIME_MIN = 8;
const TRAVEL_TIME_MAX = 10;

const stations: Station[] = [
  {
    name: '昌平东关',
    color: 'text-orange-600',
    textColor: 'text-orange-700',
    bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-amber-500',
    schedules: [
      { hour: 7, minutes: [32, 46] },
      { hour: 8, minutes: [2, 16, 32, 39, 46, 52] },
      { hour: 9, minutes: [0, 7, 15, 22] }
    ]
  },
  {
    name: '昌平西山口',
    color: 'text-blue-600',
    textColor: 'text-blue-700',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    schedules: [
      { hour: 7, minutes: [0, 5, 8, 13, 15, 20, 23, 27, 36, 39, 43, 50, 52, 57] },
      { hour: 8, minutes: [6, 9, 13, 20, 23, 27, 37, 43, 50, 57] },
      { hour: 9, minutes: [5, 12, 20, 29, 36, 44, 53] }
    ]
  }
];

// 班车时刻表数据
const busRoutes: BusRoute[] = [
  {
    name: '方舟→百度大厦',
    from: '方舟大厦',
    to: '百度大厦',
    color: 'text-green-600',
    textColor: 'text-green-700',
    bgColor: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
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
      { hour: 22, minute: 0, time: '22:00' }
    ]
  },
  {
    name: '百度大厦→方舟',
    from: '百度大厦',
    to: '方舟大厦',
    color: 'text-purple-600',
    textColor: 'text-purple-700',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
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
      { hour: 17, minute: 45, time: '17:45' }
    ]
  }
];

interface TrainTime {
  station: string;
  time: string;
  hour: number;
  minute: number;
  color: string;
  textColor: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  minutesLeft?: number;
  status?: string;
}

export default function SubwaySchedule() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextTrain, setNextTrain] = useState<TrainTime | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [availableTrains, setAvailableTrains] = useState<TrainTime[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<TrainTime | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  
  // 班车相关状态
  const [selectedBusRoute, setSelectedBusRoute] = useState<BusRoute | null>(null);
  const [nextBus, setNextBus] = useState<BusSchedule | null>(null);
  const [busCountdown, setBusCountdown] = useState<number>(0);
  const [availableBuses, setAvailableBuses] = useState<BusSchedule[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusSchedule | null>(null);
  const [isBusManualMode, setIsBusManualMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'subway' | 'bus'>('subway');

  // 计算班次状态
  const getTrainStatus = (minutesLeft: number, isDongguan: boolean): string => {
    if (!isDongguan) return ''; // 昌平西山口不显示状态
    
    if (minutesLeft < -10) {
      return '⏳ 即将错过';
    } else if (minutesLeft < 0) {
      return '🚨 已错过';
    } else if (minutesLeft < TRAVEL_TIME_MIN) {
      return '❌ 来不及了';
    } else if (minutesLeft <= TRAVEL_TIME_MAX) {
      return '🏃 赶紧跑！';
    } else if (minutesLeft <= 15) {
      return '🚶 可以准备出门';
    } else {
      return '✅ 时间充裕';
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = currentTime;

    const allTrains: TrainTime[] = [];
    const dongguanTrains: TrainTime[] = [];

    stations.forEach(station => {
      station.schedules.forEach(schedule => {
        schedule.minutes.forEach(minute => {
          const trainTime = new Date(now);
          trainTime.setHours(schedule.hour, minute, 0, 0);

          const minutesLeft = Math.floor((trainTime.getTime() - now.getTime()) / 1000 / 60);
          const isDongguan = station.name === '昌平东关';

          // 显示正负10分钟范围内的班次
          if (minutesLeft >= -10) {
            const train: TrainTime = {
              station: station.name,
              time: `${schedule.hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
              hour: schedule.hour,
              minute: minute,
              color: station.color,
              textColor: station.textColor,
              bgColor: station.bgColor,
              gradientFrom: station.gradientFrom,
              gradientTo: station.gradientTo,
              minutesLeft: minutesLeft,
              status: getTrainStatus(minutesLeft, isDongguan)
            };
            
            allTrains.push(train);
            
            // 只收集昌平东关站的班次用于倒计时（只收集未来的班次）
            if (isDongguan && minutesLeft >= TRAVEL_TIME_MIN) {
              dongguanTrains.push(train);
            }
          }
        });
      });
    });

    allTrains.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });

    dongguanTrains.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });

    setAvailableTrains(allTrains);

    // 只对昌平东关站的车进行倒计时
    if (dongguanTrains.length > 0) {
      const next = dongguanTrains[0];
      
      // 如果不是手动模式，自动更新下一班车
      if (!isManualMode) {
        setNextTrain(next);
      }

      // 计算倒计时：如果是手动模式使用selectedTrain，否则使用自动推荐的next
      const targetTrain = isManualMode && selectedTrain ? selectedTrain : next;
      const nextTrainTime = new Date(now);
      nextTrainTime.setHours(targetTrain.hour, targetTrain.minute, 0, 0);
      const secondsUntilTrain = Math.floor((nextTrainTime.getTime() - now.getTime()) / 1000);
      setCountdown(secondsUntilTrain);
    } else {
      if (!isManualMode) {
        setNextTrain(null);
      }
      setCountdown(0);
    }
  }, [currentTime, isManualMode, selectedTrain]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 点击时间点，切换到手动模式
  const handleTrainClick = (train: TrainTime) => {
    setSelectedTrain(train);
    setNextTrain(train);
    setIsManualMode(true);
  };

  // 恢复默认模式
  const handleResetToDefault = () => {
    setIsManualMode(false);
    setSelectedTrain(null);
  };

  // 班车线路选择
  const handleBusRouteSelect = (route: BusRoute) => {
    setSelectedBusRoute(route);
    setIsBusManualMode(false);
    setSelectedBus(null);
  };

  // 班车时间点击
  const handleBusClick = (bus: BusSchedule) => {
    setSelectedBus(bus);
    setNextBus(bus);
    setIsBusManualMode(true);
  };

  // 恢复班车默认模式
  const handleResetBusToDefault = () => {
    setIsBusManualMode(false);
    setSelectedBus(null);
  };

  // 计算班车倒计时
  useEffect(() => {
    if (!selectedBusRoute) return;

    const now = currentTime;
    const upcomingBuses: BusSchedule[] = [];

    selectedBusRoute.schedules.forEach(schedule => {
      const busTime = new Date(now);
      busTime.setHours(schedule.hour, schedule.minute, 0, 0);

      const minutesLeft = Math.floor((busTime.getTime() - now.getTime()) / 1000 / 60);

      // 显示未来的班次
      if (minutesLeft >= 0) {
        upcomingBuses.push(schedule);
      }
    });

    upcomingBuses.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });

    setAvailableBuses(upcomingBuses);

    if (upcomingBuses.length > 0) {
      const next = upcomingBuses[0];
      
      // 如果不是手动模式，自动更新下一班车
      if (!isBusManualMode) {
        setNextBus(next);
      }

      // 计算倒计时：如果是手动模式使用selectedBus，否则使用自动推荐的next
      const targetBus = isBusManualMode && selectedBus ? selectedBus : next;
      const nextBusTime = new Date(now);
      nextBusTime.setHours(targetBus.hour, targetBus.minute, 0, 0);
      const secondsUntilBus = Math.floor((nextBusTime.getTime() - now.getTime()) / 1000);
      setBusCountdown(secondsUntilBus);
    } else {
      if (!isBusManualMode) {
        setNextBus(null);
      }
      setBusCountdown(0);
    }
  }, [currentTime, selectedBusRoute, isBusManualMode, selectedBus]);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 relative overflow-hidden font-sans">
      {/* 动态背景 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-slate-950" />
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20 mix-blend-overlay" />

      {/* 主内容区（可滚动） */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative z-10 scrollbar-hide">
        <div className="max-w-2xl mx-auto p-4 space-y-5">
          
          {/* 顶部标题区 */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-4 pb-2"
          >
            {/* 顶栏时间卡片 (玻璃拟态) */}
            <div className="mx-auto w-4/5 p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>北京时间</span>
              </div>
              <div className="text-4xl font-extrabold text-white tracking-widest tabular-nums drop-shadow-md">
                {formatTime(currentTime)}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'subway' && (
              <motion.div 
                key="subway"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* 地铁倒计时主卡片 */}
                {nextTrain && countdown > 0 ? (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="p-5 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-blue-200 text-xs font-medium bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                          <Timer className="w-3.5 h-3.5" />
                          {isManualMode ? '已选班次' : '系统推荐下一班'}
                        </div>
                        {isManualMode && (
                          <button
                            onClick={handleResetToDefault}
                            className="text-xs px-3 py-1.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all font-medium backdrop-blur-md"
                          >
                            恢复默认
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">开往</p>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">
                              {nextTrain.station}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm mb-1">发车时间</p>
                          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tabular-nums">
                            {nextTrain.time}
                          </div>
                        </div>
                      </div>
                      
                      {/* 霓虹倒计时 */}
                      <div className="rounded-2xl bg-black/40 border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm text-slate-400 mb-2 font-medium tracking-widest">距离发车还有</span>
                        <div className="text-6xl sm:text-7xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          {formatCountdown(countdown)}
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

                {/* 地铁班次列表 */}
                <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4 text-white">
                    <Train className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-lg tracking-wide">最近班次</h3>
                  </div>
                  
                  {availableTrains.length > 0 ? (
                    <div className="space-y-2.5">
                      {availableTrains.slice(0, 8).map((train, index) => {
                        const isSelected = isManualMode && selectedTrain?.time === train.time && selectedTrain?.station === train.station;
                        return (
                          <motion.div
                            whileTap={{ scale: 0.98 }}
                            key={index}
                            onClick={() => handleTrainClick(train)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                              isSelected 
                                ? 'border-blue-500/50 bg-blue-500/10' 
                                : 'border-white/5 bg-black/20 hover:bg-black/40'
                            } transition-all cursor-pointer group`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${train.station.includes('东关') ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]'}`} />
                              <div className="flex flex-col">
                                <span className={`font-semibold text-sm text-slate-200`}>
                                  {train.station}
                                </span>
                                {train.status && (
                                  <span className="text-[10px] text-slate-400 mt-0.5">
                                    {train.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-xl font-bold text-slate-100 tabular-nums">
                                {train.time}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-4 text-sm">暂无可用班次</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'bus' && (
              <motion.div 
                key="bus"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-4"
              >
                {!selectedBusRoute ? (
                  <div className="space-y-4">
                    <h2 className="text-white font-semibold text-lg px-2">请选择班车方向</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {busRoutes.map((route, index) => (
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          key={index}
                          onClick={() => handleBusRouteSelect(route)}
                          className="relative overflow-hidden p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl cursor-pointer hover:bg-white/10 transition-all"
                        >
                          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${route.gradientFrom} ${route.gradientTo} opacity-20 blur-2xl`} />
                          <div className="flex items-center gap-4 relative z-10">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${route.gradientFrom} ${route.gradientTo} text-white shadow-lg`}>
                              <Bus className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-bold text-xl text-white tracking-wide">
                                {route.name}
                              </div>
                              <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                <span>{route.from}</span>
                                <span className="opacity-50">→</span>
                                <span>{route.to}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${selectedBusRoute.gradientFrom} ${selectedBusRoute.gradientTo} text-white shadow-inner`}>
                          <Bus className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white leading-tight">
                            {selectedBusRoute.name}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBusRoute(null)}
                        className="text-xs px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-md"
                      >
                        换向
                      </button>
                    </div>

                    {nextBus && busCountdown > 0 ? (
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50">
                        <div className="absolute top-0 right-0 p-32 bg-green-500/10 rounded-full blur-3xl" />
                        <div className="p-5 relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-green-200 text-xs font-medium bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                              <Timer className="w-3.5 h-3.5" />
                              {isBusManualMode ? '已选班次' : '下一趟发车'}
                            </div>
                            {isBusManualMode && (
                              <button
                                onClick={handleResetBusToDefault}
                                className="text-xs px-3 py-1.5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all font-medium backdrop-blur-md"
                              >
                                恢复推荐
                              </button>
                            )}
                          </div>
                          
                          <div className="text-center mb-6">
                            <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-green-500 tabular-nums drop-shadow-sm">
                              {nextBus.time}
                            </div>
                          </div>
                          
                          <div className="rounded-2xl bg-black/40 border border-white/5 p-5 flex flex-col items-center justify-center relative">
                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Countdown</span>
                            <div className="text-5xl font-bold text-white tabular-nums tracking-tighter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                              {formatCountdown(busCountdown)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center shadow-2xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
                          <Bus className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-300">今日班车已结束</p>
                      </div>
                    )}

                    <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 shadow-2xl mt-4">
                      <h3 className="font-semibold text-slate-200 tracking-wide mb-4">当日剩余时刻</h3>
                      {availableBuses.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {availableBuses.map((bus, index) => {
                            const isSelected = isBusManualMode && selectedBus?.time === bus.time;
                            return (
                              <motion.div
                                whileTap={{ scale: 0.95 }}
                                key={index}
                                onClick={() => handleBusClick(bus)}
                                className={`flex items-center justify-center p-3 rounded-2xl border ${
                                  isSelected
                                    ? 'border-green-500/50 bg-green-500/20 text-green-300' 
                                    : 'border-white/5 bg-black/20 text-slate-300 hover:bg-black/40'
                                } transition-all cursor-pointer font-bold text-lg tabular-nums`}
                              >
                                {bus.time}
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-slate-500 py-4 text-sm">暂无班车</p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 原生应用风格底部导航栏 (毛玻璃) */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10" />
        {/* iPhone 底部安全区内边距 pb-safe 的模拟 (pb-6) */}
        <div className="relative z-10 flex justify-center items-center py-2 pb-6 max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab('subway')}
            className="flex-1 flex flex-col items-center justify-center py-2 relative group"
          >
            <div className={`transition-all duration-300 ${activeTab === 'subway' ? 'text-blue-400 scale-110 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'text-slate-500 hover:text-slate-400'}`}>
              <Train className="w-6 h-6 mb-1" />
            </div>
            <span className={`text-[11px] font-medium transition-colors ${activeTab === 'subway' ? 'text-blue-400' : 'text-slate-500'}`}>地铁出行</span>
            {activeTab === 'subway' && (
              <motion.div layoutId="nav-indicator" className="absolute top-0 w-12 h-1 bg-blue-500 rounded-full blur-[2px]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('bus')}
            className="flex-1 flex flex-col items-center justify-center py-2 relative group"
          >
            <div className={`transition-all duration-300 ${activeTab === 'bus' ? 'text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'text-slate-500 hover:text-slate-400'}`}>
              <Bus className="w-6 h-6 mb-1" />
            </div>
            <span className={`text-[11px] font-medium transition-colors ${activeTab === 'bus' ? 'text-emerald-400' : 'text-slate-500'}`}>公司班车</span>
            {activeTab === 'bus' && (
              <motion.div layoutId="nav-indicator" className="absolute top-0 w-12 h-1 bg-emerald-500 rounded-full blur-[2px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
