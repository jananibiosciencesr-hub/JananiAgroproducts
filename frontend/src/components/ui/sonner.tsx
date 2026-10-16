import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-emerald-200/80 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:gap-3",
          title: "font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight",
          description: "text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "!right-2.5 !top-2.5 !left-auto !transform-none !bg-slate-100 dark:!bg-slate-800 !text-slate-500 hover:!text-slate-900 !border-none !size-5 !rounded-full shadow-none",
          success: "!border-emerald-300/80 dark:!border-emerald-800/80",
          error: "!border-rose-300/80 dark:!border-rose-800/80",
          info: "!border-blue-300/80 dark:!border-blue-800/80",
          warning: "!border-amber-300/80 dark:!border-amber-800/80",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
