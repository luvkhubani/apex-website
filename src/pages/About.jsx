export default function About() {
  return (
    <main className="min-h-screen bg-white">

      {/* Page header */}
      <section className="bg-gray-50 border-b border-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Our Story</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-black mb-4">About Apex</h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Three decades of trust, expertise, and genuine care for every customer who walks through our doors.
          </p>
        </div>
      </section>

      {/* Story section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Since 1996</p>
              <h2 className="font-display font-bold text-4xl text-black mb-6 leading-tight">
                Indore&apos;s Home for<br />Premium Electronics
              </h2>
              <div className="space-y-4 text-gray-500 text-base leading-relaxed">
                <p>
                  Apex — The Mobile Shoppe was founded in 1996 on Jail Road, Indore, with a simple mission: give every customer honest advice and the best product for their needs — not just the most expensive one.
                </p>
                <p>
                  What started as a small mobile accessories shop has grown into Indore&apos;s most trusted destination for premium electronics — from the latest iPhones and MacBooks to Galaxy tablets and everything in between.
                </p>
                <p>
                  Over 30 years, more than a lakh customers have trusted us for their most important tech purchases. Many of them are now on their second and third generation of shopping with us.
                </p>
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="bg-black rounded-3xl p-10 text-white">
                <p className="font-display font-bold text-7xl text-gold mb-2">30+</p>
                <p className="text-xl font-semibold mb-6">Years Serving Indore</p>
                <div className="border-t border-gray-700 pt-6 space-y-3 text-gray-300 text-sm">
                  <p>📍 Jail Road, Indore — Since 1996</p>
                  <p>👥 1 Lakh+ satisfied customers</p>
                  <p>📱 All major brands under one roof</p>
                  <p>✅ 100% genuine products guaranteed</p>
                </div>
              </div>
              {/* Gold accent corner */}
              <div className="absolute -top-3 -right-3 w-24 h-24 rounded-2xl border-4 border-gold opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">What We Stand For</p>
            <h2 className="font-display font-bold text-4xl text-black">Our Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤝', title: 'Honest Advice', desc: 'We recommend what you actually need, not the highest-margin product.' },
              { icon: '✅', title: 'Genuine Products', desc: 'Every item we sell is 100% original, sourced from authorised channels.' },
              { icon: '💬', title: 'Expert Team', desc: 'Our staff have years of hands-on experience with every product we carry.' },
              { icon: '💰', title: 'Fair Pricing', desc: 'Competitive prices and no hidden charges — what you see is what you pay.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <span className="text-4xl block mb-4">{icon}</span>
                <h3 className="font-display font-semibold text-lg text-black mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-20 bg-black text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-4xl mb-4">Come Meet the Team</h2>
          <p className="text-gray-400 mb-8">We&apos;d love to show you around. Drop in or WhatsApp us anytime.</p>
          <a
            href="https://wa.me/919826000000?text=Hi+Apex!+I+would+like+to+visit+your+store."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-white font-semibold rounded-full hover:bg-gold-dark transition-colors duration-200"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>
      </section>

    </main>
  );
}
