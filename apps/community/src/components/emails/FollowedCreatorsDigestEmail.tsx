import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

export interface DigestBlogItem {
  title: string;
  url: string;
  authorName: string;
  /** Public https URL; shown when valid. Otherwise initials are used. */
  authorAvatarUrl: string | null;
  publishedAt: string;
  viewCount: number;
  reactionCount: number;
  commentCount: number;
  /** 7D Momentum score (hot mode) for rankings line. */
  momentumScore7d?: number | null;
  /** 7D Impact score (quality mode) for rankings line. */
  impactScore7d?: number | null;
}

export interface DigestDiscussionItem {
  title: string;
  url: string;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  commentCount: number;
  reactionCount: number;
  /** 7D Momentum score (hot mode) for rankings line. */
  momentumScore7d?: number | null;
  /** 7D Impact score (quality mode) for rankings line. */
  impactScore7d?: number | null;
}

type FollowedCreatorsDigestEmailProps = {
  recipientName: string;
  frequencyLabel: string;
  blogItems: DigestBlogItem[];
  discussionItems: DigestDiscussionItem[];
  /** Canonical site origin for primary hero CTA (e.g. community home). */
  siteUrl: string;
  managePreferencesUrl: string;
  unsubscribeUrl: string;
};

const darkModeStyles = `
  :root {
    color-scheme: light dark;
    supported-color-schemes: light dark;
  }
  @media (prefers-color-scheme: dark) {
    .email-body {
      background-color: #0a0a0a !important;
    }
    .email-container {
      background-color: #141414 !important;
      border-color: #2a2a2a !important;
    }
    .email-hero {
      background-color: #171717 !important;
      border-color: #404040 !important;
    }
    .email-eyebrow {
      color: #a3a3a3 !important;
    }
    .email-title {
      color: #fafafa !important;
    }
    .email-text {
      color: #d4d4d4 !important;
    }
    .email-muted {
      color: #a3a3a3 !important;
    }
    .email-kicker {
      color: #737373 !important;
    }
    .email-link {
      color: #fafafa !important;
    }
    .email-item-card {
      background-color: #1a1a1a !important;
      border-color: #2a2a2a !important;
    }
    .email-avatar-fallback {
      background-color: #262626 !important;
      border-color: #404040 !important;
      color: #e5e5e5 !important;
    }
    .email-avatar-img {
      border-color: #404040 !important;
    }
    .email-hr,
    .email-section-rule {
      border-color: #2a2a2a !important;
    }
    .email-accent-border-blog {
      border-left-color: #737373 !important;
    }
    .email-accent-border-discussions {
      border-left-color: #525252 !important;
    }
    .email-btn-primary {
      background-color: #fafafa !important;
      color: #0a0a0a !important;
    }
    .email-btn-secondary {
      background-color: #262626 !important;
      color: #fafafa !important;
      border: 1px solid #404040 !important;
    }
    .email-footer-link {
      color: #d4d4d4 !important;
    }
  }
`;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase() || "?";
}

function isAbsoluteHttpUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}

function formatBlogEngagement(item: DigestBlogItem): string {
  return [
    `${item.viewCount} ${item.viewCount === 1 ? "view" : "views"}`,
    `${item.reactionCount} ${item.reactionCount === 1 ? "reaction" : "reactions"}`,
    `${item.commentCount} ${item.commentCount === 1 ? "comment" : "comments"}`
  ].join(" · ");
}

function formatDiscussionEngagement(item: DigestDiscussionItem): string {
  return [
    `${item.commentCount} ${item.commentCount === 1 ? "comment" : "comments"}`,
    `${item.reactionCount} ${item.reactionCount === 1 ? "reaction" : "reactions"}`
  ].join(" · ");
}

function formatScoreForEmail(score: number | null | undefined, mode: "hot" | "quality"): string {
  if (!Number.isFinite(score ?? NaN)) return "0.00";
  const base = score ?? 0;
  const value = mode === "hot" ? base * 100 : base;
  if (value === 0) return "0.00";
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function normalizeScoreForSparkline(score: number | null | undefined, mode: "hot" | "quality"): number {
  if (!Number.isFinite(score ?? NaN)) return 0;
  const base = score ?? 0;
  const visualScore = mode === "hot" ? base * 100 : base;
  const maxReference = mode === "hot" ? 420 : 5;
  let normalized = Math.log1p(Math.max(0, visualScore)) / Math.log1p(maxReference);
  normalized = Math.min(1, Math.max(0, normalized));
  if (mode === "hot") {
    normalized = Math.pow(normalized, 1.55);
  }
  return normalized;
}

function renderScoreSparkline(score: number | null | undefined, mode: "hot" | "quality") {
  const width = 40;
  const height = 14;
  const baseline = height - 2;
  const intensity = normalizeScoreForSparkline(score, mode);
  const peakY = baseline - intensity * (height - 4);
  const points = [
    `0,${baseline}`,
    `${(width * 0.35).toFixed(2)},${baseline}`,
    `${(width * 0.7).toFixed(2)},${peakY.toFixed(2)}`,
    `${width},${baseline}`
  ].join(" ");
  const strokeColor = mode === "hot" ? "#f97316" : "#38bdf8";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={styles.scoreSparkline}
    >
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />
    </svg>
  );
}

function DigestAuthorMedia({
  authorName,
  authorAvatarUrl
}: {
  authorName: string;
  authorAvatarUrl: string | null;
}) {
  if (isAbsoluteHttpUrl(authorAvatarUrl)) {
    return (
      <Img
        src={authorAvatarUrl.trim()}
        width={40}
        height={40}
        alt=""
        className="email-avatar-img"
        style={styles.avatarImg}
      />
    );
  }

  return (
    <Text className="email-avatar-fallback" style={styles.avatarFallback}>
      {getInitials(authorName)}
    </Text>
  );
}

function DigestItemRow({
  authorName,
  authorAvatarUrl,
  children
}: {
  authorName: string;
  authorAvatarUrl: string | null;
  children: ReactNode;
}) {
  return (
    <Row>
      <Column style={styles.avatarColumn}>
        <DigestAuthorMedia authorName={authorName} authorAvatarUrl={authorAvatarUrl} />
      </Column>
      <Column style={styles.itemContentColumn}>{children}</Column>
    </Row>
  );
}

export function FollowedCreatorsDigestEmail({
  recipientName,
  frequencyLabel,
  blogItems,
  discussionItems,
  siteUrl,
  managePreferencesUrl,
  unsubscribeUrl
}: FollowedCreatorsDigestEmailProps) {
  const hasBlog = blogItems.length > 0;
  const hasDiscussions = discussionItems.length > 0;

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{darkModeStyles}</style>
      </Head>
      <Preview>Your {frequencyLabel} CodeBay digest is ready.</Preview>
      <Body className="email-body" style={styles.body}>
        <Container className="email-container" style={styles.container}>
          <Section className="email-hero" style={styles.hero}>
            <Text className="email-eyebrow" style={styles.heroEyebrow}>
              CodeBay Community
            </Text>
            <Heading as="h1" className="email-title" style={styles.heroTitle}>
              Heres what's new from your favorite creators
            </Heading>
            <Text className="email-text" style={styles.heroLead}>
              Explore what is new beyond your digest — trending threads, fresh posts, and more.
            </Text>
            <Button href={siteUrl} className="email-btn-primary" style={styles.heroButton}>
              Open CodeBay
            </Button>
          </Section>

          <Hr className="email-section-rule" style={styles.heroRule} />

          <Section>
            <Text className="email-kicker" style={styles.kicker}>
              Creators you follow
            </Text>
            <Text className="email-text" style={styles.text}>
              Hi {recipientName}, here are a few things you may have missed from the creators you follow.
            </Text>
          </Section>

          {hasBlog ? (
            <Section className="email-accent-border-blog" style={styles.digestSectionBlog}>
              <Heading as="h2" className="email-title" style={styles.sectionHeading}>
                Blog posts
              </Heading>
              <Text className="email-muted" style={styles.sectionSub}>
                {blogItems.length} new {blogItems.length === 1 ? "post" : "posts"} from followed creators
              </Text>
              {blogItems.map((item) => (
                <Section key={item.url} className="email-item-card" style={styles.itemCard}>
                  <DigestItemRow authorName={item.authorName} authorAvatarUrl={item.authorAvatarUrl}>
                    <Link href={item.url} className="email-link" style={styles.itemTitle}>
                      {item.title}
                    </Link>
                    <Text className="email-muted" style={styles.itemMeta}>
                      {item.authorName} · {formatDate(item.publishedAt)}
                    </Text>
                    <Text className="email-muted" style={styles.itemStats}>
                      {formatBlogEngagement(item)}
                    </Text>
                    {(item.momentumScore7d != null || item.impactScore7d != null) && (
                      <div style={styles.scoreRow}>
                        {item.momentumScore7d != null ? (
                          <div style={styles.scorePill}>
                            <span style={styles.scorePillLabel}>Momentum</span>
                            <span style={styles.scorePillSeparator}>·</span>
                            <span style={styles.scorePillPeriod}>7D</span>
                            <span style={styles.scorePillSeparator}>|</span>
                            <span style={styles.scorePillValueHot}>
                              {formatScoreForEmail(item.momentumScore7d, "hot")}
                            </span>
                            {renderScoreSparkline(item.momentumScore7d, "hot")}
                          </div>
                        ) : null}
                        {item.impactScore7d != null ? (
                          <div style={styles.scorePill}>
                            <span style={styles.scorePillLabel}>Impact</span>
                            <span style={styles.scorePillSeparator}>·</span>
                            <span style={styles.scorePillPeriod}>7D</span>
                            <span style={styles.scorePillSeparator}>|</span>
                            <span style={styles.scorePillValueQuality}>
                              {formatScoreForEmail(item.impactScore7d, "quality")}
                            </span>
                            {renderScoreSparkline(item.impactScore7d, "quality")}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </DigestItemRow>
                </Section>
              ))}
            </Section>
          ) : null}

          {hasBlog && hasDiscussions ? <Hr className="email-section-rule" style={styles.sectionDivider} /> : null}

          {hasDiscussions ? (
            <Section
              className="email-accent-border-discussions"
              style={{
                ...styles.digestSectionDiscussions,
                marginTop: hasBlog ? "16px" : "24px"
              }}
            >
              <Heading as="h2" className="email-title" style={styles.sectionHeading}>
                Discussions
              </Heading>
              <Text className="email-muted" style={styles.sectionSub}>
                {discussionItems.length} new {discussionItems.length === 1 ? "thread" : "threads"} from followed
                creators
              </Text>
              {discussionItems.map((item) => (
                <Section key={item.url} className="email-item-card" style={styles.itemCard}>
                  <DigestItemRow authorName={item.authorName} authorAvatarUrl={item.authorAvatarUrl}>
                    <Link href={item.url} className="email-link" style={styles.itemTitle}>
                      {item.title}
                    </Link>
                    <Text className="email-muted" style={styles.itemMeta}>
                      {item.authorName} · {formatDate(item.createdAt)}
                    </Text>
                    <Text className="email-muted" style={styles.itemStats}>
                      {formatDiscussionEngagement(item)}
                    </Text>
                    {(item.momentumScore7d != null || item.impactScore7d != null) && (
                      <div style={styles.scoreRow}>
                        {item.momentumScore7d != null ? (
                          <div style={styles.scorePill}>
                            <span style={styles.scorePillLabel}>Momentum</span>
                            <span style={styles.scorePillSeparator}>·</span>
                            <span style={styles.scorePillPeriod}>7D</span>
                            <span style={styles.scorePillSeparator}>|</span>
                            <span style={styles.scorePillValueHot}>
                              {formatScoreForEmail(item.momentumScore7d, "hot")}
                            </span>
                            {renderScoreSparkline(item.momentumScore7d, "hot")}
                          </div>
                        ) : null}
                        {item.impactScore7d != null ? (
                          <div style={styles.scorePill}>
                            <span style={styles.scorePillLabel}>Impact</span>
                            <span style={styles.scorePillSeparator}>·</span>
                            <span style={styles.scorePillPeriod}>7D</span>
                            <span style={styles.scorePillSeparator}>|</span>
                            <span style={styles.scorePillValueQuality}>
                              {formatScoreForEmail(item.impactScore7d, "quality")}
                            </span>
                            {renderScoreSparkline(item.impactScore7d, "quality")}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </DigestItemRow>
                </Section>
              ))}
            </Section>
          ) : null}

          <Section style={styles.actions}>
            <Button href={managePreferencesUrl} className="email-btn-secondary" style={styles.buttonSecondary}>
              Manage newsletter preferences
            </Button>
          </Section>

          <Hr className="email-hr" style={styles.hr} />

          <Text className="email-muted" style={styles.footerText}>
            You are receiving this email because your newsletter digest is enabled in CodeBay.
          </Text>
          <Text className="email-muted" style={styles.footerText}>
            <Link href={unsubscribeUrl} className="email-footer-link" style={styles.footerLink}>
              Unsubscribe from digest emails
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, CSSProperties> = {
  body: {
    backgroundColor: "#fafafa",
    color: "#171717",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "24px 0"
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "600px",
    padding: "24px"
  },
  hero: {
    backgroundColor: "#f5f5f5",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    padding: "20px 18px",
    textAlign: "center"
  },
  heroEyebrow: {
    color: "#737373",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    margin: "0 0 8px",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#0a0a0a",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "26px",
    margin: "0 0 8px"
  },
  heroLead: {
    color: "#525252",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 16px"
  },
  heroButton: {
    backgroundColor: "#0a0a0a",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 600,
    padding: "10px 20px",
    textDecoration: "none"
  },
  heroRule: {
    borderColor: "#e5e5e5",
    margin: "20px 0"
  },
  kicker: {
    color: "#737373",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: 0,
    textTransform: "uppercase"
  },
  heading: {
    color: "#0a0a0a",
    fontSize: "24px",
    lineHeight: "32px",
    margin: "8px 0 12px"
  },
  text: {
    color: "#404040",
    fontSize: "14px",
    lineHeight: "22px",
    margin: 0
  },
  digestSectionBlog: {
    borderLeft: "4px solid #d4d4d4",
    marginTop: "24px",
    paddingLeft: "14px"
  },
  digestSectionDiscussions: {
    borderLeft: "4px solid #a3a3a3",
    paddingLeft: "14px"
  },
  sectionDivider: {
    borderColor: "#e5e5e5",
    margin: "28px 0 0"
  },
  sectionHeading: {
    color: "#0a0a0a",
    fontSize: "18px",
    margin: "0 0 4px"
  },
  sectionSub: {
    color: "#737373",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 12px"
  },
  itemCard: {
    backgroundColor: "#fafafa",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    marginBottom: "10px",
    padding: "12px"
  },
  avatarColumn: {
    width: "48px",
    verticalAlign: "top"
  },
  itemContentColumn: {
    verticalAlign: "top",
    paddingLeft: "12px"
  },
  avatarImg: {
    border: "1px solid #e5e5e5",
    borderRadius: "9999px",
    display: "block",
    height: "40px",
    objectFit: "cover",
    width: "40px"
  },
  avatarFallback: {
    backgroundColor: "#f5f5f5",
    border: "1px solid #e5e5e5",
    borderRadius: "9999px",
    color: "#404040",
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    height: "40px",
    lineHeight: "40px",
    margin: 0,
    textAlign: "center",
    width: "40px"
  },
  itemTitle: {
    color: "#0a0a0a",
    display: "block",
    fontSize: "15px",
    fontWeight: 600,
    lineHeight: "22px",
    margin: "0 0 4px",
    textDecoration: "none"
  },
  itemMeta: {
    color: "#737373",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 4px"
  },
  itemStats: {
    color: "#737373",
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0
  },
  scoreRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "6px"
  },
  scorePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "9999px",
    border: "1px solid #111827",
    padding: "3px 8px",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    backgroundColor: "#020617",
    color: "#e5e5e5"
  },
  scorePillLabel: {
    fontWeight: 600
  },
  scorePillSeparator: {
    opacity: 0.6
  },
  scorePillPeriod: {
    opacity: 0.8
  },
  scorePillValueHot: {
    fontWeight: 600,
    color: "#f97316"
  },
  scorePillValueQuality: {
    fontWeight: 600,
    color: "#38bdf8"
  },
  scoreSparkline: {
    display: "inline-block",
    marginLeft: "2px"
  },
  actions: {
    marginTop: "22px"
  },
  buttonSecondary: {
    backgroundColor: "#ffffff",
    border: "1px solid #d4d4d4",
    borderRadius: "8px",
    color: "#0a0a0a",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 600,
    padding: "10px 16px",
    textDecoration: "none"
  },
  hr: {
    borderColor: "#e5e5e5",
    margin: "24px 0 16px"
  },
  footerText: {
    color: "#737373",
    fontSize: "12px",
    margin: "0 0 8px"
  },
  footerLink: {
    color: "#404040",
    textDecoration: "underline"
  }
};
