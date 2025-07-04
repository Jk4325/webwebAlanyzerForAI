import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/lib/translations";

const formSchema = z.object({
  url: z.string().min(1, "URL is required").url("Invalid URL"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

type FormData = z.infer<typeof formSchema>;

interface AnalysisFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      email: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    // Normalize URL
    let url = data.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    
    onSubmit({ ...data, url });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">{t.urlLabel}</Label>
            <Input
              id="url"
              type="url"
              placeholder={t.urlPlaceholder}
              {...form.register("url")}
              className="h-12"
            />
            {form.formState.errors.url && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              {...form.register("email")}
              className="h-12"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
            disabled={isLoading}
          >
            <Rocket className="mr-2 h-5 w-5" />
            {t.startAnalysisButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
