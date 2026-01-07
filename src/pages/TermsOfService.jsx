import { Link } from "react-router-dom";
import { Shield, FileText, AlertTriangle, Lock } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-300" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            By using our Medical Assistant, you agree to these terms
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100 dark:border-blue-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Quick Summary
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-600 dark:text-green-400 text-lg">✓ What Our Medical Assistant IS</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>AI-powered symptom analysis and health information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Free to use - no subscription required</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Private and confidential conversations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>Available in English and Arabic</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-red-600 dark:text-red-400 text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                What Our Medical Assistant Is NOT
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span><strong>NOT</strong> a replacement for professional medical diagnosis</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span><strong>NOT</strong> for emergencies - call 911 or your local emergency number</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span><strong>NOT</strong> a licensed healthcare provider</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <span><strong>NOT</strong> for mental health crises or suicidal thoughts</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              ⚠️ <strong>Important:</strong> This is a summary only. By using our service, you agree to ALL the Terms below.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Welcome to Medical Assistant. By accessing and using our Services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              These terms govern your use of our AI-powered medical information service available through our website and any related applications.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Service Description</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Medical Assistant is an AI-powered tool designed to provide general health information and symptom analysis based on user input. Our Service:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-3">
              <li>Provides AI-generated health information and symptom analysis</li>
              <li>Offers general wellness guidance and educational content</li>
              <li>Supports multiple languages (English and Arabic)</li>
              <li>Includes voice input capabilities for accessibility</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                🩺 <strong>Medical Disclaimer:</strong> Our AI is not a licensed healthcare provider. The information provided is for educational purposes only and should not be considered medical advice.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. User Eligibility</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              To use our Services, you must:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Reside in a country where our Services are available</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Not use our Services for emergency medical situations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. No Medical Advice</h3>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 mb-4">
              <p className="text-red-800 dark:text-red-300 font-semibold mb-2">
                🚨 CRITICAL WARNING:
              </p>
              <ul className="list-disc pl-5 text-red-700 dark:text-red-300 space-y-2">
                <li>Our AI is NOT a licensed medical professional</li>
                <li>Information provided is for EDUCATIONAL PURPOSES ONLY</li>
                <li>Always consult with qualified healthcare providers for medical advice</li>
                <li>In emergencies, call 911 or your local emergency number immediately</li>
              </ul>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              You understand and agree that any information provided by our AI should not be relied upon as a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              5. Privacy and Data Protection
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We are committed to protecting your privacy. Our privacy practices include:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>We do not store personally identifiable health information</li>
              <li>Conversations are processed securely in real-time</li>
              <li>No training on individual user conversations</li>
              <li>Compliance with applicable privacy regulations</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              For detailed information about how we handle your data, please review our{" "}
              <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. User Responsibilities</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You agree to:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide accurate and complete information about symptoms</li>
              <li>Use the Service only for personal, non-commercial purposes</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not attempt to reverse engineer or compromise the Service</li>
              <li>Respect the intellectual property rights of the Service</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              To the maximum extent permitted by law, Medical Assistant and its affiliates shall not be liable for:
            </p>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Damages resulting from reliance on AI-generated information</li>
              <li>Service interruptions or technical issues</li>
              <li>User decisions based on information from our Service</li>
            </ul>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">8. Intellectual Property</h3>
            <p className="text-gray-700 dark:text-gray-300">
              All content, features, and functionality of the Service are owned by Medical Assistant and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">9. Modifications to Terms</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes through the Service or via email. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">10. Governing Law</h3>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">11. Contact Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              For questions about these Terms or the Service, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> legal@medicalassistant.ai
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Medical Assistant
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
            By using Medical Assistant, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;