import React from "react";
export const useRouter = () => ({ refresh() {}, replace(url: string) { window.location.assign(url); }, push(url: string) { window.location.assign(url); } });
export const usePathname = () => window.location.pathname;
export const useSearchParams = () => new URLSearchParams(window.location.search);
export function Link({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) { return <a {...props}>{children}</a>; }
