import codebayLogo from "@/assets/codebay-logo.svg";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 px-6 py-2.5 backdrop-blur-md md:bg-background/80 md:backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-1.5">
        <nav className="flex items-center justify-center gap-4">
          <a
            href="#"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center justify-center gap-2">
          <img
            src={codebayLogo}
            alt="CodeBay"
            className="h-4 w-auto dark:invert"
          />
          <span className="text-[10px] text-muted-foreground">
            &copy; {year} CodeBay. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
