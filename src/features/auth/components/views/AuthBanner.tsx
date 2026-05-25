import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, BookOpen, Users, Star,
    Lightbulb, Target, GraduationCap
} from 'lucide-react';
import { BANNER_ANIMATIONS, STAGGER_TEXT_VARIANTS } from '@/features/auth/config/authAnimations';
import type { ElementType } from 'react';
import i18n from '@/i18n';

const MotionDiv = motion.div;
const MotionSpan = motion.span;
const MotionP = motion.p;

interface FloatingIconProps {
    icon: ElementType;
    delay: number;
    size: number;
    colorClass?: string;
}

const getBannerSlides = () => [
    {
        title: i18n.t('auth:banner.slide1Title'),
        description: i18n.t('auth:banner.slide1Desc')
    },
    {
        title: i18n.t('auth:banner.slide2Title'),
        description: i18n.t('auth:banner.slide2Desc')
    },
    {
        title: i18n.t('auth:banner.slide3Title'),
        description: i18n.t('auth:banner.slide3Desc')
    }
];

const FloatingIcon = ({ icon: Icon, delay, size, colorClass = "text-white" }: FloatingIconProps) => (
    <MotionDiv
        className="absolute flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg shadow-humg-blue/20"
        style={{ width: size, height: size }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 + (delay * 0.1), duration: 0.5, type: "spring" }}
    >
        <Icon size={size * 0.55} className={colorClass} />
    </MotionDiv>
);

export const AuthBanner = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % getBannerSlides().length);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden lg:block relative w-[45%] min-h-screen bg-[#002855] shrink-0">
            <div
                ref={containerRef}
                className="sticky top-0 h-screen w-full flex flex-col p-8 overflow-hidden"
            >
                <div className="relative z-10 w-full h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center w-full min-h-[400px]">
                        <MotionDiv
                            className="relative w-[320px] h-[320px] flex items-center justify-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, type: "spring" }}
                        >
                            <div className="relative z-20 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.4)] ring-4 ring-white/10 overflow-hidden">
                                <div className="absolute inset-0 rounded-full border border-white/30 animate-ping" style={{ animationDuration: '3s' }}></div>

                                <img
                                    src="/assets/logo.png"
                                    alt="HUMG"
                                    className="w-full h-full object-cover z-10 relative"
                                />

                                <MotionDiv
                                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 z-20"
                                    initial={{ x: '-150%' }}
                                    animate={{ x: '150%' }}
                                    transition={{
                                        repeat: Infinity,
                                        repeatDelay: 4,
                                        duration: 1.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>

                            <MotionDiv
                                className="absolute inset-0 border border-white/5 rounded-full"
                                variants={BANNER_ANIMATIONS.spinSlow}
                                animate="animate"
                            />
                            <MotionDiv
                                className="absolute inset-[15%] border border-white/10 rounded-full border-dashed"
                                variants={BANNER_ANIMATIONS.spinReverse}
                                animate="animate"
                            />

                            <MotionDiv
                                className="absolute inset-[-40px]"
                                animate={{
                                    rotate: 360,
                                    scale: [1, 0.45, 1]
                                }}
                                transition={{
                                    rotate: {
                                        duration: 40,
                                        repeat: Infinity,
                                        ease: "linear"
                                    },
                                    scale: {
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }
                                }}
                            >
                                <div className="absolute top-[-2%] left-1/2 -translate-x-1/2">
                                    <MotionDiv
                                        animate={{ scale: [1, 1.8, 1] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <FloatingIcon icon={Trophy} size={42} delay={0} colorClass="text-yellow-400" />
                                    </MotionDiv>
                                </div>

                                <div className="absolute top-[18%] right-[10%]">
                                    <MotionDiv
                                        animate={{ scale: [1, 1.8, 1] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <FloatingIcon icon={Lightbulb} size={30} delay={1} colorClass="text-orange-300" />
                                    </MotionDiv>
                                </div>

                                <div className="absolute top-[55%] right-[-4%]">
                                    <MotionDiv
                                        animate={{ scale: [1, 1.8, 1] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <FloatingIcon icon={Star} size={34} delay={2} colorClass="text-purple-300" />
                                    </MotionDiv>
                                </div>

                                <div className="absolute bottom-[5%] right-[18%]">
                                    <MotionDiv
                                        animate={{ scale: [1, 1.8, 1] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <FloatingIcon icon={Users} size={32} delay={3} colorClass="text-green-300" />
                                    </MotionDiv>
                                </div>

                                <div className="absolute bottom-[5%] left-[18%]">
                                    <MotionDiv
                                        animate={{ scale: [1, 1.8, 1] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <FloatingIcon icon={Target} size={32} delay={4} colorClass="text-red-400" />
                                    </MotionDiv>
                                </div>

                                <div className="absolute top-[55%] left-[-4%]">
                                    <MotionDiv
                                        animate={{ scale: [1, 1.8, 1] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <FloatingIcon icon={BookOpen} size={34} delay={5} colorClass="text-blue-300" />
                                    </MotionDiv>
                                </div>

                                <div className="absolute top-[18%] left-[10%]">
                                    <MotionDiv
                                        animate={{ scale: [1, 1.8, 1] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <FloatingIcon icon={GraduationCap} size={30} delay={6} colorClass="text-pink-300" />
                                    </MotionDiv>
                                </div>
                            </MotionDiv>
                        </MotionDiv>
                    </div>

                    <div className="w-full pb-4 flex flex-col items-center">
                        <div className="relative h-[120px] w-full max-w-md flex flex-col items-center justify-start text-center">
                            <AnimatePresence mode="wait">
                                <MotionDiv
                                    key={activeSlide}
                                    variants={STAGGER_TEXT_VARIANTS.container}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className="absolute inset-0 flex flex-col items-center"
                                >
                                    <div className="flex flex-wrap justify-center gap-x-2 mb-4">
                                        {getBannerSlides()[activeSlide].title.split(" ").map((word, i) => (
                                            <MotionSpan
                                                key={i}
                                                variants={STAGGER_TEXT_VARIANTS.item}
                                                className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white drop-shadow-lg"
                                            >
                                                {word}
                                            </MotionSpan>
                                        ))}
                                    </div>

                                    <MotionP
                                        variants={STAGGER_TEXT_VARIANTS.item}
                                        className="text-blue-100 text-sm md:text-base font-medium leading-relaxed max-w-[80%]"
                                    >
                                        {getBannerSlides()[activeSlide].description}
                                    </MotionP>
                                </MotionDiv>
                            </AnimatePresence>
                        </div>

                        <div className="flex justify-center gap-2 mt-6">
                            {getBannerSlides().map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSlide(idx)}
                                    className={`h-1.5 rounded-full transition-colors duration-500 ${idx === activeSlide ? 'w-8 bg-humg-amber' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#001a33] to-transparent pointer-events-none z-0"></div>
            </div>
        </div>
    );
};