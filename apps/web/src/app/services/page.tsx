import Link from 'next/link';
import { FaFileAlt, FaPenFancy, FaChartLine, FaSearch, FaBriefcase, FaRobot } from 'react-icons/fa';

export default function ServicesPage() {
    const services = [
        {
            title: 'AI Resume Builder',
            description: 'Create professional, ATS-friendly resumes in minutes using our advanced AI technology. Tailor your resume for specific job descriptions automatically.',
            icon: FaFileAlt,
            color: 'bg-blue-500',
            link: '/resumes'
        },
        {
            title: 'Cover Letter Generator',
            description: 'Generate compelling cover letters that match your resume\'s style and tone. Our AI analyzes the job description to highlight your most relevant skills.',
            icon: FaPenFancy,
            color: 'bg-green-500',
            link: '/cover-letters'
        },
        {
            title: 'Job Application Tracking',
            description: 'Keep track of all your job applications in one place. Monitor status, interview dates, and follow-up reminders with our intuitive dashboard.',
            icon: FaChartLine,
            color: 'bg-purple-500',
            link: '/dashboard'
        },
        {
            title: 'Smart Job Search',
            description: 'Find the best opportunities across multiple platforms. Our AI recommends jobs that match your profile and career goals.',
            icon: FaSearch,
            color: 'bg-yellow-500',
            link: '/jobs'
        },
        {
            title: 'Interview Preparation',
            description: 'Get ready for your interviews with AI-generated questions and answers based on the job description and your experience.',
            icon: FaBriefcase,
            color: 'bg-red-500',
            link: '/services/interview-prep'
        },
        {
            title: 'Career Coaching AI',
            description: 'Receive personalized career advice and insights. Identify skill gaps and get recommendations on how to improve your marketability.',
            icon: FaRobot,
            color: 'bg-indigo-500',
            link: '/services/coaching'
        }
    ];

    return (
        <div className="bg-white min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Our Services</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Everything you need to land your dream job
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        AplifyAI provides a comprehensive suite of tools powered by artificial intelligence to supercharge your job search.
                    </p>
                </div>

                <div className="mt-20">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <div key={service.title} className="pt-6">
                                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className={`inline-flex items-center justify-center p-3 rounded-md shadow-lg ${service.color}`}>
                                                <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{service.title}</h3>
                                        <p className="mt-5 text-base text-gray-500">
                                            {service.description}
                                        </p>
                                        <div className="mt-6">
                                            <Link href={service.link} className="text-base font-medium text-indigo-600 hover:text-indigo-500">
                                                Learn more <span aria-hidden="true">&rarr;</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 bg-indigo-700 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                Ready to get started?
                            </h2>
                            <p className="mt-3 max-w-3xl text-lg text-indigo-200">
                                Join thousands of job seekers who have successfully landed jobs using AplifyAI.
                            </p>
                        </div>
                        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                            <div className="inline-flex rounded-md shadow">
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                                >
                                    Get started for free
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
