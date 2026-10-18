import { ArrowUpRight } from "lucide-react";
export default function Footer() {
  return (
    <footer>
      <div className="section footer-grid">
        <div className="footer-brand">
          <a className="logo" href="#home">
            mellosoft<span>&reg;</span>
          </a>
          <p>
            Thoughtfully designed.
            <br />
            Beautifully crafted.
            <br />
            Made for your everyday.
          </p>
          <span>A softer way to live.</span>
        </div>
        {[
          {
            title: "Explore",
            links: [
              ["Our story", "#about"],
              ["Our beds", "#products"],
              ["Collections", "#collections"],
              ["Find your style", "#collections"],
            ],
          },
          {
            title: "Support / Info",
            links: [
              [
                "Product advice",
                "mailto:hello@mellosoft.com?subject=Product%20advice",
              ],
              [
                "Delivery enquiries",
                "mailto:hello@mellosoft.com?subject=Delivery",
              ],
              ["Care guide", "mailto:hello@mellosoft.com?subject=Care%20guide"],
              ["Get in touch", "#contact"],
            ],
          },
          {
            title: "Social Media",
            links: [
              ["Instagram", "https://www.instagram.com/"],
              ["Pinterest", "https://www.pinterest.com/"],
              ["Facebook", "https://www.facebook.com/"],
            ],
          },
          {
            title: "Let us talk",
            links: [
              ["hello@mellosoft.com", "mailto:hello@mellosoft.com"],
              ["Say hello", "mailto:hello@mellosoft.com"],
            ],
          },
        ].map((c) => (
          <div className="footer-column" key={c.title}>
            <h3>{c.title}</h3>
            {c.links.map(([text, url]) => (
              <a key={text} href={url}>
                {text}
                {url.startsWith("https") && <ArrowUpRight size={13} />}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="section footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} Mellosoft. All rights reserved.
        </span>
        <span>Made for slow mornings & sweeter dreams.</span>
        <a href="#home">Back to top &uarr;</a>
      </div>
    </footer>
  );
}
