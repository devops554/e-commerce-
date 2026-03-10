/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "www.freepik.com" },
      { protocol: "https", hostname: "d3f1iyfxxz8i1e.cloudfront.net" },
      { protocol: "https", hostname: "thumbs.dreamstime.com" },
      { protocol: "https", hostname: "d3jmn01ri1fzgl.cloudfront.net" },
      { protocol: "https", hostname: "wallpaperaccess.com" },
      { protocol: "https", hostname: "iitk.ac.in" },
      { protocol: "https", hostname: "*.iitk.ac.in" },
      { protocol: "https", hostname: "*.iitkgp.ac.in" },
      { protocol: "https", hostname: "*.iitr.ac.in" },
      { protocol: "https", hostname: "*.iitg.ac.in" },
      { protocol: "https", hostname: "*.jnu.ac.in" },
      { protocol: "https", hostname: "*.bhu.ac.in" },
      { protocol: "https", hostname: "*.mit.edu" },
      { protocol: "https", hostname: "*.imperial.ac.uk" },
      { protocol: "https", hostname: "*.ox.ac.uk" },
      { protocol: "https", hostname: "*.harvard.edu" },
      { protocol: "https", hostname: "*.cam.ac.uk" },
      { protocol: "https", hostname: "*.stanford.edu" },
      { protocol: "https", hostname: "*.ethz.ch" },
      { protocol: "https", hostname: "*.nus.edu.sg" },
      { protocol: "https", hostname: "*.ucl.ac.uk" },
      { protocol: "https", hostname: "*.caltech.edu" },
      { protocol: "https", hostname: "*.shiksha.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    unoptimized: true,
  },

};

export default nextConfig;