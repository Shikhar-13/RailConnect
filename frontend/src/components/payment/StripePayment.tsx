import { useState, useEffect, useMemo } from "react";
import { 
  loadStripe, 
  StripeElementsOptions 
} from "@stripe/stripe-js";
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CreditCard,
  AlertCircle
} from "lucide-react";
import { authApi } from "../../api/axios";
import { BookingResponse, PaymentResponse } from "../../types";
import { toast } from "react-hot-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const CheckoutForm = ({ pnr }: { pnr: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !isReady) return;
    
    // Safety check: ensure element is actually mounted
    if (!elements.getElement(PaymentElement)) {
      setErrorMessage("Payment interface is not ready. Please refresh the page.");
      return;
    }

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?pnr=${pnr}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      toast.error(error.message || "Payment failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement 
        onReady={() => setIsReady(true)}
        options={{ layout: "tabs" }} 
      />
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-shake">
          <AlertCircle className="h-5 w-5" />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !isReady || loading}
        className="w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase text-sm tracking-widest hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50"
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            Complete Secure Payment <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <div className="flex flex-col items-center gap-4 text-xs text-muted-foreground font-medium pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span>PCI-DSS Compliant Security</span>
        </div>
        <p className="px-8 text-center leading-relaxed">
          Your payment information is encrypted and never stored on our servers. 
          RailBook uses Stripe for industry-leading security.
        </p>
      </div>
    </form>
  );
};

const StripePayment = ({ booking }: { booking: BookingResponse }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (booking.stripeClientSecret) {
      setClientSecret(booking.stripeClientSecret);
      return;
    }

    const fetchClientSecret = async () => {
      try {
        const { data } = await authApi.post<PaymentResponse>("/payments/create-intent", {
          pnr: booking.pnrNumber,
          amount: booking.totalFare * 100, // convert to paise
          currency: "inr",
        });
        setClientSecret(data.clientSecret);
      } catch (err) {
        toast.error("Failed to initialize payment gateway.");
      }
    };
    fetchClientSecret();
  }, [booking]);

  const options: StripeElementsOptions = useMemo(() => ({
    clientSecret: clientSecret || "",
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#0F2D5E",
        colorBackground: "#ffffff",
        colorText: "#1A1A2E",
        colorDanger: "#DC2626",
        fontFamily: "'Inter', sans-serif",
        borderRadius: "12px",
      },
    },
  }), [clientSecret]);

  if (!clientSecret) {
    return (
      <div className="bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6"></div>
        <h3 className="text-xl font-black text-primary mb-2">Initializing Payment Gateway</h3>
        <p className="text-muted-foreground text-sm font-medium">Securing your connection to Stripe...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-primary/5 border border-gray-100">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="bg-primary p-4 rounded-3xl mb-4 shadow-lg shadow-primary/10">
          <Lock className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-black text-primary mb-2">Secure Checkout</h3>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
          PNR: <span className="text-primary font-black ml-1">{booking.pnrNumber}</span>
        </p>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm pnr={booking.pnrNumber} />
      </Elements>
    </div>
  );
};

export default StripePayment;
