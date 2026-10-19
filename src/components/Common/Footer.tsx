import { Logo } from "@/components/site/Logo";
import { BookCall } from "@/components/site/BookCall";

const Footer = () => {
  return (
    <footer className="relative border-t border-line bg-bg-deep">
      <div className="container-site flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="flex flex-col items-start gap-4">
          <Logo />
          <p className="max-w-[44ch] text-[0.9375rem] leading-relaxed text-fg-muted">
            An AI and software studio. We design, build and run production systems for businesses, founders and
            sports organisations.
          </p>
        </div>
        <BookCall size="md" variant="ghost" />
      </div>
      <div className="container-site flex flex-col gap-3 border-t border-line py-6 text-[0.8125rem] text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} HubTech Ltd. All rights reserved.</p>
        <p>hubts.io</p>
      </div>
    </footer>
  );
};

export default Footer;
