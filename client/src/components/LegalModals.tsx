import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";

interface LegalModalsProps {
  showModal: string | null;
  onClose: () => void;
}

export function LegalModals({ showModal, onClose }: LegalModalsProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const legalContent = {
    cs: {
      terms: {
        title: "Obchodní podmínky",
        content: [
          "Tyto obchodní podmínky upravují poskytování služeb analýzy webových stránek prostřednictvím aplikace WebAudit Pro.",
          "Služba zahrnuje technickou analýzu 9 oblastí vašeho webu za cenu 50 Kč včetně DPH.",
          "Po úspěšné platbě obdržíte PDF report na uvedený e-mail. Služba je poskytována bez záruky.",
          "Reklamace lze uplatnit do 14 dnů od poskytnutí služby na e-mail podpory.",
          "Tyto podmínky se řídí českým právem. Spory budou řešeny u příslušných českých soudů.",
        ],
      },
      privacy: {
        title: "Ochrana osobních údajů",
        content: [
          "Zpracováváme tyto osobní údaje: e-mailová adresa, IP adresa, URL analyzovaného webu a výsledky analýzy.",
          "Údaje jsou zpracovávány na základě vašeho souhlasu pro účely poskytnutí služby a zasílání výsledků analýzy.",
          "Máte právo na přístup, opravu, výmaz nebo přenositelnost vašich údajů. Souhlas můžete kdykoliv odvolat.",
          "Údaje ukládáme po dobu nezbytnou pro poskytnutí služby, nejdéle však 2 roky.",
          "Jsme správci vašich osobních údajů podle nařízení GDPR. Kontaktovat nás můžete na e-mailu privacy@webauditpro.cz.",
        ],
      },
      data: {
        title: "Zpracování a sdílení dat",
        content: [
          "Souhlasíte s tím, že vaše data (včetně e-mailu a výsledků analýzy) mohou být:",
          "• Uchovávána pro účely zlepšování služeb a vývoje aplikace",
          "• Zpracovávána pro marketingové účely a zasílání nabídek",
          "• Sdílena nebo prodána třetím stranám pro komerční účely",
          "• Použita pro statistické analýzy a výzkum trhu",
          "Tento souhlas můžete kdykoliv odvolat, avšak již sdílená data nebudou stažena od třetích stran.",
          "Sdílení dat probíhá v souladu s platnými právními předpisy o ochraně osobních údajů.",
        ],
      },
    },
    en: {
      terms: {
        title: "Terms and Conditions",
        content: [
          "These terms and conditions govern the provision of website analysis services through the WebAudit Pro application.",
          "The service includes technical analysis of 9 areas of your website for 50 CZK including VAT.",
          "After successful payment, you will receive a PDF report to the specified email. The service is provided without warranty.",
          "Complaints can be made within 14 days of service provision to the support email.",
          "These terms are governed by Czech law. Disputes will be resolved by competent Czech courts.",
        ],
      },
      privacy: {
        title: "Privacy Policy",
        content: [
          "We process the following personal data: email address, IP address, analyzed website URL and analysis results.",
          "Data is processed based on your consent for the purpose of providing the service and sending analysis results.",
          "You have the right to access, rectify, delete or transfer your data. You can withdraw your consent at any time.",
          "We store data for the period necessary to provide the service, but no longer than 2 years.",
          "We are the controllers of your personal data according to GDPR regulation. You can contact us at privacy@webauditpro.cz.",
        ],
      },
      data: {
        title: "Data Processing and Sharing",
        content: [
          "You agree that your data (including email and analysis results) may be:",
          "• Stored for the purpose of improving services and application development",
          "• Processed for marketing purposes and sending offers",
          "• Shared or sold to third parties for commercial purposes",
          "• Used for statistical analysis and market research",
          "You can withdraw this consent at any time, but already shared data will not be withdrawn from third parties.",
          "Data sharing is carried out in accordance with applicable personal data protection laws.",
        ],
      },
    },
  };

  const currentContent = legalContent[language];

  return (
    <>
      <Dialog open={showModal === "terms"} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {currentContent.terms.title}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentContent.terms.content.map((paragraph, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModal === "privacy"} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {currentContent.privacy.title}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentContent.privacy.content.map((paragraph, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModal === "data"} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {currentContent.data.title}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentContent.data.content.map((paragraph, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
