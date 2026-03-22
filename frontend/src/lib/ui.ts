export const containerClass = "mx-auto w-[min(100%-2rem,1100px)]";
export const containerNarrowClass = "mx-auto w-[min(100%-2rem,980px)]";
export const containerWideClass = "mx-auto w-[min(100%-2rem,1180px)]";

export const btnBaseClass =
  "inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-[0.84rem] font-semibold no-underline transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/6 active:scale-[0.99]";
export const btnPrimaryClass = `${btnBaseClass} border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-[#111111] hover:border-[#111111]`;
export const btnGhostClass = `${btnBaseClass} border-[#dddddd] bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[#cfcfcf] hover:bg-[#fafafa]`;

export const fieldLabelClass = "text-sm font-bold text-[#6b6b6b]";
export const fieldControlClass =
  "w-full min-h-[42px] rounded-lg border border-[#d6d6d6] bg-white px-3.5 py-2.5 text-[0.84rem] text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[#a0a0a0] hover:border-[#c8c8c8] focus:border-[#bdbdbd] focus:bg-white focus:ring-4 focus:ring-black/4";

export const navMenuClass =
  "hidden items-center gap-4 min-[641px]:flex max-[640px]:absolute max-[640px]:right-0 max-[640px]:top-[calc(100%+10px)] max-[640px]:w-[min(92vw,340px)] max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:rounded-[14px] max-[640px]:border max-[640px]:border-[#e8e8e8] max-[640px]:bg-white max-[640px]:p-3 max-[640px]:shadow-[0_10px_30px_rgba(0,0,0,.08)] [&.is-open]:flex";
export const navLinkClass = "font-semibold text-[#6b6b6b] no-underline transition-colors hover:text-[#111111]";
export const navToggleClass =
  "inline-flex cursor-pointer rounded-[10px] border border-[#e8e8e8] bg-white px-3 py-2 leading-none min-[641px]:hidden";

export const brandLogoClass =
  "block h-[50px] w-auto max-w-[220px] object-contain max-[640px]:h-[42px] max-[640px]:max-w-[170px]";
export const badgeClass =
  "inline-flex items-center rounded-full border border-[#e8e8e8] bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#6b6b6b]";
