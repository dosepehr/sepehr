const SPLASH_SIZES = [
    { w: 1290, h: 2796, r: 3 },
    { w: 1179, h: 2556, r: 3 },
    { w: 1284, h: 2778, r: 3 },
    { w: 1170, h: 2532, r: 3 },
    { w: 1125, h: 2436, r: 3 },
    { w: 1242, h: 2688, r: 3 },
    { w: 828, h: 1792, r: 2 },
    { w: 750, h: 1334, r: 2 },
    { w: 640, h: 1136, r: 2 },
    { w: 1536, h: 2048, r: 2 },
    { w: 1668, h: 2388, r: 2 },
    { w: 2048, h: 2732, r: 2 },
] as const;

export const AppleSplashScreens = () => {
    return (
        <>
            {SPLASH_SIZES.map(({ w, h, r }) => (
                <link
                    key={`${w}x${h}`}
                    rel="apple-touch-startup-image"
                    href={`/pwa/splash/splash-${w}x${h}.png`}
                    media={`(device-width: ${w / r}px) and (device-height: ${h / r}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`}
                />
            ))}
        </>
    );
};
