import { z } from "zod";

export const chatFormSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(500, "Message must be 500 characters or less"),
});

/** Formats phone input as (XXX) XXX-XXXX, max 11 digits. Strips non-digits internally. */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
}

export const humanConnectFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .nullish()
    .refine(
      (value) => {
        if (!value) return true;
        const digits = value.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 11 && /^\d+$/.test(digits);
      },
      {
        message: "Enter a valid phone number (7–11 digits)",
      }
    ),
  notes: z.string().max(2000, "Notes must be 2000 characters or less").optional().default(""),
  website: z.string().max(0, "Invalid submission").optional().default(""),
});

export type ChatFormValues = z.infer<typeof chatFormSchema>;
export type HumanConnectFormValues = z.infer<typeof humanConnectFormSchema>;

export type ConnectStatus = "idle" | "submitting" | "success" | "error";

export const CHAT_INPUT_MAX_HEIGHT_PX = 140;
