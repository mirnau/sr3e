export function attachLightEffect(html, activeTheme) {
  function rgb(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  const colors = {
    light: {
      silver: rgb(200, 200, 200),
      lightGray: rgb(235, 235, 235),
      darkGray: rgb(150, 150, 150),
      highlight: rgb(255, 192, 203), // soft cherry blossom
    },
    dark: {
      silver: rgb(77, 77, 77),
      lightGray: rgb(31, 31, 32),
      darkGray: rgb(23, 22, 22),
      highlight: rgb(102, 119, 115),
    },
  };

  const isDark = activeTheme.toLowerCase().includes("dark");
  const themeColors = isDark ? colors.dark : colors.light;

  // Higher contrast, tighter stripe frequency for more definition
  const brushedBase = `repeating-linear-gradient(
    33deg,
    ${themeColors.darkGray} 0px,
    ${themeColors.silver} 0.15px,
    ${themeColors.lightGray} 0.75px,
    ${themeColors.darkGray} 1.5px
  )`;

  const windowContent = html.querySelector(".window-content");
  if (!windowContent) return;

  windowContent.addEventListener("mousemove", (event) => {
    const globalX = event.clientX;
    const globalY = event.clientY;

    const selectors = [".stat-card-background", ".skill-background-layer"];
    const targetElements = html.querySelectorAll(selectors.join(", "));

    targetElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const centerX = (rect.left + rect.width) * 0.5;
      const centerY = (rect.top + rect.height) * 0.5;

      const dx = globalX - centerX;
      const dy = globalY - centerY;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const maxDistance = Math.max(rect.width, rect.height) * 3.5;
      const intensity = Math.max(0, 1 - distance / maxDistance);

      const radialGradient = `radial-gradient(
        circle at ${globalX - rect.left}px ${globalY - rect.top}px,
        ${themeColors.highlight} 0%,
        ${themeColors.highlight} ${Math.round(intensity * 40)}%,
        rgba(255, 192, 203, 0.15) 75%,
        transparent 100%
      )`;

      element.style.background = `${radialGradient}, ${brushedBase}`;
      element.style.backgroundBlendMode = "screen";
    });
  });
}
