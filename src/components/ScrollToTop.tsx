import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const position: ScrollToOptions = { top: 0, left: 0, behavior: "instant" };
    document.scrollingElement?.scrollTo(position);
    window.scrollTo(position);
  }, [pathname]);
  return null;
}
