import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "!bg-white/90 dark:!bg-slate-800 !text-slate-700 dark:!text-slate-200 !border-slate-300 dark:!border-slate-600 hover:!bg-slate-100 dark:hover:!bg-slate-700 !opacity-100 !size-5 !rounded-full shadow-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
