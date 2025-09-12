const InfoTab = () => {
    return (
        <div className="min-h-[300px] dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 mb-4 pl-5 dark:text-white">Health Information Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">

                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                    <h4 className="font-medium text-blue-800 mb-2 dark:text-blue-300">Common Symptoms Guide</h4>
                    <ul className="text-sm text-blue-700 space-y-1 dark:text-blue-200">
                        <li>• Fever and chills - Possible infections</li>
                        <li>• Persistent cough - Respiratory issues</li>
                        <li>• Chest pain - Cardiac or respiratory</li>
                        <li>• Abdominal pain - Digestive system</li>
                    </ul>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700">
                    <h4 className="font-medium text-emerald-800 mb-2 dark:text-emerald-300">When to Seek Emergency Care</h4>
                    <ul className="text-sm text-emerald-700 space-y-1 dark:text-emerald-200">
                        <li>• Difficulty breathing</li>
                        <li>• Chest pain lasting more than 5 minutes</li>
                        <li>• Severe bleeding</li>
                        <li>• Sudden weakness or numbness</li>
                    </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
                    <h4 className="font-medium text-amber-800 mb-2 dark:text-amber-300">Disclaimer</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                        This AI assistant provides preliminary information only
                        and is not a substitute for professional medical
                        diagnosis. Always consult a healthcare provider for proper
                        diagnosis and treatment.
                    </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 dark:bg-purple-900/20 dark:border-purple-700">
                    <h4 className="font-medium text-purple-800 mb-2 dark:text-purple-300">Data Privacy</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-200">
                        Your medical inquiries are processed securely. We do not
                        store personally identifiable information. All data is
                        encrypted and handled according to medical privacy
                        standards.
                    </p>
                </div>
                
            </div>
        </div>
    );
};

export default InfoTab;