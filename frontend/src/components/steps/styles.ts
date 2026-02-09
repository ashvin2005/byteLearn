import { cva } from "class-variance-authority";

export const stepContainerStyles = cva(
  "w-full max-w-3xl mx-auto space-y-8 p-6 rounded-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-gray-800/30 backdrop-blur-md border border-gray-700/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const stepHeaderStyles = cva(
  "text-center space-y-3",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const stepTitleStyles = cva(
  "text-xl font-semibold tracking-tight",
  {
    variants: {
      variant: {
        default: "text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const stepDescriptionStyles = cva(
  "text-sm leading-6",
  {
    variants: {
      variant: {
        default: "text-gray-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const stepContentStyles = cva(
  "mt-8 space-y-6",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);