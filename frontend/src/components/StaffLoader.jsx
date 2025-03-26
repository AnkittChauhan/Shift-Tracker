import React from 'react';

const StaffLoader = () => {
    return (
        <td colSpan={5} className="py-4">
            <div className="flex justify-center items-center w-full h-32">
                <div className="relative w-24 h-24">
                    <div className="w-full h-full border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </td>
    );
};

export default StaffLoader;