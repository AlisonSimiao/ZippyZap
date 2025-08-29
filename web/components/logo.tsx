import { Zap } from 'lucide-react';
import React from 'react';

// import { Container } from './styles';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
        </div>
        <span className="text-xl font-serif font-bold text-">ZippyZap</span>
    </div>
  );
}

export default Logo;