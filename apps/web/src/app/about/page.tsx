import Image from 'next/image';

export default function AboutPage() {
    const team = [
        {
            name: 'Sarah Johnson',
            role: 'CEO & Co-Founder',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            bio: 'Former HR executive with a passion for helping people find their dream careers.'
        },
        {
            name: 'Michael Chen',
            role: 'CTO & Co-Founder',
            image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            bio: 'AI researcher and engineer dedicated to building intelligent tools for job seekers.'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Head of Product',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            bio: 'Product leader focused on creating intuitive and impactful user experiences.'
        }
    ];

    return (
        <div className="bg-white">
            {/* Hero section */}
            <div className="relative bg-indigo-800">
                <div className="absolute inset-0">
                    <img
                        className="w-full h-full object-cover"
                        src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&&sat=-100"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" aria-hidden="true" />
                </div>
                <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">About Us</h1>
                    <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
                        We're on a mission to democratize career success. We believe everyone deserves a job they love, and we're building the tools to help them get there.
                    </p>
                </div>
            </div>

            {/* Mission section */}
            <div className="py-16 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Our Mission</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Empowering job seekers with AI
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            The job search process is broken. It's time-consuming, opaque, and stressful. We're using artificial intelligence to change that. By automating the tedious parts of the job search, we help candidates focus on what matters most: showcasing their unique value.
                        </p>
                    </div>
                </div>
            </div>

            {/* Values section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">What drives us</h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            We are a team of innovators and learners. We believe in continuous growth and the power of technology to transform lives.
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="pt-6">
                            <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                                <div className="-mt-6">
                                    <div>
                                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Innovation</h3>
                                    <p className="mt-5 text-base text-gray-500">
                                        We are constantly exploring new technologies and AI models to build the best possible tools for our users.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                                <div className="-mt-6">
                                    <div>
                                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Continuous Learning</h3>
                                    <p className="mt-5 text-base text-gray-500">
                                        We believe that learning never stops. We encourage curiosity and provide opportunities for growth.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                                <div className="-mt-6">
                                    <div>
                                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </span>
                                    </div>
                                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">User Focus</h3>
                                    <p className="mt-5 text-base text-gray-500">
                                        Our users are at the heart of everything we do. We listen to their feedback and build solutions that solve their real problems.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
