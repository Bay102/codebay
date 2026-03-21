import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text
} from "@react-email/components";
import type { CSSProperties } from "react";

export interface DigestBlogItem {
  title: string;
  url: string;
  authorName: string;
  publishedAt: string;
}

export interface DigestDiscussionItem {
  title: string;
  url: string;
  authorName: string;
  createdAt: string;
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
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
    <Html>
      <Head />
      <Preview>Your {frequencyLabel} CodeBay digest is ready.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.hero}>
            <Text style={styles.heroEyebrow}>CodeBay Community</Text>
            <Heading as="h1" style={styles.heroTitle}>
              Jump back into the community
            </Heading>
            <Text style={styles.heroLead}>
              Explore what is new beyond your digest — trending threads, fresh posts, and more.
            </Text>
            <Button href={siteUrl} style={styles.heroButton}>
              Open CodeBay
            </Button>
          </Section>

          <Hr style={styles.heroRule} />

          <Section>
            <Text style={styles.kicker}>Your digest</Text>
            <Heading style={styles.heading}>Followed creators · {frequencyLabel}</Heading>
            <Text style={styles.text}>
              Hi {recipientName}, here is what people you follow published in this period.
            </Text>
          </Section>

          {hasBlog ? (
            <Section style={styles.digestSectionBlog}>
              <Heading as="h2" style={styles.sectionHeading}>
                Blog posts
              </Heading>
              <Text style={styles.sectionSub}>
                {blogItems.length} new {blogItems.length === 1 ? "post" : "posts"} from followed creators
              </Text>
              {blogItems.map((item) => (
                <Section key={item.url} style={styles.itemCard}>
                  <Link href={item.url} style={styles.itemTitle}>
                    {item.title}
                  </Link>
                  <Text style={styles.itemMeta}>
                    by {item.authorName} · {formatDate(item.publishedAt)}
                  </Text>
                </Section>
              ))}
            </Section>
          ) : null}

          {hasBlog && hasDiscussions ? <Hr style={styles.sectionDivider} /> : null}

          {hasDiscussions ? (
            <Section
              style={{
                ...styles.digestSectionDiscussions,
                marginTop: hasBlog ? "16px" : "24px"
              }}
            >
              <Heading as="h2" style={styles.sectionHeading}>
                Discussions
              </Heading>
              <Text style={styles.sectionSub}>
                {discussionItems.length} new {discussionItems.length === 1 ? "thread" : "threads"} from followed creators
              </Text>
              {discussionItems.map((item) => (
                <Section key={item.url} style={styles.itemCard}>
                  <Link href={item.url} style={styles.itemTitle}>
                    {item.title}
                  </Link>
                  <Text style={styles.itemMeta}>
                    by {item.authorName} · {formatDate(item.createdAt)}
                  </Text>
                </Section>
              ))}
            </Section>
          ) : null}

          <Section style={styles.actions}>
            <Button href={managePreferencesUrl} style={styles.button}>
              Manage newsletter preferences
            </Button>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.footerText}>
            You are receiving this email because your newsletter digest is enabled in CodeBay.
          </Text>
          <Text style={styles.footerText}>
            <Link href={unsubscribeUrl} style={styles.footerLink}>
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
    backgroundColor: "#0b1020",
    color: "#e5e7eb",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "24px 0"
  },
  container: {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "600px",
    padding: "24px"
  },
  hero: {
    backgroundColor: "#0c1628",
    border: "1px solid #1d4ed8",
    borderRadius: "10px",
    padding: "20px 18px",
    textAlign: "center"
  },
  heroEyebrow: {
    color: "#93c5fd",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    margin: "0 0 8px",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#f9fafb",
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "26px",
    margin: "0 0 8px"
  },
  heroLead: {
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 16px"
  },
  heroButton: {
    backgroundColor: "#2563eb",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 600,
    padding: "10px 20px",
    textDecoration: "none"
  },
  heroRule: {
    borderColor: "#1f2937",
    margin: "20px 0"
  },
  kicker: {
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: 0,
    textTransform: "uppercase"
  },
  heading: {
    color: "#f9fafb",
    fontSize: "24px",
    lineHeight: "32px",
    margin: "8px 0 12px"
  },
  text: {
    color: "#d1d5db",
    fontSize: "14px",
    lineHeight: "22px",
    margin: 0
  },
  digestSectionBlog: {
    borderLeft: "4px solid #3b82f6",
    marginTop: "24px",
    paddingLeft: "14px"
  },
  digestSectionDiscussions: {
    borderLeft: "4px solid #8b5cf6",
    paddingLeft: "14px"
  },
  sectionDivider: {
    borderColor: "#273449",
    margin: "28px 0 0"
  },
  sectionHeading: {
    color: "#f9fafb",
    fontSize: "18px",
    margin: "0 0 4px"
  },
  sectionSub: {
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 12px"
  },
  itemCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    marginBottom: "10px",
    padding: "12px"
  },
  itemTitle: {
    color: "#93c5fd",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "6px",
    textDecoration: "none"
  },
  itemMeta: {
    color: "#9ca3af",
    fontSize: "12px",
    margin: 0
  },
  actions: {
    marginTop: "22px"
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 600,
    padding: "10px 16px",
    textDecoration: "none"
  },
  hr: {
    borderColor: "#1f2937",
    margin: "24px 0 16px"
  },
  footerText: {
    color: "#9ca3af",
    fontSize: "12px",
    margin: "0 0 8px"
  },
  footerLink: {
    color: "#93c5fd",
    textDecoration: "underline"
  }
};
