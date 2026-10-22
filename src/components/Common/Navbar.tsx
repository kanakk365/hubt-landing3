import { Logo } from "@/components/site/Logo";
import { BookCall } from "@/components/site/BookCall";

/** Wordmark and the one action, on a solid white bar over every section. */
const Navbar = () => {
  return (
    <header className="tokens-light fixed inset-x-0 top-0 z-50 border-b border-line bg-bg">
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-6 px-6 md:px-8"
      >
        <Logo />
        <BookCall size="sm" />
      </nav>
    </header>
  );
};

export default Navbar;
