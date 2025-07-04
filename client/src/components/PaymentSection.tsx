import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";
import { LegalModals } from "./LegalModals";
import { CheckoutForm } from "./CheckoutForm";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentSectionProps {
  analysisId: number;
  onPayment: (consents: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    dataAccepted: boolean;
  }) => void;
  onPaymentSuccess: (paymentIntentId: string) => void;
  isLoading?: boolean;
}

export function PaymentSection({ analysisId, onPayment, onPaymentSuccess, isLoading }: PaymentSectionProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [consents, setConsents] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    dataAccepted: false,
  });

  const [showModal, setShowModal] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleConsentChange = (key: keyof typeof consents, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = Object.values(consents).every(Boolean);

  const handlePayment = async () => {
    if (canProceed) {
      // First update consents
      onPayment(consents);
      
      // Then create payment intent
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ analysisId }),
        });

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
        setShowCheckout(true);
      } catch (error) {
        console.error("Payment setup error:", error);
      }
    }
  };

  if (showCheckout && clientSecret) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm 
            clientSecret={clientSecret} 
            onSuccess={onPaymentSuccess}
          />
        </Elements>
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowCheckout(false)}
            className="mt-4"
          >
            {language === "cs" ? "Zpět" : "Back"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold mb-2">{t.completeOrderTitle}</CardTitle>
          <p className="text-muted-foreground">{t.completeOrderSubtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/20 rounded-xl p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={consents.termsAccepted}
                  onCheckedChange={(checked) => handleConsentChange("termsAccepted", checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-foreground leading-relaxed">
                  {t.termsLabel}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 underline"
                    onClick={() => setShowModal("terms")}
                  >
                    {t.termsLink}
                  </button>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={consents.privacyAccepted}
                  onCheckedChange={(checked) => handleConsentChange("privacyAccepted", checked as boolean)}
                />
                <label htmlFor="privacy" className="text-sm text-foreground leading-relaxed">
                  {t.privacyLabel}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 underline"
                    onClick={() => setShowModal("privacy")}
                  >
                    {t.privacyLink}
                  </button>
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="data"
                  checked={consents.dataAccepted}
                  onCheckedChange={(checked) => handleConsentChange("dataAccepted", checked as boolean)}
                />
                <label htmlFor="data" className="text-sm text-foreground leading-relaxed">
                  {t.dataLabel}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 underline"
                    onClick={() => setShowModal("data")}
                  >
                    {t.dataLink}
                  </button>
                </label>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handlePayment}
              disabled={!canProceed || isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {t.payButton}
            </Button>
          </div>
        </CardContent>
      </Card>

      <LegalModals
        showModal={showModal}
        onClose={() => setShowModal(null)}
      />
    </>
  );
}
