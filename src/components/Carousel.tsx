'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface CarouselProps {
    children: React.ReactNode;
    className?: string;
    showNavigation?: boolean;
    showDots?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

export default function Carousel({ 
    children, 
    className,
    showNavigation = true,
    showDots = true,
    autoPlay = false,
    autoPlayInterval = 5000
}: CarouselProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const items = React.Children.toArray(children);
    const totalItems = items.length;

    // Auto-play functionality
    React.useEffect(() => {
        if (!autoPlay || totalItems <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex === totalItems - 1 ? 0 : prevIndex + 1));
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, totalItems]);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalItems - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === totalItems - 1 ? 0 : prevIndex + 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    if (totalItems === 0) return null;

    return (
        <div className={cn("relative w-full h-full", className)}>
            {/* Carousel content */}
            <div className="relative w-full h-full overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="w-full h-full flex-shrink-0"
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {/* Navigation buttons */}
                {showNavigation && totalItems > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute flex left-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all duration-200"
                            aria-label="Previous slide"
                        >
                            <span className="mdi text-2xl">chevron_left</span>
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute flex right-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all duration-200"
                            aria-label="Next slide"
                        >
                            <span className="mdi text-2xl">chevron_right</span>
                        </button>
                    </>
                )}
            </div>

            {/* Dots navigation */}
            {showDots && totalItems > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "bg-white w-6"
                                    : "bg-white/50 hover:bg-white/75"
                            )}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}