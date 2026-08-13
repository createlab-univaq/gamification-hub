import type {Ref} from "react";
import {Link, type LinkProps} from "react-router-dom";

type RouterLinkProps = Omit<LinkProps, "to"> & { href?: LinkProps["to"], ref?: Ref<HTMLAnchorElement> }

export function RouterLink({href, ref, ...props}: RouterLinkProps) {
    return <Link ref={ref} to={href ?? ""} {...props}/>
}
