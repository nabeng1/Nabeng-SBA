/**
 * Subscription module — Paystack termly / yearly (same account as Nabeng Invoice)
 */
import { SBA } from "../runtime.js";

const SBA_TERMLY_AMOUNT_PESEWAS = 10000; // GHS 100
const SBA_YEARLY_AMOUNT_PESEWAS = 28000; // GHS 280
const SBA_PAYSTACK_PUBLIC_KEY =
  SBA.config?.paystackPublicKey ||
  "pk_live_d840cd5de76b748752770285dbdb00e940554827";
const SBA_TRIAL_DAYS = SBA.config?.trialDays || 14;

function client() {
  return window.supabaseClient || SBA.supabase;
}
function user() {
  return window.currentUser || SBA.state.currentUser;
}
function setUser(u) {
  window.currentUser = u;
  if (SBA.state) SBA.state.currentUser = u;
}

function sbaAddDuration(fromDate, plan) {
  const d = new Date(fromDate);
  if (plan === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setDate(d.getDate() + 16 * 7);
  return d;
}

function sbaGeneratePaymentRef() {
  try {
    return `SBA-${crypto.randomUUID()}`;
  } catch (e) {
    return `SBA-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function sbaSubscriptionAllowed(profile) {
  const p = profile || {};
  const now = new Date();
  if (p.subscription_status === "trial" && p.trial_ends_at && new Date(p.trial_ends_at) > now) {
    return { allowed: true, status: "trial", endsAt: p.trial_ends_at, plan: "trial" };
  }
  if (p.subscription_status === "active" && p.subscription_ends_at && new Date(p.subscription_ends_at) > now) {
    return { allowed: true, status: "active", plan: p.subscription_plan || "termly", endsAt: p.subscription_ends_at };
  }
  if (p.subscription_status === "pending") return { allowed: false, status: "pending" };
  return { allowed: false, status: "locked" };
}

async function sbaLoadSchoolSubscription(schoolid) {
  if (!schoolid || !client()) return null;
  try {
    let { data, error } = await client()
      .from("schools")
      .select("schoolid,schoolname,subscription_status,subscription_plan,subscription_ends_at,trial_ends_at,last_payment_ref")
      .eq("schoolid", schoolid)
      .maybeSingle();
    if (error) {
      console.warn("School subscription load:", error.message || error);
      const fallback = await client()
        .from("schools")
        .select("schoolid,schoolname")
        .eq("schoolid", schoolid)
        .maybeSingle();
      return fallback.error ? null : fallback.data;
    }
    return data;
  } catch (e) {
    console.warn("sbaLoadSchoolSubscription:", e);
    return null;
  }
}

async function sbaEnsureTrialIfMissing(school) {
  if (!school || !school.schoolid) return school;
  if (school.subscription_status || school.subscription_ends_at || school.trial_ends_at) return school;
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + SBA_TRIAL_DAYS);
  try {
    const { data, error } = await client()
      .from("schools")
      .update({ subscription_status: "trial", trial_ends_at: trialEnd.toISOString() })
      .eq("schoolid", school.schoolid)
      .select("schoolid,schoolname,subscription_status,subscription_plan,subscription_ends_at,trial_ends_at,last_payment_ref")
      .maybeSingle();
    if (!error && data) return data;
    if (error) console.warn("Could not save trial (run SQL migration). Using local trial.", error.message || error);
  } catch (e) {
    console.warn("trial bootstrap:", e);
  }
  return { ...school, subscription_status: "trial", trial_ends_at: trialEnd.toISOString() };
}

function sbaShowSubscriptionLock(info) {
  const lock = document.getElementById("subscriptionLockedScreen");
  const app = document.getElementById("app");
  const login = document.getElementById("loginBox");
  if (login) login.style.display = "none";
  if (app) app.style.display = "none";
  if (lock) lock.style.display = "flex";

  const statusEl = document.getElementById("subLockStatus");
  const adminPlans = document.getElementById("subPlansAdmin");
  const teacherMsg = document.getElementById("subPlansTeacher");
  const meta = document.getElementById("subLockMeta");
  const role = String(user()?.role || "").toLowerCase();

  if (statusEl) {
    if (info?.status === "pending") statusEl.textContent = "Payment submitted — waiting for confirmation…";
    else if (info?.status === "locked") statusEl.textContent = "Your school subscription has ended. Renew to continue using Nabeng-SBA.";
    else statusEl.textContent = "Choose a plan to continue using Nabeng-SBA for your school.";
  }
  if (role === "admin") {
    if (adminPlans) adminPlans.style.display = "grid";
    if (teacherMsg) teacherMsg.style.display = "none";
  } else {
    if (adminPlans) adminPlans.style.display = "none";
    if (teacherMsg) teacherMsg.style.display = "block";
  }
  if (meta) {
    meta.textContent = role === "admin"
      ? "Termly = 16 weeks · Yearly = 12 months from payment date"
      : "";
  }
}

function sbaHideSubscriptionLock() {
  const lock = document.getElementById("subscriptionLockedScreen");
  if (lock) lock.style.display = "none";
}

function sbaSetLockMsg(text, type) {
  const el = document.getElementById("subLockMsg");
  if (!el) return;
  el.textContent = text || "";
  el.className = "sba-sub-msg" + (type ? " " + type : "");
}

async function sbaCheckSubscriptionAccess() {
  const u = user();
  if (!u?.schoolid) return { allowed: true, status: "unscoped" };
  let school = await sbaLoadSchoolSubscription(u.schoolid);
  if (school) school = await sbaEnsureTrialIfMissing(school);
  const source = school || u;
  const access = sbaSubscriptionAllowed(source);
  if (u) u._schoolSubscription = source;
  return access;
}

async function sbaGateAfterLogin() {
  const access = await sbaCheckSubscriptionAccess();
  if (access.allowed) {
    sbaHideSubscriptionLock();
    return true;
  }
  sbaShowSubscriptionLock(access);
  return false;
}

async function startSbaPaystackPayment(plan) {
  const u = user();
  if (String(u?.role || "").toLowerCase() !== "admin") {
    sbaSetLockMsg("Only the school administrator can pay for the subscription.", "error");
    return;
  }
  if (!u?.schoolid) {
    sbaSetLockMsg("No school linked to this account.", "error");
    return;
  }
  const amount = plan === "yearly" ? SBA_YEARLY_AMOUNT_PESEWAS : SBA_TERMLY_AMOUNT_PESEWAS;
  const reference = sbaGeneratePaymentRef();
  const email = u.email || u.username || "";
  if (!email) {
    sbaSetLockMsg("Add an email to your admin profile before paying.", "error");
    return;
  }
  try {
    await client()
      .from("schools")
      .update({ last_payment_ref: reference, subscription_plan: plan, subscription_status: "pending" })
      .eq("schoolid", u.schoolid);
  } catch (e) {
    console.warn("pending mark:", e);
  }
  if (!window.PaystackPop) {
    sbaSetLockMsg("Paystack failed to load. Check your internet connection.", "error");
    return;
  }
  const handler = window.PaystackPop.setup({
    key: SBA_PAYSTACK_PUBLIC_KEY,
    email,
    amount,
    currency: "GHS",
    ref: reference,
    metadata: {
      schoolid: u.schoolid,
      user_id: u.id,
      plan,
      product: "nabeng_sba_subscription"
    },
    callback: function (response) {
      sbaSetLockMsg("Payment received. Activating your school subscription…", "success");
      sbaActivateSubscriptionAfterPayment(plan, response?.reference || reference);
    },
    onClose: function () {
      sbaSetLockMsg("Payment window closed. You can try again anytime.", "error");
    }
  });
  handler.openIframe();
}

async function sbaActivateSubscriptionAfterPayment(plan, reference) {
  const u = user();
  const starts = new Date();
  const ends = sbaAddDuration(starts, plan === "yearly" ? "yearly" : "termly");
  const payload = {
    subscription_status: "active",
    subscription_plan: plan,
    subscription_ends_at: ends.toISOString(),
    last_payment_ref: reference || null
  };
  try {
    const { error } = await client().from("schools").update(payload).eq("schoolid", u.schoolid);
    if (error) {
      sbaSetLockMsg("Payment OK but could not save subscription. Ref: " + reference, "error");
      return;
    }
  } catch (e) {
    sbaSetLockMsg("Could not update school subscription. Ref: " + reference, "error");
    return;
  }
  sbaSetLockMsg("Subscription active until " + ends.toLocaleDateString() + ". Opening…", "success");
  setTimeout(() => {
    sbaHideSubscriptionLock();
    const app = document.getElementById("app");
    if (app) app.style.display = "block";
    try {
      if (typeof window.showPage === "function") window.showPage("dashboardPage");
      if (typeof window.updateDashboard === "function") window.updateDashboard();
    } catch (e) {}
  }, 900);
}

// HTML onclick + core access
window.sbaGateAfterLogin = sbaGateAfterLogin;
window.sbaCheckSubscriptionAccess = sbaCheckSubscriptionAccess;
window.startSbaPaystackPayment = startSbaPaystackPayment;
window.sbaShowSubscriptionLock = sbaShowSubscriptionLock;
window.sbaHideSubscriptionLock = sbaHideSubscriptionLock;
window.sbaActivateSubscriptionAfterPayment = sbaActivateSubscriptionAfterPayment;
window.sbaSubscriptionAllowed = sbaSubscriptionAllowed;
