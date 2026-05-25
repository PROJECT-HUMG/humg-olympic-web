import { useNavigation } from 'react-router-dom';

export const NavigationProgress = () => {
    const { state } = useNavigation();
    const isLoading = state === 'loading';

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className={`h-full bg-gradient-to-r from-humg-blue via-blue-400 to-humg-blue rounded-r-full shadow-[0_0_10px_rgba(0,56,123,0.5)] ${isLoading ? 'animate-[nprogress_2s_ease-in-out_infinite]' : ''}`}
            />
        </div>
    );
};
