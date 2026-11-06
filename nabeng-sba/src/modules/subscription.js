/**
 * Subscription module — Paystack termly / yearly (same account as Nabeng Invoice)
 */
import { SBA } from "../runtime.js";

// Display / net amounts (what the school sees on the form)
const SBA_TERMLY_AMOUNT_PESEWAS = 10000; // GHS 100 — shown on form
const SBA_YEARLY_AMOUNT_PESEWAS = 28000; // GHS 280 — shown on form

/*
 * Paystack deducts a processing fee from the merchant settlement.
 * To land close to the full list price in your account, we charge a
 * slightly higher amount at Paystack only. The subscription form still
 * shows GHS 100 / GHS 280 — the fee uplift is not shown there.
 *
 * Default ~1.95% local rate + small buffer. Adjust SBA_PAYSTACK_FEE_RATE
 * if your actual Paystack rate differs.
 */
const SBA_PAYSTACK_FEE_RATE =
  (SBA.config && typeof SBA.config.paystackFeeRate === "number")
    ? SBA.config.paystackFeeRate
    : 0.0195; // 1.95%

const SBA_PAYSTACK_PUBLIC_KEY =
  SBA.config?.paystackPublicKey ||
  "pk_live_d840cd5de76b748752770285dbdb00e940554827";
const SBA_TRIAL_DAYS = SBA.config?.trialDays || 14;

/**
 * Gross amount (pesewas) to send to Paystack so settlement ≈ netAmount.
 * Rounded up to the next pesewa.
 */
function sbaPaystackChargeAmount(netPesewas) {
  const net = Math.max(0, Number(netPesewas) || 0);
  const rate = Math.min(0.2, Math.max(0, Number(SBA_PAYSTACK_FEE_RATE) || 0));
  if (rate <= 0) return Math.round(net);
  // amount such that amount * (1 - rate) ≈ net  →  amount = net / (1 - rate)
  const gross = net / (1 - rate);
  return Math.ceil(gross); // pesewas, never undercharge
}

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
  const continueBtn = document.getElementById("subContinueTrialBtn");
  const role = String(user()?.role || "").toLowerCase();
  const optional = !!(info && info.optional);

  // Remember mode so payment / continue handlers know context
  if (lock) lock.dataset.mode = optional ? "optional" : "locked";

  if (statusEl) {
    if (info?.status === "pending") {
      statusEl.textContent = "Payment submitted — waiting for confirmation…";
    } else if (optional && info?.status === "trial") {
      const ends = info.endsAt ? new Date(info.endsAt).toLocaleDateString() : "";
      statusEl.textContent = ends
        ? `You are on a free trial until ${ends}. You can subscribe now — no need to wait until it ends.`
        : "You are on a free trial. You can subscribe now — no need to wait until it ends.";
    } else if (optional && info?.status === "active") {
      const ends = info.endsAt ? new Date(info.endsAt).toLocaleDateString() : "";
      statusEl.textContent = ends
        ? `Your school plan is active until ${ends}. Renew or change plan below.`
        : "Your school plan is active. Renew or change plan below.";
    } else if (info?.status === "locked") {
      statusEl.textContent = "Your school subscription has ended. Renew to continue using Nabeng-SBA.";
    } else {
      statusEl.textContent = "Choose a plan to continue using Nabeng-SBA for your school.";
    }
  }

  if (role === "admin") {
    if (adminPlans) adminPlans.style.display = "grid";
    if (teacherMsg) teacherMsg.style.display = "none";
  } else {
    if (adminPlans) adminPlans.style.display = "none";
    if (teacherMsg) teacherMsg.style.display = "block";
  }

  // Optional (early subscribe): allow going back into the app
  if (continueBtn) {
    if (optional) {
      continueBtn.style.display = "inline-flex";
      if (info?.status === "trial") {
        continueBtn.textContent = "Continue free trial";
      } else if (info?.status === "active") {
        continueBtn.textContent = "Back to app";
      } else {
        continueBtn.textContent = "Back to app";
      }
    } else {
      continueBtn.style.display = "none";
    }
  }

  if (meta) {
    meta.textContent = role === "admin"
      ? "Termly = 16 weeks · Yearly = 12 months from payment date"
      : "";
  }
}

function sbaHideSubscriptionLock() {
  const lock = document.getElementById("subscriptionLockedScreen");
  if (lock) {
    lock.style.display = "none";
    lock.dataset.mode = "";
  }
}

/**
 * Open subscription plans while still on trial (or active).
 * Admin only. Does not force lock — user can continue trial.
 */
async function sbaOpenSubscriptionPlans() {
  const u = user();
  if (!u) {
    alert("Please log in first.");
    return;
  }
  if (String(u.role || "").toLowerCase() !== "admin") {
    alert("Only the school administrator can manage the subscription.");
    return;
  }

  const access = await sbaCheckSubscriptionAccess();
  // Always open as optional when admin chooses Subscribe from the app
  sbaShowSubscriptionLock({
    ...access,
    optional: true,
    status: access.status || "trial"
  });
}

/** Close optional subscription screen and return to the app (trial still running). */
function sbaContinueFreeTrial() {
  sbaHideSubscriptionLock();
  const app = document.getElementById("app");
  if (app) app.style.display = "block";
  try {
    if (typeof window.closeSbaSidebar === "function") window.closeSbaSidebar();
  } catch (e) {}
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

function sbaUpdateSubscriptionNavVisibility() {
  const btn = document.getElementById("navSubscriptionBtn");
  if (!btn) return;
  const role = String(user()?.role || "").toLowerCase();
  btn.style.display = role === "admin" ? "" : "none";
}

async function sbaGateAfterLogin() {
  const access = await sbaCheckSubscriptionAccess();
  sbaUpdateSubscriptionNavVisibility();
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
  // Net plan price (form still shows GHS 100 / 280). Charge gross at Paystack
  // so fees are covered and settlement is closer to the full list price.
  const netAmount = plan === "yearly" ? SBA_YEARLY_AMOUNT_PESEWAS : SBA_TERMLY_AMOUNT_PESEWAS;
  const amount = sbaPaystackChargeAmount(netAmount);
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
      product: "nabeng_sba_subscription",
      list_price_pesewas: netAmount,
      charged_pesewas: amount
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
window.sbaOpenSubscriptionPlans = sbaOpenSubscriptionPlans;
window.sbaContinueFreeTrial = sbaContinueFreeTrial;
