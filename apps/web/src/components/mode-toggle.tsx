"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export type AnimationVariant = "polygon" | "circle" | "circle-blur" | "rectangle" | "gif";
export type AnimationStart = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "top-center" | "bottom-center" | "bottom-up" | "top-down" | "left-right" | "right-left";

const getPolygonClipPaths = (position: AnimationStart) => {
  switch (position) {
    case "top-left":
      return {
        darkFrom: "polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)",
        darkTo: "polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)",
        lightFrom: "polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)",
        lightTo: "polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)",
      };
    case "top-right":
      return {
        darkFrom: "polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%)",
        darkTo: "polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%)",
        lightFrom: "polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)",
        lightTo: "polygon(-71% 50%, 50% 171%, 250% 71%, 150% -71%)",
      };
    default:
      return {
        darkFrom: "polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)",
        darkTo: "polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)",
        lightFrom: "polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)",
        lightTo: "polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)",
      };
  }
};

export const createAnimation = (variant: AnimationVariant, start: AnimationStart, blur: boolean) => {
  const clipPaths = getPolygonClipPaths(start);
  return {
    name: `${variant}-${start}${blur ? "-blur" : ""}`,
    css: `
    :root::view-transition-group(root) {
      animation-duration: 0.7s;
      animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }
    :root::view-transition-new(root) {
      animation-name: reveal-light-${start}${blur ? "-blur" : ""};
      ${blur ? "filter: blur(2px);" : ""}
    }
    :root::view-transition-old(root),
    .dark::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }
    .dark::view-transition-new(root) {
      animation-name: reveal-dark-${start}${blur ? "-blur" : ""};
      ${blur ? "filter: blur(2px);" : ""}
    }
    @keyframes reveal-dark-${start}${blur ? "-blur" : ""} {
      from {
        clip-path: ${clipPaths.darkFrom};
        ${blur ? "filter: blur(8px);" : ""}
      }
      ${blur ? "50% { filter: blur(4px); }" : ""}
      to {
        clip-path: ${clipPaths.darkTo};
        ${blur ? "filter: blur(0px);" : ""}
      }
    }
    @keyframes reveal-light-${start}${blur ? "-blur" : ""} {
      from {
        clip-path: ${clipPaths.lightFrom};
        ${blur ? "filter: blur(8px);" : ""}
      }
      ${blur ? "50% { filter: blur(4px); }" : ""}
      to {
        clip-path: ${clipPaths.lightTo};
        ${blur ? "filter: blur(0px);" : ""}
      }
    }
    `,
  };
};

import { flushSync } from "react-dom";

export const useThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const updateStyles = React.useCallback((css: string) => {
    if (typeof window === "undefined") return;
    const styleId = "theme-transition-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
  }, []);

  const toggleTheme = React.useCallback(() => {
    const animation = createAnimation("rectangle", "top-right", true);
    updateStyles(animation.css);

    if (typeof window === "undefined") return;

    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    const isDark = newTheme === "dark";

    const documentWithTransition = document as any;
    if (!documentWithTransition.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    documentWithTransition.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });
  }, [resolvedTheme, setTheme, updateStyles]);

  return { toggleTheme };
};

export function ModeToggle() {
  const { toggleTheme } = useThemeToggle();

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
