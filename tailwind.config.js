// // tailwind.config.js
// module.exports = {
//   //   theme: {
//   //     extend: {
//   //       colors: {
//   //         background: "#0D0D0D", // Dark background
//   //         foreground: "#F5F5F5", // Main text color
//   //         primary: {
//   //           DEFAULT: "#00FFFF", // Neon cyan
//   //           foreground: "#0D0D0D",
//   //         },
//   //         secondary: {
//   //           DEFAULT: "#FF4D6D", // Vibrant pink-red
//   //           foreground: "#FFFFFF",
//   //         },
//   //         "light-grey": "#1A1A1A", // Card & section background
//   //       },
//   //       fontFamily: {
//   //         heading: ["Poppins", "sans-serif"],
//   //         paragraph: ["Inter", "sans-serif"],
//   //       },

//   //     },
//   //   },

//   content: [
//     "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
//     "./public/**/*.html",
//   ],
//   theme: {
//     extend: {
//       fontSize: {
//         xs: [
//           "0.75rem",
//           { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "400" },
//         ],
//         sm: [
//           "0.875rem",
//           { lineHeight: "1.25", letterSpacing: "0.025em", fontWeight: "400" },
//         ],
//         base: [
//           "1rem",
//           { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" },
//         ],
//         lg: [
//           "1.125rem",
//           { lineHeight: "1.75", letterSpacing: "-0.025em", fontWeight: "400" },
//         ],
//         xl: [
//           "1.25rem",
//           { lineHeight: "1.75", letterSpacing: "-0.025em", fontWeight: "500" },
//         ],
//         "2xl": [
//           "1.5rem",
//           { lineHeight: "2", letterSpacing: "-0.025em", fontWeight: "600" },
//         ],
//         "3xl": [
//           "1.875rem",
//           { lineHeight: "2.25", letterSpacing: "-0.025em", fontWeight: "700" },
//         ],
//         "4xl": [
//           "2.25rem",
//           { lineHeight: "2.5", letterSpacing: "-0.025em", fontWeight: "700" },
//         ],
//         "5xl": [
//           "3rem",
//           { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "800" },
//         ],
//         "6xl": [
//           "3.75rem",
//           { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "800" },
//         ],
//         "7xl": [
//           "4.5rem",
//           { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" },
//         ],
//         "8xl": [
//           "6rem",
//           { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" },
//         ],
//         "9xl": [
//           "8rem",
//           { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" },
//         ],
//       },
//       fontFamily: {
//         heading: "syne",
//         paragraph: "azeret-mono",
//         apple: [
//           "-apple-system",
//           "BlinkMacSystemFont",
//           "'Segoe UI'",
//           "Roboto",
//           "Oxygen",
//           "Ubuntu",
//           "Cantarell",
//           "'Helvetica Neue'",
//           "sans-serif",
//         ],
//         montserrat: ["'Montserrat'", "sans-serif"],
//       },
//       colors: {
//         "light-grey": "#333333",
//         destructive: "#FF4136",
//         "destructive-foreground": "#FFFFFF",
//         background: "#000000",
//         secondary: "#FFFFFF",
//         foreground: "#FFFFFF",
//         "secondary-foreground": "#000000",
//         "primary-foreground": "#000000",
//         primary: "#00FFFF",
//       },
//     },
//   },
//   future: {
//     hoverOnlyWhenSupported: true,
//   },
//   plugins: [
//     require("@tailwindcss/container-queries"),
//     require("@tailwindcss/typography"),
//   ],
// };
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "400" }],
        sm: ["0.875rem", { lineHeight: "1.25", letterSpacing: "0.025em", fontWeight: "400" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
        lg: ["1.125rem", { lineHeight: "1.75", letterSpacing: "-0.025em", fontWeight: "400" }],
        xl: ["1.25rem", { lineHeight: "1.75", letterSpacing: "-0.025em", fontWeight: "500" }],
        "2xl": ["1.5rem", { lineHeight: "2", letterSpacing: "-0.025em", fontWeight: "600" }],
        "3xl": ["1.875rem", { lineHeight: "2.25", letterSpacing: "-0.025em", fontWeight: "700" }],
        "4xl": ["2.25rem", { lineHeight: "2.5", letterSpacing: "-0.025em", fontWeight: "700" }],
        "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "800" }],
        "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "800" }],
        "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" }],
        "8xl": ["6rem", { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" }],
        "9xl": ["8rem", { lineHeight: "1", letterSpacing: "-0.025em", fontWeight: "900" }],
      },
      fontFamily: {
        heading: "syne",
        paragraph: "azeret-mono",
        apple: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "'Helvetica Neue'",
          "sans-serif",
        ],
        montserrat: ["'Montserrat'", "sans-serif"],
      },
      colors: {
        "light-grey": "#333333",
        destructive: "#FF4136",
        "destructive-foreground": "#FFFFFF",
        background: "#000000",
        secondary: "#FFFFFF",
        foreground: "#FFFFFF",
        "secondary-foreground": "#000000",
        "primary-foreground": "#000000",
        primary: "#00FFFF",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
  ],
};
