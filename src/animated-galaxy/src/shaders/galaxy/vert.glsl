uniform float uSize;
uniform float uTime;
attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
            /**
             * Position
             */
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // rotation
  float angle = atan(modelPosition.x, modelPosition.z);
  float distancetoCenter = length(modelPosition.xz);
  float angleOffset = (1.0 / distancetoCenter) * uTime * 0.2;
  angle += angleOffset;

  modelPosition.x = cos(angle) * distancetoCenter;
  modelPosition.z = sin(angle) * distancetoCenter;

  modelPosition.xyz += aRandomness;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vColor = color;
            /**
             * Size
             */
  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / -viewPosition.z);
}