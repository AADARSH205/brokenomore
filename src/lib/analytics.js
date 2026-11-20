/**
 * Privacy-friendly analytics for BrokeNoMore.
 * No third-party tracking scripts, cookies, or personal data transmitted.
 */

export function trackEvent(eventName, properties = {}) {
  try {
    const payload = {
      eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    };

    // Base44 client analytics if available
    if (typeof globalThis !== "undefined" && globalThis.__B44_DB__?.analytics?.track) {
      globalThis.__B44_DB__.analytics.track(payload);
    } else if (typeof window !== "undefined" && window.db?.analytics?.track) {
      window.db.analytics.track(payload);
    }

    // Local debug storage
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("bnm_analytics_events") || "[]");
      stored.push(payload);
      // Keep last 50 events in session
      if (stored.length > 50) stored.shift();
      localStorage.setItem("bnm_analytics_events", JSON.stringify(stored));
    }
  } catch {
    // Silent fail safe
  }
}

/**
 * 1. Calculator Used event
 * @param {"safe_to_spend" | "tax_regime" | "sip" | "in_hand" | "hra"} calculatorType
 * @param {Record<string, any>} [details]
 */
export function trackCalculatorUsed(calculatorType, details = {}) {
  trackEvent("calculator_used", {
    calculator: calculatorType,
    ...details,
  });
}

/**
 * 2. Signup Started event
 * @param {"hero" | "nav" | "calculator" | "tools" | "footer" | "banner"} source
 */
export function trackSignupStarted(source = "hero") {
  trackEvent("signup_started", {
    source,
  });
}

/**
 * 3. Signup Completed event
 * @param {"email" | "google" | "other"} method
 */
export function trackSignupCompleted(method = "email") {
  trackEvent("signup_completed", {
    method,
  });
}

/**
 * 4. First Expense Logged event
 * @param {string} category
 * @param {number} amount
 */
export function trackFirstExpenseLogged(category, amount) {
  trackEvent("first_expense_logged", {
    category,
    amount: Math.round(Number(amount) || 0),
  });
}
