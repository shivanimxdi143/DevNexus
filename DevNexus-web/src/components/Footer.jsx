
function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">

      <aside className="grid-flow-col items-center">
        <span className="text-2xl font-bold">DN</span>
        <p>
          Copyright © {new Date().getFullYear()} DevNexus.
          All rights reserved.
        </p>
      </aside>

      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        {/* Twitter */}
        <a href="#" aria-label="Twitter">
          Twitter
        </a>

        {/* YouTube */}
        <a href="#" aria-label="YouTube">
          YouTube
        </a>

        {/* Facebook */}
        <a href="#" aria-label="Facebook">
          Facebook
        </a>
      </nav>

    </footer>
  );
}

export default Footer;
