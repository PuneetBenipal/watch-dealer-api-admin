// RotatingCircleLoader.jsx
import React from 'react';

const Loading = ({ size = "md", text = "Loading..." }) => {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16"
    };

    return (
        <div className="flex flex-col items-center justify-center py-4">
            <div
                className={`${sizeClasses[size]} border-4 border-transparent border-t-blue-500 border-l-blue-500 rounded-full animate-spin`}
                style={{ animationDuration: "1s" }}
            />
            {text && <p className="mt-3 text-gray-600 text-sm">{text}</p>}
        </div>
    );
};

export default Loading;
