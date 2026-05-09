import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Edit2, Save, X, Calendar, Clock } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface DailyReport {
  content: string;
  lastUpdated: string;
  title: string;
}

export function BallparkPalReport() {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'mattlajiness@gmail.com';
  const [report, setReport] = useState<DailyReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'dailyIntelligence', today), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DailyReport;
        setReport(data);
        setEditContent(data.content);
        setEditTitle(data.title);
      } else {
        setReport(null);
        setEditContent('');
        setEditTitle(format(new Date(), 'MMMM d, yyyy'));
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `dailyIntelligence/${today}`);
      setLoading(false);
    });

    return () => unsub();
  }, [today]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'dailyIntelligence', today), {
        title: editTitle || format(new Date(), 'MMMM d, yyyy'),
        content: editContent,
        lastUpdated: format(new Date(), 'h:mm a'),
        updatedAt: Timestamp.now()
      });
      setIsEditing(false);
      toast.success('Report updated successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `dailyIntelligence/${today}`);
    }
  };

  if (loading) return null;

  if (!report && !isAdmin) return null;

  return (
    <div className="mb-8 relative group">
      <div className="absolute inset-0 bg-[#f5f1e6] rounded-2xl border-2 border-[#dcd1b9] shadow-lg -rotate-1 transform group-hover:rotate-0 transition-transform duration-500" />
      <div className="relative bg-[#f5f1e6] rounded-2xl border-2 border-[#dcd1b9] p-6 sm:p-8 shadow-inner overflow-hidden">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Date Header */}
          <div className="flex items-center justify-between w-full mb-4 px-4">
            <button className="text-[#3b82f6] font-bold text-lg opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
              {'<<'} {format(subDays(new Date(), 1), 'M/dd')}
            </button>
            <div className="flex flex-col items-center flex-1 max-w-md mx-4">
               {isEditing ? (
                 <input 
                   value={editTitle}
                   onChange={e => setEditTitle(e.target.value)}
                   className="bg-transparent border-b border-[#3b82f6] text-center font-bold text-3xl text-slate-800 focus:outline-none w-full"
                 />
               ) : (
                 <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight text-center">
                   {report?.title || format(new Date(), 'MMMM d, yyyy')}
                 </h2>
               )}
               <div className="flex items-center gap-2 mt-2 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                 <span>Last Updated: {report?.lastUpdated || '8:18 AM'}</span>
               </div>
            </div>
            <button className="text-[#3b82f6] font-bold text-lg opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
              {format(addDays(new Date(), 1), 'M/dd')} {'>>'}
            </button>
          </div>

          <div className="w-full h-px bg-[#dcd1b9] mb-8" />

          {/* Content */}
          <div className="w-full">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-80 bg-slate-50/50 border border-[#dcd1b9] rounded-lg p-4 text-slate-700 leading-relaxed font-sans text-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20"
                placeholder="Enter report content. Use [Blue Link Text] for blue text and **Bold Text** for bold."
              />
            ) : (
              <div className="max-w-none px-2">
                {report?.content ? (
                  report.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-slate-800 leading-relaxed font-sans text-base sm:text-lg mb-6 last:mb-0">
                      {paragraph.split(/(\[.*?\]|\*\*.*?\*\*)/g).map((part, j) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                          return <span key={j} className="text-[#3b82f6] font-medium hover:underline cursor-pointer">{part.slice(1, -1)}</span>;
                        }
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j} className="font-bold text-slate-950">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  ))
                ) : (
                  <div className="space-y-6 opacity-60">
                    <p className="text-slate-800 leading-relaxed font-sans text-base sm:text-lg">
                      The weather is heating up a bit on Saturday with **70° and higher** expected for about half of the outdoor games. The warmest game is in Phoenix where the [Chase Field] roof is scheduled to be [opened to 100° temps] for [Mets / Dbacks]. The heat in Arizona is a **dry heat** (just 7% humidity) which isn't quite as good for fly ball distance as it would be elsewhere.
                    </p>
                    <p className="text-slate-800 leading-relaxed font-sans text-base sm:text-lg">
                      It isn't warm everywhere as [Boston, Cleveland, and San Francisco] will all get temps **in the 50s**. [Fenway Park] is still a top-rated venue for offense as most of its run-scoring appeal comes from **hits inside the yard**. The wind is also expected to **blow out** for [Rays / Red Sox] this afternoon.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full flex items-center justify-between mt-8 pt-6 border-t border-[#dcd1b9]">
             <div className="flex items-center gap-2 text-[#22c55e] font-bold italic text-sm">
               <span>Written by Ballpark Pal (not AI-generated)</span>
             </div>

             {isAdmin && (
               <div className="flex items-center gap-2">
                 {isEditing ? (
                   <>
                     <button 
                       onClick={() => setIsEditing(false)}
                       className="p-2 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                     >
                       <X className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={handleSave}
                       className="flex items-center gap-2 bg-[#3b82f6] text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-[#2563eb] transition-colors shadow-sm focus:ring-2 focus:ring-blue-500/20"
                     >
                       <Save className="w-4 h-4" />
                       Save Report
                     </button>
                   </>
                 ) : (
                   <button 
                     onClick={() => setIsEditing(true)}
                     className="flex items-center gap-2 border border-[#dcd1b9] text-slate-600 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-[#ebe2cd] transition-colors"
                   >
                     <Edit2 className="w-4 h-4" />
                     Edit Report
                   </button>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
