import { createContext, useContext, useEffect, useState } from 'react';

const LocationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

// eslint-disable-next-line react/prop-types
export const LocationProvider = ({ children }) => {
    const [countryCode, setCountryCode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const detectCountry = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const country = await fetchCountryCode();
                setCountryCode(country);

                localStorage.setItem('userCountryCode', country);
            } catch (err) {
                console.error('Country detection failed:', err);
                setError('Failed to detect location');

                const savedCountry = localStorage.getItem('userCountryCode');
                if (savedCountry) {
                    setCountryCode(savedCountry);
                } else {
                    setCountryCode('US');
                }
            } finally {
                setIsLoading(false);
            }
        };

        detectCountry();
    }, []);

    const fetchCountryCode = async () => {
        const services = [
            'https://ipapi.co/country/',
            'https://api.country.is/',
            'https://ipapi.co/json/'
        ];

        for (const service of services) {
            try {
                const response = await fetch(service, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) continue;

                const data = await response.json();

                if (service.includes('ipapi.co/country')) {
                    return data;
                } else if (service.includes('country.is')) {
                    return data.country;
                } else if (service.includes('ipapi.co/json')) {
                    return data.country_code;
                }
            } catch (error) {
                console.warn(`Service ${service} failed:`, error);
                continue;
            }
        }

        throw new Error('All geolocation services failed');
    };

    const value = {
        countryCode, isLoading, error, isUSA: countryCode === 'US', isSaudiArabia: countryCode === 'SA', updateCountryCode: setCountryCode,};
    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};