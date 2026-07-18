export function Footer() {
  return (
    <footer style={{ background: '#1A1A1A', color: '#999999' }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo + Description */}
          <div className="lg:col-span-1">
            <a href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
              <span style={{ color: 'var(--color-primary)' }}>Adsvance</span>
              <span className="text-white">Media</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed">
              Adsvance Media Tech delivers premium digital marketing, SEO, and web development
              solutions that drive measurable growth for businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="text-sm transition-colors hover:text-white">Home</a></li>
              <li><a href="#about" className="text-sm transition-colors hover:text-white">About</a></li>
              <li><a href="/blog" className="text-sm transition-colors hover:text-white">Blog</a></li>
              <li><a href="#contact" className="text-sm transition-colors hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Services</h3>
            <ul className="space-y-3">
              <li><a href="#services" className="text-sm transition-colors hover:text-white">Web Development</a></li>
              <li><a href="#services" className="text-sm transition-colors hover:text-white">UI/UX Design</a></li>
              <li><a href="#services" className="text-sm transition-colors hover:text-white">SEO Optimization</a></li>
              <li><a href="#services" className="text-sm transition-colors hover:text-white">Digital Marketing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm transition-colors hover:text-white">FAQ</a></li>
              <li><a href="#contact" className="text-sm transition-colors hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-sm transition-colors hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-sm transition-colors hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter + Social */}
        <div className="mt-12 flex flex-col items-start gap-6 border-t pt-8 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: '#333' }}>
          {/* Newsletter */}
          <div className="w-full max-w-md">
            <label htmlFor="newsletter-email" className="mb-2 block text-sm font-medium text-white">
              Subscribe to our newsletter
            </label>
            <div className="flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: '#333' }}
              />
              <button
                type="button"
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)' }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-lg transition-colors hover:text-white">
              <i className="fa-brands fa-facebook-f" />
            </a>
            <a href="#" aria-label="Twitter" className="text-lg transition-colors hover:text-white">
              <i className="fa-brands fa-twitter" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-lg transition-colors hover:text-white">
              <i className="fa-brands fa-linkedin-in" />
            </a>
            <a href="#" aria-label="Instagram" className="text-lg transition-colors hover:text-white">
              <i className="fa-brands fa-instagram" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-xs">
          &copy; {new Date().getFullYear()} Adsvance Media Tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
