'use client';

import { Eye, Target } from 'lucide-react';

export function VisionMission() {
  return (
    <div className="vision-mission-container bg-blue-600 rounded-lg shadow-lg text-white border-4 border-blue-600 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-blue-500 flex-shrink-0">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold">VISION & MISSION</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col space-y-4 sm:space-y-6 dashboard-scrollable">
        {/* Vision Section */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <Eye className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-bold">VISION</h3>
          </div>
          <p className="text-white leading-relaxed text-sm sm:text-base">
            To provide accessible, quality, and relevant alternative learning opportunities that empower out-of-school youth and adults to develop their full potential, acquire essential life skills, and become productive members of society through flexible and innovative educational approaches.
          </p>
        </div>

        {/* Mission Section */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-bold">MISSION</h3>
          </div>
          <p className="text-white leading-relaxed text-sm sm:text-base">
            We are committed to delivering comprehensive alternative learning programs that bridge educational gaps, promote lifelong learning, and foster personal growth through community-based, learner-centered approaches that respect diverse backgrounds and learning needs.
          </p>
        </div>
      </div>
    </div>
  );
}
