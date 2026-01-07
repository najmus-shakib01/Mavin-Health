import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database, Server, Globe } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-300" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your Privacy Matters to Us
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-green-100 dark:border-green-900">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Our Privacy Commitment
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We believe your health information should remain private and secure
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transparency</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Clear about what data we collect and why
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Minimal Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Collect only what&apos;s necessary for the service
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-3 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Server className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Security First</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enterprise-grade encryption and protection
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Medical Assistant (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered medical information service.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We designed our service with privacy as a core principle, especially important for health-related conversations.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Information You Provide:</h4>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Symptom descriptions:</strong> The health information you share with our AI</li>
                <li><strong>Demographic information:</strong> Age, gender, and duration of symptoms (optional)</li>
                <li><strong>Voice input:</strong> When using voice-to-text features</li>
                <li><strong>Language preference:</strong> Your selected interface language</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Automatically Collected Information:</h4>
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Usage data:</strong> How you interact with our service</li>
                <li><strong>Technical information:</strong> Browser type, device information, IP address</li>
                <li><strong>Location data:</strong> Country-level information for language detection</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                🔒 <strong>Important:</strong> We do not require you to create an account or provide personal identifying information to use our basic service.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Provide and improve our AI medical information service</li>
              <li>Generate relevant health information based on your symptoms</li>
              <li>Detect your location for appropriate language settings</li>
              <li>Ensure the security and integrity of our service</li>
              <li>Comply with legal obligations</li>
            </ul>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-300 text-sm">
                🤖 <strong>AI Training:</strong> We do not use individual conversations to train our AI models. Our training data comes from publicly available medical sources and synthetic data.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              4. Data Protection and Security
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement robust security measures to protect your information:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Encryption</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All data transmissions are encrypted using TLS 1.2+ protocols
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Data Minimization</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We only collect essential information needed for service delivery
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Session-Based Storage</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Conversations are processed in real-time with minimal persistence
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Regular Audits</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Security practices are regularly reviewed and updated
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Data Retention</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="p-3 text-left">Data Type</th>
                    <th className="p-3 text-left">Retention Period</th>
                    <th className="p-3 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3">Chat Conversations</td>
                    <td className="p-3">Session only</td>
                    <td className="p-3">Real-time processing</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3">Usage Analytics</td>
                    <td className="p-3">90 days</td>
                    <td className="p-3">Service improvement</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3">Error Logs</td>
                    <td className="p-3">30 days</td>
                    <td className="p-3">Debugging and maintenance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. Your Privacy Rights</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Right to Access</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Request information about what data we have about you
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Right to Deletion</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Request deletion of your data from our systems
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300">
              To exercise your rights, please contact us at privacy@medicalassistant.ai
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              7. Third-Party Services
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We may use the following third-party services:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>AI Processing:</strong> OpenRouter API for AI responses</li>
              <li><strong>Analytics:</strong> Anonymous usage statistics</li>
              <li><strong>Hosting:</strong> Secure cloud infrastructure providers</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              All third-party providers are contractually obligated to maintain confidentiality and implement appropriate security measures.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">8. Children&apos;s Privacy</h3>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300">
                👶 <strong>Our service is not intended for children under 18.</strong> We do not knowingly collect information from children. If you believe a child has provided us with information, please contact us immediately.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">9. International Users</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Our service is designed to be accessible worldwide. By using our service from outside your country of residence, you acknowledge that your information may be transferred to and processed in countries with different data protection laws.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">10. Changes to This Policy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy periodically. We will notify users of significant changes by updating the &quot;Last Updated&quot; date and, where appropriate, through service notifications.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">11. Contact Us</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              If you have questions about this Privacy Policy or our privacy practices:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> privacy@medicalassistant.ai
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>For legal inquiries:</strong> legal@medicalassistant.ai
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/terms-of-service" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Terms of Service
            </Link>
            <Link 
              to="/" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Medical Assistant
            </Link>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p>Thank you for trusting us with your health information.</p>
            <p>We are committed to maintaining your privacy and providing a secure service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;