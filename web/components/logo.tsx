import { Zap } from 'lucide-react';
import React from 'react';

// import { Container } from './styles';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black/20 backdrop-blur-sm border border-primary/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Zap className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xl font-serif font-bold tracking-tight text-foreground">ZippyZap</span>
    </div>
  );
}

export default Logo;