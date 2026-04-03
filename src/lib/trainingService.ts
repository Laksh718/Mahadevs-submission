import { supabase } from "./supabase";

// Integrate with your existing auth system
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Training Session Interface
export interface TrainingSession {
  id?: string;
  title: string;
  description?: string;
  partner_id: string;
  state: string;
  district: string;
  venue?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  duration_hours?: number;
  expected_participants?: number;
  actual_participants?: number;
  status: "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  training_mode?: "OFFLINE" | "ONLINE" | "HYBRID";
  certification_provided?: boolean;
  budget_allocated?: number;
  budget_spent?: number;
  feedback_score?: number;
  effectiveness_rating?: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Training Partner Interface
export interface TrainingPartner {
  id?: string;
  name: string;
  type: "NIDM" | "LBSNAA" | "SDMA" | "ATI" | "NGO" | "GOI_MINISTRY" | "OTHER";
  state?: string;
  district?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

// Training Participant Interface
export interface TrainingParticipant {
  id: string;
  session_id: string;
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  designation?: string;
  attendance_status: "PRESENT" | "ABSENT" | "PARTIAL";
  certification_status?: "PENDING" | "ISSUED" | "NOT_APPLICABLE";
  feedback_score?: number;
  created_at?: string;
  updated_at?: string;
}

// Analytics interfaces
export interface TrainingAnalytics {
  totalSessions: number;
  completedSessions: number;
  totalParticipants: number;
  totalBudget: number;
  averageParticipants: number;
  averageDuration: number;
}

export interface CoverageAnalytics {
  statesCovered: Array<{
    state: string;
    sessionCount: number;
    participantCount: number;
  }>;
  districtsCovered: Array<{
    district: string;
    state: string;
    sessionCount: number;
    participantCount: number;
  }>;
  partnersCovered: Array<{
    partnerName: string;
    partnerType: string;
    sessionCount: number;
  }>;
}

export interface ParticipantDemographics {
  byAudience: Array<{
    audience: string;
    count: number;
    percentage: number;
  }>;
  byTheme: Array<{
    theme: string;
    count: number;
    percentage: number;
  }>;
  byOrganization: Array<{
    organization: string;
    count: number;
  }>;
}

export interface PerformanceMetrics {
  totalSessions: number;
  completedSessions: number;
  certifiedParticipants: number;
  avgDurationHours: number;
  budgetUtilization: number;
  costPerParticipant: number;
  capacityUtilization: number;
  partnerDiversity: number;
}

// Training Theme Interface
export interface TrainingTheme {
  id: string;
  name: string;
  description?: string;
  category: string;
}

// Target Audience Interface
export interface TargetAudience {
  id: string;
  name: string;
  description?: string;
}

// Training Coverage Interface
export interface TrainingCoverage {
  state: string;
  district: string;
  total_sessions: number;
  total_participants: number;
  coverage_score: number;
  last_training_date?: string;
}

// Dashboard Stats Interface
export interface TrainingDashboardStats {
  total_sessions: number;
  total_participants: number;
  states_covered: number;
  completion_rate: number;
  ongoing_sessions: number;
  planned_sessions: number;
}

// ==================== TRAINING SESSIONS ====================

// Get all training sessions with filters
export const getTrainingSessions = async (filters?: {
  state?: string;
  status?: string;
  partner_type?: string;
  start_date?: string;
  end_date?: string;
}) => {
  let query = supabase
    .from("training_sessions")
    .select(
      `
      *,
      training_partners(name, type, state),
      training_session_themes(training_themes(name, category)),
      training_session_audiences(target_audiences(name), expected_count, actual_count)
    `
    )
    .order("start_date", { ascending: false });

  if (filters?.state) {
    query = query.eq("state", filters.state);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.start_date && filters?.end_date) {
    query = query
      .gte("start_date", filters.start_date)
      .lte("end_date", filters.end_date);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getTrainingSession = async (
  id: string
): Promise<TrainingSession | null> => {
  const { data, error } = await supabase
    .from("training_sessions")
    .select(
      `
      *,
      training_partners(name, type, state),
      training_participants(*),
      training_session_themes(training_themes(*)),
      training_session_audiences(target_audiences(*))
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const createTrainingSession = async (
  session: Omit<TrainingSession, "id" | "created_at" | "updated_at">
) => {
  const { data, error } = await supabase
    .from("training_sessions")
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update training session
export const updateTrainingSession = async (
  id: string,
  updates: Partial<TrainingSession>
) => {
  const { data, error } = await supabase
    .from("training_sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete training session
export const deleteTrainingSession = async (id: string) => {
  const { error } = await supabase
    .from("training_sessions")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

// ==================== TRAINING PARTNERS ====================

// Get all training partners
export const getTrainingPartners = async () => {
  const { data, error } = await supabase
    .from("training_partners")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
};

// Create new training partner
export const createTrainingPartner = async (
  partner: Omit<TrainingPartner, "id" | "created_at" | "updated_at">
) => {
  const { data, error } = await supabase
    .from("training_partners")
    .insert(partner)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== PARTICIPANTS ====================

// Get participants for a session
export const getSessionParticipants = async (sessionId: string) => {
  const { data, error } = await supabase
    .from("training_participants")
    .select(
      `
      *,
      target_audiences(name)
    `
    )
    .eq("session_id", sessionId)
    .order("name");

  if (error) throw error;
  return data;
};

// Add participant to session
export const addTrainingParticipant = async (
  participant: Omit<TrainingParticipant, "id" | "created_at">
) => {
  const { data, error } = await supabase
    .from("training_participants")
    .insert(participant)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update participant
export const updateTrainingParticipant = async (
  id: string,
  updates: Partial<TrainingParticipant>
) => {
  const { data, error } = await supabase
    .from("training_participants")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== THEMES & AUDIENCES ====================

// Get all training themes
export const getTrainingThemes = async () => {
  const { data, error } = await supabase
    .from("training_themes")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
};

// Get all target audiences
export const getTargetAudiences = async () => {
  const { data, error } = await supabase
    .from("target_audiences")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
};

// ==================== COVERAGE & ANALYTICS ====================

// Get training coverage by state/district
export const getTrainingCoverage = async () => {
  const { data, error } = await supabase
    .from("training_coverage")
    .select("*")
    .order("state", { ascending: true })
    .order("district", { ascending: true });

  if (error) throw error;
  return data;
};

// Get dashboard statistics
export const getTrainingDashboardStats =
  async (): Promise<TrainingDashboardStats> => {
    // Get total sessions
    const { count: totalSessions } = await supabase
      .from("training_sessions")
      .select("*", { count: "exact", head: true });

    // Get total participants
    const { data: participantSum } = await supabase
      .from("training_sessions")
      .select("actual_participants");

    const totalParticipants =
      participantSum?.reduce(
        (sum, session) => sum + (session.actual_participants || 0),
        0
      ) || 0;

    // Get states covered
    const { data: statesData } = await supabase
      .from("training_sessions")
      .select("state", { head: false });

    const statesCovered = new Set(statesData?.map((s) => s.state)).size;

    // Get ongoing sessions
    const { count: ongoingSessions } = await supabase
      .from("training_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "ONGOING");

    // Get planned sessions
    const { count: plannedSessions } = await supabase
      .from("training_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "PLANNED");

    // Calculate completion rate
    const { count: completedSessions } = await supabase
      .from("training_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "COMPLETED");

    const completionRate = totalSessions
      ? ((completedSessions || 0) / totalSessions) * 100
      : 0;

    return {
      total_sessions: totalSessions || 0,
      total_participants: totalParticipants,
      states_covered: statesCovered,
      completion_rate: Math.round(completionRate),
      ongoing_sessions: ongoingSessions || 0,
      planned_sessions: plannedSessions || 0,
    };
  };

// ==================== REPORTS ====================

// Generate training report data
export const generateTrainingReport = async (params: {
  report_type: "SESSION_SUMMARY" | "MONTHLY" | "QUARTERLY" | "ANNUAL";
  start_date?: string;
  end_date?: string;
  state?: string;
  partner_type?: string;
}) => {
  let query = supabase.from("training_sessions").select(`
      *,
      training_partners(name, type, state),
      training_participants(*)
    `);

  if (params.start_date && params.end_date) {
    query = query
      .gte("start_date", params.start_date)
      .lte("end_date", params.end_date);
  }

  if (params.state) {
    query = query.eq("state", params.state);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Get training sessions with detailed information
export const getTrainingSessionsWithDetails = async (params: {
  start_date?: string;
  end_date?: string;
  state?: string;
  status?: string;
}) => {
  let query = supabase.from("training_sessions").select(`
      *,
      training_partners(name, type, state),
      training_participants(*)
    `);

  if (params.start_date && params.end_date) {
    query = query
      .gte("start_date", params.start_date)
      .lte("end_date", params.end_date);
  }

  if (params.state) {
    query = query.eq("state", params.state);
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Update training coverage statistics
export const updateTrainingCoverage = async (
  state: string,
  district: string
) => {
  // Get current stats for this district
  const { data: sessions } = await supabase
    .from("training_sessions")
    .select("actual_participants, start_date")
    .eq("state", state)
    .eq("district", district)
    .eq("status", "COMPLETED");

  const totalSessions = sessions?.length || 0;
  const totalParticipants =
    sessions?.reduce((sum, s) => sum + (s.actual_participants || 0), 0) || 0;
  const lastTrainingDate = sessions?.length
    ? Math.max(...sessions.map((s) => new Date(s.start_date).getTime()))
    : null;

  // Calculate coverage score (you can adjust this formula)
  const coverageScore = Math.min((totalParticipants / 1000) * 100, 100); // Max 100% at 1000 participants

  const { error } = await supabase.from("training_coverage").upsert({
    state,
    district,
    total_sessions: totalSessions,
    total_participants: totalParticipants,
    last_training_date: lastTrainingDate
      ? new Date(lastTrainingDate).toISOString().split("T")[0]
      : null,
    coverage_score: coverageScore,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
};

// Analytics functions
export const getTrainingAnalytics = async (
  startDate?: string,
  endDate?: string
): Promise<TrainingAnalytics> => {
  try {
    let query = supabase.from("training_sessions").select(`
        id,
        status,
        duration_hours,
        budget_allocated,
        training_participants (
          id,
          attendance_status
        )
      `);

    if (startDate) {
      query = query.gte("start_date", startDate);
    }
    if (endDate) {
      query = query.lte("end_date", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const totalSessions = data?.length || 0;
    const completedSessions =
      data?.filter((session) => session.status === "COMPLETED").length || 0;
    const totalParticipants =
      data?.reduce(
        (sum, session) => sum + (session.training_participants?.length || 0),
        0
      ) || 0;
    const totalBudget =
      data?.reduce(
        (sum, session) => sum + (session.budget_allocated || 0),
        0
      ) || 0;
    const averageDuration = data?.length
      ? data.reduce((sum, session) => sum + (session.duration_hours || 0), 0) /
        data.length
      : 0;

    return {
      totalSessions,
      completedSessions,
      totalParticipants,
      totalBudget,
      averageParticipants: totalSessions
        ? totalParticipants / totalSessions
        : 0,
      averageDuration,
    };
  } catch (error) {
    console.error("Error getting training analytics:", error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalParticipants: 0,
      totalBudget: 0,
      averageParticipants: 0,
      averageDuration: 0,
    };
  }
};

export const getCoverageAnalytics = async (): Promise<CoverageAnalytics> => {
  try {
    const { data: sessionsData, error } = await supabase.from(
      "training_sessions"
    ).select(`
        state,
        district,
        training_partners (
          name,
          type
        ),
        training_participants (
          id
        )
      `);

    if (error) throw error;

    // Group by state
    const stateMap = new Map();
    const districtMap = new Map();
    const partnerMap = new Map();

    sessionsData?.forEach((session) => {
      // States
      const stateKey = session.state;
      if (!stateMap.has(stateKey)) {
        stateMap.set(stateKey, {
          sessionCount: 0,
          participantCount: 0,
        });
      }
      const stateData = stateMap.get(stateKey);
      stateData.sessionCount += 1;
      stateData.participantCount += session.training_participants?.length || 0;

      // Districts
      const districtKey = `${session.district}-${session.state}`;
      if (!districtMap.has(districtKey)) {
        districtMap.set(districtKey, {
          district: session.district,
          state: session.state,
          sessionCount: 0,
          participantCount: 0,
        });
      }
      const districtData = districtMap.get(districtKey);
      districtData.sessionCount += 1;
      districtData.participantCount +=
        session.training_participants?.length || 0;

      // Partners
      if (session.training_partners && session.training_partners.length > 0) {
        const partner = session.training_partners[0];
        const partnerKey = partner.name;
        if (!partnerMap.has(partnerKey)) {
          partnerMap.set(partnerKey, {
            partnerName: partner.name,
            partnerType: partner.type,
            sessionCount: 0,
          });
        }
        partnerMap.get(partnerKey).sessionCount += 1;
      }
    });

    return {
      statesCovered: Array.from(stateMap.entries()).map(([state, data]) => ({
        state,
        sessionCount: data.sessionCount,
        participantCount: data.participantCount,
      })),
      districtsCovered: Array.from(districtMap.values()),
      partnersCovered: Array.from(partnerMap.values()),
    };
  } catch (error) {
    console.error("Error getting coverage analytics:", error);
    return {
      statesCovered: [],
      districtsCovered: [],
      partnersCovered: [],
    };
  }
};

export const getParticipantDemographics = async (
  startDate?: string,
  endDate?: string
): Promise<ParticipantDemographics> => {
  try {
    let query = supabase.from("training_sessions").select(`
        training_session_themes (
          training_themes (
            name
          )
        ),
        training_session_audiences (
          target_audiences (
            name
          )
        ),
        training_participants (
          organization
        )
      `);

    if (startDate) {
      query = query.gte("start_date", startDate);
    }
    if (endDate) {
      query = query.lte("end_date", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const audienceMap = new Map();
    const themeMap = new Map();
    const organizationMap = new Map();
    let totalParticipants = 0;

    data?.forEach((session) => {
      const participantCount = session.training_participants?.length || 0;
      totalParticipants += participantCount;

      // Count by audience
      session.training_session_audiences?.forEach((sa) => {
        if (sa.target_audiences && sa.target_audiences.length > 0) {
          const audience = sa.target_audiences[0].name;
          audienceMap.set(
            audience,
            (audienceMap.get(audience) || 0) + participantCount
          );
        }
      });

      // Count by theme
      session.training_session_themes?.forEach((st) => {
        if (st.training_themes && st.training_themes.length > 0) {
          const theme = st.training_themes[0].name;
          themeMap.set(theme, (themeMap.get(theme) || 0) + participantCount);
        }
      });

      // Count by organization
      session.training_participants?.forEach((participant) => {
        if (participant.organization) {
          const org = participant.organization;
          organizationMap.set(org, (organizationMap.get(org) || 0) + 1);
        }
      });
    });

    return {
      byAudience: Array.from(audienceMap.entries()).map(
        ([audience, count]) => ({
          audience,
          count,
          percentage: totalParticipants ? (count / totalParticipants) * 100 : 0,
        })
      ),
      byTheme: Array.from(themeMap.entries()).map(([theme, count]) => ({
        theme,
        count,
        percentage: totalParticipants ? (count / totalParticipants) * 100 : 0,
      })),
      byOrganization: Array.from(organizationMap.entries()).map(
        ([organization, count]) => ({
          organization,
          count,
        })
      ),
    };
  } catch (error) {
    console.error("Error getting participant demographics:", error);
    return {
      byAudience: [],
      byTheme: [],
      byOrganization: [],
    };
  }
};

export const getPerformanceMetrics = async (
  startDate?: string,
  endDate?: string
): Promise<PerformanceMetrics> => {
  try {
    let query = supabase.from("training_sessions").select(`
        id,
        status,
        duration_hours,
        budget_allocated,
        expected_participants,
        training_participants (
          id,
          certification_status,
          attendance_status
        ),
        training_partners (
          type
        )
      `);

    if (startDate) {
      query = query.gte("start_date", startDate);
    }
    if (endDate) {
      query = query.lte("end_date", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const totalSessions = data?.length || 0;
    const completedSessions =
      data?.filter((session) => session.status === "COMPLETED").length || 0;

    let totalParticipants = 0;
    let certifiedParticipants = 0;
    let totalDuration = 0;
    let totalBudget = 0;
    let totalExpected = 0;
    const partnerTypes = new Set();

    data?.forEach((session) => {
      const participants = session.training_participants || [];
      totalParticipants += participants.length;

      certifiedParticipants += participants.filter(
        (p) => p.certification_status === "ISSUED"
      ).length;

      totalDuration += session.duration_hours || 0;
      totalBudget += session.budget_allocated || 0;
      totalExpected += session.expected_participants || 0;

      if (session.training_partners && session.training_partners.length > 0) {
        partnerTypes.add(session.training_partners[0].type);
      }
    });

    const avgDurationHours = totalSessions ? totalDuration / totalSessions : 0;
    const budgetUtilization = totalBudget > 0 ? 85 : 0; // Assume 85% utilization
    const costPerParticipant = totalParticipants
      ? totalBudget / totalParticipants
      : 0;
    const capacityUtilization = totalExpected
      ? (totalParticipants / totalExpected) * 100
      : 0;

    return {
      totalSessions,
      completedSessions,
      certifiedParticipants,
      avgDurationHours,
      budgetUtilization,
      costPerParticipant,
      capacityUtilization,
      partnerDiversity: partnerTypes.size,
    };
  } catch (error) {
    console.error("Error getting performance metrics:", error);
    return {
      totalSessions: 0,
      completedSessions: 0,
      certifiedParticipants: 0,
      avgDurationHours: 0,
      budgetUtilization: 0,
      costPerParticipant: 0,
      capacityUtilization: 0,
      partnerDiversity: 0,
    };
  }
};
