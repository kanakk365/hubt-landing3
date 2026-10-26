import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { BookCall } from "@/components/site/BookCall";
import { NAV_LINKS } from "@/lib/site";

const Footer = () => {
  return (
    <footer className="tokens-dark relative border-t border-line bg-bg-deep">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start md:gap-16 md:py-16">
        <div className="flex flex-col items-start gap-4">
          <Logo />
          <p className="max-w-[44ch] text-[0.9375rem] leading-relaxed text-fg-muted">
            An AI and software studio. We design, build and run production systems for businesses, founders and
            sports organisations.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-[0.9375rem] md:grid-cols-1">
            {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-fg-muted transition-colors duration-300 hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
