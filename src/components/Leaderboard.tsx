import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Flame, Award, Search, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardRecord {
  id: string;
  userId: string;
  displayName: string;
  mlbStreak: number;
  mlbMaxStreak: number;
  nhlStreak: number;
  nhlMaxStreak: number;
  updatedAt?: string;
}

interface LeaderboardProps {
  currentUserId?: string | null;
  activeSport: 'MLB' | 'NHL';
}

export function Leaderboard({ currentUserId, activeSport: initialSport }: LeaderboardProps) {
  const [sport, setSport] = useState<'MLB' | 'NHL'>(initialSport);
  const [sortBy, setSortBy] = useState<'active' | 'max'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync sport with initialSport when user toggles central sport
  useEffect(() => {
    setSport(initialSport);
  }, [initialSport]);

  const sortField = useMemo(() => {
    const prefix = sport.toLowerCase();
    return sortBy === 'active' ? `${prefix}Streak` : `${prefix}MaxStreak`;
  }, [sport, sortBy]);

  useEffect(() => {
    setLoading(true);
    // Fetch top 30 records ordered by the active sorted streak
    const q = query(
      collection(db, 'leaderboard'),
      orderBy(sortField, 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderboardRecord[];
      
      // Filter out duplicate user ids just in case, though they should be unique by doc ID
      const seen = new Set<string>();
      const uniqueItems = items.filter(item => {
        const uid = item.userId || item.id;
        if (seen.has(uid)) return false;
        seen.add(uid);
        return true;
      });

      setRecords(uniqueItems);
      setLoading(false);
    }, (error) => {
      console.warn("Leaderboard snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sortField]);

  // Client-side quick filter for search
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const queryLower = searchQuery.toLowerCase();
    return records.filter(r => 
      (r.displayName || 'Anonymous').toLowerCase().includes(queryLower)
    );
  }, [records, searchQuery]);

  return (
    <div className="dashboard-card p-6 border-slate-800 bg-slate-900/80 backdrop-blur-md relative overflow-hidden animate-in fade-in duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
            <Trophy className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-1.5">
              Streak Leaderboard
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            </h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Top Salami Bettors
            </p>
          </div>
        </div>
      </div>

      {/* Toggles & Filter Grid */}
      <div className="space-y-3 mb-4">
        {/* Row 1: Sport Selection & Streak Type */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
          {/* Sport switch */}
          <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800/80">
            {(['MLB', 'NHL'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={cn(
                  "px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all duration-200",
                  sport === s
                    ? "bg-blue-600 text-white shadow-[0_1px_5px_rgba(59,130,246,0.3)]"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800/80">
            <button
              onClick={() => setSortBy('active')}
              className={cn(
                "px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all duration-200 flex items-center gap-1",
                sortBy === 'active'
                  ? "bg-blue-600 text-white shadow-[0_1px_5px_rgba(59,130,246,0.3)]"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Flame className="w-3 h-3" />
              Active
            </button>
            <button
              onClick={() => setSortBy('max')}
              className={cn(
                "px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all duration-200 flex items-center gap-1",
                sortBy === 'max'
                  ? "bg-blue-600 text-white shadow-[0_1px_5px_rgba(59,130,246,0.3)]"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Award className="w-3 h-3" />
              Best All-Time
            </button>
          </div>
        </div>

        {/* Row 2: Live Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search competitor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/85 border border-slate-850 focus:border-blue-500/50 rounded-xl py-2 pl-9 pr-4 text-slate-300 text-xs focus:outline-none placeholder-slate-650 transition-colors"
          />
        </div>
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1.5 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-6 h-6 border-2 border-blue-500/35 border-t-blue-400 rounded-full animate-spin" />
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
              SYNCING SALAMI ACCOUNTS...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-slate-950/20 border border-dashed border-slate-800 p-6">
            <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-30" />
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {searchQuery ? "No matching bettors found" : "No active streaks recorded yet"}
            </p>
            <p className="text-[9px] font-mono text-slate-650 uppercase tracking-wider mt-1">
              Save settled bets to start your streak!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredRecords.map((record, index) => {
              const isCurrentUser = currentUserId === record.userId;
              const activeVal = sport === 'MLB' ? record.mlbStreak : record.nhlStreak;
              const maxVal = sport === 'MLB' ? record.mlbMaxStreak : record.nhlMaxStreak;
              
              // Top 3 positions styling
              const isTop3 = index < 3 && !searchQuery;
              const positionBg = isTop3 
                ? index === 0 ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : index === 1 ? 'bg-slate-300/15 border-slate-300/30 text-slate-200'
                  : 'bg-amber-700/15 border-amber-700/30 text-amber-500'
                : 'bg-slate-950 border-slate-900 text-slate-400';

              const rankLabel = isTop3 
                ? index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
                : `#${index + 1}`;

              return (
                <div
                  key={record.id}
                  className={cn(
                    "p-3 rounded-xl border flex items-center justify-between transition-all duration-300 gap-3 group",
                    isCurrentUser 
                      ? "bg-blue-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-blue-500/60" 
                      : "bg-slate-950/40 border-slate-900/60 hover:border-slate-800/80"
                  )}
                >
                  {/* Left: Position & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "w-7 h-7 rouned-lg rounded-lg border flex items-center justify-center text-[10px] font-bold font-mono shrink-0 shrink-0 select-none shadow-sm",
                      positionBg
                    )}>
                      {rankLabel}
                    </span>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-xs font-bold truncate group-hover:text-blue-400 transition-colors",
                          isCurrentUser ? "text-blue-400 font-extrabold" : "text-slate-200"
                        )}>
                          {record.displayName || 'Anonymous Salami'}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 bg-blue-500/20 border border-blue-400/30 text-[8px] font-black uppercase text-blue-300 tracking-widest rounded-full leading-normal scale-90">
                            YOU
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-500 mt-0.5">
                        {sortBy === 'active' ? (
                          <span>BEST ALL-TIME: {maxVal} WINS</span>
                        ) : (
                          <span>ACTIVE STREAK: {activeVal > 0 ? `${activeVal}W` : 'NONE'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Streak Values */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {sortBy === 'active' ? (
                        activeVal > 0 ? (
                          <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.05)]">
                            <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse animate-duration-1000" />
                            <span className="text-xs font-black text-red-400 font-mono italic">
                              {activeVal}W
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-slate-500 font-mono uppercase bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full select-none">
                            0-0
                          </div>
                        )
                      ) : (
                        maxVal > 0 ? (
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.05)]">
                            <Award className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                            <span className="text-xs font-black text-amber-400 font-mono italic">
                              {maxVal}W
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-slate-500 font-mono uppercase bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full select-none">
                            0-0
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Banner info */}
      <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        <span>Updated automatically</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-blue-400" />
          Salami Streak System
        </span>
      </div>
    </div>
  );
}
