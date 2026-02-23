export const containerClass = "mx-auto w-[min(100%-2rem,1100px)]";
export const containerNarrowClass = "mx-auto w-[min(100%-2rem,980px)]";
export const containerWideClass = "mx-auto w-[min(100%-2rem,1180px)]";

export const btnBaseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e8e8e8] px-4 py-3 font-bold no-underline";
export const btnPrimaryClass = `${btnBaseClass} border-[#111] bg-[#111] text-white`;
export const btnGhostClass = `${btnBaseClass} bg-transparent text-[#111111]`;

export const fieldLabelClass = "text-sm font-bold text-[#6b6b6b]";
export const fieldControlClass =
  "w-full rounded-xl border border-[#e8e8e8] bg-white px-3.5 py-3 outline-none focus:border-[#bdbdbd] focus:ring-4 focus:ring-black/5";

export const navMenuClass =
  "hidden items-center gap-4 min-[641px]:flex max-[640px]:absolute max-[640px]:right-0 max-[640px]:top-[calc(100%+10px)] max-[640px]:w-[min(92vw,340px)] max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:rounded-[14px] max-[640px]:border max-[640px]:border-[#e8e8e8] max-[640px]:bg-white max-[640px]:p-3 max-[640px]:shadow-[0_10px_30px_rgba(0,0,0,.08)] [&.is-open]:flex";
export const navLinkClass = "font-semibold text-[#6b6b6b] no-underline transition-colors hover:text-[#111111]";
export const navToggleClass =
  "inline-flex cursor-pointer rounded-[10px] border border-[#e8e8e8] bg-white px-3 py-2 leading-none min-[641px]:hidden";

export const brandLogoClass =
  "block h-[50px] w-auto max-w-[220px] object-contain max-[640px]:h-[42px] max-[640px]:max-w-[170px]";
export const badgeClass =
  "inline-flex items-center rounded-full border border-[#e8e8e8] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b6b6b]";
