varying vec3 vColor;

void main() {

  float strengh = distance(gl_PointCoord, vec2(0.5));
  // strengh = step(0.5, strengh);
  // strengh *= 2.0;
  strengh = 1.0 - strengh;
  strengh = pow(strengh, 10.0);

  vec3 color = mix(vec3(0.0), vColor, strengh);
  gl_FragColor = vec4(vec3(color), 1.0);
}