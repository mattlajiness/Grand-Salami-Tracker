import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Clock, Mail, ExternalLink, Send, Eye, EyeOff, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchMLBGames } from '../services/mlbService';
import { fetchNHLGames } from '../services/nhlService';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
}

interface FeedbackData {
  id: string;
  userId: string;
  message: string;
  email?: string;
  page?: string;
  createdAt?: any;
}

export function UserAdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [showEmailList, setShowEmailList] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'feedback'>('users');
  const [isHidden, setIsHidden] = useState(() => localStorage.getItem('hide_user_directory') === 'true');
  const [syncingStreaks, setSyncingStreaks] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Salami Streak Stats interfaces and functions
  interface StreakStats {
    current: { type: 'WIN' | 'LOSS' | 'PUSH' | null; count: number };
    max: number;
  }

  function calculateStreakStats(sportWagers: any[], totals: Record<string, number>, voidDates: Record<string, boolean> = {}): StreakStats {
    if (sportWagers.length === 0) return { current: { type: null, count: 0 }, max: 0 };

    const settled = sportWagers.filter(w => totals[w.date] !== undefined || voidDates[w.date]);
    if (settled.length === 0) return { current: { type: null, count: 0 }, max: 0 };

    let currentCount = 0;
    let currentType: 'WIN' | 'LOSS' | 'PUSH' | null = null;
    let hasSetCurrent = false;

    for (let i = 0; i < settled.length; i++) {
      const wager = settled[i];
      if (voidDates[wager.date]) {
        continue;
      }
      const finalTotal = totals[wager.date];
      const isPush = finalTotal === wager.line;
      const isWin = !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);
      const result = isWin ? 'WIN' : isPush ? 'PUSH' : 'LOSS';

      if (!hasSetCurrent) {
        currentType = result;
        currentCount = 1;
        hasSetCurrent = true;
      } else if (result === currentType) {
        currentCount++;
      } else {
        break;
      }
    }

    let maxWinStreak = 0;
    let runningWinStreak = 0;

    for (let i = settled.length - 1; i >= 0; i--) {
      const wager = settled[i];
      if (voidDates[wager.date]) {
        continue;
      }
      const finalTotal = totals[wager.date];
      const isPush = finalTotal === wager.line;
      const isWin = !isPush && (wager.side === 'OVER' ? finalTotal > wager.line : finalTotal < wager.line);

      if (isWin) {
        runningWinStreak++;
        if (runningWinStreak > maxWinStreak) {
          maxWinStreak = runningWinStreak;
        }
      } else if (isPush) {
        // Push does not break winning streak
      } else {
        runningWinStreak = 0;
      }
    }

    return {
      current: { type: currentType, count: currentCount },
      max: maxWinStreak
    };
  }

  const recalculateAllUserStreaks = async () => {
    setSyncingStreaks(true);
    setSyncStatus('Fetching all users...');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserData[];
      
      setSyncStatus(`Found ${allUsers.length} users. Fetching wagers...`);
      
      const userWagersMap: Record<string, any[]> = {};
      const uniqueMlbDates = new Set<string>();
      const uniqueNhlDates = new Set<string>();
      
      for (const u of allUsers) {
        setSyncStatus(`Fetching wagers for ${u.displayName || u.email || u.uid}...`);
        const wagersSnap = await getDocs(collection(db, 'users', u.uid, 'wagers'));
        const wagers = wagersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        userWagersMap[u.uid] = wagers;
        
        wagers.forEach((w: any) => {
          const sport = (w.sport || 'MLB').toUpperCase();
          if (sport === 'MLB') {
            uniqueMlbDates.add(w.date);
          } else if (sport === 'NHL') {
            uniqueNhlDates.add(w.date);
          }
        });
      }
      
      setSyncStatus(`Fetching game scores for ${uniqueMlbDates.size + uniqueNhlDates.size} dates...`);
      
      // Fetch MLB Scores
      const mlbVoidDates: Record<string, boolean> = {};
      const mlbTotals: Record<string, number> = {};
      
      let dateIdx = 0;
      for (const date of uniqueMlbDates) {
        dateIdx++;
        setSyncStatus(`Fetching MLB scores: ${date} (${dateIdx}/${uniqueMlbDates.size})...`);
        try {
          const games = await fetchMLBGames(date);
          const filteredGames = (games || []).filter((game: any) => {
            if (!game) return false;
            const gameDateStr = game.officialDate;
            const isTargetDate = gameDateStr === '2026-06-16';
            const isGiantsBraves = (
              (game.teams?.home?.team?.id === 115 && game.teams?.away?.team?.id === 94) ||
              (game.teams?.home?.team?.id === 94 && game.teams?.away?.team?.id === 115) ||
              (game.teams?.home?.team?.name?.toLowerCase().includes('braves') && game.teams?.away?.team?.name?.toLowerCase().includes('giants')) ||
              (game.teams?.home?.team?.name?.toLowerCase().includes('giants') && game.teams?.away?.team?.name?.toLowerCase().includes('braves'))
            );
            return !(isTargetDate && isGiantsBraves);
          });
          
          let hasPreviewOrLive = false;
          let hasFinal = false;
          let totalRuns = 0;
          let isDateVoided = false;
          
          filteredGames.forEach((g: any) => {
            const state = g.status?.abstractGameState;
            if (state === 'Preview' || state === 'Live') {
              hasPreviewOrLive = true;
            }
            if (state === 'Final') {
              hasFinal = true;
              totalRuns += (g.teams?.away?.score || 0) + (g.teams?.home?.score || 0);
            }
            
            const detailedState = (g.status?.detailedState || "").toLowerCase();
            const statusCode = g.status?.statusCode?.toUpperCase() || "";
            const isPostponed = detailedState.includes("postponed") || detailedState.includes("canceled") || detailedState.includes("cancelled") || statusCode === "C" || statusCode === "CD" || statusCode === "PPD" || statusCode === "CNCL";
            if (isPostponed) {
              isDateVoided = true;
            }
          });
          
          if (hasFinal && !hasPreviewOrLive) {
            mlbTotals[date] = totalRuns;
          }
          if (isDateVoided) {
            mlbVoidDates[date] = true;
          }
        } catch (e) {
          console.error(`Failed to fetch MLB ${date}`, e);
        }
      }
      
      // Void Overrides
      mlbVoidDates['2026-06-16'] = true;
      delete mlbVoidDates['2026-06-21']; // Yesterday shouldn't be voided
      
      // Fetch NHL Scores
      const nhlVoidDates: Record<string, boolean> = {};
      const nhlTotals: Record<string, number> = {};
      
      dateIdx = 0;
      for (const date of uniqueNhlDates) {
        dateIdx++;
        setSyncStatus(`Fetching NHL scores: ${date} (${dateIdx}/${uniqueNhlDates.size})...`);
        try {
          const nhlResult = await fetchNHLGames(date);
          let hasPreviewOrLive = false;
          let hasFinished = false;
          let totalGoals = 0;
          let isDateVoided = false;
          
          (nhlResult || []).forEach((g: any) => {
            const state = g.gameState;
            if (state === 'PRE' || state === 'LIVE' || state === 'CRIT') {
              hasPreviewOrLive = true;
            }
            if (state === 'FINAL' || state === 'OFF') {
              hasFinished = true;
              totalGoals += (g.awayTeam?.score || 0) + (g.homeTeam?.score || 0);
            }
            
            const scheduleState = g.gameScheduleState || "";
            const isPostponed = scheduleState === "PPD" || scheduleState === "CNCL" || state === "PPD" || state === "CNCL";
            if (isPostponed) {
              isDateVoided = true;
            }
          });
          
          if (hasFinished && !hasPreviewOrLive) {
            nhlTotals[date] = totalGoals;
          }
          if (isDateVoided) {
            nhlVoidDates[date] = true;
          }
        } catch (e) {
          console.error(`Failed to fetch NHL ${date}`, e);
        }
      }
      
      // Calculate & update Firestore in batch
      let updatedCount = 0;
      for (const u of allUsers) {
        setSyncStatus(`Syncing streaks for ${u.displayName || u.email || u.uid}...`);
        const wagers = userWagersMap[u.uid] || [];
        
        const mlbUserWagers = wagers
          .filter((w: any) => (w.sport || 'MLB').toUpperCase() === 'MLB')
          .sort((a: any, b: any) => b.date.localeCompare(a.date));
        
        const nhlUserWagers = wagers
          .filter((w: any) => (w.sport || 'MLB').toUpperCase() === 'NHL')
          .sort((a: any, b: any) => b.date.localeCompare(a.date));
        
        const mlbStats = calculateStreakStats(mlbUserWagers, mlbTotals, mlbVoidDates);
        const nhlStats = calculateStreakStats(nhlUserWagers, nhlTotals, nhlVoidDates);
        
        const leaderboardData = {
          userId: u.uid,
          displayName: u.displayName || u.email?.split('@')[0] || 'Anonymous Salami Bettor',
          mlbStreak: mlbStats.current.type === 'WIN' ? mlbStats.current.count : 0,
          mlbMaxStreak: mlbStats.max,
          nhlStreak: nhlStats.current.type === 'WIN' ? nhlStats.current.count : 0,
          nhlMaxStreak: nhlStats.max,
          updatedAt: new Date().toISOString()
        };
        
        const docRef = doc(db, 'leaderboard', u.uid);
        await setDoc(docRef, leaderboardData, { merge: true });
        updatedCount++;
      }
      
      setSyncStatus(`Success! Recalculated and synced streaks for all ${updatedCount} users.`);
      setTimeout(() => setSyncStatus(''), 8000);
    } catch (error: any) {
      console.error('Batch sync error:', error);
      setSyncStatus(`Sync error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setSyncingStreaks(false);
    }
  };

  useEffect(() => {
    const qUsers = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserData[];
      setUsers(usersList);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoadingUsers(false);
    });

    const qFeedback = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribeFeedback = onSnapshot(qFeedback, (snapshot) => {
      const feedbackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedbackData[];
      setFeedbacks(feedbackList);
      setLoadingFeedback(false);
    }, (error) => {
      console.error("Error fetching feedback:", error);
      setLoadingFeedback(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeFeedback();
    };
  }, []);

  const emailString = users.map(u => u.email).filter(Boolean).join('\n');

  if (isHidden) {
    return (
      <div className="dashboard-card p-4 border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-slate-300 font-bold text-xs uppercase tracking-widest">Admin Panel</h4>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              Hidden • Signups: {users.length} • Feedback: {feedbacks.length}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsHidden(false);
            localStorage.setItem('hide_user_directory', 'false');
          }}
          className="px-3 py-1.5 rounded-full border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 bg-slate-900 text-[8px] font-mono uppercase tracking-widest transition-all flex items-center gap-1.5 font-bold"
        >
          <Eye className="w-3 h-3" />
          Show Panel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Admin Panel Section */}
      <div className="dashboard-card p-6 border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-slate-850 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Admin Dashboard</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                System Intelligence Controls
              </p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-slate-950 p-1 rounded-full border border-slate-850">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5",
                activeTab === 'users'
                  ? "bg-blue-600 text-white shadow-[0_2px_10px_rgba(59,130,246,0.25)]"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Users className="w-3 h-3" />
              Signups ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5 relative",
                activeTab === 'feedback'
                  ? "bg-blue-600 text-white shadow-[0_2px_10px_rgba(59,130,246,0.25)]"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <MessageSquare className="w-3 h-3" />
              Feedback ({feedbacks.length})
              {feedbacks.length > 0 && activeTab !== 'feedback' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          </div>
          
          <div className="flex gap-2">
            {activeTab === 'users' && (
              <button 
                onClick={() => setShowEmailList(!showEmailList)}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all duration-300 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2",
                  showEmailList 
                    ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400"
                )}
              >
                <Mail className="w-3.5 h-3.5" />
                {showEmailList ? "Show Cards" : "View Email List"}
              </button>
            )}

            {activeTab === 'users' && (
              <button 
                disabled={syncingStreaks}
                onClick={recalculateAllUserStreaks}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all duration-300 font-bold uppercase tracking-widest text-[9px] flex items-center gap-2 whitespace-nowrap",
                  syncingStreaks
                    ? "bg-amber-600 border-amber-500 text-white animate-pulse"
                    : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-500 border-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.2)]"
                )}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", syncingStreaks && "animate-spin")} />
                {syncingStreaks ? "Syncing..." : "Sync All Streaks"}
              </button>
            )}

            <button
              onClick={() => {
                setIsHidden(true);
                localStorage.setItem('hide_user_directory', 'true');
              }}
              className="px-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-slate-450 hover:border-red-500/35 hover:text-red-400 font-bold uppercase tracking-widest text-[9px] transition-all flex items-center gap-1.5"
              title="Hide admin dashboard panel"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Hide Panel
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mb-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest leading-none">
              {syncStatus}
            </p>
          </div>
        )}

        {activeTab === 'users' ? (
          showEmailList ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Subscriber Emails:</p>
                  <span className="text-[9px] font-mono text-slate-600">{users.length} unique emails</span>
                </div>
                <textarea 
                  readOnly
                  value={emailString}
                  className="w-full h-64 bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-xs focus:outline-none focus:border-blue-500/50 transition-colors custom-scrollbar"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <p className="mt-2 text-[9px] font-mono text-slate-500 text-center italic">
                  Tip: Click once inside the box to select all, then press Ctrl+C (Cmd+C) to copy.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300">
              {loadingUsers ? (
                <div className="col-span-full py-8 text-center text-[10px] font-mono text-slate-500 animate-pulse">
                  LOADING USER DATA...
                </div>
              ) : users.length === 0 ? (
                <div className="col-span-full py-8 text-center text-[10px] font-mono text-slate-500">
                  NO USERS REGISTERED YET
                </div>
              ) : (
                users.map((user) => (
                  <div 
                    key={user.uid}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                        {user.displayName || 'Anonymous User'}
                      </span>
                      <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500">
                        <Clock className="w-2.5 h-2.5" />
                        {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Active'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                      <Mail className="w-3 h-3 text-blue-500/50" />
                      {user.email}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        ) : (
          /* Feedback Tab content */
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300">
            {loadingFeedback ? (
              <div className="py-8 text-center text-[10px] font-mono text-slate-500 animate-pulse">
                LOADING USER FEEDBACK...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-6">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-40" />
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  No feedback submissions found yet
                </p>
              </div>
            ) : (
              feedbacks.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-905 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-400">
                        {item.email || 'Anonymous User'}
                      </span>
                      {item.page && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8px] font-mono text-slate-400 uppercase tracking-tight">
                          Page: {item.page}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500">
                      <Clock className="w-2.5 h-2.5" />
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Just now'}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30 selection:text-white">
                    {item.message}
                  </p>
                  <div className="text-[8px] font-mono text-slate-600 upper">
                    UID: {item.userId}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

