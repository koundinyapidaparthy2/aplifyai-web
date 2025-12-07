'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaChrome, FaCheckCircle } from 'react-icons/fa';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Prevent hydration mismatch by not rendering animations on server
  if (!mounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-teal-50/50 to-transparent -z-10" />
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#3DCEA5]/10 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-3xl opacity-50 -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="inline-block px-4 py-2 rounded-full bg-[#3DCEA5]/10 text-[#3DCEA5] font-semibold text-sm mb-6 border border-[#3DCEA5]/20">
              New: AI Agent v2.0 Released 🚀
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Job Search on <br />
              <span className="text-gradient-primary">Autopilot</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
              Stop applying manually. AplifyAI's agent scans, tailors, and applies to 100+ jobs for you while you sleep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-[#3DCEA5] text-white font-bold rounded-xl hover:bg-[#34b38f] transition-all transform hover:scale-105 shadow-lg shadow-[#3DCEA5]/25 flex items-center justify-center gap-2"
              >
                <FaChrome className="w-5 h-5" />
                Add to Chrome - It's Free
              </Link>
              <Link
                href="/features"
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 hover:border-gray-300 flex items-center justify-center"
              >
                View Features
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p>Trusted by 10,000+ job seekers</p>
            </div>
          </motion.div>

          {/* Right: Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Abstract Browser Window */}
            <div className="glass rounded-2xl p-4 border border-gray-100 shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-4 flex-1 h-6 bg-gray-50 rounded-md text-[10px] text-gray-400 flex items-center px-2">
                  aplifyai.com/dashboard
                </div>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Total Applied</div>
                    <div className="text-2xl font-bold text-gray-800">124</div>
                  </div>
                  <div className="bg-[#3DCEA5]/10 rounded-lg p-3">
                    <div className="text-[#3DCEA5] text-xs mb-1">Interviews</div>
                    <div className="text-2xl font-bold text-[#3DCEA5]">8</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">Response Rate</div>
                    <div className="text-2xl font-bold text-gray-800">12%</div>
                  </div>
                </div>

                {/* Main Chart Area */}
                <div className="h-32 bg-gray-50 rounded-xl flex items-end justify-between p-4 px-6 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="w-full bg-gray-200 rounded-t-sm" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.5, backgroundColor: i === 5 ? '#3DCEA5' : undefined }}></div>
                  ))}
                </div>

                {/* Recent Activity List */}
                <div className="space-y-2">
                  {[
                    { role: 'Frontend Engineer', co: 'Google', status: 'Applied', time: '2m ago' },
                    { role: 'Product Designer', co: 'Airbnb', status: 'Interview', time: '1h ago' },
                    { role: 'React Developer', co: 'Netflix', status: 'Applied', time: '3h ago' }
                  ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 1 ? 'bg-[#FF5A5F] text-white' : i === 0 ? 'bg-blue-500 text-white' : 'bg-red-600 text-white'}`}>
                          {job.co[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{job.role}</div>
                          <div className="text-xs text-gray-500">{job.co}</div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${job.status === 'Interview' ? 'bg-[#3DCEA5]/20 text-[#3DCEA5] font-bold' : 'bg-gray-100 text-gray-500'}`}>
                        {job.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements for Depth */}
            <div className="absolute -right-10 top-20 glass p-4 rounded-xl animate-bounce duration-[3000ms] shadow-lg hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <FaCheckCircle />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Just now</div>
                  <div className="font-bold text-sm">Resume Tailored!</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Everything needed to <br />get hired faster</h2>
            <p className="text-gray-600">We've automated the tedious parts of job hunting so you can focus on what matters.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Resume Tailor',
                desc: 'Instantly rewrite your resume for every single job application to beat the ATS.',
                icon: '📝',
                gradient: 'from-blue-500/20 to-cyan-500/20',
                text: 'text-blue-600'
              },
              {
                title: 'Smart Auto-Apply',
                desc: 'Our agent applies to jobs on LinkedIn and Indeed while you sleep, 24/7.',
                icon: '⚡',
                gradient: 'from-[#3DCEA5]/20 to-emerald-500/20',
                text: 'text-[#3DCEA5]'
              },
              {
                title: 'Application Tracker',
                desc: 'Keep track of every application, interview, and offer in one beautiful dashboard.',
                icon: '📊',
                gradient: 'from-purple-500/20 to-pink-500/20',
                text: 'text-purple-600'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-2xl hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{feature.desc}</p>
                <Link href="/features" className={`text-sm font-bold flex items-center gap-1 ${feature.text} hover:opacity-80 transition-opacity`}>
                  Learn more <span aria-hidden="true">&rarr;</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Testimonials Grid */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#3DCEA5]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Loved by 10,000+ Users</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { text: "I got more interviews in one week with AplifyAI than in 3 months of manual applying.", author: "Alex Chen", role: "Software Engineer", company: "Google" },
              { text: "The resume tailor is magic. It knew exactly what keywords the recruiters were looking for.", author: "Sarah Jones", role: "Product Manager", company: "Stripe" },
              { text: "Finally, a tool that actually saves time. The auto-apply feature is a lifesaver.", author: "Mike Ross", role: "Designer", company: "Airbnb" },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-700 mb-6 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{t.author}</div>
                    <div className="text-xs text-gray-500">{t.role} @ {t.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="glass-card p-12 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DCEA5]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Start your journey today.</h2>
            <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto relative z-10">Join thousands of job seekers who found their dream role with AplifyAI.</p>

            <Link href="/signup" className="inline-block px-8 py-4 bg-[#3DCEA5] text-white font-bold rounded-xl hover:bg-[#34b38f] transition-all shadow-lg hover:scale-105 relative z-10">
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
