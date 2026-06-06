const CLOUDINARY_UPLOAD_RE = /\/image\/upload\//

const WIDTH_BREAKPOINTS = [
  320, 480, 640, 828, 960, 1080, 1200, 1400, 1600, 1920,
] as const satisfies ReadonlyArray<number>

const MAX_WIDTH = 1920

const ASPECT_RATIOS = {
  "1:1": 1 / 1,
  "4:3": 4 / 3,
  "3:2": 3 / 2,
  "16:9": 16 / 9,
  "21:9": 21 / 9,
} as const satisfies Record<string, number>

type Aspect = keyof typeof ASPECT_RATIOS

type Crop = "fill" | "fit" | "scale"

type TransformCloudinaryOptions = {
  url: string
  width: number
  aspect?: Aspect
  height?: number
  crop?: Crop
}

const snapWidth = (requested: number): number =>
  WIDTH_BREAKPOINTS.find((bp) => bp >= requested) ?? MAX_WIDTH

const resolveHeight = ({
  width,
  aspect,
  height,
}: {
  width: number
  aspect: Aspect | undefined
  height: number | undefined
}): number | null => {
  if (typeof height === "number") {
    return height
  }
  if (aspect !== undefined) {
    return Math.round(width / ASPECT_RATIOS[aspect])
  }
  return null
}

export const transformCloudinaryAvatar = (url: string, px: number): string => {
  if (!CLOUDINARY_UPLOAD_RE.test(url)) {
    return url
  }
  return url.replace(
    CLOUDINARY_UPLOAD_RE,
    `/image/upload/c_thumb,g_face,w_${px},h_${px},f_auto,q_auto/`
  )
}

export const transformCloudinary = ({
  url,
  width,
  aspect,
  height,
  crop,
}: TransformCloudinaryOptions): string => {
  if (!CLOUDINARY_UPLOAD_RE.test(url)) {
    return url
  }

  const snappedWidth = snapWidth(width)
  const resolvedHeight = resolveHeight({
    width: snappedWidth,
    aspect,
    height,
  })
  const needsCrop = resolvedHeight !== null

  const parts = [
    "f_auto",
    "q_auto",
    needsCrop ? `c_${crop ?? "fill"}` : null,
    needsCrop ? "g_auto" : null,
    `w_${snappedWidth}`,
    resolvedHeight === null ? null : `h_${resolvedHeight}`,
  ].filter((p): p is string => p !== null)

  return url.replace(CLOUDINARY_UPLOAD_RE, `/image/upload/${parts.join(",")}/`)
}
