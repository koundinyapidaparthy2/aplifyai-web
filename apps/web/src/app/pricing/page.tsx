import Link from 'next/link';
import { FaCheck } from 'react-icons/fa';

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            description: 'Perfect for getting started',
            features: [
                '1 Resume Generation',
                'Basic Templates',
                'PDF Download',
                'Job Tracking (Limited)'
            ],
            cta: 'Get Started',
            href: '/signup',
            popular: false
        },
        {
            name: 'Pro',
            price: '$19',
            period: '/month',
            description: 'For serious job seekers',
            features: [
                'Unlimited Resumes',
                'Unlimited Cover Letters',
                'Premium Templates',
                'AI Resume Tailoring',
                'Advanced Job Tracking',
                'Priority Support'
            ],
            cta: 'Start Free Trial',
            href: '/signup?plan=pro',
            popular: false
        },
        {
            name: 'Pay As You Go',
            price: '$5',
            period: '/resume',
            description: 'No subscription needed',
            features: [
                '1 Premium Resume',
                'AI Tailoring for 1 Job',
                'Cover Letter Included',
                'Lifetime Access to File'
            ],
            cta: 'Buy Now',
            href: '/signup?plan=payg',
            popular: true
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Choose the plan that fits your job search needs. No hidden fees.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${plan.popular ? 'ring-2 ring-indigo-600' : 'border-gray-200'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 -mt-4 mr-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-600 text-white shadow-sm">
                                        Most Popular
                                    </span>
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                                <p className="mt-4 flex items-baseline text-gray-900">
                                    <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                                    {plan.period && <span className="ml-1 text-xl font-semibold text-gray-500">{plan.period}</span>}
                                </p>
                                <p className="mt-6 text-gray-500">{plan.description}</p>

                                <ul role="list" className="mt-6 space-y-6">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex">
                                            <FaCheck className="flex-shrink-0 w-5 h-5 text-indigo-500" aria-hidden="true" />
                                            <span className="ml-3 text-gray-500">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                href={plan.href}
                                className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${plan.popular
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
