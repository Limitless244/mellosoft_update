"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
export default function Navbar() {
  const [bag, setBag] = useState<string[]>([]);
  const dialogRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState("");
  useEffect(() => {
    const update = () => {
      try {
        setBag(JSON.parse(localStorage.getItem("mellosoft-bag") ?? "[]"));
      } catch {
        setBag([]);
      }
    };
    update();
    window.addEventListener("bag-change", update);
    return () => window.removeEventListener("bag-change", update);
  }, []);
  useEffect(() => {
    if (!panel) return;
    const previous = document.activeElement as HTMLElement;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel("");
      if (e.key === "Tab") {
        const els =
          dialogRef.current?.querySelectorAll<HTMLElement>("button,input,a");
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [panel]);
  return (
    <>
      <header className="navbar">
        <a href="#home" className="logo">
          <Image
            src="/images/logo.png"
            width={160}
            height={160}
            className="h-[72px] w-[72px] scale-150 shrink-0 object-contain md:h-24 md:w-24 md:scale-[1.75]"
            alt="Mellosoft"
          />
        </a>
        <nav
          aria-label="Main navigation"
          className={open ? "navlinks open" : "navlinks"}
        >
          {["Home", "About", "Products", "Collections", "Contact"].map((x) => (
            <a
              key={x}
              href={
                "#" +
                {
                  Home: "home",
                  About: "about",
                  Products: "products",
                  Collections: "collections",
                  Contact: "contact",
                }[x]
              }
              onClick={() => setOpen(false)}
            >
              {x}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            aria-label="Search products"
            onClick={() => setPanel("search")}
          >
            <Search size={19} />
          </button>
          <button
            aria-label="View shopping bag"
            onClick={() => setPanel("bag")}
          >
            <ShoppingBag size={19} />
            <span className="bag-dot" />
          </button>
          <button
            aria-label="Account information"
            onClick={() => setPanel("account")}
          >
            <UserRound size={19} />
          </button>
          <button
            className="mobile-menu"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {panel && (
        <div className="dialog-backdrop" onClick={() => setPanel("")}>
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={panel}
            className="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="circle close"
              aria-label="Close dialog"
              onClick={() => setPanel("")}
            >
              <X />
            </button>
            <h3>
              {panel === "search"
                ? "Find your softer place"
                : panel === "bag"
                  ? "Your shopping bag"
                  : "Welcome to Mellosoft"}
            </h3>
            {panel === "search" ? (
              <form action="#products" onSubmit={() => setPanel("")}>
                <label htmlFor="search">Explore our bed collection</label>
                <input
                  id="search"
                  type="search"
                  placeholder="Try upholstered or oak"
                />
                <button className="pill">
                  Explore beds <ArrowUpRight size={18} />
                </button>
              </form>
            ) : (
              <p>
                {panel === "bag"
                  ? bag.length
                    ? "Your selected beds: " +
                    bag.join(", ") +
                    ". Contact us to discuss your selection."
                    : "Your bag is empty. Explore the collection below to add a bed."
                  : "For personal styling advice, write to hello@mellosoft.com."}
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
