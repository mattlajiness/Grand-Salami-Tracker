import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, Waves, Thermometer, Info, BrainCircuit, Activity, ChevronRight, X, FileText, Loader2 } from 'lucide-react';
import { ModelInputs, analyzeSalamiEdge, generateFullReport } from '../services/aiAnalystService';
import { cn } from '../lib/utils';

// Simple Markdown parser for the report
const Markdown = ({ children }: { children: string }) => {
  const parts = children.split('\n');
  return (
    <div className="space-y-4 font-mono text-sm leading-relaxed">
      {parts.map((p, i) => {
        // Handle Headers (1. Executive Summary, etc)
        if (p.match(/^[1-5]\./)) {
          return <h4 key={i} className="text-salami-red font-black uppercase tracking-tighter mt-8 mb-2 border-b border-salami-red/20 pb-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {p}
          </h4>;
        }
        
        // Handle Subheaders
        if (p.startsWith('###')) {
          return <h5 key={i} className="text-white font-bold uppercase text-xs mt-4 mb-2">{p.replace('###', '')}</h5>;
        }

        // Handle Bullet Points
        if (p.trim().startsWith('-') || p.trim().startsWith('* ')) {
          return <li key={i} className="ml-4 text-slate-400 list-none flex gap-2">
            <span className="text-salami-red">/</span>
            {p.replace(/^[-*]\s*/, '')}
          </li>;
        }

        // Handle Bold Text
        const formattedText = p.split(/(\*\*.*?\*\*)/).map((text, j) => {
          if (text.startsWith('**') && text.endsWith('**')) {
            return <span key={j} className="text-white font-bold">{text.slice(2, -2)}</span>;
          }
          return text;
        });

        // Skip empty lines
        if (!p.trim()) return null;

        return <p key={i} className="text-slate-300">{formattedText}</p>;
      })}
    </div>
  );
};

interface ModelAnalystProps {
  inputs: ModelInputs;
}

export function ModelAnalyst({ inputs }: ModelAnalystProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzedInputs, setLastAnalyzedInputs] = useState<string>('');
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [fullReport, setFullReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const isForecast = inputs.mode === 'forecast';

  // Reliable numerical extraction from the AI string
  const aiPredictedTotal = useMemo(() => {
    if (!aiInsight) return null;
    const match = aiInsight.match(/(?:Model Line|Estimated Total|Predicted Total|Line|Total):?\s*(\d+\.?\d*)/i);
    return match ? match[1] : null;
  }, [aiInsight]);

  const handleOpenReport = async () => {
    setIsReportModalOpen(true);
    if (!fullReport) {
      setIsGeneratingReport(true);
      const report = await generateFullReport(inputs);
      setFullReport(report);
      setIsGeneratingReport(false);
    }
  };

  // Model Weights & Confidence
  const modelMetrics = useMemo(() => {
    const { weather, fatigue, stats } = inputs;
    
    const fatigueScore = Math.min((fatigue.maxFatigueCount * 25) + (fatigue.highFatigueCount * 10), 100);
    const tempEffect = weather ? (weather.avgTemp - 72) / 10 : 0;
    const windEffect = weather ? (weather.highWindGames * 0.5) : 0;
    const weatherTotalImpact = tempEffect + windEffect;

    const progress = (stats.gamesFinished + (stats.gamesLive * 0.5)) / stats.totalGames;
    const confidence = isForecast ? 45 : Math.round(progress * 100);

    const heuristicForecast = stats.sumOfLines ? (stats.sumOfLines + weatherTotalImpact + (fatigueScore / 15)).toFixed(1) : null;
    
    // Calculate Edge relative to the primary prediction (AI or Heuristic)
    const primaryTarget = aiPredictedTotal ? Number(aiPredictedTotal) : Number(heuristicForecast);
    const edge = stats.betLine && primaryTarget ? 
      (stats.betType === 'over' ? (primaryTarget - stats.betLine) : (stats.betLine - primaryTarget)).toFixed(1) : 
      "0.0";

    return {
      fatigueScore,
      weatherTotalImpact,
      confidence,
      edge,
      forecastTotal: heuristicForecast
    };
  }, [inputs, isForecast, aiPredictedTotal]);

  useEffect(() => {
    if (!inputs.stats.totalGames || inputs.stats.totalGames === 0) return;

    const inputKey = JSON.stringify({
      fatigue: inputs.fatigue,
      weather: inputs.weather,
      pacing: inputs.mode === 'live' ? Math.round(inputs.stats.projectedTotal) : 0,
      mode: inputs.mode,
      games: inputs.stats.totalGames
    });

    if (inputKey !== lastAnalyzedInputs && !isLoading) {
      setIsLoading(true);
      analyzeSalamiEdge(inputs).then(insight => {
        setAiInsight(insight);
        setLastAnalyzedInputs(inputKey);
        setIsLoading(false);
      });
    }
  }, [inputs, lastAnalyzedInputs, isLoading]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-salami-red/[0.02] to-blue-500/[0.02] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/20 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-salami-red/10 rounded-lg">
            <BrainCircuit className="w-5 h-5 text-salami-red" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">AI Model Integration</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest tracking-widest">Slate Insight • v3.10</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-mono text-slate-500 uppercase">Analysis Confidence</span>
          <span className="text-sm font-mono font-black text-blue-400">{modelMetrics.confidence}%</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* HERO: THE PREDICTION */}
        <div className="relative group/hero">
          <div className="absolute -inset-1 bg-gradient-to-r from-salami-red/20 to-blue-500/20 rounded-2xl blur opacity-30 group-hover/hero:opacity-50 transition-opacity" />
          <div className="relative bg-slate-950/90 border border-slate-800/50 rounded-xl p-8 flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-salami-red to-transparent animate-pulse" />
            
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-4">Official Model Line</span>
            
            <div className="flex items-baseline gap-3">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.span 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-5xl font-mono font-black text-slate-800 animate-pulse"
                  >
                    ---.-
                  </motion.span>
                ) : (
                  <motion.span 
                    key="total"
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="text-6xl font-mono font-black text-white tracking-tighter"
                  >
                    {aiPredictedTotal || modelMetrics.forecastTotal || '---.-'}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-xs font-mono text-slate-600 font-black uppercase">Runs Total</span>
            </div>

            <div className="mt-6 flex items-center gap-8 text-[11px] font-mono uppercase tracking-[0.2em]">
              <div className="flex flex-col items-center">
                <span className="text-slate-600 mb-1">Market Base</span>
                <span className="text-slate-300 font-bold">{inputs.stats.sumOfLines?.toFixed(1) || '---'}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-slate-600 mb-1">Projected Edge</span>
                <span className={cn(
                  "font-black text-sm",
                  Number(modelMetrics.edge) > 0 ? "text-green-400" : "text-blue-400"
                )}>
                  {modelMetrics.edge} Pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Subtext */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Quant Rationalization</span>
            </div>
            <button 
              onClick={handleOpenReport}
              className="flex items-center gap-1 group text-[9px] font-mono text-slate-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              Exhaustive Detailed Report
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-5 border border-slate-800/30 min-h-[100px] relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-3 py-1"
                >
                  <div className="h-3 bg-slate-800/50 rounded animate-pulse w-full" />
                  <div className="h-3 bg-slate-800/50 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-slate-800/50 rounded animate-pulse w-3/5" />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="relative"
                >
                  <p className="text-sm font-mono text-slate-400 leading-relaxed italic">
                    {aiInsight ? `"${aiInsight}"` : "Awaiting simulation variables..."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Environmental Drivers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800/50 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Thermometer className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Weather Alpha</span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {modelMetrics.weatherTotalImpact > 0 ? '+' : ''}{modelMetrics.weatherTotalImpact.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800/50 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-salami-red/10 rounded-lg group-hover:bg-salami-red/20 transition-colors">
                <Activity className="w-4 h-4 text-salami-red" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Relief Stress</span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {(modelMetrics.fatigueScore / 10).toFixed(1)}/10
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setIsReportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="max-w-2xl w-full max-h-[85vh] bg-slate-900 rounded-2xl border border-slate-800 shadow-3xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-800/30 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-salami-red/10 rounded-lg">
                    <FileText className="w-5 h-5 text-salami-red" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-black text-white uppercase tracking-wider">Quant Edge Report</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Exhaustive Model Simulation • v3.10</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-900/50">
                {isGeneratingReport ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-salami-red animate-spin" />
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] animate-pulse">Running Neural Simulation...</p>
                  </div>
                ) : fullReport ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <Markdown>{fullReport}</Markdown>
                  </motion.div>
                ) : (
                  <p className="text-slate-500 font-mono text-xs text-center py-20 uppercase tracking-widest">Unable to generate report.</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Confidence Index</span>
                  <span className="text-xs font-mono font-black text-blue-400">{modelMetrics.confidence}%</span>
                </div>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono font-black text-[10px] uppercase tracking-widest rounded-lg transition-all"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
