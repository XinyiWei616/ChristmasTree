import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const PostEffects: React.FC = () => {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom 
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9} 
        intensity={1.5} 
        mipmapBlur 
        radius={0.6}
      />
      <Noise opacity={0.05} />
      <Vignette
        offset={0.3}
        darkness={0.6}
        eskil={false}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
};

export default PostEffects;