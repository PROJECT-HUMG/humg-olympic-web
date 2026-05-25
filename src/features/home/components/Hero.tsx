import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlayCircle, Loader2, X, Sparkles, Star, Hexagon } from 'lucide-react';
import i18n from '@/i18n';

import { useCinematicSlider } from '../hooks/useCinematicSlider';
import { useHero } from '../hooks/useHero';
import { SmartCinematicImage } from './SmartCinematicImage';
import { TypewriterEffect } from './TypewriterEffect';

const currentYear = new Date().getFullYear();

export const Hero = () => {
    const navigate = useNavigate();
    const [showVideo, setShowVideo] = useState(false);
    const [prevIndex, setPrevIndex] = useState<number | null>(null);

    const { slides, loading, videoUrl } = useHero();

    const { currentIndex, progress } = useCinematicSlider({
        count: slides.length,
        duration: 8000
    });

    const currentSlide = slides.length > 0 ? slides[currentIndex % slides.length] : null;
    const prevSlide = prevIndex !== null && slides.length > 0 ? slides[prevIndex % slides.length] : null;

    {/* ── 3D Tilt via vanilla mouse events ── */ }
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
        const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${yRatio * -16}deg) rotateY(${xRatio * 16}deg)`;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    {/* ── Track slide changes for cross-fade ── */ }
    const prevIndexRef = useRef(currentIndex);
    useEffect(() => {
        if (currentIndex !== prevIndexRef.current) {
            setPrevIndex(prevIndexRef.current);
            prevIndexRef.current = currentIndex;
            const timer = setTimeout(() => setPrevIndex(null), 800);
            return () => clearTimeout(timer);
        }
    }, [currentIndex]);

    {/* ── Preload next slide ── */ }
    useEffect(() => {
        if (slides.length > 1) {
            const nextIndex = (currentIndex + 1) % slides.length;
            const img = new Image();
            if (slides[nextIndex]?.imageUrl) img.src = slides[nextIndex].imageUrl;
        }
    }, [currentIndex, slides]);

    return (
        <section className="relative min-h-[90vh] w-full bg-transparent flex items-center pt-28 pb-16 overflow-hidden transition-colors duration-500">
            <title>{i18n.t('features:landing.hero.pageTitle')}</title>
            <meta name="description" content={i18n.t('features:landing.hero.metaDescription')} />

            {/* ── Background blobs ── */}
            <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* ── LEFT COL: CONTENT ── */}
                    <div className="order-2 lg:order-1 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left relative">

                        {/* ── Floating icons — CSS keyframes only ── */}
                        <div className="absolute -inset-10 pointer-events-none -z-10">
                            <div
                                className="absolute top-[3%] left-[10%] text-amber-400 opacity-60 dark:opacity-40 animate-[float-gentle_4s_ease-in-out_infinite]"
                            >
                                <Sparkles size={28} />
                            </div>
                            <div
                                className="absolute top-[5%] right-[10%] text-rose-400 opacity-40 animate-[pulse-scale_3s_ease-in-out_infinite]"
                            >
                                <Star size={24} fill="currentColor" />
                            </div>
                            <div
                                className="absolute top-[45%] left-[10%] text-emerald-500 opacity-20 animate-[spin_15s_linear_infinite]"
                            >
                                <Hexagon size={40} />
                            </div>
                            <div
                                className="absolute bottom-[-5%] left-[30%] text-indigo-400 opacity-50 dark:opacity-30 animate-[float-gentle_5s_ease-in-out_2s_infinite]"
                            >
                                <Sparkles size={20} />
                            </div>
                        </div>

                        {/* Headline — CSS animate-in */}
                        <h1
                            className="text-4xl md:text-5xl lg:text-[3.75rem] font-black leading-[1.1] mb-6 tracking-tight min-h-[2.6em] whitespace-pre-line"
                        >
                            <TypewriterEffect
                                texts={[i18n.t('features:landing.hero.headline')]}
                                lineClassNames={[
                                    "text-slate-900 dark:text-white",
                                    "text-transparent bg-clip-text bg-gradient-to-r from-humg-blue via-indigo-500 to-humg-blue bg-[length:200%_auto] animate-gradient-text dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400"
                                ]}
                                delay={0}
                                speed={70}
                                loop={false}
                            />
                        </h1>

                        {/* Description */}
                        <p
                            className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0 opacity-0 animate-fade-in-up"
                            style={{ animationDelay: '0.3s' }}
                        >
                            {i18n.t('features:landing.hero.subtitle')}
                        </p>

                        {/* Buttons */}
                        <div
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start opacity-0 animate-fade-in-up"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-humg-blue text-white font-semibold text-base shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                            >
                                {i18n.t('features:landing.hero.joinNow')} <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowVideo(true)}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 font-bold text-base border border-slate-200/50 dark:border-slate-700/50 hover:border-humg-blue hover:text-humg-blue dark:hover:border-blue-500 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                            >
                                <PlayCircle size={20} /> {i18n.t('features:landing.hero.watchIntro')}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT COL: CINEMATIC SLIDER ── */}
                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end" style={{ perspective: '1000px' }}>
                        <div
                            ref={cardRef}
                            className="relative w-full max-w-[800px] aspect-[4/3] md:aspect-[16/10] rounded-[32px] group isolate cursor-grab active:cursor-grabbing opacity-0 animate-fade-in-up hover:scale-[1.03]"
                            style={{
                                animationDelay: '0.3s',
                                transformStyle: 'preserve-3d',
                                transition: 'transform 0.15s ease-out, scale 0.3s ease'
                            }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Glow border */}
                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-transparent rounded-[36px] blur-sm -z-10 dark:from-blue-400/20" />

                            {/* Main Card Container */}
                            <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-slate-900 shadow-2xl shadow-blue-900/20 border border-white/10">

                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-100 dark:bg-slate-800">
                                        <Loader2 className="w-10 h-10 text-humg-blue animate-spin" />
                                    </div>
                                ) : (
                                    currentSlide && (
                                        <>
                                            {/* Exiting slide (cross-fade out) */}
                                            {prevSlide && (
                                                <div
                                                    className="absolute inset-0 z-10"
                                                    style={{ animation: 'hero-cross-fade-out 0.8s ease-out forwards' }}
                                                >
                                                    <SmartCinematicImage
                                                        src={prevSlide.imageUrl}
                                                        alt={prevSlide.title}
                                                        isActive={false}
                                                        priority={false}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                                </div>
                                            )}

                                            {/* Active slide (cross-fade in) */}
                                            <div
                                                key={currentIndex}
                                                className="absolute inset-0 z-20"
                                                style={{ animation: 'hero-cross-fade-in 0.8s ease-out forwards' }}
                                            >
                                                <SmartCinematicImage
                                                    src={currentSlide.imageUrl}
                                                    alt={currentSlide.title}
                                                    isActive={true}
                                                    priority={true}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                            </div>

                                            {/* Shine Effect — CSS :hover */}
                                            <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[linear-gradient(105deg,transparent_15%,rgba(255,255,255,0.16)_40%,transparent_65%)] mix-blend-overlay" />

                                            {/* Progress Bar */}
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/10 z-30">
                                                <div
                                                    className="h-full bg-humg-blue transition-[width] duration-100 ease-linear"
                                                    style={{ width: `${progress * 100}%` }}
                                                />
                                            </div>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Video Modal — CSS transition */}
            {showVideo && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in-up"
                    style={{ animationDuration: '0.3s' }}
                    onClick={() => setShowVideo(false)}
                >
                    <div
                        className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-up"
                        style={{ animationDuration: '0.3s', animationDelay: '0.05s' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowVideo(false)}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors border border-white/20"
                        >
                            <X size={24} />
                        </button>
                        <iframe
                            width="100%"
                            height="100%"
                            src={videoUrl}
                            title="HUMG Intro"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                </div>
            )}
        </section >
    );
};