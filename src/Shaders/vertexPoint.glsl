uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMove;

varying vec2 vUv;
varying vec4 vColor;

attribute vec4 aColor;
attribute float aPuissanceMove;
attribute float aPositionZ;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.z += (sin(modelPosition.x * 1.5 - uTime) * 0.1) + (uMove * (aPuissanceMove - aPositionZ));

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = (uSize * (aPuissanceMove - 0.4)) * uPixelRatio;

    vUv = uv;
    vColor = aColor;
}