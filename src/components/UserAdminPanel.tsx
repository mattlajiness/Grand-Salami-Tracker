import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Clock, Mail, ExternalLink, Send, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
}

export function UserAdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailList, setShowEmailList] = useState(false);
  const [isHidden, setIsHidden] = useState(() => localStorage.getItem('hide_user_directory') === 'true');

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as UserData[];
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
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
            <h4 className="text-slate-300 font-bold text-xs uppercase tracking-widest">User Directory</h4>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Hidden • Total: {users.length}</p>
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
          Show Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Directory Section */}
      <div className="dashboard-card p-6 border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-widest">User Directory</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Signups: {users.length}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
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

            <button
              onClick={() => {
                setIsHidden(true);
                localStorage.setItem('hide_user_directory', 'true');
              }}
              className="px-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-slate-450 hover:border-red-500/35 hover:text-red-400 font-bold uppercase tracking-widest text-[9px] transition-all flex items-center gap-1.5"
              title="Hide user directory from view"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Hide Panel
            </button>
          </div>
        </div>

        {showEmailList ? (
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
            {loading ? (
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
        )}
      </div>
    </div>
  );
}

