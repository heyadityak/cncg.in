import Link from "next/link";

interface SiteFooterProps {
  /** Show the "← Back to CNCG India" link (used on inner pages) */
  showBackLink?: boolean;
}

export default function SiteFooter({ showBackLink = false }: SiteFooterProps) {
  return (
    <footer className="text-center text-xs text-slate-400 pb-6 px-4 space-y-2">
      <div>
        {showBackLink && (
          <>
            <Link
              href={
                process.env.NODE_ENV === "development"
                  ? "/"
                  : "https://cncg.in"
              }
              className="hover:text-blue-500 transition-colors"
            >
              ← Back to CNCG India
            </Link>
            {" "}&middot;{" "}
          </>
        )}
        {!showBackLink && (
          <>
            Built with ♥ for the Indian cloud-native community &middot;{" "}
          </>
        )}
        <a
          href="https://cncf.io"
          className="hover:text-blue-500 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          CNCF
        </a>
      </div>

      <p className="text-[11px] text-slate-400/90 max-w-xl mx-auto leading-relaxed">
        <strong className="font-semibold text-slate-500">Disclaimer:</strong>{" "}
        This is an independent, community-run directory. CNCG India is{" "}
        <span className="font-semibold">not affiliated with, endorsed by, or sponsored by</span>{" "}
        the Cloud Native Computing Foundation (CNCF) or The Linux Foundation.
        All trademarks belong to their respective owners.
      </p>
    </footer>
  );
}
