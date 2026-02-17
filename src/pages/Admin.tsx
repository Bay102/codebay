import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ChevronDown, Loader2, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import {
  getChatHandoffs,
  updateChatHandoffArchived,
  type ChatHandoffRecord,
} from "../../supabase/api/api";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const truncate = (value: string, maxLength: number) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
};

const formatTextCell = (value: string | null) => {
  if (!value || value.trim().length === 0) {
    return "—";
  }
  return value;
};

const serializeChatHistory = (chatHistory: unknown) => {
  if (chatHistory == null) {
    return "null";
  }

  try {
    return JSON.stringify(chatHistory);
  } catch {
    return "[unserializable json]";
  }
};

const getChatHistoryMessageCount = (chatHistory: unknown) =>
  Array.isArray(chatHistory) ? chatHistory.length : 0;

type ChatHistoryMessage = {
  role: string;
  content: string;
};

const parseChatHistoryMessages = (chatHistory: unknown): ChatHistoryMessage[] => {
  if (!Array.isArray(chatHistory)) {
    return [];
  }

  return chatHistory
    .map((message) => {
      if (!message || typeof message !== "object") {
        return null;
      }

      const candidate = message as Record<string, unknown>;
      if (typeof candidate.role !== "string" || typeof candidate.content !== "string") {
        return null;
      }

      return {
        role: candidate.role,
        content: candidate.content,
      };
    })
    .filter((message): message is ChatHistoryMessage => message !== null);
};

const getChatHistoryPreviewText = (chatHistory: unknown) => {
  const messages = parseChatHistoryMessages(chatHistory);
  const firstUserMessage = messages.find(
    (message) => message.role.toLowerCase() === "user"
  );

  if (firstUserMessage?.content) {
    return truncate(firstUserMessage.content, 150);
  }

  return truncate(serializeChatHistory(chatHistory), 150);
};

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [handoffs, setHandoffs] = useState<ChatHandoffRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedHandoff, setSelectedHandoff] = useState<ChatHandoffRecord | null>(null);
  const [updatingArchivedById, setUpdatingArchivedById] = useState<Record<string, boolean>>({});
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  const fetchChatHandoffs = useCallback(async () => {
    setIsLoading(true);
    const result = await getChatHandoffs();
    setHandoffs(result.data);
    setError(result.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setAuthError(sessionError.message);
      }

      setSession(data.session ?? null);
      setIsAuthLoading(false);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setHandoffs([]);
        setSelectedHandoff(null);
        setError(null);
        setActionError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setIsLoading(false);
      return;
    }
    void fetchChatHandoffs();
  }, [fetchChatHandoffs, session]);

  const stats = useMemo(() => {
    const total = handoffs.length;
    const read = handoffs.filter((handoff) => handoff.archived === true).length;
    const newLeads = total - read;

    return { total, read, newLeads };
  }, [handoffs]);
  const newHandoffs = useMemo(
    () => handoffs.filter((handoff) => handoff.archived !== true),
    [handoffs]
  );
  const archivedHandoffs = useMemo(
    () => handoffs.filter((handoff) => handoff.archived === true),
    [handoffs]
  );

  const selectedChatHistoryMessages = useMemo(
    () => parseChatHistoryMessages(selectedHandoff?.chat_history),
    [selectedHandoff]
  );
  const selectedSerializedChatHistory = useMemo(
    () => serializeChatHistory(selectedHandoff?.chat_history),
    [selectedHandoff]
  );

  const handleToggleArchived = useCallback(
    async (handoffId: string, currentArchived: boolean | null) => {
      const nextArchived = currentArchived !== true;
      setActionError(null);
      setUpdatingArchivedById((prev) => ({ ...prev, [handoffId]: true }));

      const result = await updateChatHandoffArchived(handoffId, nextArchived);

      if (!result.success) {
        setActionError(result.error ?? "Unable to update archived status.");
      } else {
        const persistedArchived = result.data?.archived === true;
        setHandoffs((prev) =>
          prev.map((handoff) =>
            handoff.id === handoffId ? { ...handoff, archived: persistedArchived } : handoff
          )
        );
        setSelectedHandoff((prev) =>
          prev && prev.id === handoffId ? { ...prev, archived: persistedArchived } : prev
        );
      }

      setUpdatingArchivedById((prev) => {
        const nextState = { ...prev };
        delete nextState[handoffId];
        return nextState;
      });
    },
    []
  );

  const renderHandoffRows = (records: ChatHandoffRecord[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading chat handoffs...
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (records.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
            {emptyMessage}
          </TableCell>
        </TableRow>
      );
    }

    return records.map((handoff) => {
      const serializedChatHistory = serializeChatHistory(handoff.chat_history);
      const chatHistoryPreview = getChatHistoryPreviewText(handoff.chat_history);
      const messageCount = getChatHistoryMessageCount(handoff.chat_history);
      const isArchived = handoff.archived === true;
      const isUpdatingArchived = updatingArchivedById[handoff.id] === true;

      return (
        <TableRow key={handoff.id}>
          <TableCell className="whitespace-nowrap text-xs">
            {formatTimestamp(handoff.created_at)}
          </TableCell>
          <TableCell>{handoff.name}</TableCell>
          <TableCell className="max-w-[220px] truncate" title={handoff.email}>
            {handoff.email}
          </TableCell>
          <TableCell>{formatTextCell(handoff.phone)}</TableCell>
          <TableCell className="max-w-[360px]">
            <button
              type="button"
              onClick={() => setSelectedHandoff(handoff)}
              className="w-full rounded-md p-1 text-left transition-colors hover:bg-muted/40"
              title="Open full chat history"
            >
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{messageCount} messages</p>
                <p className="font-mono text-xs text-foreground/80" title={serializedChatHistory}>
                  {chatHistoryPreview}
                </p>
              </div>
            </button>
          </TableCell>
          <TableCell className="max-w-[240px]">
            <p className="truncate" title={formatTextCell(handoff.notes)}>
              {formatTextCell(handoff.notes)}
            </p>
          </TableCell>
          <TableCell>
            <Badge variant={isArchived ? "secondary" : "default"}>
              {isArchived ? "true" : "false"}
            </Badge>
          </TableCell>
          <TableCell>
            <Button
              type="button"
              size="sm"
              variant={isArchived ? "secondary" : "default"}
              disabled={isUpdatingArchived}
              onClick={() => void handleToggleArchived(handoff.id, handoff.archived)}
              className="min-w-28"
            >
              {isUpdatingArchived ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving
                </>
              ) : isArchived ? (
                "Mark as New"
              ) : (
                "Mark as Read"
              )}
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  const handleSignIn = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthError(null);

      const normalizedEmail = loginEmail.trim();
      if (!normalizedEmail || !loginPassword) {
        setAuthError("Please enter both email and password.");
        return;
      }

      setIsSigningIn(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: loginPassword,
      });

      if (signInError) {
        setAuthError(signInError.message);
      } else {
        setLoginPassword("");
      }

      setIsSigningIn(false);
    },
    [loginEmail, loginPassword]
  );

  const handleSignOut = useCallback(async () => {
    setAuthError(null);
    setIsSigningOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setAuthError(signOutError.message);
    }
    setIsSigningOut(false);
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-md items-center justify-center rounded-2xl border border-border/60 bg-card/70 p-8">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking admin session...
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 sm:p-7">
          <div className="space-y-2">
            <p className="text-primary/80 text-xs font-semibold tracking-[0.16em] uppercase">
              Admin Access
            </p>
            <h1 className="font-display text-2xl font-semibold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              You must log in with Supabase credentials to access the chat handoff dashboard.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={(event) => void handleSignIn(event)}>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="admin@yourcompany.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {authError ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {authError}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in to Admin"
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] bg-background px-4 py-8 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <section className="glass-nav rounded-2xl border border-border/60 p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-primary/80 text-xs font-semibold tracking-[0.16em] uppercase">
                  Admin Dashboard
                </p>
                <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  Chat Handoffs
                </h1>
                <p className="text-sm text-muted-foreground">
                  Live view of the `chat_handoffs` table.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
                <p className="text-xs text-muted-foreground">
                  Signed in as {session.user.email ?? "authenticated user"}
                </p>
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => void fetchChatHandoffs()}
                    variant="outline"
                    className="w-full md:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                  <Button
                    onClick={() => void handleSignOut()}
                    variant="secondary"
                    className="w-full md:w-auto"
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      "Sign out"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">New Leads</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{stats.newLeads}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">Read</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{stats.read}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  chat_handoffs
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {error ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Failed to load handoffs: {error}
              </div>
            ) : null}
            {actionError ? (
              <div className="mt-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Failed to update lead: {actionError}
              </div>
            ) : null}
            {authError ? (
              <div className="mt-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Auth error: {authError}
              </div>
            ) : null}

            <div className="glass-nav rounded-2xl border border-border/60 p-2 sm:p-3">
              <div className="px-3 pt-2 pb-3">
                <h2 className="text-base font-semibold text-foreground">New Chats</h2>
                <p className="text-sm text-muted-foreground">
                  Incoming chat handoffs that are not archived.
                </p>
              </div>
              <Table className="min-w-[1080px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>created_at</TableHead>
                    <TableHead>name</TableHead>
                    <TableHead>email</TableHead>
                    <TableHead>phone</TableHead>
                    <TableHead>chat_history</TableHead>
                    <TableHead>notes</TableHead>
                    <TableHead>archived</TableHead>
                    <TableHead>actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderHandoffRows(newHandoffs, "No new chats in `chat_handoffs`.")}
                </TableBody>
              </Table>
            </div>

            <Collapsible
              open={isArchivedOpen}
              onOpenChange={setIsArchivedOpen}
              className="glass-nav rounded-2xl border border-border/60 p-2 sm:p-3"
            >
              <div className="flex flex-col gap-3 px-3 pt-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Archived Chats</h2>
                  <p className="text-sm text-muted-foreground">
                    Handoffs that were marked as read/archived.
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto">
                    {isArchivedOpen ? "Hide Archived Chats" : "Show Archived Chats"}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isArchivedOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <Table className="min-w-[1080px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>created_at</TableHead>
                      <TableHead>name</TableHead>
                      <TableHead>email</TableHead>
                      <TableHead>phone</TableHead>
                      <TableHead>chat_history</TableHead>
                      <TableHead>notes</TableHead>
                      <TableHead>archived</TableHead>
                      <TableHead>actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderHandoffRows(archivedHandoffs, "No archived chats in `chat_handoffs`.")}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          </section>
        </div>
      </div>
      <Dialog
        open={selectedHandoff !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedHandoff(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
            <DialogDescription>
              Full conversation context for {selectedHandoff?.name ?? "selected lead"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <div>
              <span className="font-medium text-foreground">Lead:</span> {selectedHandoff?.name ?? "—"}
            </div>
            <div className="truncate">
              <span className="font-medium text-foreground">Email:</span> {selectedHandoff?.email ?? "—"}
            </div>
            <div className="text-right sm:text-left">
              <span className="font-medium text-foreground">Messages:</span>{" "}
              {selectedChatHistoryMessages.length}
            </div>
          </div>

          <ScrollArea className="max-h-[65vh] rounded-lg border border-border/60 bg-card/50 p-4">
            {selectedChatHistoryMessages.length > 0 ? (
              <div className="space-y-3">
                {selectedChatHistoryMessages.map((message, index) => {
                  const isAssistant = message.role.toLowerCase() === "assistant";
                  return (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-lg border px-3 py-2 ${isAssistant
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/60 bg-muted/30"
                        }`}
                    >
                      <p className="mb-1 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                        {message.role}
                      </p>
                      <p className="text-sm whitespace-pre-wrap text-foreground">
                        {message.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <pre className="font-mono text-xs whitespace-pre-wrap break-words text-foreground/85">
                {selectedSerializedChatHistory}
              </pre>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Admin;
