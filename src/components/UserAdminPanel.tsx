import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Clock, Mail } from 'lucide-react';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
}

export function UserAdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="dashboard-card p-6 border-blue-500/30 bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest">User Directory</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Signups: {users.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="py-8 text-center text-[10px] font-mono text-slate-500 animate-pulse">
            LOADING USER DATA...
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-[10px] font-mono text-slate-500">
            NO USERS REGISTERED YET
          </div>
        ) : (
          users.map((user) => (
            <div 
              key={user.uid}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[150px]">
                  {user.displayName || 'Anonymous'}
                </span>
                <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500">
                  <Clock className="w-2.5 h-2.5" />
                  {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Recently'}
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
    </div>
  );
}
