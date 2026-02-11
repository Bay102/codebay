import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { requestHumanConnect } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const humanConnectFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .nullish()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 11 && /^\d+$/.test(digits);
    }, {
      message: "Enter a valid phone number (7–11 digits)",
    }),
  notes: z.string().max(2000, "Notes must be 2000 characters or less").optional().default(""),
  website: z.string().max(0, "Invalid submission").optional().default(""),
});

export type HumanConnectFormValues = z.infer<typeof humanConnectFormSchema>;

type ConnectStatus = "idle" | "submitting" | "success" | "error";

const CONNECT_MIN_INTERVAL_MS = 30_000;
const CONNECT_MIN_FILL_MS = 2000;

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
}

interface ConnectFormContextValue {
  openConnectForm: () => void;
}

const ConnectFormContext = createContext<ConnectFormContextValue | null>(null);

export function useConnectForm(): ConnectFormContextValue {
  const ctx = useContext(ConnectFormContext);
  if (!ctx) {
    throw new Error("useConnectForm must be used within ConnectFormProvider");
  }
  return ctx;
}

interface ConnectFormProviderProps {
  children: ReactNode;
}

export function ConnectFormProvider({ children }: ConnectFormProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("idle");
  const [connectError, setConnectError] = useState<string | null>(null);
  const lastConnectSubmitAtRef = useRef(0);
  const connectFormOpenedAtRef = useRef<number | null>(null);

  const connectForm = useForm<HumanConnectFormValues>({
    resolver: zodResolver(humanConnectFormSchema),
    defaultValues: { name: "", email: "", phone: undefined, notes: "", website: "" },
  });

  const openConnectForm = useCallback(() => {
    setConnectError(null);
    setConnectStatus("idle");
    connectForm.reset();
    connectFormOpenedAtRef.current = Date.now();
    setIsOpen(true);
  }, [connectForm]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        setConnectError(null);
        if (connectStatus !== "submitting") setConnectStatus("idle");
        connectForm.reset();
        connectFormOpenedAtRef.current = Date.now();
      }
    },
    [connectForm, connectStatus]
  );

  const onSubmit = useCallback(async (values: HumanConnectFormValues) => {
    const now = Date.now();
    const elapsedSinceLastSubmit = now - lastConnectSubmitAtRef.current;
    if (elapsedSinceLastSubmit < CONNECT_MIN_INTERVAL_MS) {
      setConnectStatus("error");
      setConnectError("Please wait before sending another request.");
      return;
    }

    const formFillMs = connectFormOpenedAtRef.current ? now - connectFormOpenedAtRef.current : 0;
    if (formFillMs > 0 && formFillMs < CONNECT_MIN_FILL_MS) {
      setConnectStatus("error");
      setConnectError("Please review your details before submitting.");
      return;
    }

    if (values.website?.trim()) {
      setConnectStatus("error");
      setConnectError("Unable to submit your request right now.");
      return;
    }

    lastConnectSubmitAtRef.current = now;
    setConnectStatus("submitting");
    setConnectError(null);

    const trimmedPhone = values.phone?.trim();
    const trimmedNotes = values.notes?.trim();
    const response = await requestHumanConnect({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: trimmedPhone && trimmedPhone.length > 0 ? trimmedPhone : null,
      notes: trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : null,
      messages: [],
      antiBot: { formFillMs },
    });

    if (!response.success) {
      setConnectStatus("error");
      setConnectError(response.error ?? "Unable to submit your request.");
      return;
    }

    connectForm.reset();
    setConnectStatus("success");
    setIsOpen(false);
  }, [connectForm]);

  return (
    <ConnectFormContext.Provider value={{ openConnectForm }}>
      {children}
      <ConnectFormDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        connectForm={connectForm}
        connectStatus={connectStatus}
        connectError={connectError}
        onSubmit={onSubmit}
      />
    </ConnectFormContext.Provider>
  );
}

interface ConnectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectForm: UseFormReturn<HumanConnectFormValues>;
  connectStatus: ConnectStatus;
  connectError: string | null;
  onSubmit: (values: HumanConnectFormValues) => Promise<void>;
}

function ConnectFormDialog({
  open,
  onOpenChange,
  connectForm,
  connectStatus,
  connectError,
  onSubmit,
}: ConnectFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="connect-dialog sm:max-w-[420px] rounded-xl text-foreground [&>button]:text-muted-foreground [&>button]:hover:text-foreground [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_textarea]:text-foreground [&_textarea]:placeholder:text-muted-foreground [&_input]:focus-visible:ring-ai-accent/40 [&_textarea]:focus-visible:ring-ai-accent/40"
        onOpenAutoFocus={(e) => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            e.preventDefault();
          }
        }}
      >
        <div className="chat-scan-line" />

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-foreground">
            Connect with <span className="text-ai-accent">CodeBay</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share your contact details and we will follow up.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={connectForm.handleSubmit(onSubmit)} className="relative z-10 grid gap-4">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            {...connectForm.register("website")}
          />
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="connect-name">Name</Label>
              <Input
                id="connect-name"
                autoComplete="name"
                placeholder="Jane Doe"
                {...connectForm.register("name")}
                disabled={connectStatus === "submitting"}
              />
              {connectForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {connectForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="connect-email">Email</Label>
              <Input
                id="connect-email"
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                {...connectForm.register("email")}
                disabled={connectStatus === "submitting"}
              />
              {connectForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {connectForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="connect-phone">Phone</Label>
              <Controller
                name="phone"
                control={connectForm.control}
                render={({ field }) => (
                  <Input
                    id="connect-phone"
                    placeholder="(555) 123-4567"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    maxLength={18}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value);
                      field.onChange(formatted || undefined);
                    }}
                    onBlur={field.onBlur}
                    disabled={connectStatus === "submitting"}
                  />
                )}
              />
              {connectForm.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {connectForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="connect-notes">How can we help?</Label>
              <Textarea
                id="connect-notes"
                placeholder="Any additional context, timeline, or questions..."
                rows={3}
                className="resize-none text-base md:text-sm"
                {...connectForm.register("notes")}
                disabled={connectStatus === "submitting"}
              />
              {connectForm.formState.errors.notes && (
                <p className="text-xs text-destructive">
                  {connectForm.formState.errors.notes.message}
                </p>
              )}
            </div>
          </div>

          {connectError && (
            <p className="text-xs text-destructive">{connectError}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={connectStatus === "submitting"}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={connectStatus === "submitting"}>
              {connectStatus === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
