function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-[#2B3449] bg-[#151923]/95 text-[#A5AEC0] py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B83F7] via-[#55B8E8] to-[#E69AB5] flex items-center justify-center text-[#151923] font-black text-xs shadow-md shadow-[#8B83F7]/25">
            DN
          </div>
          <div>
            <p className="text-sm font-medium text-[#F1F2F8]">
              DevNexus <span className="text-xs text-[#737D92] font-normal">Developer Network</span>
            </p>
            <p className="text-xs text-[#737D92]">
              Copyright © {currentYear} DevNexus. All rights reserved.
            </p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6 text-xs text-[#A5AEC0]">
          <a href="#" className="hover:text-[#8B83F7] transition" aria-label="Twitter">
            Twitter
          </a>
          <a href="#" className="hover:text-[#8B83F7] transition" aria-label="YouTube">
            YouTube
          </a>
          <a href="#" className="hover:text-[#8B83F7] transition" aria-label="Facebook">
            Facebook
          </a>
          <span className="text-[#2B3449]">|</span>
          <span className="text-[#737D92]">Built for developers</span>
        </nav>

      </div>
    </footer>
  );
}

export default Footer;
