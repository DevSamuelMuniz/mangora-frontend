import type { LandingLayout } from "@/lib/marketing";

/** A structural miniature of each layout; colors come from the campaign stylesheet. */
export default function LayoutThumbnail({ layout }: { layout: LandingLayout }) {
  return <span className={`layout-thumbnail layout-thumbnail--${layout}`} aria-hidden="true">
    <span className="layout-thumbnail__nav"><i /><i /><i /></span>
    <span className="layout-thumbnail__hero"><span className="layout-thumbnail__copy"><b /><b /><i /><em /></span><span className="layout-thumbnail__visual">{layout === "black-friday" ? <strong>%</strong> : <><i /><i /><i /></>}</span></span>
    <span className="layout-thumbnail__sections"><i /><i /><i /></span>
  </span>;
}
