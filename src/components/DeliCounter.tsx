import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, TrendingUp, TrendingDown, Edit3, Save, X, RotateCcw, Users, ChartBar, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface DeliVote {
  userId: string;
  date: string;
  side: 'OVER' | 'UNDER';
  createdAt: any;
}

interface DeliSettings {
  date: string;
  line: number;
  updatedAt: any;
  updatedBy: string;
}

export function DeliCounter() {
  const { user } = useAuth();
  const [line, setLine] = useState<number | null>(null);
  const [votes, setVotes] = useState<DeliVote[]>([]);
  const [userVote, setUserVote] = useState<'OVER' | 'UNDER' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';

  useEffect(() => {
    // 1. Monitor Daily Line
    const settingsRef = doc(db, 'deliSettings', todayStr);
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DeliSettings;
        setLine(data.line);
        setEditValue(data.line.toString());
      } else {
        setLine(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.warn("Deli settings onSnapshot error:", err);
      setIsLoading(false);
    });

    // 2. Monitor All Votes for Today
    const votesQuery = query(
      collection(db, 'deliVotes'),
      where('date', '==', todayStr)
    );
    const unsubVotes = onSnapshot(votesQuery, (querySnap) => {
      const allVotes = querySnap.docs.map(doc => doc.data() as DeliVote);
      setVotes(allVotes);

      // Check current user's vote
      if (user) {
        const myVote = allVotes.find(v => v.userId === user.uid);
        setUserVote(myVote ? myVote.side : null);
      } else {
        setUserVote(null);
      }
    }, (err) => {
      console.warn("Deli votes onSnapshot error:", err);
    });

    return () => {
      unsubSettings();
      unsubVotes();
    };
  }, [todayStr, user]);

  const handleVote = async (side: 'OVER' | 'UNDER') => {
    if (!user || userVote) return;

    const voteId = `${user.uid}_${todayStr}`;
    const voteRef = doc(db, 'deliVotes', voteId);

    try {
      await setDoc(voteRef, {
        userId: user.uid,
        date: todayStr,
        side,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const saveLine = async () => {
    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) return;

    try {
      await setDoc(doc(db, 'deliSettings', todayStr), {
        date: todayStr,
        line: numValue,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'Admin'
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving line:', err);
    }
  };

  const overCount = votes.filter(v => v.side === 'OVER').length;
  const underCount = votes.filter(v => v.side === 'UNDER').length;
  const totalVotes = votes.length;

  const data = [
    { name: 'OVER', value: overCount, color: '#e11d48' },
    { name: 'UNDER', value: underCount, color: '#3b82f6' }
  ].filter(d => d.value > 0);

  // Default display if no data
  const chartPlaceholderData = totalVotes === 0 ? [{ name: 'Empty', value: 1, color: '#1e293b' }] : data;

  return (
    <div className="dashboard-card relative overflow-hidden group">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <ShoppingBag className="w-24 h-24 rotate-12" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row gap-6 p-6">
        {/* Left Side: Stats & Line */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-salami-red/10 flex items-center justify-center border border-salami-red/20">
                <ShoppingBag className="w-5 h-5 text-salami-red" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-widest">The Deli Counter</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Public Sentiment Tracker</p>
                <p className="text-[9px] text-slate-400 mt-1 max-w-[220px] leading-tight font-medium">
                  Cast your vote on today's Grand Salami total. Once submitted, your pick is locked for the day.
                </p>
              </div>
            </div>

            {isAdmin && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
                title="Edit Daily Line"
              >
                <Edit3 className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50 text-center relative">
            {isEditing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    step="0.5"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-32 bg-slate-900 border-2 border-salami-red rounded-lg p-2 text-xl font-mono text-white text-center focus:outline-none"
                    placeholder="Enter Line"
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={saveLine}
                      className="p-1.5 rounded bg-green-600 hover:bg-green-500 transition-colors"
                    >
                      <Save className="w-4 h-4 text-white" />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Input Daily Salami Total</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-1">Current Daily Line</span>
                <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tighter">
                  {line ? line.toFixed(1) : <span className="text-slate-800">---.-</span>}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <button 
                    onClick={() => handleVote('OVER')}
                    disabled={!line || !user || !!userVote}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 font-bold uppercase tracking-widest text-[10px]",
                      userVote === 'OVER' 
                        ? "bg-salami-red border-salami-red text-white shadow-lg shadow-salami-red/40" 
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-salami-red/50 hover:text-salami-red",
                      !!userVote && userVote !== 'OVER' && "opacity-30 grayscale cursor-not-allowed"
                    )}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Over
                  </button>
                  <button 
                    onClick={() => handleVote('UNDER')}
                    disabled={!line || !user || !!userVote}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 font-bold uppercase tracking-widest text-[10px]",
                      userVote === 'UNDER' 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/40" 
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-blue-600/50 hover:text-blue-400",
                      !!userVote && userVote !== 'UNDER' && "opacity-30 grayscale cursor-not-allowed"
                    )}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Under
                  </button>
                </div>
                {!user && (
                  <p className="mt-3 text-[8px] font-mono text-slate-600 uppercase tracking-widest">Sign in to cast your vote</p>
                )}
                {user && userVote && (
                  <p className="mt-4 text-[9px] font-mono text-green-500 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 py-1 px-3 bg-green-500/5 rounded-full border border-green-500/10">
                    <CheckCircle2 className="w-3 h-3" />
                    Pick Locked: {userVote}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-around">
            <div className="text-center">
              <span className="block text-[8px] font-mono text-slate-500 uppercase">Total Votes</span>
              <span className="text-lg font-mono font-black text-white">{totalVotes}</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="text-center text-salami-red">
              <span className="block text-[8px] font-mono text-slate-500 uppercase">Over Support</span>
              <span className="text-lg font-mono font-black">{totalVotes ? Math.round((overCount/totalVotes)*100) : 0}%</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="text-center text-blue-400">
              <span className="block text-[8px] font-mono text-slate-500 uppercase">Under Support</span>
              <span className="text-lg font-mono font-black">{totalVotes ? Math.round((underCount/totalVotes)*100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Visualization */}
        <div className="w-full xl:w-48 h-48 xl:h-auto flex flex-col items-center justify-center bg-slate-950/30 rounded-2xl border border-slate-800/30">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartPlaceholderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {chartPlaceholderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-[8px] font-mono text-white">
                          {payload[0].name}: {payload[0].value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ChartBar className="w-5 h-5 text-slate-700 animate-pulse" />
            </div>
          </div>
          
          <div className="mt-2 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Public Consensus</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-salami-red" />
              <span className="text-[8px] font-mono text-slate-500">Over</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-2" />
              <span className="text-[8px] font-mono text-slate-500">Under</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
