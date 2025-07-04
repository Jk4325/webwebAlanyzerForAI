import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}

export function CheckoutForm({ clientSecret, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage(language === "cs" ? "Platba byla úspěšně dokončena!" : "Payment succeeded!");
          break;
        case "processing":
          setMessage(language === "cs" ? "Platba se zpracovává." : "Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage(language === "cs" ? "Platba nebyla dokončena, zkuste to znovu." : "Your payment was not successful, please try again.");
          break;
        default:
          setMessage(language === "cs" ? "Něco se pokazilo." : "Something went wrong.");
          break;
      }
    });
  }, [stripe, clientSecret, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred.");
      } else {
        setMessage(language === "cs" ? "Neočekávaná chyba." : "An unexpected error occurred.");
      }
      
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage(language === "cs" ? "Platba byla úspěšně dokončena!" : "Payment succeeded!");
      onSuccess(paymentIntent.id);
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          {language === "cs" ? "Platba 50 Kč" : "Payment 50 CZK"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <PaymentElement options={paymentElementOptions} />
          <Button
            disabled={isLoading || !stripe || !elements}
            type="submit"
            className="w-full mt-6 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "cs" ? "Zpracovává se..." : "Processing..."}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {language === "cs" ? "Zaplatit 50 Kč" : "Pay 50 CZK"}
              </>
            )}
          </Button>
          {message && (
            <div className="mt-4 p-3 rounded-lg bg-muted text-center text-sm">
              {message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}