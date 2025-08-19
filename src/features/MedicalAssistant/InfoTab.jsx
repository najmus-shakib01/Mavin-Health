const InfoTab = () => {
    return (
        <div className="min-h-[300px]">
            <h3 className="font-medium text-gray-900 mb-4">
                Health Information Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                        Common Symptoms Guide
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Fever and chills - Possible infections</li>
                        <li>• Persistent cough - Respiratory issues</li>
                        <li>• Chest pain - Cardiac or respiratory</li>
                        <li>• Abdominal pain - Digestive system</li>
                    </ul>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-800 mb-2">
                        When to Seek Emergency Care
                    </h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• Difficulty breathing</li>
                        <li>• Chest pain lasting more than 5 minutes</li>
                        <li>• Severe bleeding</li>
                        <li>• Sudden weakness or numbness</li>
                    </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">
                        Disclaimer
                    </h4>
                    <p className="text-sm text-amber-700">
                        This AI assistant provides preliminary information only
                        and is not a substitute for professional medical
                        diagnosis. Always consult a healthcare provider for proper
                        diagnosis and treatment.
                    </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">
                        Data Privacy
                    </h4>
                    <p className="text-sm text-purple-700">
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