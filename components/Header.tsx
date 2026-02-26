"use client";

import { useEffect, useRef, useState } from "react";
import { Airplane, Mail, Phone } from "iconoir-react";
import Link from "next/link";
import { trackContactClick } from "@/lib/analytics";
import { resolveTestModeState } from "@/lib/test-mode";

function LogoSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 251 158"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M247.034 0.12439H221.139C218.714 0.12439 217.437 2.99258 219.044 4.80144L222.965 9.19867L186.283 98.6423L149.6 9.19867L153.552 4.76147C155.149 2.9626 153.881 0.12439 151.476 0.12439H125.531C120.033 0.12439 120.172 4.68152 122.947 7.08L127.297 11.5272L174.607 125.275C175.166 126.625 176.484 127.504 177.95 127.504H194.635C196.092 127.504 197.409 126.625 197.978 125.275L245.278 11.5272L249.629 7.08C252.393 4.68152 250.697 0.12439 247.044 0.12439H247.034Z"
        fill="currentColor"
      />
      <path
        d="M175.256 146.072L127.946 32.3241C127.387 30.9749 126.07 30.0955 124.603 30.0955H107.918C106.461 30.0955 105.144 30.9749 104.575 32.3241L73.6308 106.717H28.6858V70.49H78.9197C80.167 70.49 81.2946 69.7305 81.7636 68.5712L89.3376 51.3021C89.7667 50.2428 88.9884 49.0835 87.8508 49.0835H28.6858V20.1318H99.5561L104.506 24.579C106.382 26.2579 109.355 24.9287 109.355 22.4103V3.14249C109.355 1.47354 108.008 0.12439 106.342 0.12439H2.9801C0.365629 0.12439 -0.871757 3.36235 1.07413 5.11124L7.03154 10.4579V117.031L0.934427 122.567C-0.981525 124.306 0.245882 127.494 2.83042 127.494H64.9791L57.2554 146.062L52.9046 150.51C50.1405 152.908 51.8369 157.465 55.4892 157.465H81.3844C83.8093 157.465 85.0866 154.597 83.48 152.788L79.5583 148.391L88.1302 127.504L96.6522 106.717L116.241 58.9573L135.829 106.717H106.92C105.364 106.717 103.957 107.657 103.358 109.106L96.9116 124.806C96.3828 126.095 97.3307 127.504 98.7178 127.504H144.351L152.923 148.391L148.972 152.828C147.375 154.627 148.642 157.465 151.047 157.465H176.992C180.655 157.465 182.351 152.908 179.577 150.51L175.226 146.062L175.256 146.072Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 233 31"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 29.3393V0.921327C0 0.745546 0.149917 0.59906 0.329817 0.59906H17.0805C17.2604 0.59906 17.4104 0.745546 17.4104 0.921327V6.20453C17.4104 6.38031 17.2604 6.5268 17.0805 6.5268H7.37592C7.19602 6.5268 7.0461 6.67327 7.0461 6.84905V11.1752C7.0461 11.351 7.19602 11.4975 7.37592 11.4975H13.4625C13.6425 11.4975 13.7924 11.644 13.7924 11.8198V17.0639C13.7924 17.2397 13.6425 17.3862 13.4625 17.3862H7.37592C7.19602 17.3862 7.0461 17.5326 7.0461 17.7084V23.3725C7.0461 23.5483 7.19602 23.6947 7.37592 23.6947H17.3704C17.5503 23.6947 17.7002 23.8412 17.7002 24.017V29.3002C17.7002 29.476 17.5503 29.6225 17.3704 29.6225H0.339812C0.159912 29.6225 0.0099947 29.476 0.0099947 29.3002L0 29.3393Z" fill="currentColor" />
      <path d="M35.2605 29.4077L34.2611 24.5347C34.2311 24.3882 34.0912 24.271 33.9312 24.271H28.6142C28.4543 24.271 28.3144 24.3784 28.2844 24.5347L27.3249 29.4077C27.2949 29.564 27.155 29.6714 26.9951 29.6714H20.3887C20.1689 29.6714 20.009 29.4761 20.0689 29.271L27.5848 0.853027C27.6247 0.706543 27.7547 0.608887 27.9046 0.608887H34.7008C34.8507 0.608887 34.9807 0.706543 35.0206 0.853027L42.4965 29.271C42.5465 29.4761 42.3966 29.6714 42.1767 29.6714H35.5703C35.4104 29.6714 35.2805 29.564 35.2405 29.4077H35.2605ZM32.8518 17.6694C32.1722 13.8511 31.5326 10.6968 31.2327 8.04052C30.9829 10.6968 30.3832 13.8511 29.6636 17.7183L29.4937 18.6362H33.0218L32.8518 17.6792V17.6694Z" fill="currentColor" />
      <path d="M54.4899 29.6713H47.9035C47.7536 29.6713 47.6237 29.5737 47.5837 29.4272L40.3077 0.999454C40.2578 0.794376 40.4177 0.59906 40.6276 0.59906H47.4938C47.6537 0.59906 47.7936 0.706486 47.8136 0.862736L49.3327 9.11468C50.0523 12.933 50.9518 18.4115 51.2417 21.3608C51.4915 18.4115 52.3911 12.933 53.0707 9.11468L54.5499 0.872496C54.5798 0.716246 54.7098 0.60882 54.8697 0.60882H61.6959C61.9058 0.60882 62.0657 0.804136 62.0157 1.00921L54.7897 29.4369C54.7497 29.5834 54.6198 29.6811 54.4699 29.6811L54.4899 29.6713Z" fill="currentColor" />
      <path d="M96.1705 29.6713H90.1538C89.9939 29.6713 89.854 29.5541 89.824 29.3979L88.9345 23.9389C88.2149 19.5346 87.4853 14.6811 87.3154 12.142C87.1455 14.6713 86.4659 19.4955 85.6963 23.9389L84.7668 29.3979C84.7368 29.5541 84.5969 29.6713 84.437 29.6713H78.5003C78.3404 29.6713 78.2004 29.5541 78.1705 29.3979L73.1432 0.979923C73.1033 0.78461 73.2632 0.599064 73.4731 0.599064H79.7096C79.8795 0.599064 80.0194 0.726011 80.0394 0.882261L80.6791 5.91156C81.1488 9.52484 81.6585 14.4662 81.8684 18.1186C82.1682 14.5053 82.8878 9.5639 83.4375 5.95062L84.1971 0.8725C84.2171 0.71625 84.367 0.589304 84.5269 0.589304H90.1138C90.2838 0.589304 90.4237 0.70649 90.4437 0.86274L91.2532 5.94086C91.8529 9.55414 92.5225 14.4955 92.8223 18.1088C93.0322 14.4565 93.5919 9.55414 94.0117 5.9018L94.6114 0.8725C94.6313 0.706485 94.7713 0.579529 94.9412 0.579529H101.178C101.388 0.579529 101.548 0.765075 101.508 0.960387L96.4803 29.3783C96.4503 29.5346 96.3104 29.6518 96.1505 29.6518L96.1705 29.6713Z" fill="currentColor" />
      <path d="M115.73 29.3783L114.74 24.5541C114.71 24.3881 114.56 24.2709 114.38 24.2709H109.113C108.943 24.2709 108.794 24.3881 108.754 24.5541L107.804 29.3783C107.774 29.5444 107.624 29.6615 107.444 29.6615H100.898C100.658 29.6615 100.488 29.4467 100.548 29.2221L108.054 0.862736C108.094 0.706486 108.244 0.59906 108.404 0.59906H115.15C115.32 0.59906 115.46 0.706486 115.5 0.862736L122.966 29.2221C123.026 29.4467 122.856 29.6615 122.616 29.6615H116.07C115.9 29.6615 115.75 29.5444 115.71 29.3783H115.73ZM113.321 17.6694C112.641 13.851 112.002 10.6967 111.702 8.04046C111.452 10.6967 110.852 13.851 110.133 17.7182L109.963 18.6362H113.491L113.321 17.6791V17.6694Z" fill="currentColor" />
      <path d="M134.239 30.1205C129.732 30.1205 127.073 28.3529 124.655 25.306C124.545 25.1693 124.565 24.9642 124.695 24.8568L129.062 21.0091C129.202 20.8919 129.422 20.9115 129.542 21.0482C131.431 23.2064 132.98 24.3197 134.369 24.3197C135.859 24.3197 136.918 23.5677 136.918 21.9955C136.918 20.4232 136.448 19.3783 133.09 17.9232C127.183 15.3939 125.015 13.1869 125.015 8.62634C125.015 4.06579 128.543 0.159546 134.239 0.159546C138.697 0.159546 140.996 1.69274 143.384 4.515C143.494 4.65172 143.484 4.8568 143.354 4.97399L138.917 8.86072C138.777 8.9779 138.547 8.9486 138.427 8.81189C136.558 6.65368 135.829 5.97009 134.03 5.97009C132.67 5.97009 131.901 6.96618 131.901 8.05017C131.901 9.58337 132.67 10.4623 135.679 11.7416C141.665 14.3197 143.884 16.722 143.884 21.5853C143.884 27.0248 139.766 30.14 134.239 30.14V30.1205Z" fill="currentColor" />
      <path d="M160.555 29.3295V17.8354C160.555 17.6498 160.405 17.4936 160.205 17.4936H154.908C154.718 17.4936 154.558 17.6401 154.558 17.8354V29.3295C154.558 29.5151 154.408 29.6713 154.208 29.6713H147.712C147.522 29.6713 147.362 29.5248 147.362 29.3295V0.940863C147.362 0.755316 147.512 0.59906 147.712 0.59906H154.208C154.398 0.59906 154.558 0.74555 154.558 0.940863V11.1069C154.558 11.2924 154.708 11.4487 154.908 11.4487H160.205C160.395 11.4487 160.555 11.3022 160.555 11.1069V0.940863C160.555 0.755316 160.705 0.59906 160.905 0.59906H167.401C167.591 0.59906 167.751 0.74555 167.751 0.940863V29.3295C167.751 29.5151 167.601 29.6713 167.401 29.6713H160.905C160.715 29.6713 160.555 29.5248 160.555 29.3295Z" fill="currentColor" />
      <path d="M190.094 30.1205C183.127 30.1205 179.599 24.9252 179.599 15.1693C179.599 5.41345 183.547 0.140015 190.184 0.140015C196.31 0.140015 198.509 3.49938 199.678 8.88024C199.718 9.05602 199.608 9.23181 199.438 9.28063L193.222 10.931C193.032 10.9799 192.832 10.8431 192.802 10.6576C192.312 7.65955 191.813 6.12634 190.144 6.12634C187.845 6.12634 186.955 8.48963 186.955 15.101C186.955 21.7123 187.845 24.1537 190.234 24.1537C191.833 24.1537 192.402 23.0697 193.162 19.7884C193.202 19.6029 193.412 19.4759 193.602 19.5345L199.538 21.517C199.708 21.5756 199.798 21.7513 199.758 21.9271C198.419 27.015 195.9 30.1302 190.104 30.1302L190.094 30.1205Z" fill="currentColor" />
      <path d="M212.995 30.1205C206.319 30.1205 202.411 25.433 202.411 15.1693C202.411 4.90564 206.409 0.140015 213.075 0.140015C219.741 0.140015 223.699 4.87634 223.699 15.0912C223.699 25.306 219.701 30.1205 212.985 30.1205H212.995ZM213.045 6.12634C210.796 6.12634 209.727 8.07947 209.727 15.101C209.727 22.1224 210.876 24.1537 213.085 24.1537C215.294 24.1537 216.403 22.2006 216.403 15.1888C216.403 8.17712 215.254 6.1361 213.045 6.1361V6.12634Z" fill="currentColor" />
      <path d="M228.927 30.0642C226.552 30.0642 224.801 28.399 224.801 26.0795C224.801 23.76 226.536 22.1393 228.927 22.1393C231.317 22.1393 233.006 23.76 233.006 26.0795C233.006 28.399 231.301 30.0642 228.927 30.0642Z" fill="currentColor" />
    </svg>
  );
}

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isHiddenForCta, setIsHiddenForCta] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isTestModeEnabled, setIsTestModeEnabled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateThemeFromViewport = () => {
      const sampleX = window.innerWidth / 2;
      const rect = headerRef.current?.getBoundingClientRect();
      const sampleY = Math.max(
        1,
        Math.min(window.innerHeight - 1, (rect?.bottom ?? 76) + 2),
      );
      const el = document.elementFromPoint(sampleX, sampleY);
      const themedSection = el?.closest("[data-header-theme]");
      const nextTheme = themedSection?.getAttribute("data-header-theme");
      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
      setHasScrolled(window.scrollY > 0);
    };

    const onScrollOrResize = () => {
      window.requestAnimationFrame(updateThemeFromViewport);
    };

    updateThemeFromViewport();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  useEffect(() => {
    const { testModeEnabled } = resolveTestModeState();
    setIsTestModeEnabled(testModeEnabled);
  }, []);

  useEffect(() => {
    const hideTrigger =
      document.getElementById("bottom-cta") ??
      document.querySelector<HTMLElement>("footer");
    if (!hideTrigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHiddenForCta(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.02,
        rootMargin: "0px 0px -45% 0px",
      },
    );

    observer.observe(hideTrigger);
    return () => observer.disconnect();
  }, []);

  const isLightTheme = theme === "light";

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter,color] duration-150 ease-out ${
        isHiddenForCta ? "-translate-y-full" : "translate-y-0"
      } ${
        hasScrolled
          ? isLightTheme
            ? "bg-eav-cream/80 backdrop-blur-[2px]"
            : "bg-eav-black/80 backdrop-blur-[2px]"
          : "bg-transparent backdrop-blur-0"
      }`}
    >
      <div className="flex h-12 items-center justify-center bg-eav-orange px-5 text-eav-white sm:px-8">
        <p className="inline-flex items-center justify-center gap-3 text-center font-body text-sm font-semibold sm:text-base">
          <Airplane className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Temporarily closed while we travel! We'll be back March 9th.</span>
        </p>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2.5 transition-opacity hover:opacity-80"
              aria-label="EAV Wash Co. home"
            >
              <span
                className={`block h-auto w-[140px] transition-colors duration-500 sm:w-[140px] ${
                  isLightTheme ? "text-eav-black" : "text-eav-cream"
                }`}
              >
                <Wordmark className="h-auto w-full" />
              </span>
            </Link>
            {isTestModeEnabled && (
              <span
                className={`inline-flex h-5 items-center rounded-full border px-2 font-body text-[10px] font-semibold uppercase tracking-[0.08em] ${
                  isLightTheme
                    ? "border-eav-black/20 bg-eav-black/5 text-eav-black"
                    : "border-eav-cream/25 bg-eav-cream/10 text-eav-cream"
                }`}
              >
                Test Mode
              </span>
            )}
          </div>

          <nav className="flex items-center justify-end gap-2 sm:gap-6" aria-label="Primary">
            <a
              href="tel:+14703009995"
              onClick={() =>
                trackContactClick({ channel: "phone", placement: "header" })
              }
              className={`inline-flex h-8 items-center gap-1.5 rounded-sm bg-eav-orange px-3 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-eav-white transition-all duration-500 hover:brightness-110 active:scale-[0.98] sm:h-auto sm:rounded-none sm:bg-transparent sm:px-0 sm:text-[14px] sm:font-normal sm:normal-case sm:tracking-normal sm:hover:brightness-100 ${
                isLightTheme
                  ? "sm:text-eav-black sm:hover:text-eav-black/70"
                  : "sm:text-eav-cream sm:hover:text-eav-cream/70"
              }`}
            >
              <Phone
                className="h-[14px] w-[14px] shrink-0 text-eav-white sm:h-[16px] sm:w-[16px] sm:text-eav-orange"
                aria-hidden="true"
              />
              <span className="sm:hidden">Call</span>
              <span className="hidden sm:inline">(470) 300-9995</span>
            </a>
            <a
              href="mailto:hello@eavwash.co"
              onClick={() =>
                trackContactClick({ channel: "email", placement: "header" })
              }
              className={`inline-flex h-8 items-center gap-1.5 rounded-sm bg-eav-orange px-3 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-eav-white transition-all duration-500 hover:brightness-110 active:scale-[0.98] sm:h-auto sm:rounded-none sm:bg-transparent sm:px-0 sm:text-[14px] sm:font-normal sm:normal-case sm:tracking-normal sm:hover:brightness-100 ${
                isLightTheme
                  ? "sm:text-eav-black sm:hover:text-eav-black/70"
                  : "sm:text-eav-cream sm:hover:text-eav-cream/70"
              }`}
            >
              <Mail
                className="h-[14px] w-[14px] shrink-0 text-eav-white sm:h-[16px] sm:w-[16px] sm:text-eav-orange"
                aria-hidden="true"
              />
              <span className="sm:hidden">Email</span>
              <span className="hidden sm:inline">hello@eavwash.co</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
