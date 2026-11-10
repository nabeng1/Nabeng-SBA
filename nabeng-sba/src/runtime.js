/**
 * Nabeng-SBA runtime — shared config & state (like Nabeng Invoice runtime.js)
 * Supabase client comes from the CDN script on system.html (window.supabase).
 */

const SBA = (window.SBA = window.SBA || {});

SBA.config = {
  supabaseUrl: "https://ftslcifbzohhgljqcgus.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c2xjaWZiem9oaGdsanFjZ3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTQ5NjUsImV4cCI6MjA5NTAzMDk2NX0.O6bGKNOdRDH1u2t-MiK8y0ppO-q-P4gggSeDEGsoUrQ",
  brandLogo: "/nabeng-sba-logo.png",
  paystackPublicKey: "pk_live_d840cd5de76b748752770285dbdb00e940554827",
  termlyAmountPesewas: 10000,
  yearlyAmountPesewas: 28000,
  trialDays: 14,
  // Paystack fee rate used to gross-up charge (not shown on form)
  paystackFeeRate: 0.0195
};

SBA.state = SBA.state || {
  currentUser: null,
  students: [],
  filteredStudents: [],
  subjects: [],
  users: [],
  activeTerm: "term1",
  currentStudent: null,
  selectedSubject: null,
  attendanceData: {},
  teacherHomeworkData: [],
  teacherHomeworkSubmissions: [],
  homeworkWeekOffset: 0,
  homeworkTermSelected: "term1",
  termSettings: null,
  gradeChartInstance: null,
  topChartInstance: null,
  subjectChartInstance: null,
  passChartInstance: null
};

function ensureSupabase() {
  if (window.supabaseClient) return window.supabaseClient;
  if (window.supabase && typeof window.supabase.createClient === "function") {
    window.supabaseClient = window.supabase.createClient(
      SBA.config.supabaseUrl,
      SBA.config.supabaseAnonKey,
      {
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
          flowType: "implicit"
        }
      }
    );
    return window.supabaseClient;
  }
  console.error("[SBA] Supabase CDN not loaded yet");
  return null;
}

SBA.supabase = ensureSupabase();
SBA.$ = (id) => document.getElementById(id);

// Mirror state on window for classic app-core.js
Object.keys(SBA.state).forEach((key) => {
  try {
    Object.defineProperty(window, key, {
      get() { return SBA.state[key]; },
      set(v) { SBA.state[key] = v; },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    // already defined
  }
});

window.supabaseUrl = SBA.config.supabaseUrl;
window.supabaseKey = SBA.config.supabaseAnonKey;
window.SBA = SBA;

export default SBA;
export { SBA, ensureSupabase };
