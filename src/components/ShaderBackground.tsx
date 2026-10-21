import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

// Raw WebGL fragment shader: domain-warped fBm ("Inigo Quilez" style warp) with a cosine
// palette. Time is derived ONLY from the Remotion frame, so every frame is deterministic and
// render tabs can work on frames out of order.
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform float u_pulse; uniform vec3 u_tint; uniform float u_zoom;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<6;i++){ v+=a*noise(p); p=m*p; a*=.5; } return v; }
vec3 pal(float t){ return vec3(.45,.5,.6)+vec3(.45,.45,.4)*cos(6.28318*(vec3(1.,1.,.9)*t+vec3(.55,.62,.72))); }
void main(){
  vec2 uv = (gl_FragCoord.xy - .5*u_res) / u_res.y * u_zoom;
  float t = u_time*.12;
  vec2 q = vec2(fbm(uv*1.5 + t), fbm(uv*1.5 + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(uv*1.5 + 4.*q + vec2(1.7,9.2) + .15*t), fbm(uv*1.5 + 4.*q + vec2(8.3,2.8) - .126*t));
  float f = fbm(uv*1.5 + 4.*r);
  vec3 col = mix(vec3(.02,.02,.06), pal(f*.6 + .55 + .1*sin(t)) * u_tint, clamp(f*f*1.8,0.,1.));
  col += .35*u_pulse*pal(length(q)+.2)*smoothstep(.4,1.,f);
  col *= 1. - .55*dot(uv/u_zoom, uv/u_zoom);           // vignette
  col += (hash(gl_FragCoord.xy + u_time) - .5) * .03;   // film grain
  gl_FragColor = vec4(pow(max(col,0.), vec3(.9)), 1.);
}`;

export const ShaderBackground: React.FC<{
  tint?: [number, number, number];
  pulse?: number;
  speed?: number;
  zoom?: number;
  opacity?: number;
}> = ({tint = [0.6, 0.8, 1.2], pulse = 0, speed = 1, zoom = 1, opacity = 1}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<{gl: WebGLRenderingContext; prog: WebGLProgram} | null>(null);
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  // render at half resolution and upscale with CSS: 4x fewer fragments, softer look is fine here
  const w = width / 2, h = height / 2;

  useLayoutEffect(() => {
    const canvas = ref.current!;
    if (!glRef.current) {
      const gl = canvas.getContext('webgl', {preserveDrawingBuffer: true, antialias: false});
      if (!gl) return;
      const mk = (type: number, src: string) => {
        const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
        return s;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog); gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      glRef.current = {gl, prog};
    }
    const {gl, prog} = glRef.current;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), w, h);
    gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), (frame / fps) * speed);
    gl.uniform1f(gl.getUniformLocation(prog, 'u_pulse'), pulse);
    gl.uniform1f(gl.getUniformLocation(prog, 'u_zoom'), zoom);
    gl.uniform3f(gl.getUniformLocation(prog, 'u_tint'), tint[0], tint[1], tint[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.finish();
  }, [frame, fps, w, h, pulse, speed, zoom, tint[0], tint[1], tint[2]]);

  return (
    <canvas ref={ref} width={w} height={h}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}} />
  );
};
