'use client';
import React from 'react';
import { cn } from '@/utils/cn';
import Button from './Button';

export default function Carousel(props: {
    children: React.ReactNode;
}) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const items = React.Children.toArray(props.children);
    const totalItems = items.length;

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalItems - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === totalItems - 1 ? 0 : prevIndex + 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Carousel container with navigation */}
            {/* <div className="relative"> */}
                {/* Carousel content */}
                <div className="overflow-hidden rounded-lg">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="w-full flex-shrink-0 flex justify-center items-center min-h-[400px] bg-gray-50"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between w-full">
                        <Button
                            variant="tonal"
                            hasIcon
                            icon="chevron_left"
                            hasLabel={false}
                            onClick={goToPrevious}
                            className="rounded-[8px] p-6 hover:rounded-l-full hover:rounded-r-xl duration-200 ease-[cubic-bezier(0.05,0.7,0.1,1.0)]"
                        />
                        <Button
                            variant="tonal"
                            hasIcon
                            icon="chevron_right"
                            hasLabel={false}
                            onClick={goToNext}
                            className="rounded-[8px] p-6 hover:rounded-r-full hover:rounded-l-xl duration-200 ease-[cubic-bezier(0.05,0.7,0.1,1.0)]"
                        />
                {/* </div> */}
            </div>

            {/* Dots navigation */}
            <div className="flex justify-center mt-6 gap-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            index === currentIndex
                                ? "bg-(--md-sys-color-primary) w-6"
                                : "bg-(--md-sys-color-outline-variant) hover:bg-(--md-sys-color-outline) w-2"
                        )}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}