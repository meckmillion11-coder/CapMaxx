/**
 * Static content for CapMaxx public/marketing pages.
 *
 * This is intentionally kept in one simple module so an Admin "Site Pages"
 * editor can later read/write the same shape from the database and adopt it
 * without changing the page components. Keep the structure stable.
 */

export interface SitePageSection {
  heading?: string;
  body?: string;
  items?: string[];
}

export interface SitePage {
  slug: string;
  title: string;
  intro?: string;
  sections?: SitePageSection[];
  note?: string;
}

export const aboutPage: SitePage = {
  slug: "about",
  title: "About CapMaxx",
  intro:
    "CapMaxx helps businesses showcase underutilized resources and discover companies looking for capacity, equipment, warehouse space, transportation resources, labor, services, and business capabilities.",
  sections: [
    {
      heading: "Why CapMaxx",
      body:
        "Most businesses have capacity, equipment, space, or expertise that sits idle at least part of the time. CapMaxx turns that underutilized value into an opportunity by connecting companies that have resources to offer with companies that need them.",
    },
    {
      heading: "What you can do here",
      items: [
        "Showcase available or underutilized resources and capabilities.",
        "Discover companies actively looking for what you provide.",
        "Connect directly to discuss requirements, timelines, and availability.",
        "Build a network of suppliers, customers, and strategic partners.",
      ],
    },
  ],
};

export const howItWorksPage: SitePage = {
  slug: "how-it-works",
  title: "How It Works",
  intro:
    "Getting value from CapMaxx takes just a few steps. Showcase what you have, discover who needs it, and connect directly.",
  sections: [
    {
      heading: "Steps",
      items: [
        "Create a company profile.",
        "Showcase available or underutilized resources.",
        "Browse resources and needs.",
        "Connect directly with companies.",
        "Turn underutilized resources into business opportunities.",
      ],
    },
  ],
};

export const contactPage: SitePage = {
  slug: "contact",
  title: "Contact Us",
  intro: "Have a question about CapMaxx? Reach out and we'll be happy to help.",
  sections: [
    {
      heading: "Contact details",
      items: ["Company: CapMaxx", "Contact: Mahajan", "Email: support@capmaxx.com"],
    },
  ],
  note: "Contact details can be updated later from Admin Panel.",
};

const legalDisclaimer =
  "This page is a starting template and should be reviewed by a qualified legal professional before public launch.";

export const privacyPolicyPage: SitePage = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  intro:
    "This Privacy Policy explains what information CapMaxx collects and how it is used. It is a starting template and will evolve as the platform grows.",
  sections: [
    {
      heading: "Information we collect",
      items: [
        "Account information",
        "Company information",
        "Contact information",
        "Listings you create",
        "Uploaded media",
        "Messages you send and receive",
        "Saved and followed companies and listings",
        "Intake submissions",
        "Usage and activity data",
      ],
    },
    {
      heading: "How we use information",
      items: [
        "Operate and maintain the platform",
        "Display company profiles and listings",
        "Enable messages and connections between companies",
        "Improve safety and prevent misuse",
        "Provide administrative support",
      ],
    },
    {
      heading: "Please note",
      body:
        "You should not upload confidential or sensitive information that you do not want to be publicly visible. Listings, profiles, and uploaded media may be visible to other users of the platform.",
    },
  ],
  note: legalDisclaimer,
};

export const termsOfServicePage: SitePage = {
  slug: "terms-of-service",
  title: "Terms of Service",
  intro:
    "These Terms of Service govern your use of CapMaxx. By using the platform you agree to the following terms. This is a starting template and will evolve as the platform grows.",
  sections: [
    {
      heading: "Using the platform",
      body:
        "CapMaxx is a platform for business resource visibility and connections. Users are responsible for the accuracy of the information they post.",
    },
    {
      heading: "What CapMaxx does not guarantee",
      body:
        "CapMaxx does not guarantee any deals, payments, contracts, or results. Transactions and agreements happen directly between users, who are responsible for their own due diligence.",
    },
    {
      heading: "Acceptable use",
      items: [
        "Do not post fake, misleading, illegal, harmful, or infringing content.",
        "CapMaxx may remove listings, suspend accounts, and review reports at its discretion.",
        "Users are expected to interact honestly and professionally.",
      ],
    },
  ],
  note: legalDisclaimer,
};

export const sitePages = {
  about: aboutPage,
  "how-it-works": howItWorksPage,
  contact: contactPage,
  "privacy-policy": privacyPolicyPage,
  "terms-of-service": termsOfServicePage,
} as const;
