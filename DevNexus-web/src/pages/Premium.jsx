import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { BASE_URL } from "../config/api";

function Premium() {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [selectedPlan, setSelectedPlan] = useState("monthly");

  // Determine if logged-in user is currently active premium
  const isAlreadyPremium = Boolean(user?.isPremium || user?.premium?.isActive);

  const activePlanName = user?.premium?.plan
    ? user.premium.plan === "yearly"
      ? "Annual Pass (Yearly)"
      : "Monthly Plan"
    : "Premium Membership";

  const expiryDateFormatted = user?.premium?.expiryDate
    ? new Date(user.premium.expiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: 199,
      duration: "per month",
      description: "Ideal for short-term networking and immediate connections.",
      features: [
        "Unlimited cold message requests",
        "Direct connection requests",
        "Developer priority feed highlight",
        "Crown verified profile badge",
        "Standard 24/7 support",
      ],
    },
    {
      id: "yearly",
      name: "Annual Pass",
      price: 999,
      duration: "per year",
      popular: true,
      description: "Best value for active developers looking to build a network.",
      features: [
        "Everything in Monthly Plan",
        "Save over 58% annually",
        "VIP priority in feed matching",
        "Gold crown verified badge",
        "Exclusive early feature access",
      ],
    },
  ];

  const handlePayment = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ plan: selectedPlan }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create order");
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "DevNexus",
          description: `${selectedPlan} Premium Membership`,
          order_id: data.orderId,
          theme: {
            color: "#8B83F7",
          },

          handler: async (paymentResponse) => {
            try {
              console.log("Razorpay payment response:", paymentResponse);

              const verifyResponse = await fetch(
                `${BASE_URL}/payment/verify`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                  }),
                }
              );

              const verifyData = await verifyResponse.json();

              if (!verifyResponse.ok) {
                throw new Error(
                  verifyData.message || "Payment verification failed"
                );
              }

              // Immediately fetch updated profile to synchronize Redux across the app
              try {
                const profileRes = await fetch(
                  `${BASE_URL}/profile/view`,
                  { credentials: "include" }
                );

                if (profileRes.ok) {
                  const updatedUser = await profileRes.json();
                  dispatch(addUser(updatedUser));
                } else if (verifyData.premium) {
                  dispatch(
                    addUser({
                      ...user,
                      isPremium: true,
                      premium: verifyData.premium,
                    })
                  );
                }
              } catch {
                if (verifyData.premium) {
                  dispatch(
                    addUser({
                      ...user,
                      isPremium: true,
                      premium: verifyData.premium,
                    })
                  );
                }
              }

              alert("Payment successful! Premium activated.");
              console.log("Verified payment:", verifyData);

            } catch (error) {
              console.error("Verification error:", error);
              alert(error.message);
            }
          },
        };

        const razorpay = new window.Razorpay(options);

        // Listen for payment failure
        razorpay.on("payment.failed", async (response) => {
          try {
            const { order_id, payment_id } =
              response.error.metadata || {};

            const result = await fetch(
              `${BASE_URL}/payment/failed`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: order_id,
                  razorpay_payment_id: payment_id,
                }),
              }
            );

            const failureData = await result.json();

            if (!result.ok) {
              throw new Error(
                failureData.message || "Unable to record payment failure"
              );
            }

            alert(
              "Payment failed. Your payment status has been updated."
            );
          } catch (error) {
            console.error("Payment failure recording error:", error);
            alert(
              "Payment failed, but we couldn't update its status."
            );
          }
        });

        razorpay.open();
      };

      script.onerror = () => {
        alert("Unable to load Razorpay checkout.");
      };

      document.body.appendChild(script);

    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#151923] text-[#F1F2F8] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Active Premium Member Banner (If already premium) */}
        {isAlreadyPremium && (
          <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#D9B875]/15 via-[#2B3449]/40 to-[#1B2130]/40 border-2 border-[#D9B875]/50 shadow-2xl shadow-[#D9B875]/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-[#D9B875]/20 border border-[#D9B875]/40 flex items-center justify-center text-3xl shadow-lg shadow-[#D9B875]/20 shrink-0">
                  👑
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#F1F2F8]">
                      You are a Premium Member
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#55B8E8]/20 text-[#55B8E8] border border-[#55B8E8]/40 text-xs font-bold">
                      ✓ Active
                    </span>
                  </div>
                  <p className="text-sm text-[#D9B875] mt-1">
                    Current tier: <strong className="text-[#F1F2F8]">{activePlanName}</strong>
                    {expiryDateFormatted && (
                      <span className="text-[#A5AEC0]"> • Valid through {expiryDateFormatted}</span>
                    )}
                  </p>
                  <p className="text-xs text-[#A5AEC0] mt-1">
                    All exclusive perks including direct messaging, priority feed, and VIP crown badge are active.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D9B875]/20 text-[#D9B875] border border-[#D9B875]/40 text-xs font-bold shadow-sm shadow-[#D9B875]/15">
                  👑 VIP Member
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D9B875]/15 border border-[#D9B875]/40 text-[#D9B875] text-xs font-semibold mb-4">
            <span>👑</span>
            <span>DevNexus VIP Access</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F1F2F8] tracking-tight">
            Supercharge Your <span className="gradient-text">Developer Network</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#A5AEC0] max-w-xl mx-auto leading-relaxed">
            Message developers directly, get highlighted in discovery feeds, and unlock VIP networking perks.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "💬",
              title: "Direct Messaging",
              description: "Send introductory message requests to any developer without waiting for mutual matching.",
            },
            {
              icon: "⚡",
              title: "Priority Discovery",
              description: "Your card is showcased at the top of developer discovery feeds across all tech stacks.",
            },
            {
              icon: "👑",
              title: "Verified VIP Badge",
              description: "Golden crown badge displayed next to your name and avatar on all pages.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="rounded-3xl glass-card border border-[#2B3449] p-6 text-center space-y-2 card-transition hover:border-[#8B83F7]/40"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#222A3B] border border-[#2B3449] text-[#8B83F7] flex items-center justify-center text-2xl mx-auto mb-3">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-[#F1F2F8]">{feature.title}</h3>
              <p className="text-xs text-[#A5AEC0] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Plan Selector */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isUserActivePlan =
                isAlreadyPremium && user?.premium?.plan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative cursor-pointer rounded-3xl p-7 border-2 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-[#8B83F7] bg-[#222A3B]/90 shadow-2xl shadow-[#8B83F7]/20"
                      : "border-[#2B3449] bg-[#1B2130] hover:border-[#2B3449]/90"
                  }`}
                >
                  {isUserActivePlan ? (
                    <span className="absolute -top-3.5 right-6 bg-[#D9B875] text-[#151923] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                      YOUR CURRENT PLAN
                    </span>
                  ) : plan.popular ? (
                    <span className="absolute -top-3.5 right-6 gradient-primary text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                      BEST VALUE
                    </span>
                  ) : null}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#F1F2F8]">{plan.name}</h3>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-[#8B83F7]" : "border-[#2B3449]"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#8B83F7]" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#F1F2F8]">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs text-[#A5AEC0] font-medium">
                        /{plan.duration.replace("per ", "")}
                      </span>
                    </div>

                    <p className="text-xs text-[#A5AEC0]">{plan.description}</p>

                    <div className="pt-2 space-y-2 border-t border-[#2B3449]/80">
                      {plan.features.map((feat, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-[#F1F2F8]/85">
                          <span className="text-[#8B83F7] font-bold">✓</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? "gradient-primary text-white shadow-md shadow-[#8B83F7]/30"
                          : "bg-[#222A3B] text-[#A5AEC0] hover:bg-[#2B3449] hover:text-[#F1F2F8]"
                      }`}
                    >
                      {isUserActivePlan
                        ? "Extend / Renew Plan"
                        : isSelected
                        ? "Selected Plan"
                        : "Choose Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Action */}
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={handlePayment}
              className="px-10 py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm shadow-xl shadow-[#8B83F7]/30 hover:opacity-95 transition-transform active:scale-98"
            >
              {isAlreadyPremium ? "Extend Membership" : "Continue to Payment"}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#A5AEC0]/70">
              <svg className="w-4 h-4 text-[#8B83F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Instant activation • Secured by Razorpay checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Premium;
