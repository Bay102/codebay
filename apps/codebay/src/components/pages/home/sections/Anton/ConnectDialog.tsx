"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Loader2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPhoneInput, type ConnectStatus, type HumanConnectFormValues } from "@/components/pages/home/sections/Anton/chatForms";

interface ConnectDialogProps {
  isOpen: boolean;
  isLoadingChat: boolean;
  status: ConnectStatus;
  error: string | null;
  form: UseFormReturn<HumanConnectFormValues>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HumanConnectFormValues) => Promise<void>;
}

export const ConnectDialog = ({
  isOpen,
  isLoadingChat,
  status,
  error,
  form,
  onOpenChange,
  onSubmit,
}: ConnectDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <button
        type="button"
        disabled={isLoadingChat || status === "submitting"}
        className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-medium leading-none transition-all hover:border-primary/40 hover:bg-primary/20 hover:shadow-[0_0_12px_hsla(24,95%,53%,0.25)] disabled:pointer-events-none disabled:opacity-50"
      >
        <UserCircle className="h-3.5 w-3.5" />
        <span className="text-foreground">{status === "success" ? "Request sent" : "Connect with CodeBay"}</span>
      </button>
    </DialogTrigger>
    <DialogContent
      className="connect-dialog rounded-xl text-foreground sm:max-w-[420px] [&>button]:text-muted-foreground [&>button]:hover:text-foreground [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_input]:focus-visible:ring-ai-accent/40 [&_textarea]:text-foreground [&_textarea]:placeholder:text-muted-foreground [&_textarea]:focus-visible:ring-ai-accent/40"
      onOpenAutoFocus={(event) => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          event.preventDefault();
        }
      }}
    >
      <div className="chat-scan-line" />

      <DialogHeader className="relative z-10">
        <DialogTitle className="text-foreground">
          Connect with <span className="text-ai-accent">CodeBay</span>
        </DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Share your contact details and we will follow up, usually within 48 hours. We may use your chat history to
          better understand your needs.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10 grid gap-4">
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...form.register("website")} />
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="connect-name">Name</Label>
            <Input
              id="connect-name"
              autoComplete="name"
              placeholder="Jane Doe"
              {...form.register("name")}
              disabled={status === "submitting"}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connect-email">Email</Label>
            <Input
              id="connect-email"
              type="email"
              autoComplete="email"
              placeholder="jane@company.com"
              {...form.register("email")}
              disabled={status === "submitting"}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connect-phone">Phone</Label>
            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="connect-phone"
                  placeholder="(555) 123-4567"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={18}
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const formatted = formatPhoneInput(event.target.value);
                    field.onChange(formatted || undefined);
                  }}
                  onBlur={field.onBlur}
                  disabled={status === "submitting"}
                />
              )}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="connect-notes">How can we help?</Label>
            <Textarea
              id="connect-notes"
              placeholder="Any additional context, timeline, or questions..."
              rows={3}
              className="resize-none text-base md:text-sm"
              {...form.register("notes")}
              disabled={status === "submitting"}
            />
            {form.formState.errors.notes && (
              <p className="text-xs text-destructive">{form.formState.errors.notes.message}</p>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={status === "submitting"}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? (
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
