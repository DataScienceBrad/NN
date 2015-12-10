//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    shadersCache.ts - defines cache of shaders.
//-------------------------------------------------------------------------------------

/// <reference path="../_references.ts" />

module shadersCache {
    export interface ShaderCacheItem {
        [name: string]: string;
    }

    export var shaders: ShaderCacheItem = {};

    export function getShaderCodeByName(name: string): string {
        return shaders[name] || "";
    }

    shaders["../shaders/pointCube/pointFragment"] = `//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    pointFragment.c - an GLSL fragment shader for drawing cubes using the POINT primitive in BeachParty.
//-------------------------------------------------------------------------------------
precision mediump float;

//---- CONSTANTS ----
const float ambientFactor = .2;
const float lightingEnabled = 1.0;
const float lightFactor1 = .75;     //  .5;
const vec3 crLight = vec3(1.0, 1.0, 1.0);
const vec3 lightPos = vec3(0.0, 0.0, 15.0);
const float epsilon = 0.0001;

//---- UNIFORMS ----
uniform vec2 canvasSize;
uniform vec3 cameraPos;
uniform mat4 worldMatrix;
uniform mat4 mvpMatrix;
uniform mat4 invMvpMatrix;
uniform mat4 invWorldMatrix;
uniform sampler2D uSampler1;		// set to "0"
uniform sampler2D uSampler2;		// set to "1"
uniform float usingTexture1;
uniform float usingTexture2;
uniform float toPercentFrag;
uniform float ndcZ;

//---- INPUT ----
varying vec3 vColor;
varying vec3 vPosition;
varying vec3 vSize;
varying float vOpacity;
varying highp vec2 v_texCoord1;
varying highp vec2 v_texCoord2;


float cubeIntersection(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax)
{
	vec3 tMin = (cubeMin - origin) / ray;
	vec3 tMax = (cubeMax - origin) / ray;
	vec3 t1 = min(tMin, tMax);
	vec3 t2 = max(tMin, tMax);
	float tNear = max(max(t1.x, t1.y), t1.z);
	float tFar = min(min(t2.x, t2.y), t2.z);

	float dist = (tNear < tFar) ? tNear : -1.0;
	return dist;
}

//---- find normal of cube at "hit" ----
vec3 cubeNormal(vec3 hit, vec3 cubeMin, vec3 cubeMax)
{
	//---- figure out which side of cube "hit" is on ----
	if (hit.x < cubeMin.x + epsilon) return vec3(-1.0, 0.0, 0.0);
	else if (hit.x > cubeMax.x - epsilon) return vec3(1.0, 0.0, 0.0);
	else if (hit.y < cubeMin.y + epsilon) return vec3(0.0, -1.0, 0.0);
	else if (hit.y > cubeMax.y - epsilon) return vec3(0.0, 1.0, 0.0);
	else if (hit.z < cubeMin.z + epsilon) return vec3(0.0, 0.0, -1.0);

	return vec3(0.0, 0.0, 1.0);
}

vec4 computeLighting(vec3 intersection, vec3 direction, vec4 objColor, vec3 objNorm, float objSpecularFactor,
	vec3 actualLightPos)
{
	//---- add AMBIENT component ----
	float ambient = ambientFactor;   // .01;
	vec4 color = vec4(ambient * objColor.xyz, 1.0);

	//---- (loop thru each light) ----

	vec3 lightdir = normalize(actualLightPos - intersection);

	float dp = dot(objNorm, lightdir);
	if (dp > 0.0)
	{
		//---- add DIFFUSE component ----
		color += lightFactor1 * dp * objColor.w * vec4(objColor.xyz * crLight, 1.0);
	}

	vec3 rd = lightdir - 2.0 * dot(lightdir, objNorm) * objNorm;
	dp = dot(direction, rd);
	if (dp > 0.0)
	{
		//---- add SPECULAR component ----
		color += (lightFactor1 * pow(dp, 20.0) * objSpecularFactor) * vec4(crLight, 1.0);
	}

	return color;
}

vec4 calcColor(float xOffset, float yOffset, bool isDiscardEnabled)
{
	/// this works by transforming the current fragment from SCREEN units, so it can be used to create a camera ray
	/// that can then be intersection-tested with an axis-aligned cube.

	float fragX = gl_FragCoord.x + xOffset;
	float fragY = gl_FragCoord.y + yOffset;

	vec4 ndcFrag = 2.0 * vec4(fragX, fragY, 0, 1) * vec4(1.0 / canvasSize.x, 1.0 / canvasSize.y, 1, 1);
	ndcFrag += vec4(-1, -1, -1, 1);
	//ndcFrag.y = -ndcFrag.y;		// correct y for flipping

	//---- convert to world units ----
	vec4 worldFrag = invMvpMatrix * vec4(ndcFrag.xy, ndcZ, 1);
	worldFrag /= worldFrag.w;

	vec4 cameraTemp = invWorldMatrix * vec4(cameraPos, 1);
	cameraTemp /= cameraTemp.w;
	vec3 actualCameraPos = cameraTemp.xyz;

	vec4 lightTemp = invWorldMatrix * vec4(lightPos, 1);
	lightTemp /= lightTemp.w;
	vec3 actualLightPos = lightTemp.xyz;

	//vec3 cameraDelta = actualCameraPos - worldFrag.xyz;
	//vec3 lightDelta = lightPos - worldFrag.xyz;

	//---- convert to model units ----
	vec3 modelFrag = worldFrag.xyz;
	//modelFrag -= vPosition;
	//modelFrag /= vSize;

	//actualCameraPos = modelFrag + cameraDelta;  
	//vec3 actualLightPos = modelFrag + lightDelta;

	vec3 direction = normalize(modelFrag - actualCameraPos);

	float unit = .5;
	vec3 cubeMin = vec3(-unit, -unit, -unit);
	vec3 cubeMax = vec3(unit, unit, unit);

	vec3 cubeMin2 = vPosition - vSize / 2.0;
	vec3 cubeMax2 = vPosition + vSize / 2.0;

	float tDistance = cubeIntersection(actualCameraPos, direction, cubeMin2, cubeMax2);

	//---- CUBE hit-test discard ----
	if (tDistance < 0.0)
	{
		if (isDiscardEnabled)
		{
			discard;
		}
		else
		{
			//discardCount++;
		}
	}

	vec4 color;

	if (lightingEnabled == 1.0)
	{
		float objSpecular = .3;

		//---- world units ----
		vec3 intersection = actualCameraPos + tDistance * direction;

		//---- update the fragment's Z value (NDC), for correct z-buffering ----
		vec4 ndcIntersection = mvpMatrix * vec4(intersection, 1);
		ndcIntersection /= ndcIntersection.w;

		//---- WebGL doesn't support gl_FragDepth - how to work around? ----
		//gl_FragDepth = ndcIntersection.z;

		//---- make intersection axis aligned ----
		intersection -= vPosition; // = worldMatrix * intersection;
		intersection /= vSize;

		vec3 objNorm = cubeNormal(intersection, cubeMin, cubeMax);

		color = computeLighting(intersection, direction, vec4(vColor, 1), objNorm, objSpecular, actualLightPos);
	}
	else
	{
		color = vec4(vColor, 1);
	}

	return color;
}

void main()
{
    //---- hide pixels of opacity=0, even if we are not blending ----
    if (vOpacity == 0.0)
    {
        discard;
    }

    vec4 objColor = calcColor(0.0, 0.0, true);

    //---- compute FROM color ----
    vec4 texColor1 = (usingTexture1 == 1.0) ? texture2D(uSampler1, v_texCoord1) : vec4(1, 1, 1, 1);

    //---- compute TO color ----
    vec4 texColor2 = (usingTexture2 == 1.0) ? texture2D(uSampler2, v_texCoord2) : vec4(1, 1, 1, 1);

    //---- mix them ----
    vec4 texColorMixed = mix(texColor1, texColor2, toPercentFrag);

    //---- debug - JUST USE TEXTRUE REGISTER #1 ----
    //texColorMixed = texture2D(uSampler1, v_texCoord2) + .00001 * texColorMixed;

    gl_FragColor = vOpacity * objColor * texColorMixed;

    //---- debug ----
    //gl_FragColor = .00001*gl_FragColor + vec4(1, 0, 0, 1);  
}`;

    shaders["../shaders/pointCube/pointVertex"] = `//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    pointVertex.c - an GLSL vertex shader for drawing cubes using the POINT primitive in BeachParty.
//-------------------------------------------------------------------------------------

//---- CONSTANTS ----
const float constOpacity = 1.0;

//---- UNIFORMS ----
uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 szCanvas;
uniform vec2 cubeTexCoords[24];
uniform vec3 colorPalette[28];
uniform vec3 colorPalette2[28];
uniform vec3 hoverColor;
uniform vec3 colors[4];
uniform float isColorDiscrete;
uniform float isColorDiscrete2;
uniform float maxColors;
uniform float maxColors2;
uniform float toPercent;
uniform float toPercentTheta;
uniform float toPercentUneased;
uniform float sizeFactor;			// adjust incoming sizes to default sizedFactor=1
uniform float sizeFactor2;		    // size change can be INSTANT or ANIMATED
uniform float globalOpacity;
uniform float globalOpacity2;
uniform float textureCount1;
uniform float textureCount2;
uniform float hoverVectorIndex;

//---- INPUT ----
attribute vec3 xyz;
attribute vec3 xyz2;
attribute vec3 size;
attribute vec3 size2;
attribute float colorIndex;
attribute float colorIndex2;
attribute float imageIndex;
attribute float imageIndex2;
attribute float opacity;
attribute float opacity2;
attribute float theta;
attribute float theta2;
attribute float vectorIndex;
//attribute float vertexId;
attribute float staggerOffset;

//---- OUTPUT ----
varying vec3 vColor;
varying vec3 vPosition;
varying vec3 vSize;
varying float vOpacity;
varying highp vec2 v_texCoord1;
varying highp vec2 v_texCoord2;

void setGlPointSizeAndLocation(vec3 szMixed, vec3 posMixed)
{
    /// We first need to calculate the "gl_PointSize" as max(ndcWidth, ndcHeight), where ndcWidth and ndcHeight are the 
    /// width and height of the bounding box for our cube in normalized device coordinates (-1 to +1).
    /// To do this, we calculate the 8 vertices of the cube in world space and then map them to NDC.

	mat4 mvp = projectionMatrix * modelViewMatrix;
	vec3 halfSize = szMixed / 2.0;

	//---- first, transform the first 4 vertices ----
	vec4 p000 = mvp * vec4(posMixed + vec3(-halfSize.x, -halfSize.y, -halfSize.z), 1);
	vec4 p001 = mvp * vec4(posMixed + vec3(-halfSize.x, -halfSize.y, halfSize.z), 1);
	vec4 p010 = mvp * vec4(posMixed + vec3(-halfSize.x, halfSize.y, -halfSize.z), 1);
	vec4 p011 = mvp * vec4(posMixed + vec3(-halfSize.x, halfSize.y, halfSize.z), 1);

	vec4 p100 = mvp * vec4(posMixed + vec3(halfSize.x, -halfSize.y, -halfSize.z), 1);
	vec4 p101 = mvp * vec4(posMixed + vec3(halfSize.x, -halfSize.y, halfSize.z), 1);
	vec4 p110 = mvp * vec4(posMixed + vec3(halfSize.x, halfSize.y, -halfSize.z), 1);
	vec4 p111 = mvp * vec4(posMixed + vec3(halfSize.x, halfSize.y, halfSize.z), 1);

	////---- now, we can derive the other 4 without matrix multiplication ----
	//vec4 y = p010 - p000;
	//vec4 z = p101 - p100;

	//vec4 p110 = p100 + y;
	//vec4 p111 = p110 + z;
	//vec4 p011 = p010 + z;
	//vec4 p001 = p000 + z;

	//---- apply "w" to complete transformations ----
	p000.xyz /= p000.w;
	p001.xyz /= p001.w;
	p010.xyz /= p010.w;
	p011.xyz /= p011.w;
	p100.xyz /= p100.w;
	p101.xyz /= p101.w;
	p110.xyz /= p110.w;
	p111.xyz /= p111.w;

	//---- finally, find the min and max of X and Y among all 8 vertices ----
	float xMin = min(p000.x, min(p001.x, min(p010.x, min(p011.x, min(p100.x, min(p101.x, min(p110.x, p111.x)))))));
	float yMin = min(p000.y, min(p001.y, min(p010.y, min(p011.y, min(p100.y, min(p101.y, min(p110.y, p111.y)))))));
	float zMin = min(p000.z, min(p001.z, min(p010.z, min(p011.z, min(p100.z, min(p101.z, min(p110.z, p111.z)))))));

	float xMax = max(p000.x, max(p001.x, max(p010.x, max(p011.x, max(p100.x, max(p101.x, max(p110.x, p111.x)))))));
	float yMax = max(p000.y, max(p001.y, max(p010.y, max(p011.y, max(p100.y, max(p101.y, max(p110.y, p111.y)))))));
	float zMax = max(p000.z, max(p001.z, max(p010.z, max(p011.z, max(p100.z, max(p101.z, max(p110.z, p111.z)))))));

	//---- bounding box width/height ----
	float bbWidth = (xMax - xMin) * szCanvas.x / 2.0;
	float bbHeight = (yMax - yMin) * szCanvas.y / 2.0;

	//---- specify SIZE of POINT square (in screen units)  ----
	gl_PointSize = 1.0 * max(bbWidth, bbHeight);        // look now looks right (its min() is slightly larger than cube min below

	//---- specify CENTER of POINT square (in NDC) ----
	//---- NOTE: this is NOT the center transformed into NDC; it needs to be the center of the bb in NDC ----
	//gl_Position = mvp * vec4(posMixed, 1.0);
	//gl_Position /= gl_Position.w;
	gl_Position = vec4((xMax + xMin) / 2.0, (yMax + yMin) / 2.0, 0, 1);

	//---- pass CENTER position of cube in WORLD ----
	vPosition = posMixed;

	//---- pass SIZE of cube in WORLD ----
	vSize = size;       //  vec3(xMax - xMin, yMax - yMin, zMax - zMin);

    //---- debug ----
    //gl_PointSize = 10.0;
    //gl_Position = vec4(0, 0, 0, 1);
}

void main(void)
{
    int ci = int(clamp(colorIndex, 0.0, maxColors));
    int ci2 = int(clamp(colorIndex2, 0.0, maxColors2));

    //---- stagger movement & color changes ----
    float toPercentStag = clamp(toPercent + staggerOffset, 0.0, 1.0);
    float toPercenUneasedStag = clamp(toPercentUneased + staggerOffset, 0.0, 1.0);

    //---- DISCRETE/CONTINUOUS COLOR PALETTE ----
    vec3 color = (isColorDiscrete == 1.0) ? (colorPalette[ci]) : (mix(colorPalette[ci], colorPalette[ci + 1], colorIndex - float(ci)));
    vec3 color2 = (isColorDiscrete2 == 1.0) ? (colorPalette2[ci2]) : (mix(colorPalette2[ci2], colorPalette2[ci2 + 1], colorIndex2 - float(ci2)));
    vec3 colorMixed = mix(color, color2, toPercenUneasedStag);

    //---- set VERTEX ID ----
    //int vi = int(cubeTriangles[int(vertexId + 3.0*triangleIndex)]);

    //---- INTERPOLATE between from/to values for SIZE and XYZ ----
    vec3 szMixed = mix(size*sizeFactor, size2*sizeFactor2, toPercentStag);
    vec3 posMixed = mix(xyz, xyz2, toPercentStag);

    setGlPointSizeAndLocation(szMixed, posMixed);

    ////---- info for RAY CASTING in fragment shader ----
    mat4 matPMV = projectionMatrix * modelViewMatrix;

    //---- rotate line by theta / theta2 ----
    float thetaMix = mix(theta, theta2, toPercentTheta);
    float sint = sin(thetaMix);
    float cost = cos(thetaMix);
    mat3 matRot = mat3(cost, sint, 0, -sint, cost, 0, 0, 0, 1);
    vec3 vertPos = vec3(0, 0, 0);       //  : (cubeVertices[vi] * szMixed);
    vec3 pos = matRot * vertPos + posMixed;

    //---- texture coordinates ----
    v_texCoord1 = cubeTexCoords[0];      // FIXME [vi];   (was vertexIndex)
    v_texCoord2 = cubeTexCoords[0];     // FIXME [vi];
    v_texCoord1.x = (v_texCoord1.x + imageIndex) / textureCount1;
    v_texCoord2.x = (v_texCoord2.x + imageIndex2) / textureCount2;

    vColor = colorMixed;

    //---- hover (total override of lit color) ----
    if (vectorIndex == hoverVectorIndex)
    {
        vColor = hoverColor;
    }

    //---- opacity ----
    vOpacity = mix(opacity*globalOpacity, opacity2*globalOpacity2, toPercenUneasedStag);
}
`;

    shaders["../shaders/cubeVertexShader.c"] = `//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//   cubeVertexShader.c - an GLSL vertex shader for drawing non-POINT primitives in BeachParty.
//-------------------------------------------------------------------------------------

/// NOTE: "light direction" here should be specified as the light position, pointing towards the origin.
const vec3 crLight = vec3(1.0, 1.0, 1.0);       
const vec3 dirLight = vec3(0, 0, 1);			// z=+1 point to negative z, where shapes are (camera is at (0, 0, 7))

//const vec3 crLight2 = vec3(1.0, 1.0, 1.0);
//const vec3 dirLight2 = vec3(0, -1, 0);			// from above 

//---- constants ----
uniform vec3 cubeVertices[24];
uniform vec3 cubeNormals[24];
uniform vec2 cubeTexCoords[24];
uniform mat4 projectionMatrix;
uniform float cubeTriangles[36];

//---- set on every draw ----
uniform vec3 colorPalette[28];
uniform vec3 colorPalette2[28];
uniform float isColorDiscrete;
uniform float isColorDiscrete2;
uniform float maxColors;
uniform float maxColors2;

uniform mat3 normalMatrix;
uniform mat4 modelViewMatrix;
uniform float lightFactor1;
uniform float lightFactor2;
uniform float toPercent;
uniform float toPercentTheta;
uniform float toPercentUneased;
uniform float ambientFactor;
uniform float triangleIndex;
uniform float sizeFactor;			// adjust incoming sizes to default sizedFactor=1
uniform float sizeFactor2;		    // size change can be INSTANT or ANIMATED
uniform float lightingEnabled;
uniform float globalOpacity;
uniform float globalOpacity2;
uniform float textureCount1;
uniform float textureCount2;
uniform float drawingPoints;
uniform float hoverVectorIndex;
uniform vec3 hoverColor;
uniform float canvasWidth;
uniform float canvasHeight;

//---- attribute buffers ----
attribute vec3 xyz;
attribute vec3 xyz2;
attribute vec3 size;
attribute vec3 size2;
attribute float colorIndex;
attribute float colorIndex2;
attribute float imageIndex;
attribute float imageIndex2;
attribute float opacity;
attribute float opacity2;
attribute float theta;
attribute float theta2;
attribute float vectorIndex;
attribute float vertexId;
attribute float staggerOffset;

//---- output to fragment shader ----
varying vec3 v_color;
varying float v_opacity;
varying highp vec2 v_texCoord1;
varying highp vec2 v_texCoord2;
//varying vec2 vPosition;
//varying vec2 vSize;

void main()
{
	int ci = int(clamp(colorIndex, 0.0, maxColors));
	int ci2 = int(clamp(colorIndex2, 0.0, maxColors2));

	//---- stagger movement & color changes ----
	float toPercentStag = clamp(toPercent + staggerOffset, 0.0, 1.0);
	float toPercenUneasedStag = clamp(toPercentUneased + staggerOffset, 0.0, 1.0);

	//---- DISCRETE/CONTINUOUS COLOR PALETTE ----
	vec3 color = (isColorDiscrete == 1.0) ? (colorPalette[ci]) : (mix(colorPalette[ci], colorPalette[ci + 1], colorIndex - float(ci)));
	vec3 color2 = (isColorDiscrete2 == 1.0) ? (colorPalette2[ci2]) : (mix(colorPalette2[ci2], colorPalette2[ci2 + 1], colorIndex2 - float(ci2)));
	vec3 colorMixed = mix(color, color2, toPercenUneasedStag);

    //---- set VERTEX ID ----
	int vi = int(cubeTriangles[int(vertexId + 3.0*triangleIndex)]);

	//---- INTERPOLATE between from/to values for SIZE and XYZ ----
	vec3 szMixed = mix(size*sizeFactor, size2*sizeFactor2, toPercentStag);
	vec3 posMixed = mix(xyz, xyz2, toPercentStag);

	////---- info for RAY CASTING in fragment shader ----
	mat4 matPMV = projectionMatrix * modelViewMatrix;

	//vec4 posNorm = matPMV * vec4(posMixed, 1);
	//vec4 szNorm = matPMV * vec4(szMixed, 1);
	//vec4 szZero = matPMV * vec4(0, 0, 0, 1);

	//vSize.x = (szNorm.x - szZero.x) * (canvasWidth / 2.0) / szNorm.w ; 
    //vSize.y = (szNorm.y - szZero.y) * (canvasHeight / 2.0) / szNorm.w;

    //vPosition.x = (posNorm.x + 1.0) * (canvasWidth / 2.0) / posNorm.w;
    //vPosition.y = (posNorm.y + 1.0) * (canvasHeight / 2.0) / posNorm.w;
	
	//---- rotate line by theta / theta2 ----
	float thetaMix = mix(theta, theta2, toPercentTheta);
	float sint = sin(thetaMix);
	float cost = cos(thetaMix);
    mat3 matRot = mat3(cost, sint, 0, -sint, cost, 0, 0, 0, 1);
	vec3 vertPos = (drawingPoints == 1.0) ? vec3(0, 0, 0) : (cubeVertices[vi] * szMixed);
	vec3 pos = matRot * vertPos + posMixed;

    //---- texture coordinates ----
    v_texCoord1 = cubeTexCoords[vi];
    v_texCoord2 = cubeTexCoords[vi];
    v_texCoord1.x = (v_texCoord1.x + imageIndex) / textureCount1;
    v_texCoord2.x = (v_texCoord2.x + imageIndex2) / textureCount2;

	//---- LIGHTING ----
	vec3 transNormal = normalize(normalMatrix *  cubeNormals[vi]);
	vec3 totalLight = vec3(ambientFactor, ambientFactor, ambientFactor);

	//---- LIGHT # 1 ----
    float dirWeighting = lightFactor1 * max(dot(transNormal, normalize(dirLight)), 0.0);
	totalLight += (dirWeighting * crLight);

	//---- LIGHT # 2 ----
	//float dirWeighting2 = lightFactor2 * max(dot(transNormal, normalize(dirLight2)), 0.0);
	//totalLight += (dirWeighting2 * crLight2);

    //---- important: don't distort original colors - ensure totalLight doesn't exceed 1 ----
    totalLight = clamp(totalLight, vec3(0, 0, 0), vec3(1, 1, 1));

    //---- debug ----
	//totalLight = 0.0 + 0.000000001 * totalLight;	

	v_color = (lightingEnabled == 1.0) ? colorMixed * totalLight : colorMixed;

    //---- debug ----
    //v_color = vec3(0, 0, 0) + 0.000000001 * v_color;
    
    //---- hover (total override of lit color) ----
	if (vectorIndex == hoverVectorIndex)
	{
		v_color = hoverColor;
	}

	//---- opacity ----
	v_opacity = mix(opacity*globalOpacity, opacity2*globalOpacity2, toPercenUneasedStag);

	//---- pass values to fragment shader ----
	//gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1);
	gl_Position = matPMV * vec4(pos, 1);

	//gl_Position = .0000000001*gl_Position + ((vertexId == 0.0) ? vec4(-.5, -.5, 0, 1) : ((vertexId == 1.0) ? vec4(.5, -.5, 0, 1) : vec4(.5, .5, 0, 1)));

	//---- this sets the size of POINT drawing primitives -----
	gl_PointSize = szMixed.x;

}
`;

    shaders["../shaders/fragmentShader.c"] = `//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    fragmentShader.c - an GLSL fragment shader for drawing in BeachParty.
//-------------------------------------------------------------------------------------

precision mediump float;

varying vec3 v_color;
varying float v_opacity;

varying highp vec2 v_texCoord1;
varying highp vec2 v_texCoord2;

uniform sampler2D uSampler1;		// set to "0"
uniform sampler2D uSampler2;		// set to "1"

uniform float usingTexture1;	
uniform float usingTexture2;	
uniform float toPercentFrag;

void main()
{
	//---- hide pixels of opacity=0, even if we are not blending ----
	if (v_opacity == 0.0)
	{
		discard;
	}

	//---- Note: vPosition is the center of the shape being drawn ----

	////---- get distance from center of shape ----
	//float xDiff = gl_FragCoord.x - vPosition.x;
	//float yDiff = gl_FragCoord.y - vPosition.y;

	//if ((abs(xDiff) > vSize.x) || (abs(yDiff) > vSize.y))
	//{
	//	//discard;
	//}

    //---- compute FROM color ----
    vec4 texColor1 = (usingTexture1 == 1.0) ? texture2D(uSampler1, v_texCoord1) : vec4(1, 1, 1, 1);

    //---- compute TO color ----
    vec4 texColor2 = (usingTexture2 == 1.0) ? texture2D(uSampler2, v_texCoord2) : vec4(1, 1, 1, 1);

    //---- mix them ----
    vec4 texColorMixed = mix(texColor1, texColor2, toPercentFrag);

    //---- debug - JUST USE TEXTRUE REGISTER #1 ----
	//texColorMixed = texture2D(uSampler1, v_texCoord2) + .00001 * texColorMixed;

    gl_FragColor = vec4(v_color, v_opacity) * texColorMixed;

    //---- debug ----
    //gl_FragColor = .00001*gl_FragColor + vec4(1, 0, 0, 1);  
}
`;

    shaders["../shaders/gridLinesFragmentShader.c"] = `//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//    gridLinesFragmentShader.c - an GLSL fragment shader for drawing 3D GRID LINES in BeachParty.
//-------------------------------------------------------------------------------------

precision mediump float;
uniform vec4 u_color;

void main()
{
    gl_FragColor = u_color;

    //---- debug ----
    //gl_FragColor = .00001*gl_FragColor + vec4(1, 0, 0, 1);  
}
`;

    shaders["../shaders/gridLinesVertexShader.c"] = `//-------------------------------------------------------------------------------------
//  Copyright (c) 2015 - Microsoft Corporation.
//   gridLinesVertexShader.c - an GLSL vertex shader for drawing 3D GRLD LINES in BeachParty.
//-------------------------------------------------------------------------------------

attribute vec3 a_position;
uniform mat4 u_mvMatrix;
uniform mat4 u_pMatrix;

void main() 
{
    gl_Position = u_pMatrix * u_mvMatrix * vec4(a_position, 1.0); 
}`;
}
