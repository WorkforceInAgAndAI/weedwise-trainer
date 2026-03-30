export type Json =
 | string
 | number
 | boolean
 | null
 | { [key: string]: Json | undefined }
 | Json[]

export type Database = {
 // Allows to automatically instantiate createClient with right options
 // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
 __InternalSupabase: {
 PostgrestVersion: "14.1"
 }
 public: {
 Tables: {
 classes: {
 Row: {
 created_at: string
 description: string | null
 id: string
 instructor_id: string | null
 instructor_name: string
 join_code: string
 name: string
 year: string | null
 }
 Insert: {
 created_at?: string
 description?: string | null
 id?: string
 instructor_id?: string | null
 instructor_name: string
 join_code: string
 name: string
 year?: string | null
 }
 Update: {
 created_at?: string
 description?: string | null
 id?: string
 instructor_id?: string | null
 instructor_name?: string
 join_code?: string
 name?: string
 year?: string | null
 }
 Relationships: [
 {
 foreignKeyName: "classes_instructor_id_fkey"
 columns: ["instructor_id"]
 isOneToOne: false
 referencedRelation: "instructors"
 referencedColumns: ["id"]
 },
 ]
 }
 competition_scores: {
 Row: {
 competition_id: string
 completed: boolean
 correct_count: number
 created_at: string
 id: string
 score: number
 student_id: string
 team_name: string | null
 time_taken_ms: number
 total_count: number
 }
 Insert: {
 competition_id: string
 completed?: boolean
 correct_count?: number
 created_at?: string
 id?: string
 score?: number
 student_id: string
 team_name?: string | null
 time_taken_ms?: number
 total_count?: number
 }
 Update: {
 competition_id?: string
 completed?: boolean
 correct_count?: number
 created_at?: string
 id?: string
 score?: number
 student_id?: string
 team_name?: string | null
 time_taken_ms?: number
 total_count?: number
 }
 Relationships: [
 {
 foreignKeyName: "competition_scores_competition_id_fkey"
 columns: ["competition_id"]
 isOneToOne: false
 referencedRelation: "competition_sessions"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "competition_scores_student_id_fkey"
 columns: ["student_id"]
 isOneToOne: false
 referencedRelation: "students"
 referencedColumns: ["id"]
 },
 ]
 }
 competition_sessions: {
 Row: {
 class_id: string
 created_at: string
 created_by: string
 ended_at: string | null
 grade_level: string
 id: string
 mode: string
 question_count: number
 question_seed: string
 started_at: string | null
 status: string
 time_limit_seconds: number
 }
 Insert: {
 class_id: string
 created_at?: string
 created_by: string
 ended_at?: string | null
 grade_level: string
 id?: string
 mode?: string
 question_count?: number
 question_seed?: string
 started_at?: string | null
 status?: string
 time_limit_seconds?: number
 }
 Update: {
 class_id?: string
 created_at?: string
 created_by?: string
 ended_at?: string | null
 grade_level?: string
 id?: string
 mode?: string
 question_count?: number
 question_seed?: string
 started_at?: string | null
 status?: string
 time_limit_seconds?: number
 }
 Relationships: [
 {
 foreignKeyName: "competition_sessions_class_id_fkey"
 columns: ["class_id"]
 isOneToOne: false
 referencedRelation: "classes"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "competition_sessions_created_by_fkey"
 columns: ["created_by"]
 isOneToOne: false
 referencedRelation: "students"
 referencedColumns: ["id"]
 },
 ]
 }
 game_sessions: {
 Row: {
 created_at: string
 grade_level: string
 id: string
 phases_completed: number
 session_data: Json | null
 species_mastered: number
 streak_best: number
 student_id: string
 total_correct: number
 total_wrong: number
 total_xp: number
 updated_at: string
 }
 Insert: {
 created_at?: string
 grade_level: string
 id?: string
 phases_completed?: number
 session_data?: Json | null
 species_mastered?: number
 streak_best?: number
 student_id: string
 total_correct?: number
 total_wrong?: number
 total_xp?: number
 updated_at?: string
 }
 Update: {
 created_at?: string
 grade_level?: string
 id?: string
 phases_completed?: number
 session_data?: Json | null
 species_mastered?: number
 streak_best?: number
 student_id?: string
 total_correct?: number
 total_wrong?: number
 total_xp?: number
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "game_sessions_student_id_fkey"
 columns: ["student_id"]
 isOneToOne: false
 referencedRelation: "students"
 referencedColumns: ["id"]
 },
 ]
 }
 instructors: {
 Row: {
 created_at: string
 display_name: string
 id: string
 user_id: string
 }
 Insert: {
 created_at?: string
 display_name: string
 id?: string
 user_id: string
 }
 Update: {
 created_at?: string
 display_name?: string
 id?: string
 user_id?: string
 }
 Relationships: []
 }
 student_badges: {
 Row: {
 badge_id: string
 earned_at: string
 id: string
 student_id: string
 }
 Insert: {
 badge_id: string
 earned_at?: string
 id?: string
 student_id: string
 }
 Update: {
 badge_id?: string
 earned_at?: string
 id?: string
 student_id?: string
 }
 Relationships: [
 {
 foreignKeyName: "student_badges_student_id_fkey"
 columns: ["student_id"]
 isOneToOne: false
 referencedRelation: "students"
 referencedColumns: ["id"]
 },
 ]
 }
 students: {
 Row: {
 class_id: string
 created_at: string
 id: string
 nickname: string
 user_id: string | null
 }
 Insert: {
 class_id: string
 created_at?: string
 id?: string
 nickname: string
 user_id?: string | null
 }
 Update: {
 class_id?: string
 created_at?: string
 id?: string
 nickname?: string
 user_id?: string | null
 }
 Relationships: [
 {
 foreignKeyName: "students_class_id_fkey"
 columns: ["class_id"]
 isOneToOne: false
 referencedRelation: "classes"
 referencedColumns: ["id"]
 },
 ]
 }
 }
 Views: {
 [_ in never]: never
 }
 Functions: {
 generate_join_code: { Args: never; Returns: string }
 }
 Enums: {
 [_ in never]: never
 }
 CompositeTypes: {
 [_ in never]: never
 }
 }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
 DefaultSchemaTableNameOrOptions extends
 | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
 Row: infer R
 }
 ? R
 : never
 : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
 DefaultSchema["Views"])
 ? (DefaultSchema["Tables"] &
 DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
 Row: infer R
 }
 ? R
 : never
 : never

export type TablesInsert<
 DefaultSchemaTableNameOrOptions extends
 | keyof DefaultSchema["Tables"]
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Insert: infer I
 }
 ? I
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Insert: infer I
 }
 ? I
 : never
 : never

export type TablesUpdate<
 DefaultSchemaTableNameOrOptions extends
 | keyof DefaultSchema["Tables"]
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Update: infer U
 }
 ? U
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Update: infer U
 }
 ? U
 : never
 : never

export type Enums<
 DefaultSchemaEnumNameOrOptions extends
 | keyof DefaultSchema["Enums"]
 | { schema: keyof DatabaseWithoutInternals },
 EnumName extends DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
 : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
 : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
 ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
 : never

export type CompositeTypes<
 PublicCompositeTypeNameOrOptions extends
 | keyof DefaultSchema["CompositeTypes"]
 | { schema: keyof DatabaseWithoutInternals },
 CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
 : never = never,
> = PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
 : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
 ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
 : never

export const Constants = {
 public: {
 Enums: {},
 },
} as const
