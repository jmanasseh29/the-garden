precision highp float;
precision highp int;

#include <utils>

varying vec3 eye;
varying vec3 pos;

vec4 cellShade(float dotProd, vec4 c) {
    if (dotProd > .95) {
        c = c*vec4(1.0, 1.0, 1.0, 1.0);
    } else if (dotProd  > 0.5) {
        c = c*vec4(.8, .8, .8, 1.0);
    } else if (dotProd > 0.25) {
        c = c*vec4(.45, .35, .35, 1.0);
    } else {
        c = c*vec4(1.0, 1.0, 1.0, 1.0);
    }
    return c;
}

vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor) {
  vec3 color;

  if (ray.y < 0.0) {
    vec2 t = intersectCube(origin, ray, vec3(-waterWidth/2.0, -poolHeight, -waterWidth/2.0), vec3(waterWidth/2.0, 2.0, waterWidth/2.0));
    color = getWallColor(origin + ray * t.y);
  } else {
    vec2 t = intersectCube(origin, ray, vec3(-waterWidth/2.0, -poolHeight, -waterWidth/2.0), vec3(waterWidth/2.0, 2.0, waterWidth/2.0));
    vec3 hit = origin + ray * t.y;
    if (hit.y < 7.0 / 12.0) {
      color = getWallColor(hit);
    } else {
      // get rid of stuff
      // color = textureCube(sky, ray).rgb;
      color += 0.01 * vec3(pow(max(0.0, dot(light, ray)), 20.0)) * vec3(10.0, 8.0, 6.0);
    }
  }

  if (ray.y < 0.0) color *= waterColor;

  return color;
}


void main() {
  vec2 coord = pos.xz / waterWidth + 0.5;
  vec4 info = texture2D(water, coord);

  /* make water look more "peaked" */
  for (int i = 0; i < 5; i++) {
    coord += info.ba * 0.005;
    info = texture2D(water, coord);
  }

  vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);
  vec3 incomingRay = normalize(pos - eye);

  vec3 reflectedRay = reflect(incomingRay, normal);
  vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
  float fresnel = mix(0.01, 5.0, pow(1.0 - dot(normal, -incomingRay), 5.0)); //first is blackness, second one can kinda sunset

  vec3 reflectedColor = getSurfaceRayColor(pos, reflectedRay, abovewaterColor);
  vec3 refractedColor = getSurfaceRayColor(pos, refractedRay, abovewaterColor);

  vec4 colorIn = vec4(mix(refractedColor, reflectedColor, fresnel), 1.0);

  gl_FragColor = cellShade(dot(normal, -incomingRay), colorIn);
  // gl_FragColor = colorIn;
}
