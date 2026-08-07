/**
 * All imagery in one place.
 * Replace any URL with your own photography — every page pulls from here.
 * Format helper keeps Unsplash params consistent.
 */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const img = {
  // Signature
  heroTrain: u("photo-1552465011-b4e21bf6e79a", 2200),
  sigiriya: u("photo-1546708973-b339540b5162"),
  templeKandy: u("photo-1602216056096-3b40cc0c9944"),

  // Coast & surf
  beachPanorama: u("photo-1507525428034-b723cf961d3e", 2000),
  beachPalms: u("photo-1506929562872-bb421503ef21"),
  beachAerial: u("photo-1505142468610-359e7d316be0"),
  beachChairs: u("photo-1519046904884-53103b34b206"),
  beachSunset: u("photo-1468413253725-0d5181091126"),
  surfWave: u("photo-1502680390469-be75c86b636f"),
  seaTurtle: u("photo-1544551763-46a013bb70d5"),

  // Hills & wilds
  mistyHills: u("photo-1470071459604-3b5ec3a7fe05"),
  greenMountains: u("photo-1464822759023-fed622ff2c3b"),
  forest: u("photo-1441974231531-c6227db76b6e"),
  sunraysValley: u("photo-1469474968028-56623f02e42e"),
  lakeCanoe: u("photo-1476514525535-07fb3b4ae5f1"),
  mountainLake: u("photo-1501785888041-af3ef285b470"),

  // Wildlife
  elephants: u("photo-1547471080-7cc2caa01a7e"),
  elephantHerd: u("photo-1557050543-4d5f4e07ef46"),
  leopard: u("photo-1456926631375-92c8ce872def"),
  safariJeep: u("photo-1516426122078-c23e76319801"),

  // Journeys & fleet
  coastalDrive: u("photo-1533473359331-0135ef1b58bf"),
  drivingWheel: u("photo-1449965408869-eaa3f722e40d"),
  sedanNight: u("photo-1549317661-bd32c8ce0db2"),
  cityLights: u("photo-1449824913935-59a10b8d2000"),
};

export type ImageKey = keyof typeof img;

/**
 * Crops an image to the 1200×630 ratio social platforms expect.
 * Unsplash URLs are re-cropped server-side; other URLs pass through unchanged.
 */
export function toOgImage(src: string): string {
  if (!src) return img.heroTrain;
  if (!src.includes("images.unsplash.com")) return src;
  const [base] = src.split("?");
  return `${base}?auto=format&fit=crop&w=1200&h=630&q=80`;
}

/** Default social sharing image for the whole site. */
export const ogDefault = toOgImage(img.heroTrain);
