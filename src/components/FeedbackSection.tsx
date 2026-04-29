import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const FeedbackSection: React.FC = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => {
    const handleOpen = () => setShowForm(true);
    window.addEventListener('open-feedback-form', handleOpen);
    return () => window.removeEventListener('open-feedback-form', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !auth.currentUser) return;

    setStatus('submitting');
    try {
      const feedbackPath = 'feedback';
      await addDoc(collection(db, feedbackPath), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        message: message.trim(),
        page: window.location.pathname,
        createdAt: serverTimestamp()
      });
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setStatus('idle');
        setShowForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setStatus('error');
      // Use the mandated error handler
      try {
        handleFirestoreError(error, OperationType.WRITE, 'feedback');
      } catch (err) {
        // Log it but don't crash the component
        console.error('Handled Firestore Error:', err);
      }
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="mt-12 mb-8 px-4 max-w-2xl mx-auto">
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent -mr-16 -mt-16 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Feedback & Bugs</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Help us build the ultimate Salami Tracker</p>
            </div>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
            >
              Share Feedback
            </button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you like, what's broken, or what features you want next..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 min-h-[120px] transition-all resize-none"
                  disabled={status === 'submitting' || status === 'success'}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-[9px] font-mono text-slate-500 leading-relaxed max-w-[240px]">
                  * Your feedback is tied to your account so we can follow up if needed.
                </p>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                    disabled={status === 'submitting'}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={status === 'submitting' || status === 'success' || !message.trim()}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                      status === 'success' ? "bg-green-600 text-white shadow-green-600/20" :
                      status === 'error' ? "bg-red-600 text-white shadow-red-600/20" :
                      "bg-white text-slate-950 hover:bg-slate-200 shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {status === 'submitting' ? (
                      <div className="w-3 h-3 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                    ) : status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : status === 'error' ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Received!' : status === 'error' ? 'Failed' : 'Submit'}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
