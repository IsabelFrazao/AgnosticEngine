'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

type NavLeaf = {
  slug: string;
  label: string;
  order: number;
  children: NavLeaf[];
};

type NavEntry = {
  nav?: {
    label: string;
    order: number;
    parent?: string;
  };
};

type NavManifestLike = Record<string, NavEntry>;

type SidebarExtraItemLike = {
  href: string;
  label: string;
  order: number;
};

type SidebarProps = {
  navManifest: NavManifestLike;
  extras: SidebarExtraItemLike[];
};

function buildNavTree(navManifest: NavManifestLike): NavLeaf[] {
  const entries = Object.entries(navManifest)
    .filter(([, page]) => page.nav !== undefined)
    .map(([slug, page]) => ({ slug, ...page.nav! }));

  const roots = entries.filter((entry) => !entry.parent).sort((a, b) => a.order - b.order);

  return roots.map((root) => ({
    slug: root.slug,
    label: root.label,
    order: root.order,
    children: entries
      .filter((entry) => entry.parent === root.slug)
      .sort((a, b) => a.order - b.order)
      .map((child) => ({
        slug: child.slug,
        label: child.label,
        order: child.order,
        children: [],
      })),
  }));
}

type NavItemProps = {
  item: NavLeaf;
  pathname: string;
};

function NavItem({ item, pathname }: NavItemProps) {
  const isActive = pathname === item.slug;
  const isAncestor = pathname.startsWith(item.slug + '/');
  const hasChildren = item.children.length > 0;
  const [open, setOpen] = useState(isActive || isAncestor);

  const linkClass = [
    'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-(--color-primary) text-(--color-primary-foreground)'
      : 'text-(--color-muted-foreground) hover:bg-(--color-muted) hover:text-(--color-foreground)',
  ].join(' ');

  return (
    <li>
      <div className="flex items-center gap-1">
        <Link href={item.slug} className={linkClass}>
          {item.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
            className="rounded p-1 text-(--color-muted-foreground) transition-colors hover:bg-(--color-muted) hover:text-(--color-foreground)"
          >
            <svg
              aria-hidden="true"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            >
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="mt-1 ml-3 space-y-1 border-l border-(--color-border) pl-3">
          {item.children.map((child) => (
            <NavItem key={child.slug} item={child} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ExtraItem({ item }: { item: SidebarExtraItemLike }) {
  return (
    <li>
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-(--color-muted-foreground) transition-colors hover:bg-(--color-muted) hover:text-(--color-foreground)"
      >
        {item.label}
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 9L9 1M9 1H4M9 1V6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">(opens in new tab)</span>
      </a>
    </li>
  );
}

export function Sidebar({ navManifest, extras }: SidebarProps) {
  const pathname = usePathname();
  const navTree = useMemo(() => buildNavTree(navManifest), [navManifest]);
  const sortedExtras = useMemo(() => [...extras].sort((a, b) => a.order - b.order), [extras]);

  return (
    <aside
      aria-label="Main navigation"
      className="flex h-full w-60 shrink-0 flex-col border-r border-(--color-border) bg-(--color-surface) px-3 py-6"
    >
      <nav aria-label="Page navigation">
        <ul className="space-y-1">
          {navTree.map((item) => (
            <NavItem key={item.slug} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>
      {sortedExtras.length > 0 && (
        <>
          <hr className="my-4 border-(--color-border)" aria-hidden="true" />
          <nav aria-label="External links">
            <ul className="space-y-1">
              {sortedExtras.map((item) => (
                <ExtraItem key={item.href} item={item} />
              ))}
            </ul>
          </nav>
        </>
      )}
    </aside>
  );
}
