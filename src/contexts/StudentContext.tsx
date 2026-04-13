import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface StudentSession {
 studentId: string;
 nickname: string;
 classId: string;
 className: string;
}

interface StudentContextType {
 session: StudentSession | null;
 joinClass: (
 joinCode: string,
 nickname: string
 ) => Promise<{ success: boolean; error?: string; rejoined?: boolean }>;
 leaveClass: () => void;
}

function isValidStudentSession(value: unknown): value is StudentSession {
 if (!value || typeof value !== 'object') return false;
 const v = value as Record<string, unknown>;
 return (
  typeof v.studentId === 'string' &&
  typeof v.nickname === 'string' &&
  typeof v.classId === 'string' &&
  typeof v.className === 'string'
 );
}

function readSavedSession(): StudentSession | null {
 const saved = localStorage.getItem('weedid_student');
 if (!saved) return null;

 try {
  const parsed: unknown = JSON.parse(saved);
  if (isValidStudentSession(parsed)) return parsed;
 } catch {
  // Invalid JSON in persisted storage should never crash app boot
 }

 localStorage.removeItem('weedid_student');
 return null;
}

const StudentContext = createContext<StudentContextType | null>(null);

export function useStudent() {
 const ctx = useContext(StudentContext);
 if (!ctx) throw new Error('useStudent must be inside StudentProvider');
 return ctx;
}

export function StudentProvider({ children }: { children: ReactNode }) {
 const [session, setSession] = useState<StudentSession | null>(() => readSavedSession());

 const joinClass = useCallback(async (joinCode: string, nickname: string) => {
 // Look up class by join code
 const { data: classData, error: classErr } = await supabase
 .from('classes')
 .select('id, name')
 .eq('join_code', joinCode.toUpperCase().trim())
 .maybeSingle();

 if (classErr) {
 logger.devWarn('[joinClass] class lookup', classErr.message);
 return {
 success: false,
 error: "We couldn't look up that class. Check your connection and try again, or ask your instructor.",
 };
 }
 if (!classData) {
 return { success: false, error: 'Invalid join code. Please check with your instructor.' };
 }

 // Check if nickname already exists in this class
 const { data: existing, error: existingErr } = await supabase
 .from('students')
 .select('id')
 .eq('class_id', classData.id)
 .eq('nickname', nickname.trim())
 .maybeSingle();

 if (existingErr) {
 logger.devWarn('[joinClass] student lookup', existingErr.message);
 return {
 success: false,
 error: "We couldn't verify your nickname. Check your connection and try again.",
 };
 }

 let studentId: string;
 let rejoined = false;

 if (existing) {
 // Rejoin as existing student
 rejoined = true;
 studentId = existing.id;
 } else {
 // Create new student
 const { data: newStudent, error: insertErr } = await supabase
 .from('students')
 .insert({ class_id: classData.id, nickname: nickname.trim() })
 .select('id')
 .single();

 if (insertErr || !newStudent) {
 logger.devWarn('[joinClass] insert student', insertErr?.message);
 const code = insertErr?.code;
 const msg = insertErr?.message?.toLowerCase() ?? '';
 if (code === '23505' || msg.includes('unique') || msg.includes('duplicate')) {
 return {
 success: false,
 error: 'That nickname is already taken in this class. Pick a different nickname.',
 };
 }
 return {
 success: false,
 error: "We couldn't join you to the class. Please try again or ask your instructor.",
 };
 }
 studentId = newStudent.id;
 }

 const sess: StudentSession = {
 studentId,
 nickname: nickname.trim(),
 classId: classData.id,
 className: classData.name,
 };
 setSession(sess);
 localStorage.setItem('weedid_student', JSON.stringify(sess));
 return { success: true, rejoined };
 }, []);

 const leaveClass = useCallback(() => {
 setSession(null);
 localStorage.removeItem('weedid_student');
 }, []);

 /* Poll every 20 seconds to detect if the instructor ended the session */
 useEffect(() => {
 if (!session) return;
 const check = async () => {
 const { data } = await supabase
 .from('classes')
 .select('id')
 .eq('id', session.classId)
 .maybeSingle();
 if (!data) {
 setSession(null);
 localStorage.removeItem('weedid_student');
 toast.info('Your class session has ended. Thanks for playing!', { duration: 6000 });
 }
 };
 const interval = setInterval(check, 20000);
 return () => clearInterval(interval);
 }, [session]);

 return (
 <StudentContext.Provider value={{ session, joinClass, leaveClass }}>
 {children}
 </StudentContext.Provider>
 );
}
