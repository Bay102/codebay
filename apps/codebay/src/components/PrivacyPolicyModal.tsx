import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIVACY_POLICY_CONTENT = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly, such as when you contact us, subscribe to updates, or use our services. This may include your name, email address, phone number, and any messages or notes you submit. We also automatically collect certain technical data, including IP address, browser type, and usage information.",
  },
  {
    title: "How We Use Your Information",
    body: "We use the information we collect to provide, maintain, and improve our services, to respond to your inquiries, to send you relevant updates (with your consent), and to protect against fraud or abuse. We do not sell your personal information to third parties.",
  },
  {
    title: "Data Sharing and Disclosure",
    body: "We may share your information with service providers who assist us in operating our business, such as hosting and analytics. These providers are contractually obligated to protect your data. We may also disclose information when required by law or to protect our rights and safety.",
  },
  {
    title: "Cookies and Similar Technologies",
    body: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content. You can manage cookie preferences through your browser settings.",
  },
  {
    title: "Data Security",
    body: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "Your Rights",
    body: "Depending on your location, you may have the right to access, correct, or delete your personal information, to object to or restrict certain processing, and to data portability. Contact us to exercise these rights.",
  },
  {
    title: "Data Retention",
    body: "We retain your information only for as long as necessary to fulfill the purposes described in this policy or as required by law. When data is no longer needed, we securely delete or anonymize it.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the effective date. Your continued use of our services after such changes constitutes acceptance of the updated policy.",
  },
  {
    title: "Contact Us",
    body: "If you have questions about this Privacy Policy or our data practices, please contact us through the Contact link in the footer.",
  },
];

export function PrivacyPolicyModal({ open, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] sm:max-w-[560px] flex flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto overscroll-contain max-h-[60dvh] px-6 pb-6">
          <div className="pr-4 space-y-6 text-sm text-muted-foreground">
            <p>
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
              CodeBay (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
            </p>
            {PRIVACY_POLICY_CONTENT.map((section) => (
              <section key={section.title}>
                <h3 className="font-medium text-foreground mb-1.5">{section.title}</h3>
                <p className="leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
