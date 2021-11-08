uniform float uTime;

varying vec2 vUv;

void main()
{
    gl_FragColor = vec4(sin(uTime), 1.0, 0.0, 1.0);
}