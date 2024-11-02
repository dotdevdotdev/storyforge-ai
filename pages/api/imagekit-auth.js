import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export default function handler(req, res) {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    console.log("Auth parameters generated:", authenticationParameters);
    res.status(200).json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    res.status(500).json({
      error: "Failed to generate auth parameters",
      details: error.message,
    });
  }
}
