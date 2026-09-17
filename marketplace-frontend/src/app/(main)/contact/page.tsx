'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: call an API endpoint to send the email
    setSubmitted(true);
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
        <p className="text-lg text-gray-500">Have a question or feedback? We'd love to hear from you.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-6">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              label: 'Email',
              value: 'support@collectibles.market',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              label: 'Response time',
              value: 'Within 24 hours on business days',
            },
          ].map((item) => (
            <div key={item.label} className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm text-gray-700 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Common topics</p>
            <ul className="space-y-1.5 text-sm text-gray-500">
              {[
                'Account or login issues',
                'Reporting a listing or user',
                'Feature requests',
                'Partnership enquiries',
                'General feedback',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Message sent!</h3>
            <p className="text-sm text-gray-500">We'll get back to you within 24 hours.</p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              className="mt-5 text-sm text-primary-600 hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Your name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@email.com"
              required
            />
            <Input
              label="Subject"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              placeholder="What's this about?"
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                rows={5}
                required
                placeholder="Tell us more..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <Button type="submit" className="w-full">Send message</Button>
          </form>
        )}
      </div>
    </div>
  );
}
