import Link from 'next/link';
import { FaCheck } from 'react-icons/fa';
import { FiInfo, FiEye } from 'react-icons/fi';

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: '/month',
            description: 'Public Preview. Full access to our core Agentic tools.',
            features: [
                { name: 'Unlimited Agentic Resume Generation', info: 'AI Agents analyze your profile and target job to generate tailored resumes.' },
                { name: 'Agentic Cover Letter Generation', info: 'Smart agents craft personalized cover letters matching your voice.' },
                { name: 'Agentic Job Tracking', info: 'Automated status updates and application organization.' },
                { name: 'Latex & PDF Downloads', info: 'Professional ATS-friendly formats.' },
                { name: 'Browser Extension Access', info: 'Seamless integration with job boards.' },
                { name: 'Public Preview limits apply', info: 'Fair usage policy during beta.' }
            ],
            cta: 'Get Started',
            href: '/signup',
            popular: true,
            active: true,
            style: 'border-[#3DCEA5] ring-1 ring-[#3DCEA5] shadow-xl'
        },
        {
            name: 'Pro',
            price: 'Coming Soon',
            description: 'Futuristic power for serious job seekers.',
            features: [
                { name: 'Everything in Free', info: 'All the benefits of the Free plan.' },
                { name: 'Premium Agentic Templates', info: 'Exclusive, high-performance resume designs.' },
                { name: 'LinkedIn Agentic Optimization', info: 'AI agents rewrite your profile for maximum visibility.' },
                { name: 'Interview Prep Agent', info: 'Real-time roleplay and feedback from AI interviewers.' },
                { name: 'Higher Agentic Rate Limits', info: 'Faster processing and more daily actions.' },
                { name: 'Notify me when available', info: 'Get an email when Pro launches.' }
            ],
            cta: 'Notify me when available',
            href: '#',
            popular: false,
            active: false,
            style: 'border-purple-200 bg-gradient-to-b from-purple-50/50 to-white'
        },
        {
            name: 'Pro+',
            price: 'Coming Soon',
            description: 'The ultimate futuristic career acceleration.',
            features: [
                { name: 'Everything in Pro', info: 'All features from Free and Pro.' },
                { name: 'Human-in-the-Loop Review', info: 'Expert human review of your AI-generated assets.' },
                { name: '1-on-1 Career Coaching Agent', info: 'Personalized strategy from advanced AI coaches.' },
                { name: 'Agentic Application Concierge', info: 'Agents that apply to jobs on your behalf.' },
                { name: 'Notify me when available', info: 'Get early access to Pro+.' }
            ],
            cta: 'Notify me when available',
            href: '#',
            popular: false,
            active: false,
            style: 'border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white'
        }
    ];

    return (
        <div className="bg-gray-50/50 min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-base font-semibold text-[#3DCEA5] tracking-wide uppercase">Pricing Plans</h2>
                    <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
                        Agentic Career Tools
                    </p>
                    <p className="mt-4 text-xl text-gray-500">
                        Join the Public Preview today and experience the future of job searching.
                    </p>
                </div>

                <div className="mt-20 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative p-8 bg-white border rounded-3xl flex flex-col transition-all duration-300 hover:shadow-2xl ${plan.style}`}
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">{plan.name}</h3>
                                <p className="mt-6 flex items-baseline text-gray-900">
                                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                    {plan.period && <span className="ml-1 text-xl font-semibold text-gray-500">{plan.period}</span>}
                                </p>
                                <p className="mt-4 text-gray-500">{plan.description}</p>

                                <ul role="list" className="mt-8 space-y-4">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <FaCheck className={`w-5 h-5 ${plan.active ? 'text-[#3DCEA5]' : 'text-purple-400'}`} aria-hidden="true" />
                                            </div>
                                            <div className="ml-3 flex-1 flex items-center justify-between group/item relative">
                                                <span className="text-gray-600 text-sm font-medium">{feature.name}</span>
                                                <div className="ml-2 relative cursor-help group/info">
                                                    <FiEye className="w-4 h-4 text-gray-300 group-hover/item:text-gray-500 transition-colors" />
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-10 pointer-events-none text-center shadow-xl">
                                                        {feature.info}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {plan.active ? (
                                <Link
                                    href={plan.href}
                                    className="mt-8 block w-full py-4 px-6 bg-[#3DCEA5] border border-transparent rounded-xl text-center font-bold text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200 hover:bg-[#34b38f]"
                                >
                                    {plan.cta}
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="mt-8 block w-full py-4 px-6 border border-gray-200 rounded-xl text-center font-bold bg-gray-50 text-gray-400 cursor-not-allowed uppercase text-sm tracking-wider"
                                >
                                    {plan.cta}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
