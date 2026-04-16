import { useState } from 'react';
import FadeUp from '../components/FadeUp';
import { useStoreConfig, waUrl } from '../hooks/useStoreConfig';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const storeCfg = useStoreConfig();

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = `Hi Apex! My name is ${form.name}. ${form.message} (Phone: ${form.phone})`;
    window.open(waUrl(storeCfg.whatsappNumber, text), '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-white">

      {/* Page header */}
      <section className="bg-white py-[80px] md:py-[100px] px-6 border-b border-apple-border">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <p className="text-[12px] font-semibold tracking-[0.15em] text-apple-gray uppercase mb-4">Get in Touch</p>
            <h1 className="font-sans font-bold text-[40px] md:text-[64px] text-apple-black leading-[1.07] tracking-[-0.02em] mb-4">
              We&apos;re here to help.
            </h1>
            <p className="text-[19px] text-apple-gray max-w-[480px]">
              Questions about a product? Check availability or get expert advice.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="py-[80px] px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Contact details */}
          <FadeUp>
            <div>
              <h2 className="font-sans font-bold text-[32px] text-apple-black tracking-[-0.02em] mb-10">Find us.</h2>
              <div className="space-y-8">

                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                    label: 'Address',
                    content: <span className="text-apple-gray text-[15px] leading-relaxed">{storeCfg.addressLine1}<br />{storeCfg.addressLine2}</span>,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ),
                    label: 'Phone',
                    content: <a href={`tel:${storeCfg.phoneDisplay.replace(/\s/g,'')}`} className="text-apple-black text-[15px] hover:opacity-70 transition-opacity">{storeCfg.phoneDisplay}</a>,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    label: 'Hours',
                    content: <span className="text-apple-gray text-[15px]">{storeCfg.storeHours}</span>,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    ),
                    label: 'WhatsApp',
                    content: (
                      <div>
                        <a href={waUrl(storeCfg.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="text-[#25D366] text-[15px] font-semibold hover:opacity-80 transition-opacity">
                          {storeCfg.phoneDisplay}
                        </a>
                        <p className="text-apple-gray text-[13px] mt-0.5">Fastest way to reach us</p>
                      </div>
                    ),
                  },
                ].map(({ icon, label, content }) => (
                  <div key={label} className="flex items-start gap-5">
                    <div className="w-10 h-10 rounded-full bg-apple-light flex items-center justify-center flex-shrink-0 text-apple-black">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-apple-black mb-1 tracking-wide">{label}</p>
                      {content}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </FadeUp>

          {/* Form */}
          <FadeUp delay={120}>
            <div>
              <h2 className="font-sans font-bold text-[32px] text-apple-black tracking-[-0.02em] mb-10">Send a message.</h2>

              {submitted ? (
                <div className="bg-apple-light rounded-[24px] p-12 text-center">
                  <span className="text-6xl block mb-5">✅</span>
                  <h3 className="font-sans font-bold text-[24px] text-apple-black mb-3">Opening WhatsApp…</h3>
                  <p className="text-[15px] text-apple-gray mb-6">Your message is ready. Complete the chat in WhatsApp.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[14px] text-apple-black underline underline-offset-4 hover:opacity-70 transition-opacity"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    { id: 'name',    label: 'Your Name',     type: 'text', placeholder: 'e.g. Rahul Sharma' },
                    { id: 'phone',   label: 'Phone Number',  type: 'tel',  placeholder: 'e.g. 98765 43210' },
                  ].map(({ id, label, type, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-[14px] font-semibold text-apple-black mb-2">
                        {label} <span className="text-apple-gray font-normal">*</span>
                      </label>
                      <input
                        id={id}
                        name={id}
                        type={type}
                        required
                        value={form[id]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full px-4 py-3.5 rounded-[14px] border border-apple-border bg-white text-apple-black text-[15px] placeholder-apple-gray focus:outline-none focus:border-apple-black transition-colors duration-200"
                      />
                    </div>
                  ))}

                  <div>
                    <label htmlFor="message" className="block text-[14px] font-semibold text-apple-black mb-2">
                      Message <span className="text-apple-gray font-normal">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what you're looking for…"
                      className="w-full px-4 py-3.5 rounded-[14px] border border-apple-border bg-white text-apple-black text-[15px] placeholder-apple-gray focus:outline-none focus:border-apple-black transition-colors duration-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full text-[15px] font-medium text-white bg-apple-black py-4 rounded-[14px] hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200"
                  >
                    Send via WhatsApp
                  </button>
                  <p className="text-center text-[13px] text-apple-gray">
                    Opens WhatsApp with your message pre-filled.
                  </p>
                </form>
              )}
            </div>
          </FadeUp>

        </div>
      </section>

      {/* Google Maps */}
      <section className="border-t border-apple-border">
        {storeCfg.googleMapsEmbed ? (
          <iframe
            src={storeCfg.googleMapsEmbed}
            width="100%"
            height="420"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Apex The Mobile Shoppe — Location"
          />
        ) : (
          <div className="bg-apple-light py-[60px] px-6 text-center">
            <div className="max-w-[560px] mx-auto">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="font-sans font-bold text-[22px] text-apple-black mb-3">Find Us on Google Maps</h3>
              <p className="text-[15px] text-apple-gray mb-6">
                Apex The Mobile Shoppe · {storeCfg.addressLine1}, {storeCfg.addressLine2}
              </p>
              <a
                href={storeCfg.googleMapsLink || 'https://maps.google.com/?q=Apex+The+Mobile+Shoppe+Jail+Road+Indore'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-white bg-apple-black px-6 py-3 rounded-pill hover:scale-[1.02] transition-transform"
              >
                Open in Google Maps →
              </a>
              <p className="text-[12px] text-apple-gray mt-4">
                Add your Google Maps embed in Admin → 🏪 Store → Google Maps
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Directions card */}
      <section className="bg-white py-[60px] px-6 border-t border-apple-border">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-apple-light flex items-center justify-center flex-shrink-0 text-[20px]">📍</div>
                <div>
                  <p className="text-[13px] font-semibold text-apple-black mb-1">Address</p>
                  <p className="text-[14px] text-apple-gray leading-relaxed">
                    Apex — The Mobile Shoppe<br />
                    {storeCfg.addressLine1}<br />
                    {storeCfg.addressLine2}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-apple-light flex items-center justify-center flex-shrink-0 text-[20px]">🕙</div>
                <div>
                  <p className="text-[13px] font-semibold text-apple-black mb-1">Store Hours</p>
                  <p className="text-[14px] text-apple-gray">{storeCfg.storeHours}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-apple-light flex items-center justify-center flex-shrink-0 text-[20px]">🗺️</div>
                <div>
                  <p className="text-[13px] font-semibold text-apple-black mb-1">Directions</p>
                  <a
                    href={storeCfg.googleMapsLink || 'https://maps.google.com/?q=Apex+The+Mobile+Shoppe+Jail+Road+Indore'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-[#0071e3] font-medium hover:underline"
                  >
                    Get Directions on Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
