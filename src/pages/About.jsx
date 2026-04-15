import FadeUp from '../components/FadeUp';

export default function About() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-white py-[80px] md:py-[120px] px-6 text-center">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-5">Our Story</p>
            <h1 className="font-sans font-bold text-[40px] md:text-[72px] text-apple-black leading-[1.05] tracking-[-0.02em] mb-6">
              Three decades.<br />One promise.
            </h1>
            <p className="text-[19px] md:text-[21px] text-apple-gray max-w-[560px] mx-auto leading-relaxed">
              Honest advice, genuine products, and the best prices in Indore — since 1996.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Story */}
      <section className="bg-apple-light py-[80px] md:py-[120px] px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div>
              <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-5">Since 1996</p>
              <h2 className="font-sans font-bold text-[36px] md:text-[48px] text-apple-black leading-[1.1] tracking-[-0.02em] mb-7">
                Indore&apos;s home for<br />premium electronics.
              </h2>
              <div className="space-y-4 text-[17px] text-apple-gray leading-relaxed">
                <p>
                  Apex — The Mobile Shoppe was founded in 1996 on Jail Road, Indore, with a simple mission: give every customer honest advice and the best product for their needs — not just the most expensive one.
                </p>
                <p>
                  What started as a small mobile accessories shop has grown into Indore&apos;s most trusted destination for premium electronics — from the latest iPhones and MacBooks to Galaxy tablets and everything in between.
                </p>
                <p>
                  Over 30 years, more than a lakh customers have trusted us for their most important tech purchases. Many are now on their second and third generation of shopping with us.
                </p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={120}>
            <div
              className="bg-white rounded-[32px] p-12"
              style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}
            >
              <p className="font-display font-bold text-[80px] text-apple-black leading-none tracking-tight mb-2">30+</p>
              <p className="text-[22px] font-semibold text-apple-black mb-8">Years Serving Indore</p>
              <div className="border-t border-apple-border pt-8 space-y-4 text-[15px] text-apple-gray">
                <p>📍 Jail Road, Indore — Since 1996</p>
                <p>👥 1 Lakh+ satisfied customers</p>
                <p>📱 All major brands under one roof</p>
                <p>✅ 100% genuine products guaranteed</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-[80px] md:py-[120px] px-6">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-5">Principles</p>
              <h2 className="font-sans font-bold text-[36px] md:text-[48px] text-apple-black leading-[1.1] tracking-[-0.02em]">
                What we stand for.
              </h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤝', title: 'Honest Advice',   desc: 'We recommend what you actually need, not the highest-margin product.' },
              { icon: '✅', title: 'Genuine Products', desc: 'Every item we sell is 100% original from authorised channels.' },
              { icon: '💬', title: 'Expert Team',      desc: 'Years of hands-on experience with every product we carry.' },
              { icon: '💰', title: 'Fair Pricing',     desc: 'Competitive prices. No hidden charges. What you see is what you pay.' },
            ].map((v, i) => (
              <FadeUp key={v.title} delay={i * 80}>
                <div
                  className="bg-apple-light rounded-[24px] p-8 text-center hover:-translate-y-1 transition-transform duration-300"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                >
                  <span className="text-4xl block mb-5">{v.icon}</span>
                  <h3 className="text-[18px] font-semibold text-apple-black mb-2">{v.title}</h3>
                  <p className="text-[15px] text-apple-gray leading-relaxed">{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-apple-light py-[80px] md:py-[120px] px-6 text-center border-t border-apple-border">
        <div className="max-w-[600px] mx-auto">
          <FadeUp>
            <h2 className="font-sans font-bold text-[36px] md:text-[48px] text-apple-black leading-[1.1] tracking-[-0.02em] mb-5">
              Come meet the team.
            </h2>
            <p className="text-[17px] text-apple-gray mb-10">
              Drop in at Jail Road or WhatsApp us anytime. No appointment needed.
            </p>
            <a
              href="https://wa.me/918349570000?text=Hi%20Apex!%20I%20would%20like%20to%20visit%20your%20store."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[17px] font-medium text-white bg-apple-black px-8 py-3.5 rounded-pill hover:scale-[1.02] transition-transform"
            >
              WhatsApp Us
            </a>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
