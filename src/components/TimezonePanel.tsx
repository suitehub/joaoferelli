import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Globe, 
  Bell, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sun, 
  Moon, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { TimezoneAlarm } from '../types';

interface TimezonePanelProps {
  alarms: TimezoneAlarm[];
  onAddAlarm: (alarm: Omit<TimezoneAlarm, 'id' | 'createdAt'>) => void;
  onDeleteAlarm: (id: string) => void;
  isGuestMode?: boolean;
  isReadOnly?: boolean;
}

export const TimezonePanel: React.FC<TimezonePanelProps> = ({
  alarms,
  onAddAlarm,
  onDeleteAlarm,
  isGuestMode = false,
  isReadOnly = false,
}) => {
  const [timeBR, setTimeBR] = useState('');
  const [dateBR, setDateBR] = useState('');
  const [timeEG, setTimeEG] = useState('');
  const [dateEG, setDateEG] = useState('');
  const [hourDiff, setHourDiff] = useState(6);

  // Alarm form states
  const [title, setTitle] = useState('');
  const [inputTime, setInputTime] = useState('20:00');
  const [sourceZone, setSourceZone] = useState<'Brazil' | 'Egypt'>('Brazil');

  // Simulator/Converter states
  const [simHour, setSimHour] = useState(12);
  const [simMinute, setSimMinute] = useState(0);

  // Clock updating loop
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      // Brazil time format
      const formatterBR = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const dateFormatterBR = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setTimeBR(formatterBR.format(now));
      setDateBR(dateFormatterBR.format(now));

      // Egypt time format
      const formatterEG = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const dateFormatterEG = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'Africa/Cairo',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setTimeEG(formatterEG.format(now));
      setDateEG(dateFormatterEG.format(now));

      // Calculate dynamic hour difference
      try {
        const brHour = parseInt(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false }), 10);
        const egHour = parseInt(now.toLocaleString('en-US', { timeZone: 'Africa/Cairo', hour: 'numeric', hour12: false }), 10);
        const diff = (egHour - brHour + 24) % 24;
        setHourDiff(diff);
      } catch (e) {
        setHourDiff(6); // Fallback
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Time conversion formula based on dynamic offset
  const getConvertedTime = (timeString: string, from: 'Brazil' | 'Egypt') => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '';

    let convertedH;
    if (from === 'Brazil') {
      convertedH = (h + hourDiff) % 24;
    } else {
      convertedH = (h - hourDiff + 24) % 24;
    }

    return `${String(convertedH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleAddAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !inputTime) return;

    let timeBrazil = '';
    let timeEgypt = '';

    if (sourceZone === 'Brazil') {
      timeBrazil = inputTime;
      timeEgypt = getConvertedTime(inputTime, 'Brazil');
    } else {
      timeEgypt = inputTime;
      timeBrazil = getConvertedTime(inputTime, 'Egypt');
    }

    onAddAlarm({
      title: title.trim(),
      timeBrazil,
      timeEgypt,
      sourceTimezone: sourceZone,
    });

    setTitle('');
  };

  // Convert for slider simulator
  const simTimeBR = `${String(simHour).padStart(2, '0')}:${String(simMinute).padStart(2, '0')}`;
  const simTimeEG = getConvertedTime(simTimeBR, 'Brazil');

  // Check if an hour represents day or night for custom icons
  const isNight = (timeStr: string) => {
    if (!timeStr) return false;
    const hour = parseInt(timeStr.split(':')[0], 10);
    return hour < 6 || hour >= 18;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="timezone-panel-root">
      
      {/* Intro Header */}
      <div className="text-center sm:text-left mb-8">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-2 justify-center sm:justify-start">
          <Globe className="w-6 h-6 text-indigo-500 animate-spin-slow" />
          <span>Fuso Horário & Alarmes de Comparação</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Acompanhe o tempo real e compare os horários entre o Brasil (São Paulo) e o Egito (Cairo) para planejar eventos com facilidade.
        </p>
      </div>

      {/* Clocks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* BRAZIL CLOCK CARD */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4">
            {isNight(timeBR) ? (
              <Moon className="w-8 h-8 text-blue-500/20 fill-blue-500/10" />
            ) : (
              <Sun className="w-8 h-8 text-amber-500/20 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🇧🇷</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Brasil (São Paulo)</span>
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight my-4">
              {timeBR || '00:00:00'}
            </div>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-2">
            <span className="text-xs text-slate-400 font-medium capitalize">{dateBR}</span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">UTC -3 (Horário Oficial de Brasília)</div>
          </div>
        </div>

        {/* EGYPT CLOCK CARD */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4">
            {isNight(timeEG) ? (
              <Moon className="w-8 h-8 text-indigo-500/20 fill-indigo-500/10" />
            ) : (
              <Sun className="w-8 h-8 text-amber-500/20 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🇪🇬</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Egito (Cairo)</span>
            </div>
            <div className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight my-4">
              {timeEG || '00:00:00'}
            </div>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-2">
            <span className="text-xs text-slate-400 font-medium capitalize">{dateEG}</span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">UTC +3 (Horário do Cairo • {hourDiff}h à frente)</div>
          </div>
        </div>

      </div>

      {/* Timezone Difference Summary Indicator */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100/50 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-700">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>O Egito está atualmente <strong className="text-indigo-700 font-semibold">{hourDiff} horas</strong> à frente do Brasil.</span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          São Paulo (GMT-3) vs. Cairo (GMT+3)
        </div>
      </div>

      {/* Calculator Slider Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs mb-8">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span>Simulador de Comparação de Horário</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Arraste o controle abaixo para simular o horário no Brasil e ver instantaneamente o horário correspondente no Egito.
        </p>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horário no Brasil</span>
              <span className="font-mono font-bold text-lg text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                {simTimeBR} {simHour >= 18 || simHour < 6 ? '🌙 Noite' : '☀️ Dia'}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="23" 
              value={simHour}
              onChange={(e) => setSimHour(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>00:00 (Meia-noite)</span>
              <span>06:00</span>
              <span>12:00 (Meio-dia)</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="h-px bg-slate-100 flex-1"></div>
            <div className="mx-4 p-2 bg-slate-50 rounded-full text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/30">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Horário correspondente no Egito</span>
              <span className="text-xs text-indigo-500 font-mono">Cálculo: Hora do Brasil + {hourDiff}h</span>
            </div>
            <span className="font-mono font-black text-2xl text-indigo-700 bg-indigo-50 px-4 py-2 rounded-2xl">
              {simTimeEG} {isNight(simTimeEG) ? '🌙 Noite' : '☀️ Dia'}
            </span>
          </div>
        </div>
      </div>

      {/* Alarm & Warnings Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM TO ADD TIME WARNING */}
        {!isGuestMode && !isReadOnly && (
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs h-fit">
            <h3 className="font-display font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              <span>Novo Aviso de Fuso</span>
            </h3>
            
            <form onSubmit={handleAddAlarmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Título / Nome do Evento
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Ligar para kimberly, Jantar, Reunião"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Origem do Horário
                  </label>
                  <select 
                    value={sourceZone}
                    onChange={(e) => setSourceZone(e.target.value as 'Brazil' | 'Egypt')}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="Brazil">🇧🇷 Brasil</option>
                    <option value="Egypt">🇪🇬 Egito</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Definir Horário
                  </label>
                  <input 
                    type="time" 
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Live Preview Conversion info */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 font-mono space-y-1">
                <div className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider mb-1">Visualização do Evento</div>
                {sourceZone === 'Brazil' ? (
                  <>
                    <div>🇧🇷 No Brasil: <span className="font-bold text-slate-800">{inputTime}</span></div>
                    <div>🇪🇬 No Egito: <span className="font-bold text-indigo-600">{getConvertedTime(inputTime, 'Brazil')}</span></div>
                  </>
                ) : (
                  <>
                    <div>🇪🇬 No Egito: <span className="font-bold text-slate-800">{inputTime}</span></div>
                    <div>🇧🇷 No Brasil: <span className="font-bold text-blue-600">{getConvertedTime(inputTime, 'Egypt')}</span></div>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Aviso Dual</span>
              </button>
            </form>
          </div>
        )}

        {/* LIST OF TIME WARNINGS */}
        <div className={`${(isGuestMode || isReadOnly) ? 'lg:col-span-12' : 'lg:col-span-7'} bg-white border border-slate-100 rounded-3xl p-6 shadow-xs`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" />
              <span>Avisos e Lembretes Agendados ({alarms.length})</span>
            </h3>
          </div>

          {alarms.length === 0 ? (
            <div className="border border-dashed border-slate-100 rounded-2xl p-8 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">Nenhum aviso ou alarme registrado.</p>
              <p className="text-xs text-slate-400 mt-1">
                {isGuestMode 
                  ? 'O João não cadastrou nenhum lembrete público de fuso horário.' 
                  : 'Registre eventos acima para monitorar os horários duplos no seu dia a dia.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {alarms.map((alarm) => (
                <div 
                  key={alarm.id}
                  className="p-4 border border-slate-50 bg-slate-50/30 rounded-2xl flex items-center justify-between gap-4 group hover:border-slate-100 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-slate-800 leading-tight truncate">
                      {alarm.createdByName && (
                        <span className="text-rose-600 font-bold mr-1">[{alarm.createdByName}]</span>
                      )}
                      {alarm.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[11px]">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700">
                        <span>🇧🇷 Brasil:</span>
                        <span className="font-bold">{alarm.timeBrazil}</span>
                      </div>
                      <span className="text-slate-300">→</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                        <span>🇪🇬 Egito:</span>
                        <span className="font-bold">{alarm.timeEgypt}</span>
                      </div>
                    </div>
                  </div>

                  {!isGuestMode && !isReadOnly && (
                    <button
                      onClick={() => onDeleteAlarm(alarm.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
                      title="Excluir Lembrete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
