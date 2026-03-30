import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentSession {
 studentId: string;
 nickname: string;
 classId: string;
 className: string;
}

interface StudentContextType {
 session: StudentSession | null;
 joinClass: (joinCode: string, nickname: string) => Promise<{ success: boolean; error?: string }>;
 leaveClass: () => void;
}

const StudentContext = createContext<StudentContextType | null>(null);

export function useStudent() {
 const ctx = useContext(StudentContext);
 if (!ctx) throw new Error('useStudent must be inside StudentProvider');
 return ctx;
}

export function StudentProvider({ children }: { children: ReactNode }) {
 const [session, setSession] = useState<StudentSession | null>(() => {
 const saved = localStorage.getItem('weedid_student');
 return saved ? JSON.parse(saved) : null;
 });

 const joinClass = useCallback(async (joinCode: string, nickname: string) => {
 // Look up class by join code
 const { data: classData, error: classErr } = await supabase
 .from('classes')
 .select('id, name')
 .eq('join_code', joinCode.toUpperCase().trim())
 .maybeSingle();

 if (classErr || !classData) {
 return { success: false, error: 'Invalid join code. Please check with your instructor.' };
 }

 // Check if nickname already exists in this class
 const { data: existing } = await supabase
 .from('students')
 .select('id')
 .eq('class_id', classData.id)
 .eq('nickname', nickname.trim())
 .maybeSingle();

 let studentId: string;

 if (existing) {
 // Rejoin as existing student
 studentId = existing.id;
 } else {
 // Create new student
 const { data: newStudent, error: insertErr } = await supabase
 .from('students')
 .insert({ class_id: classData.id, nickname: nickname.trim() })
 .select('id')
 .single();

 if (insertErr || !newStudent) {
 return { success: false, error: 'Failed to join class. Please try again.' };
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
 return { success: true };
 }, []);

 const leaveClass = useCallback(() => {
 setSession(null);
 localStorage.removeItem('weedid_student');
 }, []);

 return (
 <StudentContext.Provider value={{ session, joinClass, leaveClass }}>
 {children}
 </StudentContext.Provider>
 );
}
