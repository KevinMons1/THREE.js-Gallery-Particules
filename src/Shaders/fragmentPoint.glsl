varying vec4 vColor;

void main()
{
    gl_FragColor = vec4(vColor.r, vColor.g, vColor.b, vColor.a - 0.8);
}