import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Timer, Train, Zap, Bus } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      <div className="max-w-2xl mx-auto space-y-3 relative z-10">
        <div className="text-center pt-3 pb-2">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/50">
              <Train className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{"乘车班次查询"}</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-white/90">实时倒计时</span>
          </div>
        </div>

        <Card className="shadow-lg bg-white rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
              <Clock className="w-4 h-4 text-blue-600" />
              当前时间
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <div className="text-4xl sm:text-5xl font-bold text-center text-gray-900 tabular-nums">
              {formatTime(currentTime)}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="subway" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="subway" className="flex items-center gap-2">
              <Train className="w-4 h-4" />
              地铁
            </TabsTrigger>
            <TabsTrigger value="bus" className="flex items-center gap-2">
              <Bus className="w-4 h-4" />
              班车
            </TabsTrigger>
          </TabsList>

          {/* 地铁Tab内容 */}
          <TabsContent value="subway" className="space-y-3 mt-3">
            {nextTrain && countdown > 0 && (
              <Card className="shadow-lg bg-white rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 text-xs font-medium">
                      <Timer className="w-3 h-3 text-orange-600" />
                      {isManualMode ? '已选择班次（倒计时）' : '下一班昌平东关（倒计时）'}
                    </div>
                    {isManualMode && (
                      <button
                        onClick={handleResetToDefault}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors font-medium"
                      >
                        恢复默认
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        {nextTrain.station}
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                      {nextTrain.time}
                    </div>
                  </div>
                  
                  <div className="text-center bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="text-xs text-gray-600 mb-1 font-medium">倒计时</div>
                    <div className="text-5xl sm:text-6xl font-bold text-orange-600 tabular-nums tracking-tight">
                      {formatCountdown(countdown)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">分钟:秒</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {availableTrains.length === 0 && (
              <Card className="shadow-lg bg-white rounded-xl">
                <CardContent className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-xl font-semibold text-gray-800">由昌平东关始发的列车，已无可赶上的班次</p>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg bg-white rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Train className="w-5 h-5 text-blue-600" />
                  最近班次（±10分钟）
                </CardTitle>
                <p className="text-xs text-gray-600 mt-1">
                  昌平东关：重点关注 | 昌平西山口：时间参考
                </p>
              </CardHeader>
              <CardContent className="p-5">
                {availableTrains.length > 0 ? (
                  <div className="space-y-3">
                    {availableTrains.slice(0, 10).map((train, index) => {
                      const isSelected = isManualMode && selectedTrain?.time === train.time && selectedTrain?.station === train.station;
                      return (
                        <div
                          key={index}
                          onClick={() => handleTrainClick(train)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-lg' 
                              : train.bgColor
                          } transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${train.gradientFrom} ${train.gradientTo} text-white font-bold text-sm shadow-md`}>
                              {index + 1}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <MapPin className={`w-4 h-4 ${train.color}`} />
                                <span className={`font-bold text-base ${train.textColor}`}>
                                  {train.station}
                                </span>
                              </div>
                              {train.status && (
                                <span className="text-xs text-gray-600 ml-6">
                                  {train.status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-gray-800 tabular-nums">
                              {train.time}
                            </div>
                            {isSelected && (
                              <Badge className="bg-blue-600 text-white">已选</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-6">
                    暂无可用班次
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 班车Tab内容 */}
          <TabsContent value="bus" className="space-y-3 mt-3">
            {!selectedBusRoute ? (
              <Card className="shadow-lg bg-white rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Bus className="w-5 h-5 text-green-600" />
                    选择班车线路
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {busRoutes.map((route, index) => (
                    <div
                      key={index}
                      onClick={() => handleBusRouteSelect(route)}
                      className={`p-5 rounded-xl border-2 ${route.bgColor} transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${route.gradientFrom} ${route.gradientTo} text-white font-bold shadow-md`}>
                            <Bus className="w-5 h-5" />
                          </div>
                          <div>
                            <div className={`font-bold text-lg ${route.textColor}`}>
                              {route.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {route.from} → {route.to}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {route.schedules.length} 班次
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="shadow-lg bg-white rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${selectedBusRoute.gradientFrom} ${selectedBusRoute.gradientTo} text-white font-bold shadow-md`}>
                          <Bus className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`font-bold text-lg ${selectedBusRoute.textColor}`}>
                            {selectedBusRoute.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedBusRoute.from} → {selectedBusRoute.to}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBusRoute(null)}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-medium"
                      >
                        切换线路
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {nextBus && busCountdown > 0 && (
                  <Card className="shadow-lg bg-white rounded-xl">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700 text-xs font-medium">
                          <Timer className="w-3 h-3 text-green-600" />
                          {isBusManualMode ? '已选择班次（倒计时）' : '下一班班车（倒计时）'}
                        </div>
                        {isBusManualMode && (
                          <button
                            onClick={handleResetBusToDefault}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors font-medium"
                          >
                            恢复默认
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 tabular-nums">
                          {nextBus.time}
                        </div>
                      </div>
                      
                      <div className="text-center bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1 font-medium">倒计时</div>
                        <div className="text-5xl sm:text-6xl font-bold text-green-600 tabular-nums tracking-tight">
                          {formatCountdown(busCountdown)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">分钟:秒</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {availableBuses.length === 0 && (
                  <Card className="shadow-lg bg-white rounded-xl">
                    <CardContent className="py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Bus className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-xl font-semibold text-gray-800">今日班车已结束</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-lg bg-white rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Bus className="w-5 h-5 text-green-600" />
                      今日剩余班次
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    {availableBuses.length > 0 ? (
                      <div className="space-y-3">
                        {availableBuses.slice(0, 10).map((bus, index) => {
                          const isSelected = isBusManualMode && selectedBus?.time === bus.time;
                          return (
                            <div
                              key={index}
                              onClick={() => handleBusClick(bus)}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                  : selectedBusRoute.bgColor
                              } transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${selectedBusRoute.gradientFrom} ${selectedBusRoute.gradientTo} text-white font-bold text-sm shadow-md`}>
                                  {index + 1}
                                </div>
                                <span className={`font-bold text-base ${selectedBusRoute.textColor}`}>
                                  班次 {index + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-gray-800 tabular-nums">
                                  {bus.time}
                                </div>
                                {isSelected && (
                                  <Badge className="bg-blue-600 text-white">已选</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-6">
                        暂无可用班次
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center text-white/60 text-xs pt-2">

        </div>
      </div>
    </div>
  );
}
