import React from 'react';
import { AppState } from '../types';
import { COLORS } from '../constants';

interface OverlayProps {
  appState: AppState;
  setAppState: (s: AppState) => void;
}

const Overlay: React.FC<OverlayProps> = ({ appState, setAppState }) => {
  const isTree = appState === AppState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between items-center p-8 z-10 select-none">
      
      {/* Header */}
      <div className="text-center space-y-4 mt-8 opacity-90 transition-opacity duration-1000">
        <h1 
          className="text-5xl md:text-7xl text-transparent bg-clip-text font-serif tracking-widest drop-shadow-2xl"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, ${COLORS.goldLight}, ${COLORS.gold})`,
            fontFamily: '"Cinzel", serif',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.3)'
          }}
        >
          ARIX
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 bg-emerald-500/50"></div>
          <p className="text-emerald-300 font-light tracking-[0.4em] text-xs md:text-xs uppercase">
            Signature Holiday Collection
          </p>
          <div className="h-[1px] w-12 bg-emerald-500/50"></div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-16 pointer-events-auto">
        <button
          onClick={() => setAppState(isTree ? AppState.SCATTERED : AppState.TREE_SHAPE)}
          className="group relative px-10 py-5 bg-black/60 backdrop-blur-xl border border-yellow-700/40 rounded-sm overflow-hidden transition-all duration-700 hover:border-yellow-400 hover:bg-black/80 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
        >
          {/* Animated Sheen */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-200/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
          
          <span 
            className="relative text-yellow-50 font-serif text-sm md:text-base tracking-[0.25em] transition-colors group-hover:text-white"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {isTree ? "DISMANTLE FORM" : "ASSEMBLE SIGNATURE"}
          </span>
        </button>
      </div>

      {/* Decorative Borders */}
      <div className="absolute top-0 left-0 w-full h-full p-6 pointer-events-none">
        <div className="w-full h-full border border-emerald-900/20 relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-yellow-700/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-yellow-700/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-yellow-700/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-yellow-700/50" />
        </div>
      </div>
      
    </div>
  );
};

export default Overlay;